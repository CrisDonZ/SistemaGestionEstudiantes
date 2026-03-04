import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar datos existentes
  await prisma.representante.deleteMany();
  await prisma.grupoAseo.deleteMany();
  await prisma.estudiante.deleteMany();
  await prisma.usuario.deleteMany();

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@escuela.com',
      password: hashedPassword,
      nombre: 'Administrador'
    }
  });

  console.log('✅ Usuario administrador creado:', admin.email);

  // Crear estudiantes para el admin
  const estudiante1 = await prisma.estudiante.create({
    data: {
      nombre: 'Juan',
      apellido: 'Pérez',
      fechaNacimiento: new Date('2015-03-15'),
      acudiente: 'María Pérez',
      usuarioId: admin.id
    }
  });

  const estudiante2 = await prisma.estudiante.create({
    data: {
      nombre: 'Ana',
      apellido: 'García',
      fechaNacimiento: new Date('2016-07-20'),
      acudiente: 'Carlos García',
      usuarioId: admin.id
    }
  });

  const estudiante3 = await prisma.estudiante.create({
    data: {
      nombre: 'Luis',
      apellido: 'Martínez',
      fechaNacimiento: new Date('2015-11-10'),
      acudiente: 'Laura Martínez',
      usuarioId: admin.id
    }
  });

  console.log('✅ 3 Estudiantes creados para el admin');

  // Crear grupo de aseo para el lunes
  await prisma.grupoAseo.create({
    data: {
      dia: 'LUNES',
      usuarioId: admin.id,
      estudiantes: {
        connect: [{ id: estudiante1.id }]
      }
    }
  });

  console.log('✅ Grupo de aseo del lunes creado');

  // Crear representantes
  await prisma.representante.create({
    data: {
      tipo: 'PADRES',
      nombre: 'María González',
      email: 'maria@example.com',
      telefono: '3001234567',
      usuarioId: admin.id
    }
  });

  await prisma.representante.create({
    data: {
      tipo: 'ESTUDIANTES',
      nombre: 'Carlos Rodríguez',
      email: 'carlos@example.com',
      telefono: '3009876543',
      usuarioId: admin.id
    }
  });

  console.log('✅ 2 Representantes creados');

  // Crear segundo usuario de prueba
  const user2 = await prisma.usuario.create({
    data: {
      email: 'profesor@escuela.com',
      password: hashedPassword,
      nombre: 'Profesor Demo'
    }
  });

  console.log('✅ Usuario profesor creado:', user2.email);

  // Crear un estudiante para el profesor
  await prisma.estudiante.create({
    data: {
      nombre: 'Pedro',
      apellido: 'López',
      fechaNacimiento: new Date('2016-05-20'),
      acudiente: 'Carmen López',
      usuarioId: user2.id
    }
  });

  console.log('✅ 1 Estudiante creado para el profesor');

  console.log('\n🎉 Seed completado exitosamente\n');
  console.log('📧 Usuarios creados:');
  console.log('   - admin@escuela.com (contraseña: admin123) - 3 estudiantes');
  console.log('   - profesor@escuela.com (contraseña: admin123) - 1 estudiante\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });