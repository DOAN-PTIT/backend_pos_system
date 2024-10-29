/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[product_code]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[barcode]` on the table `Variation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[product_code]` on the table `Variation` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "phone_number" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "note" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "note" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Shop" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ShopSetting" ADD COLUMN     "auto_product_code" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source_order" TEXT,
ADD COLUMN     "time_zone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_product_code_key" ON "Product"("product_code");

-- CreateIndex
CREATE UNIQUE INDEX "Variation_barcode_key" ON "Variation"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "Variation_product_code_key" ON "Variation"("product_code");
