/*
  Warnings:

  - You are about to drop the column `date_of_birth` on the `ShopCustomer` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `ShopCustomer` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ShopCustomer` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `ShopCustomer` table. All the data in the column will be lost.
  - You are about to drop the column `refferal_code` on the `ShopCustomer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ShopCustomer" DROP COLUMN "date_of_birth",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "phone_number",
DROP COLUMN "refferal_code";

-- AlterTable
ALTER TABLE "ShopUser" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'admin';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user';
