ALTER TABLE "Product" ADD COLUMN "priceInPaise" INTEGER NOT NULL DEFAULT 0;

UPDATE "Product"
SET "priceInPaise" = "price" * 100
WHERE "priceInPaise" = 0;
