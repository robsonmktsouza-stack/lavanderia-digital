import { auth } from "@/auth";
import { hasPermission } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { audit } from "@/lib/audit";

const schema=z.object({
  name:z.string().min(3).optional(),
  email:z.string().email().optional(),
  status:z.enum(["ACTIVE","DISABLED"]).optional(),
  role:z.enum(["ADMIN","MANAGER","ATTENDANT","DRIVER","EMPLOYEE"]).optional(),
  permissions:z.array(z.string()).optional(),
  phone:z.string().nullable().optional(),
  vehicle:z.string().nullable().optional(),
  plate:z.string().nullable().optional()
});

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
  const s=await auth();
  if(!s?.user||!hasPermission(s.user,"staff.manage")) return Response.json({error:"Sem permissão"},{status:403});
  const p=schema.safeParse(await req.json());
  if(!p.success) return Response.json({error:"Dados inválidos"},{status:400});
  if(!prisma) return Response.json({ok:true,demo:true});
  const {id}=await params;
  const target=await prisma.user.findUnique({where:{id},select:{id:true,role:true,email:true}});
  if(!target||target.role==="CUSTOMER") return Response.json({error:"Funcionário não encontrado"},{status:404});
  if(target.role==="ADMIN"&&s.user.role!=="ADMIN") return Response.json({error:"Somente administrador pode editar outro administrador"},{status:403});
  if(p.data.role==="ADMIN"&&s.user.role!=="ADMIN") return Response.json({error:"Somente administrador pode conceder nível administrador"},{status:403});
  const email=p.data.email?.toLowerCase();
  if(email&&email!==target.email){
    const exists=await prisma.user.findUnique({where:{email}});
    if(exists) return Response.json({error:"E-mail já cadastrado"},{status:409});
  }
  await prisma.user.update({where:{id},data:{
    name:p.data.name,
    email,
    status:p.data.status,
    role:p.data.role,
    permissions:p.data.permissions,
    phone:p.data.phone,
    staffProfile:(p.data.vehicle!==undefined||p.data.plate!==undefined)?{upsert:{create:{vehicle:p.data.vehicle,plate:p.data.plate},update:{vehicle:p.data.vehicle,plate:p.data.plate}}}:undefined
  }});
  await audit({actorId:s.user.id,action:"UPDATE",entity:"User",entityId:id,metadata:p.data});
  return Response.json({ok:true});
}
