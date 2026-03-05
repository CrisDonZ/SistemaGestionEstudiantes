import { Request, Response } from 'express';
import prisma from '../config/database';

// Obtener todos los estudiantes DEL USUARIO AUTENTICADO
export const getAllEstudiantes = async (req: Request, res: Response) => {
  try {
    const estudiantes = await prisma.estudiante.findMany({
      where: {
        usuarioId: req.userId! // FILTRAR POR USUARIO
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json(estudiantes);
  } catch (error) {
    console.error('Error obteniendo estudiantes:', error);
    res.status(500).json({ error: 'Error al obtener estudiantes' });
  }
};

// Obtener un estudiante por ID (solo si pertenece al usuario)
export const getEstudianteById = async (req: Request, res: Response) => {
  try {
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const estudiante = await prisma.estudiante.findFirst({
      where: { 
        id: id,
        usuarioId: req.userId! // VERIFICAR QUE PERTENECE AL USUARIO
      }
    });

    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    res.json(estudiante);
  } catch (error) {
    console.error('Error obteniendo estudiante:', error);
    res.status(500).json({ error: 'Error al obtener estudiante' });
  }
};

// Crear un nuevo estudiante PARA EL USUARIO AUTENTICADO
export const createEstudiante = async (req: Request, res: Response) => {
  try {
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const fechaNacimiento = req.body.fechaNacimiento;
    const acudiente = req.body.acudiente;
    const telefono = req.body.telefono;
    const telefonoAcu = req.body.telefonoAcu;
    const fotoUrl = req.body.fotoUrl;

    // Validar datos requeridos
    if (!nombre || !apellido || !fechaNacimiento || !acudiente || !telefono || !telefonoAcu) {
      return res.status(400).json({ 
        error: 'Nombre, apellido, fecha de nacimiento, acudiente y teléfonos son requeridos' 
      });
    }

    // Crear estudiante CON EL ID DEL USUARIO
    const estudiante = await prisma.estudiante.create({
      data: {
        nombre: nombre,
        apellido: apellido,
        fechaNacimiento: new Date(fechaNacimiento),
        acudiente: acudiente,
        telefono: telefono,
        telefonoAcu: telefonoAcu,
        fotoUrl: fotoUrl || null,
        usuarioId: req.userId!
      }
    });

    res.status(201).json({
      message: 'Estudiante creado exitosamente',
      estudiante
    });
  } catch (error) {
    console.error('Error creando estudiante:', error);
    res.status(500).json({ error: 'Error al crear estudiante' });
  }
};

// Actualizar un estudiante (solo si pertenece al usuario)
// Actualizar un estudiante (solo si pertenece al usuario)
export const updateEstudiante = async (req: Request, res: Response) => {
  try {
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const fechaNacimiento = req.body.fechaNacimiento;
    const acudiente = req.body.acudiente;
    const telefono = req.body.telefono;
    const telefonoAcu = req.body.telefonoAcu;
    const fotoUrl = req.body.fotoUrl;

    // Verificar que el estudiante existe Y PERTENECE AL USUARIO
    const existingEstudiante = await prisma.estudiante.findFirst({
      where: { 
        id: id,
        usuarioId: req.userId!
      }
    });

    if (!existingEstudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // Preparar datos para actualizar
    const dataToUpdate: any = {};
    
    if (nombre) dataToUpdate.nombre = nombre;
    if (apellido) dataToUpdate.apellido = apellido;
    if (fechaNacimiento) dataToUpdate.fechaNacimiento = new Date(fechaNacimiento);
    if (acudiente) dataToUpdate.acudiente = acudiente;
    if (telefono) dataToUpdate.telefono = telefono;
    if (telefonoAcu) dataToUpdate.telefonoAcu = telefonoAcu;
    if (fotoUrl !== undefined) dataToUpdate.fotoUrl = fotoUrl;

    // Actualizar estudiante
    const estudiante = await prisma.estudiante.update({
      where: { id: id },
      data: dataToUpdate
    });

    res.json({
      message: 'Estudiante actualizado exitosamente',
      estudiante
    });
  } catch (error) {
    console.error('Error actualizando estudiante:', error);
    res.status(500).json({ error: 'Error al actualizar estudiante' });
  }
};
// Eliminar un estudiante (solo si pertenece al usuario)
export const deleteEstudiante = async (req: Request, res: Response) => {
  try {
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Verificar que el estudiante existe Y PERTENECE AL USUARIO
    const estudiante = await prisma.estudiante.findFirst({
      where: { 
        id: id,
        usuarioId: req.userId!
      }
    });

    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // Eliminar estudiante
    await prisma.estudiante.delete({
      where: { id: id }
    });

    res.json({ message: 'Estudiante eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando estudiante:', error);
    res.status(500).json({ error: 'Error al eliminar estudiante' });
  }
};

// Obtener cumpleaños del mes actual DEL USUARIO AUTENTICADO
export const getCumpleanosDelMes = async (req: Request, res: Response) => {
  try {
    const ahora = new Date();
    const mesActual = ahora.getMonth() + 1;

    const estudiantes = await prisma.estudiante.findMany({
      where: {
        usuarioId: req.userId! // FILTRAR POR USUARIO
      }
    });

    // Filtrar estudiantes que cumplen años este mes
    const cumpleaneros = estudiantes.filter(estudiante => {
      const mesNacimiento = new Date(estudiante.fechaNacimiento).getMonth() + 1;
      return mesNacimiento === mesActual;
    });

    // Ordenar por día del mes
    cumpleaneros.sort((a, b) => {
      const diaA = new Date(a.fechaNacimiento).getDate();
      const diaB = new Date(b.fechaNacimiento).getDate();
      return diaA - diaB;
    });

    res.json(cumpleaneros);
  } catch (error) {
    console.error('Error obteniendo cumpleaños:', error);
    res.status(500).json({ error: 'Error al obtener cumpleaños' });
  }
};