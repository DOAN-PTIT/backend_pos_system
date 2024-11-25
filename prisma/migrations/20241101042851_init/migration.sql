/*
  Warnings:

  - Added the required column `delivery_address` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delivery_company` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delivery_cost` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delivery_cost_shop` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discount_percent` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimated_delivery` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paid` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipient_name` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipient_phone_number` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopuser_id` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_cost` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tracking_number` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "delivery_address" TEXT NOT NULL,
ADD COLUMN     "delivery_company" TEXT NOT NULL,
ADD COLUMN     "delivery_cost" INTEGER NOT NULL,
ADD COLUMN     "delivery_cost_shop" INTEGER NOT NULL,
ADD COLUMN     "discount_percent" INTEGER NOT NULL,
ADD COLUMN     "estimated_delivery" TIMESTAMPTZ(6) NOT NULL,
ADD COLUMN     "paid" INTEGER NOT NULL,
ADD COLUMN     "recipient_name" TEXT NOT NULL,
ADD COLUMN     "recipient_phone_number" TEXT NOT NULL,
ADD COLUMN     "shopuser_id" INTEGER NOT NULL,
ADD COLUMN     "total_cost" INTEGER NOT NULL,
ADD COLUMN     "tracking_number" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopuser_id_fkey" FOREIGN KEY ("shopuser_id") REFERENCES "ShopUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
