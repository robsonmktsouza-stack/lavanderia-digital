import { prisma } from "@/lib/prisma";

export async function audit(input: { actorId?: string | null; action: any; entity: string; entityId?: string | null; metadata?: Record<string, unknown> }) {
  if (!prisma) return;
  await prisma.auditLog.create({ data: { actorId: input.actorId ?? null, action: input.action, entity: input.entity, entityId: input.entityId ?? null, metadata: input.metadata ?? undefined } });
}
