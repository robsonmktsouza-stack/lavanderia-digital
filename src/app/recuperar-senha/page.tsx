import Link from "next/link";
import { WashingMachine } from "lucide-react";
import { ResetForm } from "@/components/customer/reset-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10"><div className="w-full max-w-md">
    <Link href="/" className="mb-5 flex items-center justify-center gap-2 text-sm font-semibold"><span className="grid size-9 place-items-center rounded-xl bg-[var(--brand)] text-white"><WashingMachine className="size-5"/></span>{process.env.NEXT_PUBLIC_APP_NAME ?? "Lavanderia Digital"}</Link>
    <Card><CardHeader><CardTitle>{token ? "Crie uma nova senha" : "Recuperar senha"}</CardTitle><CardDescription>{token ? "Defina uma senha segura para sua conta." : "Informe seu e-mail e enviaremos um link de recuperação."}</CardDescription></CardHeader><CardContent><ResetForm token={token}/><Link href="/entrar" className="mt-4 block text-center text-xs font-medium text-[var(--brand)]">Voltar para o login</Link></CardContent></Card>
  </div></main>;
}
