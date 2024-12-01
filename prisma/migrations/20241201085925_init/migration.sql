/*
  Warnings:

  - Added the required column `at_counter` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "at_counter" BOOLEAN NOT NULL;
