/*
  Warnings:

  - You are about to drop the column `discount_percent` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "discount_percent",
ADD COLUMN     "total_discount" INTEGER;
