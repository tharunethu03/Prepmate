import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

const NEW_PASSWORD = "Admin@1234"; // change this to whatever you want

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  if (!admin) {
    console.log("❌ No admin user found.");
    return;
  }

  const hashed = await hash(NEW_PASSWORD, 12);
  await prisma.user.update({
    where: { id: admin.id },
    data: { password: hashed },
  });

  console.log(`✅ Password reset for ${admin.email}`);
  console.log(`   New password: ${NEW_PASSWORD}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
