-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT;
