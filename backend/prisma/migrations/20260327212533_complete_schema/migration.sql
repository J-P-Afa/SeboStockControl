/*
  Warnings:

  - You are about to drop the `Book` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EdicaoEspecial" AS ENUM ('normal', 'variante');

-- CreateEnum
CREATE TYPE "EstadoLivro" AS ENUM ('novo', 'usado');

-- CreateEnum
CREATE TYPE "ColecaoLivro" AS ENUM ('completa', 'em_lancamento');

-- DropTable
DROP TABLE "Book";

-- CreateTable
CREATE TABLE "classificacao" (
    "id" SERIAL NOT NULL,
    "descricao" VARCHAR(100) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editora" (
    "id" SERIAL NOT NULL,
    "descricao" VARCHAR(150) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idioma" (
    "id" SERIAL NOT NULL,
    "descricao" VARCHAR(50) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idioma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canal_venda" (
    "id" SERIAL NOT NULL,
    "descricao" VARCHAR(100) NOT NULL,
    "comissao" DECIMAL(5,4) NOT NULL DEFAULT 0.0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canal_venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forma_pagamento" (
    "id" SERIAL NOT NULL,
    "descricao" VARCHAR(100) NOT NULL,
    "taxa" DECIMAL(5,4) NOT NULL DEFAULT 0.0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forma_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_saida" (
    "id" SERIAL NOT NULL,
    "descricao" VARCHAR(50) NOT NULL,
    "is_venda" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipo_saida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livro" (
    "id" SERIAL NOT NULL,
    "id_classificacao" INTEGER NOT NULL,
    "id_editora" INTEGER NOT NULL,
    "id_idioma" INTEGER NOT NULL,
    "descricao" VARCHAR(255) NOT NULL,
    "capa" VARCHAR(500),
    "isbn13" CHAR(13),
    "isbn10" CHAR(10),
    "edicao_especial" "EdicaoEspecial" NOT NULL DEFAULT 'normal',
    "volume" VARCHAR(50),
    "estado" "EstadoLivro" NOT NULL,
    "colecao" "ColecaoLivro" NOT NULL,
    "peso_gramas" DECIMAL(8,2),
    "preco_tabelado" DECIMAL(12,2),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "livro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estoque" (
    "id_livro" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "custo_unitario_medio" DECIMAL(12,4) NOT NULL DEFAULT 0.0,
    "custo_total" DECIMAL(14,4) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estoque_pkey" PRIMARY KEY ("id_livro")
);

-- CreateTable
CREATE TABLE "entrada" (
    "id" SERIAL NOT NULL,
    "id_livro" INTEGER NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valor_unitario" DECIMAL(12,4) NOT NULL,
    "valor_total" DECIMAL(14,4) NOT NULL,
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saida" (
    "id" SERIAL NOT NULL,
    "id_livro" INTEGER NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "id_tipo_saida" INTEGER NOT NULL,
    "id_canal_venda" INTEGER,
    "id_forma_pagamento" INTEGER,
    "data" DATE NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valor_unitario" DECIMAL(12,4) NOT NULL,
    "valor_total" DECIMAL(14,4) NOT NULL,
    "snapshot_custo_unitario" DECIMAL(12,4) NOT NULL,
    "snapshot_custo_total" DECIMAL(14,4) NOT NULL,
    "snapshot_preco_tabelado" DECIMAL(12,2),
    "snapshot_comissao_plataforma" DECIMAL(5,4) NOT NULL DEFAULT 0.0,
    "valor_comissao_plataforma" DECIMAL(14,4) NOT NULL,
    "snapshot_taxa_pagamento" DECIMAL(5,4) NOT NULL DEFAULT 0.0,
    "valor_taxa_pagamento" DECIMAL(14,4) NOT NULL,
    "lucro_venda" DECIMAL(14,4) NOT NULL,
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "classificacao_descricao_key" ON "classificacao"("descricao");

-- CreateIndex
CREATE UNIQUE INDEX "editora_descricao_key" ON "editora"("descricao");

-- CreateIndex
CREATE UNIQUE INDEX "idioma_descricao_key" ON "idioma"("descricao");

-- CreateIndex
CREATE UNIQUE INDEX "canal_venda_descricao_key" ON "canal_venda"("descricao");

-- CreateIndex
CREATE UNIQUE INDEX "forma_pagamento_descricao_key" ON "forma_pagamento"("descricao");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_saida_descricao_key" ON "tipo_saida"("descricao");

-- AddForeignKey
ALTER TABLE "livro" ADD CONSTRAINT "livro_id_classificacao_fkey" FOREIGN KEY ("id_classificacao") REFERENCES "classificacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livro" ADD CONSTRAINT "livro_id_editora_fkey" FOREIGN KEY ("id_editora") REFERENCES "editora"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livro" ADD CONSTRAINT "livro_id_idioma_fkey" FOREIGN KEY ("id_idioma") REFERENCES "idioma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estoque" ADD CONSTRAINT "estoque_id_livro_fkey" FOREIGN KEY ("id_livro") REFERENCES "livro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrada" ADD CONSTRAINT "entrada_id_livro_fkey" FOREIGN KEY ("id_livro") REFERENCES "livro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrada" ADD CONSTRAINT "entrada_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saida" ADD CONSTRAINT "saida_id_livro_fkey" FOREIGN KEY ("id_livro") REFERENCES "livro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saida" ADD CONSTRAINT "saida_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saida" ADD CONSTRAINT "saida_id_tipo_saida_fkey" FOREIGN KEY ("id_tipo_saida") REFERENCES "tipo_saida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saida" ADD CONSTRAINT "saida_id_canal_venda_fkey" FOREIGN KEY ("id_canal_venda") REFERENCES "canal_venda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saida" ADD CONSTRAINT "saida_id_forma_pagamento_fkey" FOREIGN KEY ("id_forma_pagamento") REFERENCES "forma_pagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
