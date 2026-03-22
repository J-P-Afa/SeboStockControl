/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Book` table. All the data in the column will be lost.
  - Added the required column `price` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "edition" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "publisher" TEXT;
