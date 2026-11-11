ALTER TABLE "Product" ADD COLUMN "isGeneralStore" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "pickupPersonName" TEXT;
