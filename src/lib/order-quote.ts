import { prisma } from "@/lib/prisma";
import { calculateOrder } from "@/lib/pricing";

export type QuoteItem={serviceId:string;quantity:number};
function postalInRange(postal:string,from?:string|null,to?:string|null){const p=postal.replace(/\D/g,"");if(from&&p<from.replace(/\D/g,""))return false;if(to&&p>to.replace(/\D/g,""))return false;return true}

export class QuoteError extends Error{constructor(message:string,public status=400){super(message)}}

async function regionFor(address:any){
  if(!prisma) return null;
  const candidates=await prisma.serviceRegion.findMany({where:{city:{equals:address.city,mode:"insensitive"},state:{equals:address.state,mode:"insensitive"},active:true}});
  return candidates.find(r=>postalInRange(address.postalCode,r.postalCodeFrom,r.postalCodeTo))??null;
}

export async function calculateOrderQuote(input:{customerId:string;addressId:string;deliveryAddressId?:string;items:QuoteItem[];couponCode?:string}){
  if(!prisma){
    const subtotal=input.items.reduce((a,i)=>a+i.quantity*20,0);const totals=calculateOrder({items:[{quantity:1,unitPrice:subtotal}],collectionFee:7.9,deliveryFee:7.9});
    return {address:null,deliveryAddress:null,collectionRegion:null,deliveryRegion:null,services:[],coupon:null,totals};
  }
  const [address,deliveryAddressRaw]=await Promise.all([
    prisma.address.findFirst({where:{id:input.addressId,userId:input.customerId}}),
    input.deliveryAddressId?prisma.address.findFirst({where:{id:input.deliveryAddressId,userId:input.customerId}}):Promise.resolve(null)
  ]);
  if(!address)throw new QuoteError("Endereço de coleta inválido.");
  const deliveryAddress=deliveryAddressRaw??address;
  if(input.deliveryAddressId&&!deliveryAddressRaw)throw new QuoteError("Endereço de entrega inválido.");
  const [collectionRegion,deliveryRegion,services]=await Promise.all([
    regionFor(address),regionFor(deliveryAddress),prisma.service.findMany({where:{id:{in:input.items.map(i=>i.serviceId)},active:true}})
  ]);
  if(!collectionRegion)throw new QuoteError("O endereço de coleta ainda não está em uma região atendida.");
  if(!deliveryRegion)throw new QuoteError("O endereço de entrega ainda não está em uma região atendida.");
  if(services.length!==new Set(input.items.map(i=>i.serviceId)).size)throw new QuoteError("Um ou mais serviços não estão disponíveis.");
  for(const item of input.items){const sv=services.find(x=>x.id===item.serviceId);if(!sv)throw new QuoteError("Serviço inválido.");if(item.quantity<Number(sv.minimumQty))throw new QuoteError(`Quantidade mínima para ${sv.name}: ${Number(sv.minimumQty)}.`)}
  let coupon:any=null;
  if(input.couponCode?.trim()){
    coupon=await prisma.coupon.findUnique({where:{code:input.couponCode.trim().toUpperCase()}});const now=new Date();
    if(!coupon||!coupon.active||(coupon.startsAt&&coupon.startsAt>now)||(coupon.expiresAt&&coupon.expiresAt<now)||(coupon.maxUses!==null&&coupon.usedCount>=coupon.maxUses))throw new QuoteError("Cupom inválido, expirado ou esgotado.");
  }
  const priceItems=input.items.map(i=>({quantity:i.quantity,unitPrice:Number(services.find(sv=>sv.id===i.serviceId)!.price)}));
  const rawSubtotal=priceItems.reduce((a,i)=>a+i.quantity*i.unitPrice,0);
  const regionMinimum=Math.max(Number(collectionRegion.minOrderValue),Number(deliveryRegion.minOrderValue));
  if(rawSubtotal<regionMinimum)throw new QuoteError(`Pedido mínimo para esta rota: R$ ${regionMinimum.toFixed(2).replace(".",",")}.`);
  if(coupon&&rawSubtotal<Number(coupon.minOrder))throw new QuoteError(`Este cupom exige pedido mínimo de R$ ${Number(coupon.minOrder).toFixed(2).replace(".",",")}.`);
  const totals=calculateOrder({items:priceItems,collectionFee:Number(collectionRegion.collectionFee),deliveryFee:Number(deliveryRegion.deliveryFee),coupon:coupon?{type:coupon.type,value:Number(coupon.value)}:null});
  return {address,deliveryAddress,collectionRegion,deliveryRegion,services,coupon,totals};
}
