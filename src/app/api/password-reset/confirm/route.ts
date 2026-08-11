import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ token: z.string().min(20), password: z.string().min(8).max(128) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Dados inválidos." }, { status: 400 });
  if (!prisma) return Response.json({ ok: true, demo: true });

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const reset = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return Response.json({ error: "Este link expirou ou já foi utilizado." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    prisma.passwordResetToken.updateMany({ where: { userId: reset.userId, usedAt: null, id: { not: reset.id } }, data: { usedAt: new Date() } })
  ]);
  return Response.json({ ok: true });
}
