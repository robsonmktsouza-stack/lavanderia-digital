"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetForm({ token }: { token?: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (token) return <form className="space-y-4" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setError(""); setMsg("");
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password !== confirm) { setBusy(false); setError("As senhas não coincidem."); return; }
    const r = await fetch("/api/password-reset/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password }) });
    const d = await r.json(); setBusy(false);
    if (!r.ok) { setError(d.error ?? "Não foi possível alterar a senha."); return; }
    setMsg("Senha alterada com sucesso. Redirecionando para o login...");
    setTimeout(() => router.push("/entrar"), 700);
  }}>
    <div className="space-y-1.5"><Label>Nova senha</Label><Input name="password" type="password" minLength={8} required /></div>
    <div className="space-y-1.5"><Label>Confirmar nova senha</Label><Input name="confirm" type="password" minLength={8} required /></div>
    <Button className="w-full" disabled={busy}>{busy ? "Alterando..." : "Alterar senha"}</Button>
    {error && <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
    {msg && <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">{msg}</p>}
  </form>;

  return <form className="space-y-4" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setError("");
    const fd = new FormData(e.currentTarget);
    const r = await fetch("/api/password-reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: fd.get("email") }) });
    const d = await r.json(); setBusy(false);
    setMsg(d.devResetUrl ? `Modo desenvolvimento: ${d.devResetUrl}` : "Se o e-mail estiver cadastrado, enviaremos as instruções.");
  }}>
    <div className="space-y-1.5"><Label>E-mail</Label><Input name="email" type="email" required /></div>
    <Button className="w-full" disabled={busy}>{busy ? "Enviando..." : "Enviar instruções"}</Button>
    {msg && <p className="break-all rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{msg}</p>}
  </form>;
}
