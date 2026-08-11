"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BarChart3, CalendarDays, CircleDollarSign, ClipboardList, Gift, House, LogOut, MapPinned, MessageCircle, PackageCheck, Route, Settings, Shirt, Tags, UserRound, UsersRound, Truck, WashingMachine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; permission?: string };

const customerNav: NavItem[] = [
  { href: "/app", label: "Início", icon: House },
  { href: "/app/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/app/enderecos", label: "Endereços", icon: MapPinned },
  { href: "/app/perfil", label: "Minha conta", icon: UserRound }
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Visão geral", icon: BarChart3 },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList, permission: "orders.view" },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays, permission: "routes.manage" },
  { href: "/admin/clientes", label: "Clientes", icon: UsersRound, permission: "customers.view" },
  { href: "/admin/equipe", label: "Equipe", icon: UserRound, permission: "staff.manage" },
  { href: "/admin/motoristas", label: "Motoristas", icon: Truck, permission: "routes.manage" },
  { href: "/admin/servicos", label: "Serviços e preços", icon: Shirt, permission: "services.manage" },
  { href: "/admin/rotas", label: "Rotas", icon: Route, permission: "routes.manage" },
  { href: "/admin/cupons", label: "Cupons", icon: Gift, permission: "settings.manage" },
  { href: "/admin/regioes", label: "Regiões e taxas", icon: Tags, permission: "settings.manage" },
  { href: "/admin/financeiro", label: "Financeiro", icon: CircleDollarSign, permission: "finance.view" },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings, permission: "settings.manage" }
];

const driverNav: NavItem[] = [
  { href: "/motorista", label: "Minha rota", icon: Route },
  { href: "/motorista/pedidos", label: "Pedidos", icon: PackageCheck },
  { href: "/motorista/perfil", label: "Perfil", icon: UserRound }
];

export function AppShell({ role, userName, permissions = [], supportWhatsapp, children }: { role: string; userName?: string | null; permissions?: string[]; supportWhatsapp?: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const can = (permission?: string) => !permission || role === "ADMIN" || permissions.includes("*") || permissions.includes(permission);
  const nav = role === "DRIVER" ? driverNav : role === "CUSTOMER" ? customerNav : adminNav.filter(item => can(item.permission));
  const mobile = nav.slice(0, 4);
  const title = role === "DRIVER" ? "Área do motorista" : role === "CUSTOMER" ? "Área do cliente" : "Gestão da lavanderia";

  return <div className="app-grid">
    <aside className="app-sidebar no-print">
      <div className="flex h-full flex-col px-3 py-4">
        <Link href={nav[0].href} className="mb-6 flex items-center gap-3 px-2">
          <span className="grid size-9 place-items-center rounded-[10px] bg-[var(--brand)] text-white"><WashingMachine className="size-5" /></span>
          <span><strong className="block text-sm tracking-tight">{process.env.NEXT_PUBLIC_APP_NAME ?? "Lavanderia Digital"}</strong><small className="text-[11px] text-slate-500">{title}</small></span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {nav.map((item) => {
            const active = item.href === pathname || (item.href !== nav[0].href && pathname.startsWith(item.href));
            return <Link key={item.href} href={item.href} className={cn("flex h-9 items-center gap-2.5 rounded-[8px] px-3 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900", active && "bg-blue-50 text-[var(--brand)]") }>
              <item.icon className="size-4" /><span>{item.label}</span>
            </Link>;
          })}
        </nav>
        <div className="mt-4 border-t pt-4">
          <div className="mb-3 px-2"><div className="truncate text-xs font-semibold">{userName ?? "Usuário"}</div><div className="text-[10px] uppercase tracking-wide text-slate-400">{role}</div></div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-slate-600" onClick={() => signOut({ callbackUrl: "/entrar" })}><LogOut className="size-4" /> Sair</Button>
        </div>
      </div>
    </aside>
    <main className="app-content">{children}</main>
    {role === "CUSTOMER" && supportWhatsapp && <a className="fixed bottom-20 right-4 z-30 grid size-12 place-items-center rounded-full bg-emerald-600 text-white shadow-lg no-print md:bottom-5" href={`https://wa.me/${supportWhatsapp.replace(/\D/g, "")}`} target="_blank" aria-label="Atendimento pelo WhatsApp"><MessageCircle className="size-5" /></a>}
    <nav className="mobile-bottom-nav no-print safe-bottom">
      {mobile.map(item => {
        const active = item.href === pathname || (item.href !== mobile[0].href && pathname.startsWith(item.href));
        return <Link key={item.href} href={item.href} className={cn("flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold text-slate-500", active && "text-[var(--brand)]") }><item.icon className="size-[18px]" /><span className="max-w-full truncate">{item.label}</span></Link>;
      })}
    </nav>
  </div>;
}
