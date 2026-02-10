import { Request, Response } from 'express';
import prisma from '../config/database';

// Obtener todos los estudiantes
export const getAllEstudiantes = async (req: Request, res: Response) => {
  try {
    const estudiantes = await prisma.estudiante.findMany({
      include: {
        grupo: true
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

// Obtener un estudiante por ID
export const getEstudianteById = async (req: Request, res: Response) => {
  try {
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;


    const estudiante = await prisma.estudiante.findUnique({
      where: { id: id },
      include: {
        grupo: true
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

// Crear un nuevo estudiante
export const createEstudiante = async (req: Request, res: Response) => {
  try {
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const fechaNacimiento = req.body.fechaNacimiento;
    const grupoId = req.body.grupoId;

    // Validar datos requeridos
    if (!nombre || !apellido || !fechaNacimiento) {
      return res.status(400).json({ 
        error: 'Nombre, apellido y fecha de nacimiento son requeridos' 
      });
    }
    // Validar que grupoid exista

    if (grupoId) {
      const grupo = await prisma.grupo.findUnique({
        where: { id: grupoId }
      })
      if (!grupo) {
        return res.status(400).json({ 
          error: 'El grupoId proporcionado no existe' 
        });
      }
    };


    //Validar que la fecha de nacimiento sea una fecha válida
    const fechaNac = new Date(fechaNacimiento);
    if (isNaN(fechaNac.getTime())) {
      return res.status(400).json({
        error: 'La fecha de nacimiento no es una fecha válida'
      });
    }
    // Crear estudiante
    const estudiante = await prisma.estudiante.create({
      data: {
        nombre: nombre,
        apellido: apellido,
        fechaNacimiento: new Date(fechaNacimiento),
        grupoId: grupoId || null
      },
      include: {
        grupo: true
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

// Actualizar un estudiante
export const updateEstudiante = async (req: Request, res: Response) => {
  try {
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const fechaNacimiento = req.body.fechaNacimiento;
    const grupoId = req.body.grupoId;

    // Verificar que el estudiante existe
    const existingEstudiante = await prisma.estudiante.findUnique({
      where: { id: id }
    });

    if (!existingEstudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // Preparar datos para actualizar
    const dataToUpdate: any = {};
    
    if (nombre) dataToUpdate.nombre = nombre;
    if (apellido) dataToUpdate.apellido = apellido;
    if (fechaNacimiento) dataToUpdate.fechaNacimiento = new Date(fechaNacimiento);
    if (grupoId !== undefined) dataToUpdate.grupoId = grupoId;

    // Actualizar estudiante
    const estudiante = await prisma.estudiante.update({
      where: { id: id },
      data: dataToUpdate,
      include: {
        grupo: true
      }
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

// Eliminar un estudiante
export const deleteEstudiante = async (req: Request, res: Response) => {
  try {
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;


    // Verificar que el estudiante existe
    const estudiante = await prisma.estudiante.findUnique({
      where: { id: id }
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

// Obtener cumpleaños del mes actual
export const getCumpleanosDelMes = async (req: Request, res: Response) => {
  try {
    const ahora = new Date();
    const mesActual = ahora.getMonth() + 1;

    const estudiantes = await prisma.estudiante.findMany({
      include: {
        grupo: true
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