import { requireRole } from "@/lib/access";import { AppShell } from "@/components/layout/app-shell";
export default async function Layout({children}:{children:React.ReactNode}){const s=await requireRole(["DRIVER"]);return <AppShell role="DRIVER" userName={s.user.name}>{children}</AppShell>}
