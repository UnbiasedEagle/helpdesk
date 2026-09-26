import "dotenv/config";
import { auth } from "../src/lib/auth.js";
import { Role } from "../src/lib/permissions.js";
import { prisma } from "../src/prisma.js";

async function main() {
  // Better Auth stores emails lowercased, so match that for the existence check.
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin ${email} already exists, skipping.`);
    return;
  }

  // Goes through Better Auth so the password is hashed and the credential account is created.
  await auth.api.createUser({
    body: { email, password, name, role: Role.Admin },
  });
  console.log(`Created admin ${email}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
