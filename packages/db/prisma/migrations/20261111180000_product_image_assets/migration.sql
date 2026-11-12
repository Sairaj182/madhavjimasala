CREATE TABLE "ProductImageAsset" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "secureUrl" TEXT NOT NULL,
    "format" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "bytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductImageAsset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductImageAsset_publicId_key" ON "ProductImageAsset"("publicId");
CREATE INDEX "ProductImageAsset_productId_idx" ON "ProductImageAsset"("productId");
ALTER TABLE "ProductImageAsset" ADD CONSTRAINT "ProductImageAsset_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
