/*
  Warnings:

  - You are about to drop the column `variationId` on the `Promotion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[variation_id]` on the table `PromotionItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_variationId_fkey";

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "variationId";

-- CreateIndex
CREATE UNIQUE INDEX "PromotionItem_variation_id_key" ON "PromotionItem"("variation_id");
