"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Activity, BarChart3, Bell, Boxes, CalendarDays, CircleDollarSign, ClipboardList, ExternalLink, FileBarChart, Gift, House, LogOut, MapPinned, MessageCircle, PackageCheck, Route, Search, Settings, Shirt, Tags, UserRound, UsersRound, Truck, WashingMachine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; permission?: string };

const customerNav: NavItem[] = [
  { href: "/app", label: "Início", icon: House },{ href: "/app/pedidos", label: "Pedidos", icon: ClipboardList },{ href: "/app/enderecos", label: "Endereços", icon: MapPinned },{ href: "/app/perfil", label: "Minha conta", icon: UserRound }
];
const adminNav: NavItem[] = [
  { href: "/admin", label: "Visão geral", icon: BarChart3 },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList, permission: "orders.view" },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays, permission: "orders.view" },
  { href: "/admin/clientes", label: "Clientes", icon: UsersRound, permission: "customers.view" },
  { href: "/admin/motoristas", label: "Motoristas", icon: Truck, permission: "routes.manage" },
  { href: "/admin/rotas", label: "Rotas", icon: Route, permission: "routes.manage" },
  { href: "/admin/armarios", label: "Armários", icon: Boxes, permission: "settings.manage" },
  { href: "/admin/servicos", label: "Serviços e preços", icon: Shirt, permission: "services.manage" },
  { href: "/admin/cupons", label: "Cupons", icon: Gift, permission: "settings.manage" },
  { href: "/admin/regioes", label: "Regiões e taxas", icon: Tags, permission: "settings.manage" },
  { href: "/admin/financeiro", label: "Financeiro", icon: CircleDollarSign, permission: "finance.view" },
  { href: "/admin/relatorios", label: "Relatórios", icon: FileBarChart, permission: "finance.view" },
  { href: "/admin/equipe", label: "Equipe e permissões", icon: UserRound, permission: "staff.manage" },
  { href: "/admin/auditoria", label: "Auditoria", icon: Activity, permission: "staff.manage" },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings, permission: "settings.manage" }
];
const driverNav: NavItem[] = [{ href: "/motorista", label: "Minha rota", icon: Route },{ href: "/motorista/pedidos", label: "Pedidos", icon: PackageCheck },{ href: "/motorista/perfil", label: "Perfil", icon: UserRound }];

export function AppShell({ role, userName, permissions = [], supportWhatsapp, children }: { role: string; userName?: string | null; permissions?: string[]; supportWhatsapp?: string | null; children: React.ReactNode }) {
  const pathname = usePathname();const can = (permission?: string) => !permission || role === "ADMIN" || permissions.includes("*") || permissions.includes(permission);
  const nav = role === "DRIVER" ? driverNav : role === "CUSTOMER" ? customerNav : adminNav.filter(item => can(item.permission));const mobile = nav.slice(0, 4);
  const title = role === "DRIVER" ? "Área do motorista" : role === "CUSTOMER" ? "Área do cliente" : "Gestão da lavanderia";const isAdmin=!['DRIVER','CUSTOMER'].includes(role);
  return <div className="app-grid">
    <aside className="app-sidebar no-print"><div className="flex h-full flex-col px-3 py-4">
      <Link href={nav[0].href} className="mb-5 flex items-center gap-3 px-2"><span className="grid size-9 place-items-center rounded-[10px] bg-[var(--brand)] text-white"><WashingMachine className="size-5" /></span><span><strong className="block text-sm tracking-tight">{process.env.NEXT_PUBLIC_APP_NAME ?? "Lavanderia Digital"}</strong><small className="text-[11px] text-slate-500">{title}</small></span></Link>
      <nav className="flex-1 space-y-0.5 overflow-y-auto pr-1">{nav.map((item) => {const active = item.href === pathname || (item.href !== nav[0].href && pathname.startsWith(item.href));return <Link key={item.href} href={item.href} className={cn("flex h-9 items-center gap-2.5 rounded-[8px] px-3 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900", active && "bg-blue-50 text-[var(--brand)]")}><item.icon className="size-4" /><span>{item.label}</span></Link>})}</nav>
      <div className="mt-4 border-t pt-4"><div className="mb-3 px-2"><div className="truncate text-xs font-semibold">{userName ?? "Usuário"}</div><div className="text-[10px] uppercase tracking-wide text-slate-400">{role}</div></div><Button variant="ghost" size="sm" className="w-full justify-start text-slate-600" onClick={() => signOut({ callbackUrl: "/entrar" })}><LogOut className="size-4" /> Sair</Button></div>
    </div></aside>
    <main className="app-content">
      {isAdmin&&<div className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur no-print"><div className="flex h-14 items-center gap-3 px-5 lg:px-6"><div className="relative hidden max-w-md flex-1 md:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/><input className="h-9 w-full rounded-lg border bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-[var(--brand)] focus:bg-white" placeholder="Buscar pedido, cliente, telefone ou CPF..."/></div><div className="ml-auto flex items-center gap-2"><span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 sm:flex"><span className="size-1.5 rounded-full bg-emerald-500"/>Operação online</span><Link href="/" target="_blank" className="grid size-9 place-items-center rounded-lg border text-slate-500 hover:bg-slate-50" title="Abrir site"><ExternalLink className="size-4"/></Link><button className="relative grid size-9 place-items-center rounded-lg border text-slate-500 hover:bg-slate-50"><Bell className="size-4"/><span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500 ring-2 ring-white"/></button><div className="grid size-9 place-items-center rounded-full bg-[var(--brand)] text-xs font-bold text-white">{(userName??"A").slice(0,1).toUpperCase()}</div></div></div></div>}
      {children}
    </main>
    {role === "CUSTOMER" && supportWhatsapp && <a className="fixed bottom-20 right-4 z-30 grid size-12 place-items-center rounded-full bg-emerald-600 text-white shadow-lg no-print md:bottom-5" href={`https://wa.me/${supportWhatsapp.replace(/\D/g, "")}`} target="_blank" aria-label="Atendimento pelo WhatsApp"><MessageCircle className="size-5" /></a>}
    <nav className="mobile-bottom-nav no-print safe-bottom">{mobile.map(item => {const active = item.href === pathname || (item.href !== mobile[0].href && pathname.startsWith(item.href));return <Link key={item.href} href={item.href} className={cn("flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold text-slate-500", active && "text-[var(--brand)]")}><item.icon className="size-[18px]" /><span className="max-w-full truncate">{item.label}</span></Link>})}</nav>
  </div>;
}
