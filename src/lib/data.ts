import { prisma } from "@/lib/prisma";
import { demoDrivers, demoOrders, demoServices } from "@/lib/demo-data";

export async function getServices() {
  if (!prisma) return demoServices;
  return prisma.service.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function getCustomerOrders(customerId: string) {
  if (!prisma) return demoOrders;
  return prisma.order.findMany({ where: { customerId }, orderBy: { createdAt: "desc" }, include: { customer: { select: { name: true } }, payments: true, voucher: true } });
}

export async function getCustomerAddresses(customerId: string) {
  if (!prisma) return [{ id: "demo-address", label: "Casa", street: "Avenida Paulista", number: "1000", district: "Bela Vista", city: "São Paulo", state: "SP", postalCode: "01310100", isDefault: true }];
  return prisma.address.findMany({ where: { userId: customerId }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] });
}

export async function getAdminOrders() {
  if (!prisma) return demoOrders.map(o => ({ ...o, payments: [{ status: "PAID", method: "PIX" }] }));
  return prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { customer: { select: { name: true, phone: true } }, payments: { orderBy: { createdAt: "desc" }, take: 1 }, assignedEmployee: { select: { name: true } } } });
}

export async function getDrivers() {
  if (!prisma) return demoDrivers;
  return prisma.user.findMany({ where: { role: "DRIVER", status: "ACTIVE" }, include: { staffProfile: true }, orderBy: { name: "asc" } });
}

export async function getOrderForCustomer(orderId: string, customerId: string) {
  if (!prisma) {
    const base = demoOrders.find(o=>o.id===orderId) ?? { ...demoOrders[0], id:orderId, number:orderId.startsWith("demo-")?"LAV-DEMO-NOVO":demoOrders[0].number };
    return { ...base, notes:"Pedido de demonstração", collectionAddress:{street:"Avenida Paulista",number:"1000",district:"Bela Vista",city:"São Paulo",state:"SP",postalCode:"01310100"}, deliveryAddress:{street:"Avenida Paulista",number:"1000",district:"Bela Vista",city:"São Paulo",state:"SP",postalCode:"01310100"}, items:[{id:"i1",serviceName:"Lavagem por kg",quantity:2,unit:"KG",unitPrice:17.9,total:35.8},{id:"i2",serviceName:"Camisa social",quantity:2,unit:"ITEM",unitPrice:14.9,total:29.8}], payments:[{id:"p1",method:"PIX",status:"PAID",amount:82.5,paidAt:new Date()}], voucher:{id:"v1",code:"DEMO12345678",qrPayload:base.number}, routes:[{id:"route-demo",type:"DELIVERY",status:"IN_PROGRESS",driver:{id:"demo-driver",name:"Carlos Motorista",phone:"11999990000",staffProfile:{vehicle:"Fiat Fiorino",plate:"ABC1D23"}}}], lockerAuthorization:null, statusHistory:[{id:"h1",toStatus:"CONFIRMED",createdAt:new Date("2026-08-10T12:00:00-03:00"),note:"Pagamento confirmado"},{id:"h2",toStatus:"COLLECTED",createdAt:new Date("2026-08-10T14:30:00-03:00"),note:"Roupas coletadas"},{id:"h3",toStatus:"IN_PROCESS",createdAt:new Date("2026-08-10T16:00:00-03:00"),note:"Lavagem iniciada"}] };
  }
  return prisma.order.findFirst({ where:{ id:orderId, customerId }, include:{ customer:{select:{name:true,phone:true,email:true}}, collectionAddress:true, deliveryAddress:true, items:true, payments:{orderBy:{createdAt:"desc"}}, voucher:true, routes:{orderBy:{createdAt:"desc"},include:{driver:{include:{staffProfile:true}}}}, statusHistory:{orderBy:{createdAt:"asc"}}, lockerAuthorization:{include:{locker:true}} } });
}

export async function getAvailableLockers(){if(!prisma)return[{id:"locker-demo",externalId:"LOCKER-001",name:"Armário 01",locationName:"Unidade Centro",address:"São Paulo - SP",compartment:"A01",status:"AVAILABLE"}];return prisma.locker.findMany({where:{active:true,status:"AVAILABLE"},orderBy:[{locationName:"asc"},{name:"asc"}]});}

export async function getDriverRoutes(driverId:string){
  if(!prisma)return[{id:"route-demo",type:"DELIVERY",status:"IN_PROGRESS",startedAt:new Date(),order:{id:"demo-001",number:"LAV-20260810-01A2B3",status:"DRIVER_EN_ROUTE_DELIVERY",collectionAt:new Date(),deliveryExpectedAt:new Date(Date.now()+3600000),notes:"Ligar ao chegar",customer:{name:"Cliente Demonstração",phone:"11988887777"},collectionAddress:{street:"Avenida Paulista",number:"1000",district:"Bela Vista",city:"São Paulo",state:"SP"},deliveryAddress:{street:"Rua Haddock Lobo",number:"200",district:"Cerqueira César",city:"São Paulo",state:"SP"}}}];
  return prisma.deliveryRoute.findMany({where:{driverId,status:{in:["PENDING","IN_PROGRESS"]}},orderBy:{createdAt:"asc"},include:{order:{include:{customer:{select:{name:true,phone:true}},collectionAddress:true,deliveryAddress:true}}}});
}

export async function getDriverOrders(driverId:string){
  if(!prisma){const routes=await getDriverRoutes(driverId);return routes.map((route:any)=>({...route.order,routes:[{id:route.id,type:route.type,status:route.status,createdAt:new Date()}]}));}
  return prisma.order.findMany({
    where:{routes:{some:{driverId}}},
    orderBy:{updatedAt:"desc"},
    take:100,
    include:{customer:{select:{name:true,phone:true}},collectionAddress:true,deliveryAddress:true,routes:{where:{driverId},orderBy:{createdAt:"desc"}}}
  });
}

export async function getDriverOrder(orderId:string,driverId:string){
  if(!prisma){const route=(await getDriverRoutes(driverId))[0];return route?.order.id===orderId?{...route.order,routes:[{id:route.id,type:route.type,status:route.status}],proofs:[]}:null;}
  return prisma.order.findFirst({where:{id:orderId,routes:{some:{driverId}}},include:{customer:{select:{name:true,phone:true,email:true}},collectionAddress:true,deliveryAddress:true,items:true,routes:{where:{driverId},orderBy:{createdAt:"desc"}},proofs:{orderBy:{createdAt:"desc"}}}});
}

export async function getCustomerCheckoutProfile(customerId:string){
  if(!prisma)return {phone:"11988887777"};
  return prisma.user.findUnique({where:{id:customerId},select:{phone:true}});
}

export async function getCheckoutConfig(){
  if(!prisma)return {settings:{pixEnabled:true,creditCardEnabled:true,debitCardEnabled:true,defaultDeliveryHours:48,whatsapp:"5511999999999"},slots:[1,2,3,4,5,6].map(weekday=>({id:`demo-slot-${weekday}`,weekday,startTime:"08:00",endTime:"18:00",intervalMin:60,capacity:8,active:true}))};
  const [settings,slots]=await Promise.all([prisma.systemSetting.findUnique({where:{id:"main"}}),prisma.availabilitySlot.findMany({where:{active:true},orderBy:[{weekday:"asc"},{startTime:"asc"}]})]);
  return {settings:settings??{pixEnabled:true,creditCardEnabled:true,debitCardEnabled:false,defaultDeliveryHours:48,whatsapp:null},slots};
}
