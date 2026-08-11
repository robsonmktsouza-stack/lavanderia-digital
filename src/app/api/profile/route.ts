import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
const schema=z.object({name:z.string().min(2).max(100),phone:z.string().max(20).optional().nullable(),cpf:z.string().max(14).optional().nullable()});
export async function PATCH(req:Request){const s=await auth();if(!s?.user)return Response.json({error:"Não autorizado"},{status:401});const p=schema.safeParse(await req.json());if(!p.success)return Response.json({error:"Dados inválidos"},{status:400});if(!prisma)return Response.json({ok:true});try{const user=await prisma.user.update({where:{id:s.user.id},data:{name:p.data.name,phone:p.data.phone?.replace(/\D/g,"")||null,cpf:p.data.cpf?.replace(/\D/g,"")||null},select:{name:true,phone:true,cpf:true,email:true}});return Response.json({ok:true,user});}catch{return Response.json({error:"Não foi possível salvar. Confira se o CPF já está em uso."},{status:409});}}
