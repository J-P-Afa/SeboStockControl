-- DropForeignKey
ALTER TABLE "entrada" DROP CONSTRAINT "entrada_book_id_fkey";

-- DropForeignKey
ALTER TABLE "estoque" DROP CONSTRAINT "estoque_book_id_fkey";

-- DropForeignKey
ALTER TABLE "saida" DROP CONSTRAINT "saida_book_id_fkey";

-- AddForeignKey
ALTER TABLE "estoque" ADD CONSTRAINT "estoque_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrada" ADD CONSTRAINT "entrada_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saida" ADD CONSTRAINT "saida_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
