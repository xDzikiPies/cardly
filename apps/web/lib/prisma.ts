import { PrismaClient } from "@prisma/client";

// Zapobiega tworzeniu wielu instancji PrismaClient przy hot-reload w dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
