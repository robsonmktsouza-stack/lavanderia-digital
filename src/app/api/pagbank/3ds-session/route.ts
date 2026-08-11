import { auth } from "@/auth";import { create3DSSession } from "@/lib/pagbank";
export async function POST(){if(!(await auth())?.user)return Response.json({error:"Não autorizado"},{status:401});try{return Response.json(await create3DSSession());}catch(e:any){return Response.json({error:e.message},{status:502});}}
