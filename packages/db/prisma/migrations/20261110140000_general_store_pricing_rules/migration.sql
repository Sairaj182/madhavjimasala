ALTER TABLE "Product" ADD COLUMN "allowLooseQuantity" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "loosePricingRules" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "CartItem" ADD COLUMN "selectionType" TEXT NOT NULL DEFAULT 'PACKED';
ALTER TABLE "CartItem" ADD COLUMN "selectionKey" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "CartItem" ADD COLUMN "requestedWeightGrams" INTEGER;

ALTER TABLE "OrderItem" ADD COLUMN "selectionType" TEXT NOT NULL DEFAULT 'PACKED';
ALTER TABLE "OrderItem" ADD COLUMN "requestedWeightGrams" INTEGER;
ALTER TABLE "OrderItem" ADD COLUMN "acceptedWeightGrams" INTEGER;
ALTER TABLE "OrderItem" ADD COLUMN "pricingUnit" TEXT NOT NULL DEFAULT 'PACK';

UPDATE "CartItem"
SET "selectionKey" = 'packed-' || "packingLabel"
WHERE "selectionKey" = 'default';

CREATE UNIQUE INDEX "CartItem_cartId_productId_selectionKey_key"
ON "CartItem"("cartId", "productId", "selectionKey");
