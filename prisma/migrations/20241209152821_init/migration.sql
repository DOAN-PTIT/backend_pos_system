-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "customer_id" DROP NOT NULL,
ALTER COLUMN "shopuser_id" DROP NOT NULL,
ALTER COLUMN "shop_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "product_id" DROP NOT NULL,
ALTER COLUMN "order_id" DROP NOT NULL,
ALTER COLUMN "variation_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "shop_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Promotion" ALTER COLUMN "shop_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PromotionItem" ALTER COLUMN "product_id" DROP NOT NULL,
ALTER COLUMN "promotion_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ShopCustomer" ALTER COLUMN "shop_id" DROP NOT NULL,
ALTER COLUMN "customer_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ShopSetting" ALTER COLUMN "shop_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ShopUser" ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "shop_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Variation" ALTER COLUMN "product_id" DROP NOT NULL;
