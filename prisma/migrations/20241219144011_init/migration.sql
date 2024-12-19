/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Purchases` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Purchases" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;
