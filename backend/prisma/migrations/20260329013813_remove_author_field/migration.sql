/*
  Warnings:

  - You are about to drop the column `author` on the `books` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[isbn13,condition]` on the table `books` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[isbn10,condition]` on the table `books` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "books_isbn10_key";

-- DropIndex
DROP INDEX "books_isbn13_key";

-- AlterTable
ALTER TABLE "books" DROP COLUMN "author";

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn13_condition_key" ON "books"("isbn13", "condition");

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn10_condition_key" ON "books"("isbn10", "condition");
