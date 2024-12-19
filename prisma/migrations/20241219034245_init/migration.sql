-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "status" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "Purchases" ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
