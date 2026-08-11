import { auth } from "@/auth";import { roleHome } from "@/lib/access";
export async function GET(){const s=await auth();return Response.json({authenticated:!!s?.user,role:s?.user?.role,home:roleHome(s?.user?.role)});}
