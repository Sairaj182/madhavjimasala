import { prisma } from "@repo/db";

export type GeneralStoreControls = {
  generalStoreEnabled: boolean;
  generalStoreCatalogueOpen: boolean;
  generalStoreCartOpen: boolean;
  generalStoreCheckoutOpen: boolean;
  generalStoreOrdersOpen: boolean;
  generalStorePickupOpen: boolean;
  generalStoreNotificationsOpen: boolean;
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
  generalStoreMaintenanceMessage: "General Store ordering is temporarily unavailable.",
};

export async function getGeneralStoreControls(): Promise<GeneralStoreControls> {
  const rows = await prisma.$queryRaw<GeneralStoreControls[]>`
    SELECT "generalStoreEnabled", "generalStoreCatalogueOpen", "generalStoreCartOpen",
      "generalStoreCheckoutOpen", "generalStoreOrdersOpen", "generalStorePickupOpen",
      "generalStoreNotificationsOpen", "generalStoreMaintenanceMessage"
    FROM "StoreSettings" WHERE "id" = 'store' LIMIT 1
  `;
  return rows[0] ?? defaultGeneralStoreControls;
}
