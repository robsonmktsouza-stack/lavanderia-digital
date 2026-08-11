import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL;

function createClient() {
  if (!connectionString) return null;
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
}

export const prisma = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production" && prisma) globalForPrisma.prisma = prisma;
