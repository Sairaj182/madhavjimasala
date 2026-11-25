import { prisma } from "@repo/db";

export type GeneralStoreControls = {
  generalStoreEnabled: boolean;
  generalStoreCatalogueOpen: boolean;
  generalStoreCartOpen: boolean;
  generalStoreCheckoutOpen: boolean;
  generalStoreOrdersOpen: boolean;
  generalStorePickupOpen: boolean;
  generalStoreNotificationsOpen: boolean;
  generalStoreChatOpen: boolean;
  generalStoreMaintenanceMessage: string;
};

export const defaultGeneralStoreControls: GeneralStoreControls = {
  generalStoreEnabled: true,
  generalStoreCatalogueOpen: true,
  generalStoreCartOpen: true,
  generalStoreCheckoutOpen: true,
  generalStoreOrdersOpen: true,
  generalStorePickupOpen: true,
  generalStoreNotificationsOpen: true,
  generalStoreChatOpen: false,
  generalStoreMaintenanceMessage: "General Store ordering is temporarily unavailable.",
};

export async function getGeneralStoreControls(db: Pick<typeof prisma, "$queryRaw"> = prisma): Promise<GeneralStoreControls> {
  const rows = await db.$queryRaw<GeneralStoreControls[]>`
    SELECT "generalStoreEnabled", "generalStoreCatalogueOpen", "generalStoreCartOpen",
      "generalStoreCheckoutOpen", "generalStoreOrdersOpen", "generalStorePickupOpen",
      "generalStoreNotificationsOpen", "generalStoreChatOpen", "generalStoreMaintenanceMessage"
    FROM "StoreSettings" WHERE "id" = 'store' LIMIT 1
  `;
  return { ...defaultGeneralStoreControls, ...(rows[0] ?? {}) };
}
