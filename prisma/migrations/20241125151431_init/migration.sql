/*
  Warnings:

  - Added the required column `surcharge` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "surcharge" INTEGER NOT NULL;
