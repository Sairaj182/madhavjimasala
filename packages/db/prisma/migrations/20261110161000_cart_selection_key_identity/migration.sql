-- Cart selections are identified by their canonical selection key.
-- A packing label is not unique for loose quantities because multiple weights
-- can intentionally use the same label (for example, "Loose quantity").
DROP INDEX IF EXISTS "CartItem_cartId_productId_packingLabel_key";
