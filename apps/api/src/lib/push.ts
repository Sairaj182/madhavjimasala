import * as webpush from "web-push";
import { prisma } from "@repo/db";
import { env } from "../env";
import { getGeneralStoreControls } from "./general-store-settings";

type StoredSubscription = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

function pushConfigured() {
  return Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT);
}

function configurePush() {
  if (!pushConfigured()) return false;
  webpush.setVapidDetails(env.VAPID_SUBJECT!, env.VAPID_PUBLIC_KEY!, env.VAPID_PRIVATE_KEY!);
  return true;
}

export function getPushPublicKey() {
  return env.VAPID_PUBLIC_KEY ?? null;
}

export async function notifyUser(userId: string, title: string, body: string, url = "/orders") {
  const controls = await getGeneralStoreControls();
  if (!controls.generalStoreNotificationsOpen) return;
  if (!configurePush()) return;

  const subscriptions = await prisma.$queryRaw<StoredSubscription[]>`
    SELECT "id", "endpoint", "p256dh", "auth"
    FROM "PushSubscription"
    WHERE "userId" = ${userId}
  `;

  await Promise.allSettled(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        JSON.stringify({ title, body, url }),
        { TTL: 86400 },
      );
    } catch (error: unknown) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await prisma.$executeRaw`DELETE FROM "PushSubscription" WHERE "id" = ${subscription.id}`;
      }
    }
  }));
}
