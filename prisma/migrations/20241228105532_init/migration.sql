-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shop_delivery_company_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shop_delivery_company_id_fkey" FOREIGN KEY ("shop_delivery_company_id") REFERENCES "ShopDeliveryCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;
