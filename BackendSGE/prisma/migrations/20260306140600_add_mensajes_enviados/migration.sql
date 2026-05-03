-- CreateEnum
CREATE TYPE "TipoMensaje" AS ENUM ('FELICITACION', 'DISCIPLINA', 'CIRCULAR');

-- CreateTable
CREATE TABLE "Materia" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "calificacion" DOUBLE PRECISION NOT NULL,
    "periodo" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Materia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MensajeEnviado" (
    "id" TEXT NOT NULL,
    "tipo" "TipoMensaje" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fechaEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MensajeEnviado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Materia_estudianteId_idx" ON "Materia"("estudianteId");

-- CreateIndex
CREATE INDEX "Materia_usuarioId_idx" ON "Materia"("usuarioId");

-- CreateIndex
CREATE INDEX "MensajeEnviado_estudianteId_idx" ON "MensajeEnviado"("estudianteId");

-- CreateIndex
CREATE INDEX "MensajeEnviado_usuarioId_idx" ON "MensajeEnviado"("usuarioId");

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MensajeEnviado" ADD CONSTRAINT "MensajeEnviado_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;
