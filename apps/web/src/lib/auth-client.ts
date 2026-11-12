import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
const apiUrl = configuredApiUrl.startsWith("http")
  ? configuredApiUrl
  : new URL(
      configuredApiUrl,
      typeof window === "undefined" ? "http://localhost" : window.location.origin,
    ).toString().replace(/\/$/, "");

export const authClient = createAuthClient({
  baseURL: `${apiUrl}/auth`,
  plugins: [
    adminClient()
  ]
});
