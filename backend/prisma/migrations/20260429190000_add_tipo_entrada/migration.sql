CREATE TABLE "tipo_entrada" (
    "id" SERIAL NOT NULL,
    "descricao" VARCHAR(50) NOT NULL,
    "is_doacao" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipo_entrada_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tipo_entrada_descricao_key" ON "tipo_entrada"("descricao");

INSERT INTO "tipo_entrada" ("descricao", "is_doacao", "is_active", "updated_at")
VALUES
    ('Compra', false, true, CURRENT_TIMESTAMP),
    ('Doação Recebida', true, true, CURRENT_TIMESTAMP)
ON CONFLICT ("descricao") DO NOTHING;

ALTER TABLE "entrada" ADD COLUMN "tipo_entrada_id" INTEGER;

UPDATE "entrada"
SET "tipo_entrada_id" = (
    SELECT "id" FROM "tipo_entrada" WHERE "descricao" = 'Compra' LIMIT 1
)
WHERE "tipo_entrada_id" IS NULL;

ALTER TABLE "entrada" ALTER COLUMN "tipo_entrada_id" SET NOT NULL;

ALTER TABLE "entrada" ADD CONSTRAINT "entrada_tipo_entrada_id_fkey"
FOREIGN KEY ("tipo_entrada_id") REFERENCES "tipo_entrada"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
