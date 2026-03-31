-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_genre_id_fkey";

-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_language_id_fkey";

-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_publisher_id_fkey";

-- AlterTable
ALTER TABLE "books" ALTER COLUMN "publisher_id" DROP NOT NULL,
ALTER COLUMN "language_id" DROP NOT NULL,
ALTER COLUMN "genre_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "publishers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE SET NULL ON UPDATE CASCADE;
