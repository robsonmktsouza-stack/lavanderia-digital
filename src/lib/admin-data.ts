import { prisma } from "@/lib/prisma";
import { demoOrders, demoServices, demoDrivers } from "@/lib/demo-data";

export async function getDashboardStats(){
  if(!prisma)return {ordersToday:8,pending:5,revenueToday:742.4,deliveriesToday:6,recent:demoOrders,byStatus:[{status:"IN_PROCESS",count:4},{status:"COLLECTION_SCHEDULED",count:3},{status:"DELIVERED",count:12}],payments:[{status:"PAID",amount:5820.5},{status:"PENDING",amount:680.2}]};
  const start=new Date();start.setHours(0,0,0,0);const end=new Date(start);end.setDate(end.getDate()+1);
  const [ordersToday,pending,revenue,deliveriesToday,recent,byStatus,payments]=await Promise.all([
    prisma.order.count({where:{createdAt:{gte:start,lt:end}}}),
    prisma.order.count({where:{status:{notIn:["DELIVERED","CANCELED"]}}}),
    prisma.payment.aggregate({_sum:{amount:true},where:{status:"PAID",paidAt:{gte:start,lt:end}}}),
    prisma.order.count({where:{deliveryExpectedAt:{gte:start,lt:end},status:{not:"CANCELED"}}}),
    prisma.order.findMany({take:8,orderBy:{createdAt:"desc"},include:{customer:{select:{name:true}},payments:{take:1,orderBy:{createdAt:"desc"}}}}),
    prisma.order.groupBy({by:["status"],_count:{_all:true}}),
    prisma.payment.groupBy({by:["status"],_sum:{amount:true}})
  ]);
  return {ordersToday,pending,revenueToday:Number(revenue._sum.amount??0),deliveriesToday,recent,byStatus:byStatus.map(x=>({status:x.status,count:x._count._all})),payments:payments.map(x=>({status:x.status,amount:Number(x._sum.amount??0)}))};
}

export async function getAdminCustomers(){if(!prisma)return[{id:"c1",name:"Cliente Demonstração",email:"cliente@lavanderia.local",phone:"11988887777",createdAt:new Date(),_count:{customerOrders:2}}];return prisma.user.findMany({where:{role:"CUSTOMER"},orderBy:{createdAt:"desc"},include:{_count:{select:{customerOrders:true}}}});}
export async function getAdminStaff(){if(!prisma)return[{id:"a1",name:"Administrador",email:"admin@lavanderia.local",role:"ADMIN",status:"ACTIVE",permissions:["*"],staffProfile:null},{id:"d1",name:"Carlos Motorista",email:"motorista@lavanderia.local",role:"DRIVER",status:"ACTIVE",permissions:[],staffProfile:{vehicle:"Fiat Fiorino",plate:"ABC1D23"}}];return prisma.user.findMany({where:{role:{not:"CUSTOMER"}},include:{staffProfile:true},orderBy:{name:"asc"}});}
export async function getAdminServices(){if(!prisma)return demoServices.map(s=>({...s,active:true,sortOrder:0}));return prisma.service.findMany({orderBy:[{active:"desc"},{sortOrder:"asc"},{name:"asc"}]});}
export async function getAdminCoupons(){if(!prisma)return[{id:"cup1",code:"BEMVINDO10",description:"10% na primeira experiência",type:"PERCENT",value:10,minOrder:0,usedCount:4,maxUses:null,active:true,expiresAt:null}];return prisma.coupon.findMany({orderBy:{createdAt:"desc"}});}
export async function getAdminRegions(){if(!prisma)return[{id:"reg1",name:"São Paulo - Centro expandido",city:"São Paulo",state:"SP",collectionFee:7.9,deliveryFee:7.9,minOrderValue:25,active:true}];return prisma.serviceRegion.findMany({orderBy:[{active:"desc"},{name:"asc"}]});}
export async function getAdminSlots(){if(!prisma)return[1,2,3,4,5].map(d=>({id:`s${d}`,weekday:d,startTime:"08:00",endTime:"18:00",intervalMin:60,capacity:8,active:true}));return prisma.availabilitySlot.findMany({orderBy:[{weekday:"asc"},{startTime:"asc"}]});}
export async function getAdminRoutes(){if(!prisma)return[{id:"r1",type:"DELIVERY",status:"IN_PROGRESS",createdAt:new Date(),order:{id:"demo-001",number:"LAV-20260810-01A2B3",customer:{name:"Cliente Demonstração"}},driver:demoDrivers[0]}];return prisma.deliveryRoute.findMany({take:100,orderBy:{createdAt:"desc"},include:{order:{include:{customer:{select:{name:true}}}},driver:{include:{staffProfile:true}}}});}
