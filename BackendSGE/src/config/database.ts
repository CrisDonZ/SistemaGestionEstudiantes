import { PrismaClient } from '@prisma/client';

// Se crea una unica instancia de Prima
const prisma = new PrismaClient();

export default prisma;