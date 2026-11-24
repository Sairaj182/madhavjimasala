CREATE INDEX "Order_pickupSlotId_status_idx" ON "Order"("pickupSlotId", "status");
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
