import { requireRole } from "@/lib/access";import { AppShell } from "@/components/layout/app-shell";
export default async function Layout({children}:{children:React.ReactNode}){const s=await requireRole(["ADMIN","MANAGER","ATTENDANT","EMPLOYEE"]);return <AppShell role={s.user.role??"ADMIN"} userName={s.user.name} permissions={s.user.permissions??[]}>{children}</AppShell>}
