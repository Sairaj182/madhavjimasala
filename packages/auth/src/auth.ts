import { betterAuth } from "better-auth"
import { prisma } from "@repo/db"

export const auth = betterAuth({
  database: prisma,

  emailAndPassword: {
    enabled: true
  }
})