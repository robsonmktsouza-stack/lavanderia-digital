import { prisma } from "@/lib/prisma";
import { demoOrders, demoServices, demoDrivers } from "@/lib/demo-data";

const demoCustomers = [
  {id:"c1",name:"Mariana Alves",email:"mariana@email.com",phone:"11988887777",cpf:"123.456.789-00",status:"ACTIVE",createdAt:new Date("2026-05-12"),_count:{customerOrders:14},totalSpent:1284.7,lastOrderAt:new Date("2026-08-11")},
  {id:"c2",name:"Paulo Ribeiro",email:"paulo@email.com",phone:"11987776666",cpf:"234.567.890-11",status:"ACTIVE",createdAt:new Date("2026-06-03"),_count:{customerOrders:8},totalSpent:684.2,lastOrderAt:new Date("2026-08-11")},
  {id:"c3",name:"Camila Santos",email:"camila@email.com",phone:"11986665555",cpf:"345.678.901-22",status:"ACTIVE",createdAt:new Date("2026-04-21"),_count:{customerOrders:19},totalSpent:1960.4,lastOrderAt:new Date("2026-08-11")},
  {id:"c4",name:"Fernando Costa",email:"fernando@email.com",phone:"11985554444",cpf:"456.789.012-33",status:"ACTIVE",createdAt:new Date("2026-07-01"),_count:{customerOrders:5},totalSpent:522.9,lastOrderAt:new Date("2026-08-11")},
  {id:"c5",name:"Bianca Melo",email:"bianca@email.com",phone:"11984443333",cpf:"567.890.123-44",status:"ACTIVE",createdAt:new Date("2026-05-28"),_count:{customerOrders:11},totalSpent:998.3,lastOrderAt:new Date("2026-08-11")},
  {id:"c6",name:"Lucas Martins",email:"lucas@email.com",phone:"11983332222",cpf:"678.901.234-55",status:"ACTIVE",createdAt:new Date("2026-08-08"),_count:{customerOrders:1},totalSpent:55.7,lastOrderAt:new Date("2026-08-11")}
];

export async function getDashboardStats(){
  if(!prisma)return {
    ordersToday:8,pending:7,revenueToday:742.4,deliveriesToday:4,collectionsToday:5,pendingPayment:735.9,avgTicket:92.8,delayed:1,activeDrivers:4,openRoutes:5,
    recent:demoOrders.slice(0,6),
    byStatus:[{status:"AWAITING_PAYMENT",count:1},{status:"COLLECTION_SCHEDULED",count:3},{status:"IN_PROCESS",count:4},{status:"READY_FOR_DELIVERY",count:2},{status:"DELIVERED",count:12}],
    payments:[{status:"PAID",amount:5820.5},{status:"PENDING",amount:680.2},{status:"REFUNDED",amount:65.7}],
    todayAgenda:demoOrders.filter(o=>o.collectionAt.toDateString()===new Date("2026-08-11T12:00:00-03:00").toDateString()||o.deliveryExpectedAt.toDateString()===new Date("2026-08-11T12:00:00-03:00").toDateString()).slice(0,6),
    alerts:[{tone:"danger",title:"1 entrega próxima do limite",text:"LAV-20260811-84A8C4 · 14:30"},{tone:"warning",title:"Pagamento pendente",text:"LAV-20260811-63D2B7 · R$ 55,70"},{tone:"info",title:"2 rotas aguardam motorista",text:"Distribua antes das 15h"}],
    topServices:[{name:"Lavagem por kg",orders:34,revenue:1842.7},{name:"Passadoria",orders:27,revenue:940.2},{name:"Camisa social",orders:21,revenue:812.4},{name:"Edredom casal",orders:13,revenue:598.5}],
    revenueWeek:[{d:"Qua",v:640},{d:"Qui",v:810},{d:"Sex",v:720},{d:"Sáb",v:1040},{d:"Dom",v:420},{d:"Seg",v:960},{d:"Ter",v:742.4}],
    activity:[{actor:"Ana Operação",action:"alterou o pedido para Em processamento",when:"há 8 min"},{actor:"Carlos Motorista",action:"enviou comprovante de coleta",when:"há 19 min"},{actor:"Sistema",action:"confirmou pagamento PIX",when:"há 31 min"},{actor:"Administrador",action:"atribuiu rota para Rafael Lima",when:"há 46 min"}]
  };
  const start=new Date();start.setHours(0,0,0,0);const end=new Date(start);end.setDate(end.getDate()+1);const now=new Date();
  const [ordersToday,pending,revenue,deliveriesToday,collectionsToday,recent,byStatus,payments,pendingPay,drivers,openRoutes,todayAgenda,logs,paid30]=await Promise.all([
    prisma.order.count({where:{createdAt:{gte:start,lt:end}}}),
    prisma.order.count({where:{status:{notIn:["DELIVERED","CANCELED"]}}}),
    prisma.payment.aggregate({_sum:{amount:true},where:{status:"PAID",paidAt:{gte:start,lt:end}}}),
    prisma.order.count({where:{deliveryExpectedAt:{gte:start,lt:end},status:{not:"CANCELED"}}}),
    prisma.order.count({where:{collectionAt:{gte:start,lt:end},status:{not:"CANCELED"}}}),
    prisma.order.findMany({take:8,orderBy:{createdAt:"desc"},include:{customer:{select:{name:true,phone:true}},payments:{take:1,orderBy:{createdAt:"desc"}}}}),
    prisma.order.groupBy({by:["status"],_count:{_all:true}}),
    prisma.payment.groupBy({by:["status"],_sum:{amount:true}}),
    prisma.payment.aggregate({_sum:{amount:true},where:{status:{in:["PENDING","IN_ANALYSIS","AUTHORIZED"]}}}),
    prisma.user.count({where:{role:"DRIVER",status:"ACTIVE"}}),
    prisma.deliveryRoute.count({where:{status:{in:["PENDING","IN_PROGRESS"]}}}),
    prisma.order.findMany({where:{OR:[{collectionAt:{gte:start,lt:end}},{deliveryExpectedAt:{gte:start,lt:end}}],status:{not:"CANCELED"}},take:10,orderBy:{collectionAt:"asc"},include:{customer:{select:{name:true}}}}),
    prisma.auditLog.findMany({take:6,orderBy:{createdAt:"desc"},include:{actor:{select:{name:true}}}}),
    prisma.payment.findMany({where:{status:"PAID",paidAt:{gte:new Date(Date.now()-30*86400000)}},select:{amount:true,paidAt:true}})
  ]);
  const receivedToday=Number(revenue._sum.amount??0);const avgTicket=ordersToday?receivedToday/ordersToday:0;const delayed=await prisma.order.count({where:{deliveryExpectedAt:{lt:now},status:{notIn:["DELIVERED","CANCELED"]}}});
  const revenueWeek=[6,5,4,3,2,1,0].map(off=>{const d=new Date();d.setDate(d.getDate()-off);const key=d.toISOString().slice(0,10);return{d:d.toLocaleDateString("pt-BR",{weekday:"short"}).replace(".",""),v:paid30.filter(p=>p.paidAt?.toISOString().slice(0,10)===key).reduce((a,p)=>a+Number(p.amount),0)}});
  return {ordersToday,pending,revenueToday:receivedToday,deliveriesToday,collectionsToday,pendingPayment:Number(pendingPay._sum.amount??0),avgTicket,delayed,activeDrivers:drivers,openRoutes,recent,byStatus:byStatus.map(x=>({status:x.status,count:x._count._all})),payments:payments.map(x=>({status:x.status,amount:Number(x._sum.amount??0)})),todayAgenda,alerts:delayed?[{tone:"danger",title:`${delayed} entrega(s) atrasada(s)`,text:"Revise a agenda operacional"}]:[],topServices:[],revenueWeek,activity:logs.map(x=>({actor:x.actor?.name??"Sistema",action:`${x.action} em ${x.entity}`,when:x.createdAt.toLocaleString("pt-BR")}))};
}

export async function getAdminCustomers(){
  if(!prisma)return demoCustomers;
  const rows=await prisma.user.findMany({where:{role:"CUSTOMER"},orderBy:{createdAt:"desc"},include:{_count:{select:{customerOrders:true}},customerOrders:{select:{total:true,createdAt:true},orderBy:{createdAt:"desc"}}}});
  return rows.map(x=>({...x,totalSpent:x.customerOrders.reduce((a,o)=>a+Number(o.total),0),lastOrderAt:x.customerOrders[0]?.createdAt??null}));
}
export async function getAdminStaff(){if(!prisma)return[{id:"a1",name:"Administrador",email:"admin@lavanderia.local",role:"ADMIN",status:"ACTIVE",permissions:["*"],staffProfile:null},{id:"m1",name:"Ana Operação",email:"ana@lavanderia.local",role:"MANAGER",status:"ACTIVE",permissions:["orders.view","orders.manage","customers.view","routes.manage"],staffProfile:null},...demoDrivers.map(d=>({...d,role:"DRIVER",permissions:[]}))];return prisma.user.findMany({where:{role:{not:"CUSTOMER"}},include:{staffProfile:true},orderBy:{name:"asc"}});}
export async function getAdminServices(){if(!prisma)return demoServices;return prisma.service.findMany({orderBy:[{active:"desc"},{sortOrder:"asc"},{name:"asc"}]});}
export async function getAdminCoupons(){if(!prisma)return[{id:"cup1",code:"BEMVINDO10",description:"10% na primeira experiência",type:"PERCENT",value:10,minOrder:0,usedCount:18,maxUses:100,active:true,expiresAt:new Date("2026-12-31")},{id:"cup2",code:"FRETEGRATIS",description:"R$ 15 de desconto",type:"FIXED",value:15,minOrder:80,usedCount:9,maxUses:50,active:true,expiresAt:new Date("2026-09-30")}];return prisma.coupon.findMany({orderBy:{createdAt:"desc"}});}
export async function getAdminRegions(){if(!prisma)return[{id:"reg1",name:"Centro expandido",city:"São Paulo",state:"SP",collectionFee:7.9,deliveryFee:7.9,minOrderValue:25,active:true},{id:"reg2",name:"Zona Sul",city:"São Paulo",state:"SP",collectionFee:9.9,deliveryFee:9.9,minOrderValue:35,active:true},{id:"reg3",name:"Zona Oeste",city:"São Paulo",state:"SP",collectionFee:8.9,deliveryFee:8.9,minOrderValue:30,active:true}];return prisma.serviceRegion.findMany({orderBy:[{active:"desc"},{name:"asc"}]});}
export async function getAdminSlots(){if(!prisma)return[1,2,3,4,5,6].map(d=>({id:`s${d}`,weekday:d,startTime:d===6?"09:00":"08:00",endTime:d===6?"14:00":"20:00",intervalMin:60,capacity:d===6?5:10,active:true}));return prisma.availabilitySlot.findMany({orderBy:[{weekday:"asc"},{startTime:"asc"}]});}
export async function getAdminRoutes(){if(!prisma)return[{id:"r1",type:"DELIVERY",status:"IN_PROGRESS",createdAt:new Date("2026-08-11T12:40:00-03:00"),order:{id:"demo-008",number:"LAV-20260811-84A8C4",customer:{name:"Gustavo Freitas"}},driver:demoDrivers[0]},{id:"r2",type:"COLLECTION",status:"IN_PROGRESS",createdAt:new Date("2026-08-11T12:55:00-03:00"),order:{id:"demo-003",number:"LAV-20260811-31B7D8",customer:{name:"Camila Santos"}},driver:demoDrivers[1]},{id:"r3",type:"COLLECTION",status:"PENDING",createdAt:new Date("2026-08-11T13:05:00-03:00"),order:{id:"demo-002",number:"LAV-20260811-22F9C1",customer:{name:"Paulo Ribeiro"}},driver:demoDrivers[2]},{id:"r4",type:"DELIVERY",status:"PENDING",createdAt:new Date("2026-08-11T13:10:00-03:00"),order:{id:"demo-005",number:"LAV-20260811-55C6A9",customer:{name:"Bianca Melo"}},driver:demoDrivers[3]}];return prisma.deliveryRoute.findMany({take:100,orderBy:{createdAt:"desc"},include:{order:{include:{customer:{select:{name:true}}}},driver:{include:{staffProfile:true}},locations:{take:1,orderBy:{createdAt:"desc"}}}});}
export async function getAdminAudit(){if(!prisma)return[{id:"au1",action:"STATUS_CHANGE",entity:"Order",entityId:"demo-001",createdAt:new Date("2026-08-11T13:31:00-03:00"),actor:{name:"Ana Operação"},metadata:{from:"COLLECTED",to:"IN_PROCESS"}},{id:"au2",action:"PAYMENT_UPDATE",entity:"Payment",entityId:"pay-demo",createdAt:new Date("2026-08-11T13:18:00-03:00"),actor:null,metadata:{status:"PAID",method:"PIX"}},{id:"au3",action:"ASSIGN",entity:"DeliveryRoute",entityId:"r2",createdAt:new Date("2026-08-11T13:02:00-03:00"),actor:{name:"Administrador"},metadata:{driver:"Rafael Lima"}},{id:"au4",action:"CREATE",entity:"Coupon",entityId:"cup2",createdAt:new Date("2026-08-11T12:44:00-03:00"),actor:{name:"Administrador"},metadata:{code:"FRETEGRATIS"}}];return prisma.auditLog.findMany({take:100,orderBy:{createdAt:"desc"},include:{actor:{select:{name:true,email:true}}}});}
export async function getAdminLockers(){if(!prisma)return[{id:"l1",name:"Armário 01",externalId:"LOCKER-001",locationName:"Unidade Centro",address:"Av. Paulista, 1000",compartment:"A01",status:"AVAILABLE",active:true},{id:"l2",name:"Armário 02",externalId:"LOCKER-002",locationName:"Unidade Centro",address:"Av. Paulista, 1000",compartment:"A02",status:"RESERVED",active:true},{id:"l3",name:"Armário 03",externalId:"LOCKER-003",locationName:"Shopping Sul",address:"Av. Jabaquara, 1800",compartment:"B01",status:"OCCUPIED",active:true}];return prisma.locker.findMany({orderBy:[{locationName:"asc"},{name:"asc"}]});}
