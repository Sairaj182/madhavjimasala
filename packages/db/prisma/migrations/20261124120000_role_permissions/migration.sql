CREATE TABLE "RolePermission" (
  "id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "feature" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RolePermission_role_feature_key" ON "RolePermission"("role", "feature");
CREATE INDEX "RolePermission_role_idx" ON "RolePermission"("role");
