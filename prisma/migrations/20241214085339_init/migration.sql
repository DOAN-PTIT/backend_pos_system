/*
  Warnings:

  - You are about to drop the column `is_discount_percent` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `PromotionItem` table. All the data in the column will be lost.
  - Added the required column `discount` to the `PromotionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_discount_percent` to the `PromotionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_discount` to the `PromotionItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PromotionItem" DROP CONSTRAINT "PromotionItem_product_id_fkey";

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "is_discount_percent",
DROP COLUMN "value",
ADD COLUMN     "condition" JSONB,
ADD COLUMN     "variationId" INTEGER,
ALTER COLUMN "name" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "PromotionItem" DROP COLUMN "product_id",
ADD COLUMN     "discount" INTEGER NOT NULL,
ADD COLUMN     "is_discount_percent" BOOLEAN NOT NULL,
ADD COLUMN     "max_discount" INTEGER NOT NULL,
ADD COLUMN     "variation_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_variationId_fkey" FOREIGN KEY ("variationId") REFERENCES "Variation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionItem" ADD CONSTRAINT "PromotionItem_variation_id_fkey" FOREIGN KEY ("variation_id") REFERENCES "Variation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
