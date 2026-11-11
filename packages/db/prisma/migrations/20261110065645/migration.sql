-- Historical compatibility migration already recorded in the development database.
-- It conditionally removes the JSON default when the column already exists;
-- fresh shadow databases safely defer the operation to the later migration.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'Product'
      AND column_name = 'loosePricingRules'
  ) THEN
    ALTER TABLE "Product" ALTER COLUMN "loosePricingRules" DROP DEFAULT;
  END IF;
END $$;
