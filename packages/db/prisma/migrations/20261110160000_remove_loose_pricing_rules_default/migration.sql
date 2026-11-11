-- Align the database default with the Prisma schema after the column is created.
ALTER TABLE "Product" ALTER COLUMN "loosePricingRules" DROP DEFAULT;
