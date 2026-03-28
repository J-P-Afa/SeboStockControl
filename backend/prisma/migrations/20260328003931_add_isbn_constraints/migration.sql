/*
  Warnings:

  - You are about to drop the `Book` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EditionType" AS ENUM ('normal', 'variante');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('novo', 'usado');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('completo', 'em_lancamento');

-- DropTable
DROP TABLE "Book";

-- CreateTable
CREATE TABLE "books" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "isbn13" CHAR(13),
    "isbn10" CHAR(10),
    "editionType" "EditionType" NOT NULL DEFAULT 'normal',
    "volume" VARCHAR(50),
    "condition" "Condition" NOT NULL,
    "status" "Status" NOT NULL,
    "weight" DECIMAL(8,2) NOT NULL,
    "publisherId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publishers" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(150) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publishers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "books_title_idx" ON "books"("title");

-- CreateIndex
CREATE INDEX "books_isbn13_idx" ON "books"("isbn13");

-- CreateIndex
CREATE INDEX "books_isbn10_idx" ON "books"("isbn10");

-- CreateIndex
CREATE INDEX "books_genreId_idx" ON "books"("genreId");

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "publishers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ISBN13
CREATE UNIQUE INDEX uq_isbn13_novo  
ON books (isbn13) 
WHERE isbn13 IS NOT NULL AND condition = 'novo';

CREATE UNIQUE INDEX uq_isbn13_usado 
ON books (isbn13) 
WHERE isbn13 IS NOT NULL AND condition = 'usado';

-- ISBN10
CREATE UNIQUE INDEX uq_isbn10_novo  
ON books (isbn10) 
WHERE isbn10 IS NOT NULL AND condition = 'novo';

CREATE UNIQUE INDEX uq_isbn10_usado 
ON books (isbn10) 
WHERE isbn10 IS NOT NULL AND condition = 'usado';