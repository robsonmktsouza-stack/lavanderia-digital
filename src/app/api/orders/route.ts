import { auth } from "@/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateOrderQuote, QuoteError } from "@/lib/order-quote";
import { createPagBankPayment, mapPaymentStatus } from "@/lib/pagbank";
import { makeOrderNumber } from "@/lib/utils";

const schema=z.object({
  addressId:z.string(),deliveryAddressId:z.string().optional(),collectionAt:z.string(),deliveryExpectedAt:z.string(),notes:z.string().max(1000).optional(),
  couponCode:z.string().optional(),paymentMethod:z.enum(["PIX","CREDIT_CARD","DEBIT_CARD"]),encryptedCard:z.string().optional(),holderName:z.string().optional(),holderTaxId:z.string().optional(),
  installments:z.number().int().min(1).max(12).optional(),threeDSId:z.string().optional(),lockerId:z.string().optional(),
  items:z.array(z.object({serviceId:z.string(),quantity:z.number().positive().max(999)})).min(1).max(50)
});
function brDate(value:string){return new Date(/[zZ]|[+-]\d\d:\d\d$/.test(value)?value:`${value}:00-03:00`)}
function minutes(hhmm:string){const[h,m]=hhmm.split(":").map(Number);return h*60+m}

export async function POST(req:Request){
 const s=await auth();if(!s?.user)return Response.json({error:"Não autorizado"},{status:401});
 const p=schema.safeParse(await req.json());if(!p.success)return Response.json({error:p.error.issues[0]?.message??"Dados inválidos"},{status:400});
 if(!prisma)return Response.json({ok:true,orderId:`demo-${Date.now()}`,number:makeOrderNumber(),payment:{status:"PAID",method:p.data.paymentMethod,pixQrCodeText:p.data.paymentMethod==="PIX"?"PIX-DEMO-COPIA-E-COLA":null}},{status:201});
 try{
  const collectionAt=brDate(p.data.collectionAt),deliveryExpectedAt=brDate(p.data.deliveryExpectedAt);
  if(Number.isNaN(collectionAt.getTime())||Number.isNaN(deliveryExpectedAt.getTime()))return Response.json({error:"Datas inválidas."},{status:400});
  if(collectionAt.getTime()<Date.now()+15*60*1000)return Response.json({error:"Escolha uma coleta com pelo menos 15 minutos de antecedência."},{status:400});
  if(deliveryExpectedAt<=collectionAt)return Response.json({error:"A previsão de entrega deve ser posterior à coleta."},{status:400});

  const settings=await prisma.systemSetting.findUnique({where:{id:"main"}});
  if(p.data.paymentMethod==="PIX"&&settings?.pixEnabled===false)return Response.json({error:"PIX está temporariamente indisponível."},{status:409});
  if(p.data.paymentMethod==="CREDIT_CARD"&&settings?.creditCardEnabled===false)return Response.json({error:"Cartão de crédito está temporariamente indisponível."},{status:409});
  if(p.data.paymentMethod==="DEBIT_CARD"&&settings?.debitCardEnabled!==true)return Response.json({error:"Cartão de débito está indisponível."},{status:409});
  const quote=await calculateOrderQuote({customerId:s.user.id,addressId:p.data.addressId,deliveryAddressId:p.data.deliveryAddressId,items:p.data.items,couponCode:p.data.couponCode});
  const {address,deliveryAddress,services,coupon,totals}=quote;
  if(totals.total>0&&p.data.paymentMethod!=="PIX"&&!p.data.encryptedCard)return Response.json({error:"Dados do cartão não foram criptografados."},{status:400});
  if(totals.total>0&&p.data.paymentMethod==="DEBIT_CARD"&&!p.data.threeDSId)return Response.json({error:"A autenticação 3DS é obrigatória no débito."},{status:400});

  const datePart=p.data.collectionAt.slice(0,10),localDate=new Date(`${datePart}T12:00:00-03:00`),weekday=localDate.getUTCDay(),time=p.data.collectionAt.slice(11,16);
  const activeSlots=await prisma.availabilitySlot.findMany({where:{weekday,active:true}});
  const slot=activeSlots.find(x=>{const t=minutes(time),start=minutes(x.startTime),end=minutes(x.endTime);return t>=start&&t<end&&(t-start)%x.intervalMin===0});
  if(!slot)return Response.json({error:"O horário escolhido não está disponível na agenda."},{status:409});
  const slotEnd=new Date(collectionAt.getTime()+slot.intervalMin*60*1000);
  const booked=await prisma.order.count({where:{collectionAt:{gte:collectionAt,lt:slotEnd},status:{not:"CANCELED"}}});
  if(booked>=slot.capacity)return Response.json({error:"Este horário acabou de atingir a capacidade máxima. Escolha outro."},{status:409});

  const locker=p.data.lockerId?await prisma.locker.findFirst({where:{id:p.data.lockerId,active:true,status:"AVAILABLE"}}):null;
  if(p.data.lockerId&&!locker)return Response.json({error:"Armário indisponível."},{status:409});
  const number=makeOrderNumber();
  const order=await prisma.$transaction(async tx=>{
    if(locker){const reserved=await tx.locker.updateMany({where:{id:locker.id,active:true,status:"AVAILABLE"},data:{status:"RESERVED"}});if(reserved.count!==1)throw new QuoteError("Este armário acabou de ser reservado por outro cliente.",409)}
    if(coupon){
      if(coupon.maxUses!==null){const reserved=await tx.coupon.updateMany({where:{id:coupon.id,active:true,usedCount:{lt:coupon.maxUses}},data:{usedCount:{increment:1}}});if(reserved.count!==1)throw new QuoteError("Este cupom acabou de atingir o limite de usos.",409)}
      else await tx.coupon.update({where:{id:coupon.id},data:{usedCount:{increment:1}}});
    }
    return tx.order.create({data:{
      number,customerId:s.user.id,collectionAddressId:address!.id,deliveryAddressId:deliveryAddress!.id,couponId:coupon?.id,status:"AWAITING_PAYMENT",collectionAt,deliveryExpectedAt,notes:p.data.notes,
      subtotal:totals.subtotal,discount:totals.discount,collectionFee:totals.collectionFee,deliveryFee:totals.deliveryFee,total:totals.total,pieceCount:Math.round(p.data.items.reduce((a,i)=>a+i.quantity,0)),volumeCount:1,
      items:{create:p.data.items.map(i=>{const sv=services.find(x=>x.id===i.serviceId)!;return{serviceId:sv.id,serviceName:sv.name,unit:sv.unit,quantity:i.quantity,unitPrice:sv.price,total:Number(sv.price)*i.quantity}})},
      voucher:{create:{code:crypto.randomUUID().replaceAll("-","").slice(0,12).toUpperCase(),qrPayload:number}},
      ...(locker?{lockerAuthorization:{create:{lockerId:locker.id,status:"PENDING",accessCode:String(Math.floor(100000+Math.random()*900000)),validFrom:new Date(collectionAt.getTime()-30*60*1000),validUntil:new Date(collectionAt.getTime()+2*60*60*1000)}}}:{}),
      statusHistory:{create:{toStatus:"AWAITING_PAYMENT",actorId:s.user.id,note:"Pedido criado pelo cliente"}}
    },include:{customer:true,collectionAddress:true,deliveryAddress:true,items:true,voucher:true}});
  });

  try{
    if(totals.total<=0){
      await prisma.payment.create({data:{orderId:order.id,method:p.data.paymentMethod,status:"PAID",amount:0,provider:"CUPOM",idempotencyKey:`FREE-${crypto.randomUUID()}`,rawResponse:{reason:"TOTAL_ZERO"},paidAt:new Date()}});
      await prisma.order.update({where:{id:order.id},data:{status:"CONFIRMED",statusHistory:{create:{fromStatus:"AWAITING_PAYMENT",toStatus:"CONFIRMED",actorId:s.user.id,note:"Pedido confirmado sem saldo a pagar"}}}});
      const{authorizeLockerForPaidOrder}=await import("@/lib/locker");await authorizeLockerForPaidOrder(order.id).catch(()=>null);
      return Response.json({ok:true,orderId:order.id,number:order.number,payment:{status:"PAID",method:p.data.paymentMethod,provider:"CUPOM"}},{status:201});
    }
    const pay=await createPagBankPayment({order,method:p.data.paymentMethod,encryptedCard:p.data.encryptedCard,holderName:p.data.holderName,holderTaxId:p.data.holderTaxId,installments:p.data.installments,threeDSId:p.data.threeDSId});
    const mapped=mapPaymentStatus(pay.status);
    await prisma.payment.create({data:{orderId:order.id,method:p.data.paymentMethod,status:mapped as any,amount:order.total,providerOrderId:pay.providerOrderId,providerChargeId:pay.providerChargeId,providerTransactionId:pay.providerTransactionId,idempotencyKey:pay.idempotencyKey,pixQrCodeText:pay.pixQrCodeText,pixQrCodeImageUrl:pay.pixQrCodeImageUrl,rawResponse:pay.rawResponse as any,paidAt:mapped==="PAID"?new Date():null}});
    if(mapped==="PAID"){await prisma.order.update({where:{id:order.id},data:{status:"CONFIRMED",statusHistory:{create:{fromStatus:"AWAITING_PAYMENT",toStatus:"CONFIRMED",actorId:s.user.id,note:"Pagamento confirmado"}}}});const{authorizeLockerForPaidOrder}=await import("@/lib/locker");await authorizeLockerForPaidOrder(order.id).catch(()=>null)}
    return Response.json({ok:true,orderId:order.id,number:order.number,payment:{status:mapped,method:p.data.paymentMethod,pixQrCodeText:pay.pixQrCodeText,pixQrCodeImageUrl:pay.pixQrCodeImageUrl}},{status:201});
  }catch(paymentError:any){
    await prisma.$transaction(async tx=>{
      await tx.order.update({where:{id:order.id},data:{status:"CANCELED",statusHistory:{create:{fromStatus:"AWAITING_PAYMENT",toStatus:"CANCELED",actorId:s.user.id,note:"Falha ao iniciar pagamento"}}}});
      if(coupon)await tx.coupon.update({where:{id:coupon.id},data:{usedCount:{decrement:1}}});
      if(locker){await tx.locker.update({where:{id:locker.id},data:{status:"AVAILABLE"}});await tx.lockerAuthorization.update({where:{orderId:order.id},data:{status:"REVOKED",errorMessage:"Pagamento não iniciado"}})}
    });
    throw paymentError;
  }
 }catch(e:any){console.error(e);if(e instanceof QuoteError)return Response.json({error:e.message},{status:e.status});return Response.json({error:e.message??"Falha ao criar pedido."},{status:500})}
}
