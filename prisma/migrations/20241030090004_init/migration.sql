/*
  Warnings:

  - Made the column `phone_number` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "date_of_birth" DATE,
ALTER COLUMN "phone_number" SET NOT NULL;
