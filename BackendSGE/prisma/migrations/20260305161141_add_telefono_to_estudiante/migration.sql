/*
  Warnings:

  - Added the required column `telefono` to the `Estudiante` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefonoAcu` to the `Estudiante` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Estudiante" ADD COLUMN     "fotoUrl" TEXT,
ADD COLUMN     "telefono" TEXT NOT NULL,
ADD COLUMN     "telefonoAcu" TEXT NOT NULL;
