import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@repo/db"
import { createAccessControl, admin } from "better-auth/plugins"

const adminStatements = {
  user: ["create", "list", "set-role", "ban", "impersonate", "impersonate-admins", "delete", "set-password", "get", "update"],
  session: ["list", "revoke", "delete"],
} as const;

const adminAccessControl = createAccessControl(adminStatements);
const ownerRole = adminAccessControl.newRole({
  user: [...adminStatements.user],
  session: [...adminStatements.session],
});
const staffRole = adminAccessControl.newRole({ user: [], session: [] });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["SUPER_ADMIN", "STORE_OWNER", "ADMIN", "admin"],
      roles: {
        user: staffRole,
        STAFF: staffRole,
        staff: staffRole,
        STORE_OWNER: ownerRole,
        store_owner: ownerRole,
        SUPER_ADMIN: ownerRole,
        super_admin: ownerRole,
        superadmin: ownerRole,
        ADMIN: ownerRole,
        admin: ownerRole,
      },
    })
  ],
  emailAndPassword: {
    enabled: true
  },
  trustedOrigins: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["http://localhost:3000"]
})
