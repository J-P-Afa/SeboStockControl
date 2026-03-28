-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('SYSTEM', 'LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "EditionType" AS ENUM ('normal', 'variante');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('novo', 'usado');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('completo', 'em_lancamento');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "themePreference" "ThemePreference" NOT NULL DEFAULT 'SYSTEM',
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "books" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(255),
    "author" VARCHAR(150),
    "isbn13" CHAR(13),
    "isbn10" CHAR(10),
    "list_price" DECIMAL(10,2),
    "editionType" "EditionType" NOT NULL DEFAULT 'normal',
    "volume" VARCHAR(50),
    "condition" "Condition" NOT NULL,
    "status" "Status" NOT NULL,
    "publication_year" INTEGER,
    "pages" INTEGER,
    "synopsis" VARCHAR(1000),
    "dimensions" VARCHAR(50),
    "weight" DECIMAL(8,2) NOT NULL,
    "publisher_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "genre_id" INTEGER NOT NULL,
    "classificacao_id" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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

-- CreateTable
CREATE TABLE "classificacao" (
    "id" SERIAL NOT NULL,
    "descricao" VARCHAR(50) NOT NULL,
    "margem_alvo" DECIMAL(5,4) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canal_venda" (
    "id" SERIAL NOT NULL,
    "descricao" VARCHAR(50) NOT NULL,
    "comissao_fixa" DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    "comissao_variavel" DECIMAL(5,4) NOT NULL DEFAULT 0.0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canal_venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forma_pagamento" (
    "id" SERIAL NOT NULL,
    "descricao" VARCHAR(50) NOT NULL,
    "taxa" DECIMAL(5,4) NOT NULL DEFAULT 0.0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forma_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_saida" (
    "id" SERIAL NOT NULL,
    "descricao" VARCHAR(50) NOT NULL,
    "is_venda" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipo_saida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estoque" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "custo_medio" DECIMAL(14,4) NOT NULL DEFAULT 0.0,
    "data_ultima_entrada" TIMESTAMP(3),
    "data_ultima_saida" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrada" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "custo_unitario" DECIMAL(14,4) NOT NULL,
    "valor_total" DECIMAL(14,4) NOT NULL,
    "data_entrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fornecedor" VARCHAR(150),
    "numero_nota_fiscal" VARCHAR(50),
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saida" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo_saida_id" INTEGER NOT NULL,
    "canal_venda_id" INTEGER,
    "forma_pagamento_id" INTEGER,
    "quantidade" INTEGER NOT NULL,
    "valor_unitario" DECIMAL(14,4) NOT NULL,
    "valor_total" DECIMAL(14,4) NOT NULL,
    "data_saida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot_custo_unitario" DECIMAL(14,4) NOT NULL,
    "snapshot_custo_total" DECIMAL(14,4) NOT NULL,
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

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_action_key" ON "permissions"("action");

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn13_key" ON "books"("isbn13");

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn10_key" ON "books"("isbn10");

-- CreateIndex
CREATE INDEX "books_title_idx" ON "books"("title");

-- CreateIndex
CREATE INDEX "books_isbn13_idx" ON "books"("isbn13");

-- CreateIndex
CREATE INDEX "books_isbn10_idx" ON "books"("isbn10");

-- CreateIndex
CREATE INDEX "books_genre_id_idx" ON "books"("genre_id");

-- CreateIndex
CREATE UNIQUE INDEX "genres_description_key" ON "genres"("description");

-- CreateIndex
CREATE UNIQUE INDEX "publishers_description_key" ON "publishers"("description");

-- CreateIndex
CREATE UNIQUE INDEX "languages_description_key" ON "languages"("description");

-- CreateIndex
CREATE UNIQUE INDEX "classificacao_descricao_key" ON "classificacao"("descricao");

-- CreateIndex
CREATE UNIQUE INDEX "canal_venda_descricao_key" ON "canal_venda"("descricao");

-- CreateIndex
CREATE UNIQUE INDEX "forma_pagamento_descricao_key" ON "forma_pagamento"("descricao");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_saida_descricao_key" ON "tipo_saida"("descricao");

-- CreateIndex
CREATE UNIQUE INDEX "estoque_book_id_key" ON "estoque"("book_id");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "publishers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_classificacao_id_fkey" FOREIGN KEY ("classificacao_id") REFERENCES "classificacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estoque" ADD CONSTRAINT "estoque_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrada" ADD CONSTRAINT "entrada_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrada" ADD CONSTRAINT "entrada_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saida" ADD CONSTRAINT "saida_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saida" ADD CONSTRAINT "saida_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saida" ADD CONSTRAINT "saida_tipo_saida_id_fkey" FOREIGN KEY ("tipo_saida_id") REFERENCES "tipo_saida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saida" ADD CONSTRAINT "saida_canal_venda_id_fkey" FOREIGN KEY ("canal_venda_id") REFERENCES "canal_venda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saida" ADD CONSTRAINT "saida_forma_pagamento_id_fkey" FOREIGN KEY ("forma_pagamento_id") REFERENCES "forma_pagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
