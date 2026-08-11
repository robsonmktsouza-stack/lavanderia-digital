import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");
  return session;
}

export async function requireRole(roles: string[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role ?? "")) redirect(roleHome(session.user.role));
  return session;
}

export function roleHome(role?: string | null) {
  if (["ADMIN", "MANAGER", "ATTENDANT", "EMPLOYEE"].includes(role ?? "")) return "/admin";
  if (role === "DRIVER") return "/motorista";
  return "/app";
}

export function hasPermission(user: { role?: string | null; permissions?: string[] | null }, permission: string) {
  if (user.role === "ADMIN") return true;
  const list = user.permissions ?? [];
  return list.includes("*") || list.includes(permission);
}

export async function requirePermission(permission: string) {
  const session = await requireSession();
  if (!hasPermission(session.user, permission)) redirect("/admin");
  return session;
}
