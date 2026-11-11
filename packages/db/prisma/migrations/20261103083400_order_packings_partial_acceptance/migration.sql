ALTER TABLE "CartItem" ADD COLUMN "packingLabel" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "CartItem" ADD COLUMN "packingWeight" TEXT;
ALTER TABLE "Order" ADD COLUMN "serialNumber" SERIAL NOT NULL;
ALTER TABLE "OrderItem" ADD COLUMN "packingLabel" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "OrderItem" ADD COLUMN "packingWeight" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "available" BOOLEAN NOT NULL DEFAULT true;

DROP INDEX "CartItem_cartId_productId_key";
CREATE UNIQUE INDEX "CartItem_cartId_productId_packingLabel_key" ON "CartItem"("cartId", "productId", "packingLabel");
CREATE UNIQUE INDEX "Order_serialNumber_key" ON "Order"("serialNumber");
