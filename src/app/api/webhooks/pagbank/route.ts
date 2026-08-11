import { createHash, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { mapPaymentStatus } from "@/lib/pagbank";
import { authorizeLockerForPaidOrder } from "@/lib/locker";

function validSignature(raw:string,header:string|null){const token=process.env.PAGBANK_TOKEN;if(!token)return process.env.NODE_ENV!=="production";if(!header)return false;const expected=createHash("sha256").update(`${token}-${raw}`,"utf8").digest("hex");try{return expected.length===header.length&&timingSafeEqual(Buffer.from(expected),Buffer.from(header))}catch{return false}}
export async function POST(req:Request){
 const raw=await req.text();if(!validSignature(raw,req.headers.get("x-authenticity-token")))return Response.json({error:"Assinatura inválida"},{status:401});let data:any;try{data=JSON.parse(raw)}catch{return Response.json({error:"JSON inválido"},{status:400})}if(!prisma)return Response.json({ok:true,demo:true});
 const charge=data.charges?.[0];const status=mapPaymentStatus(charge?.status??data.status);const payment=await prisma.payment.findFirst({where:{OR:[{providerOrderId:data.id??"__none__"},{providerChargeId:charge?.id??"__none__"},{order:{number:data.reference_id??"__none__"}}]},include:{order:{include:{lockerAuthorization:true}}}});if(!payment)return Response.json({ok:true,ignored:true});
 await prisma.payment.update({where:{id:payment.id},data:{status:status as any,providerChargeId:charge?.id??payment.providerChargeId,providerTransactionId:charge?.payment_response?.reference??payment.providerTransactionId,rawResponse:data,paidAt:status==="PAID"?(payment.paidAt??new Date()):payment.paidAt}});
 if(status==="PAID"&&payment.order.status==="AWAITING_PAYMENT"){await prisma.order.update({where:{id:payment.orderId},data:{status:"CONFIRMED",statusHistory:{create:{fromStatus:"AWAITING_PAYMENT",toStatus:"CONFIRMED",note:"Pagamento confirmado automaticamente pelo PagBank"}}}});await authorizeLockerForPaidOrder(payment.orderId).catch(()=>null)}
 if(["DECLINED","CANCELED"].includes(status)&&payment.order.status==="AWAITING_PAYMENT"){await prisma.$transaction(async tx=>{await tx.order.update({where:{id:payment.orderId},data:{status:"CANCELED",statusHistory:{create:{fromStatus:"AWAITING_PAYMENT",toStatus:"CANCELED",note:`Pagamento ${status.toLowerCase()}`}}}});if(payment.order.couponId)await tx.coupon.update({where:{id:payment.order.couponId},data:{usedCount:{decrement:1}}});if(payment.order.lockerAuthorization){await tx.lockerAuthorization.update({where:{id:payment.order.lockerAuthorization.id},data:{status:"REVOKED"}});await tx.locker.update({where:{id:payment.order.lockerAuthorization.lockerId},data:{status:"AVAILABLE"}})}})}
 return Response.json({ok:true});
}
