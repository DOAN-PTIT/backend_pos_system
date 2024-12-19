-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "shop_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
