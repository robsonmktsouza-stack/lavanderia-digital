import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });

const demoUsers = {
  "admin@lavanderia.local": { id: "demo-admin", name: "Administrador", password: "Admin@123", role: "ADMIN" },
  "motorista@lavanderia.local": { id: "demo-driver", name: "Carlos Motorista", password: "Motorista@123", role: "DRIVER" },
  "cliente@lavanderia.local": { id: "demo-customer", name: "Cliente Demonstração", password: "Cliente@123", role: "CUSTOMER" }
} as const;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  pages: { signIn: "/entrar" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const parsed = schema.safeParse(credentials);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();

        if (!prisma) {
          const demo = demoUsers[email as keyof typeof demoUsers];
          if (!demo || parsed.data.password !== demo.password) return null;
          return { id: demo.id, email, name: demo.name, role: demo.role } as any;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.status !== "ACTIVE") return null;
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        await prisma.$transaction([
          prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
          prisma.auditLog.create({ data: { actorId:user.id, action:"LOGIN", entity:"Session", entityId:user.id } })
        ]);
        return { id: user.id, email: user.email, name: user.name, role: user.role, permissions: user.permissions } as any;
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions ?? [];
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? token.sub ?? "");
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions ?? [];
      }
      return session;
    }
  }
});
