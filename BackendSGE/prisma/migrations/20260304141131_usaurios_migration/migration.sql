/*
  Warnings:

  - A unique constraint covering the columns `[usuarioId,dia]` on the table `GrupoAseo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuarioId` to the `Estudiante` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `GrupoAseo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Representante` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Estudiante" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GrupoAseo" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Representante" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Estudiante_usuarioId_idx" ON "Estudiante"("usuarioId");

-- CreateIndex
CREATE INDEX "GrupoAseo_usuarioId_idx" ON "GrupoAseo"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "GrupoAseo_usuarioId_dia_key" ON "GrupoAseo"("usuarioId", "dia");

-- CreateIndex
CREATE INDEX "Representante_usuarioId_idx" ON "Representante"("usuarioId");

-- AddForeignKey
ALTER TABLE "Estudiante" ADD CONSTRAINT "Estudiante_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoAseo" ADD CONSTRAINT "GrupoAseo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Representante" ADD CONSTRAINT "Representante_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
