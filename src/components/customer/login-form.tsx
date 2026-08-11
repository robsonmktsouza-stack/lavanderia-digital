"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter(); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  return <form className="space-y-4" onSubmit={async e=>{e.preventDefault();setLoading(true);setError("");const fd=new FormData(e.currentTarget);const res=await signIn("credentials",{email:fd.get("email"),password:fd.get("password"),redirect:false});if(res?.error){setError("E-mail ou senha inválidos.");setLoading(false);return;}const r=await fetch("/api/me");const me=await r.json();router.push(me.home ?? "/app");router.refresh();}}>
    <div className="space-y-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" required autoComplete="email" placeholder="voce@exemplo.com"/></div>
    <div className="space-y-1.5"><div className="flex justify-between"><Label htmlFor="password">Senha</Label><a href="/recuperar-senha" className="text-xs font-medium text-[var(--brand)]">Esqueci minha senha</a></div><Input id="password" name="password" type="password" required autoComplete="current-password"/></div>
    {error && <p className="text-xs font-medium text-red-600">{error}</p>}<Button className="w-full" disabled={loading}>{loading?"Entrando...":"Entrar"}</Button>
  </form>;
}
