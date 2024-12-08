-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "number_of_referrals" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referral_code" TEXT;
