-- CreateTable
CREATE TABLE "DeliveryCompany" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "DeliveryCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopDeliveryCompany" (
    "id" SERIAL NOT NULL,
    "price" INTEGER NOT NULL,
    "is_active" BOOLEAN,
    "shop_id" INTEGER,
    "delivery_company_id" INTEGER,

    CONSTRAINT "ShopDeliveryCompany_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShopDeliveryCompany" ADD CONSTRAINT "ShopDeliveryCompany_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopDeliveryCompany" ADD CONSTRAINT "ShopDeliveryCompany_delivery_company_id_fkey" FOREIGN KEY ("delivery_company_id") REFERENCES "DeliveryCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;
