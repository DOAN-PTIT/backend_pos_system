-- AlterTable
ALTER TABLE "Purchases" ADD COLUMN     "shop_user_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_shop_user_id_fkey" FOREIGN KEY ("shop_user_id") REFERENCES "ShopUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
