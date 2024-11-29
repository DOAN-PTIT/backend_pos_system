/*
  Warnings:

  - Added the required column `variation_id` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "delivery_cost" DROP NOT NULL,
ALTER COLUMN "delivery_cost_shop" DROP NOT NULL,
ALTER COLUMN "discount_percent" DROP NOT NULL,
ALTER COLUMN "paid" DROP NOT NULL,
ALTER COLUMN "tracking_number" DROP NOT NULL,
ALTER COLUMN "surcharge" DROP NOT NULL;

-- Step 1: Add the column with a default value
ALTER TABLE "OrderItem" ADD COLUMN "variation_id" INTEGER DEFAULT 0;

-- Step 2: Update existing rows with appropriate values
UPDATE "OrderItem" SET "variation_id" = (SELECT id FROM "Variation" LIMIT 1);

-- Step 3: Alter the column to remove the default value and set it as NOT NULL
ALTER TABLE "OrderItem" ALTER COLUMN "variation_id" SET NOT NULL,
ALTER COLUMN "variation_id" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variation_id_fkey" FOREIGN KEY ("variation_id") REFERENCES "Variation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
