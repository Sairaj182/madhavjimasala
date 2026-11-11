ALTER TABLE "OrderItem" ADD COLUMN "acceptedPackingLabel" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "acceptedPackingWeight" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "fulfillmentNote" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "requestedQuantity" INTEGER NOT NULL DEFAULT 1;

UPDATE "OrderItem"
SET "requestedQuantity" = "quantity"
WHERE "requestedQuantity" = 1 AND "quantity" <> 1;
