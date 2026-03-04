/*
  Warnings:

  - You are about to drop the column `grupoId` on the `Estudiante` table. All the data in the column will be lost.
  - You are about to drop the `Grupo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `acudiente` to the `Estudiante` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Estudiante" DROP CONSTRAINT "Estudiante_grupoId_fkey";

-- AlterTable
ALTER TABLE "Estudiante" DROP COLUMN "grupoId",
ADD COLUMN     "acudiente" TEXT NOT NULL;

-- DropTable
DROP TABLE "Grupo";
