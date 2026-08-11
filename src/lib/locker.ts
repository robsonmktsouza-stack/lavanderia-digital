import { prisma } from "@/lib/prisma";

export async function authorizeLockerForPaidOrder(orderId: string) {
  if (!prisma) return { ok:true, mode:"demo" };
  const auth = await prisma.lockerAuthorization.findUnique({ where:{ orderId }, include:{ locker:true, order:true } });
  if (!auth) return { ok:true, skipped:"order_without_locker" };
  if (auth.status === "AUTHORIZED" || auth.status === "USED") return { ok:true, skipped:"already_authorized" };
  const body = { lockerId:auth.locker.externalId, orderId:auth.order.number, validFrom:auth.validFrom.toISOString(), validUntil:auth.validUntil.toISOString(), accessCode:auth.accessCode };
  if ((process.env.LOCKER_MODE ?? "mock") === "mock") {
    await prisma.lockerAuthorization.update({ where:{id:auth.id}, data:{status:"AUTHORIZED",authorizedAt:new Date(),controllerRef:`MOCK-${Date.now()}`} });
    return { ok:true, mode:"mock" };
  }
  if (!process.env.LOCKER_API_URL) throw new Error("LOCKER_API_URL não configurada.");
  try {
    const r = await fetch(`${process.env.LOCKER_API_URL.replace(/\/$/,"")}/access/authorize`, { method:"POST", headers:{"content-type":"application/json",authorization:`Bearer ${process.env.LOCKER_API_TOKEN??""}`}, body:JSON.stringify(body) });
    const data = await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(data.message ?? `HTTP ${r.status}`);
    await prisma.lockerAuthorization.update({where:{id:auth.id},data:{status:"AUTHORIZED",authorizedAt:new Date(),controllerRef:data.id??data.reference??null,errorMessage:null}});
    return {ok:true,data};
  } catch (error:any) {
    await prisma.lockerAuthorization.update({where:{id:auth.id},data:{status:"ERROR",errorMessage:String(error?.message??error)}});
    throw error;
  }
}
