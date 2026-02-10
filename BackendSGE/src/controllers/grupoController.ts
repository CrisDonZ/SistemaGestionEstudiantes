import { Request, Response } from 'express';
import prisma from '../config/database';

// Obtener todos los grupos
export const getAllGrupos = async (req: Request, res: Response) => {
  try {
    const grupos = await prisma.grupo.findMany({
      include: {
        estudiantes: true,
        _count: {
          select: { estudiantes: true }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json(grupos);
  } catch (error) {
    console.error('Error obteniendo grupos:', error);
    res.status(500).json({ error: 'Error al obtener grupos' });
  }
};

// Obtener un grupo por ID
export const getGrupoById = async (req: Request, res: Response) => {
  try {
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;


    const grupo = await prisma.grupo.findUnique({
      where: { id: id },
      include: {
        estudiantes: {
          orderBy: {
            nombre: 'asc'
          }
        }
      }
    });

    if (!grupo) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    res.json(grupo);
  } catch (error) {
    console.error('Error obteniendo grupo:', error);
    res.status(500).json({ error: 'Error al obtener grupo' });
  }
};

// Crear un nuevo grupo
export const createGrupo = async (req: Request, res: Response) => {
  try {
    const nombre = req.body.nombre;
    const grado = req.body.grado;

    // Validar datos requeridos
    if (!nombre || !grado) {
      return res.status(400).json({ 
        error: 'Nombre y grado son requeridos' 
      });
    }

    // Crear grupo
    const grupo = await prisma.grupo.create({
      data: {
        nombre: nombre,
        grado: grado
      }
    });

    res.status(201).json({
      message: 'Grupo creado exitosamente',
      grupo
    });
  } catch (error) {
    console.error('Error creando grupo:', error);
    res.status(500).json({ error: 'Error al crear grupo' });
  }
};

// Actualizar un grupo
export const updateGrupo = async (req: Request, res: Response) => {
  try {
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const nombre = req.body.nombre;
    const grado = req.body.grado;

    // Verificar que el grupo existe
    const existingGrupo = await prisma.grupo.findUnique({
      where: { id: id }
    });

    if (!existingGrupo) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    // Preparar datos para actualizar
    const dataToUpdate: any = {};
    if (nombre) dataToUpdate.nombre = nombre;
    if (grado) dataToUpdate.grado = grado;

    // Actualizar grupo
    const grupo = await prisma.grupo.update({
      where: { id: id },
      data: dataToUpdate,
      include: {
        estudiantes: true
      }
    });

    res.json({
      message: 'Grupo actualizado exitosamente',
      grupo
    });
  } catch (error) {
    console.error('Error actualizando grupo:', error);
    res.status(500).json({ error: 'Error al actualizar grupo' });
  }
};

// Eliminar un grupo
export const deleteGrupo = async (req: Request, res: Response) => {
  try {
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;


    // Verificar que el grupo existe
    const grupo = await prisma.grupo.findUnique({
      where: { id: id },
      include: {
        estudiantes: true
      }
    });

    if (!grupo) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    // Verificar si tiene estudiantes asignados
    if (grupo.estudiantes.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar un grupo con estudiantes asignados' 
      });
    }

    // Eliminar grupo
    await prisma.grupo.delete({
      where: { id: id }
    });

    res.json({ message: 'Grupo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando grupo:', error);
    res.status(500).json({ error: 'Error al eliminar grupo' });
  }
};