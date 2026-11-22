CREATE TABLE "Testimonial" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT 'Customer',
  "company" TEXT,
  "quote" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "approved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Testimonial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Testimonial_rating_check" CHECK ("rating" BETWEEN 1 AND 5)
);
CREATE INDEX "Testimonial_approved_createdAt_idx" ON "Testimonial"("approved", "createdAt");
CREATE INDEX "Testimonial_userId_createdAt_idx" ON "Testimonial"("userId", "createdAt");
