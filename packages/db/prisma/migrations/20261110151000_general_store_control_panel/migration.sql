ALTER TABLE "StoreSettings" ADD COLUMN "generalStoreEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "StoreSettings" ADD COLUMN "generalStoreCatalogueOpen" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "StoreSettings" ADD COLUMN "generalStoreCartOpen" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "StoreSettings" ADD COLUMN "generalStoreCheckoutOpen" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "StoreSettings" ADD COLUMN "generalStoreOrdersOpen" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "StoreSettings" ADD COLUMN "generalStorePickupOpen" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "StoreSettings" ADD COLUMN "generalStoreNotificationsOpen" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "StoreSettings" ADD COLUMN "generalStoreMaintenanceMessage" TEXT NOT NULL DEFAULT 'General Store ordering is temporarily unavailable.';
