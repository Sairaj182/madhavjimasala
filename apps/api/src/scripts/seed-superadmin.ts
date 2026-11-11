import { auth } from "@repo/auth";
import { prisma } from "@repo/db";

const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SUPERADMIN_PASSWORD;
const name = process.env.SUPERADMIN_NAME?.trim() || "Super Admin";

async function main() {
  if (!email || !password) {
    throw new Error(
      "SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set before seeding the superadmin",
    );
  }

  if (password.length < 8) {
    throw new Error("SUPERADMIN_PASSWORD must be at least 8 characters long");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        role: "SUPER_ADMIN",
        isActive: true,
        banned: false,
        banReason: null,
        banExpires: null,
      },
    });

    console.log(`Promoted existing user ${email} to SUPER_ADMIN.`);
    return;
  }

  const result = await auth.api.signUpEmail({
    body: { name, email, password },
  });

  if (!result.user) {
    throw new Error("Better Auth did not return the created superadmin user");
  }

  await prisma.user.update({
    where: { id: result.user.id },
    data: {
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log(`Created superadmin ${email}.`);
}

main()
  .catch((error) => {
    console.error("Failed to seed superadmin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
