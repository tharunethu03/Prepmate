import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

const globalForPrisma = global as unknown as {
  prisma: typeof prisma | undefined;
};

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
