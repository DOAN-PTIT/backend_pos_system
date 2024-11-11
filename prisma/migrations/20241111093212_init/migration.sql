/*
  Warnings:

  - You are about to drop the column `image` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price_at_counter` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `retail_price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `product_code` on the `Variation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[variation_code]` on the table `Variation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `variation_code` to the `Variation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Variation_product_code_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "image",
DROP COLUMN "price_at_counter",
DROP COLUMN "retail_price";

-- AlterTable
ALTER TABLE "Variation" DROP COLUMN "product_code",
ADD COLUMN     "variation_code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Variation_variation_code_key" ON "Variation"("variation_code");
