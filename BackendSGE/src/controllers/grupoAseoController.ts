import { Request, Response } from 'express';
import prisma from '../config/database';

// Obtener todos los grupos de aseo DEL USUARIO AUTENTICADO
export const getAllGrupoAseo = async (req: Request, res: Response) => {
  try {
    const gruposAseo = await prisma.grupoAseo.findMany({
      where: {
        usuarioId: req.userId! // FILTRAR POR USUARIO
      },
      include: {
        estudiantes: {
          orderBy: {
            nombre: 'asc'
          }
        }
      },
      orderBy: {
        dia: 'asc'
      }
    });

    res.json(gruposAseo);
  } catch (error) {
    console.error('Error obteniendo grupos de aseo:', error);
    res.status(500).json({ error: 'Error al obtener grupos de aseo' });
  }
};

// Obtener grupo de aseo por día
export const getGrupoAseoPorDia = async (req: Request, res: Response) => {
  try {
    const diaParam = req.params.dia;
    
    // Verificar que diaParam sea un string
    if (typeof diaParam !== 'string') {
      return res.status(400).json({ error: 'Día inválido' });
    }
    
    const dia = diaParam.toUpperCase();

    const diasValidos = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
    if (!diasValidos.includes(dia)) {
      return res.status(400).json({ error: 'Día inválido' });
    }

    const grupoAseo = await prisma.grupoAseo.findFirst({
      where: { dia: dia as any },
      include: {
        estudiantes: {
          orderBy: {
            nombre: 'asc'
          }
        }
      }
    });

    if (!grupoAseo) {
      return res.status(404).json({ error: 'Grupo de aseo no encontrado' });
    }

    res.json(grupoAseo);
  } catch (error) {
    console.error('Error obteniendo grupo de aseo:', error);
    res.status(500).json({ error: 'Error al obtener grupo de aseo' });
  }
};

// Crear o actualizar grupo de aseo DEL USUARIO AUTENTICADO
export const createGrupoAseo = async (req: Request, res: Response) => {
  try {
    console.log('=== Crear/Actualizar Grupo de Aseo ===');
    console.log('Body recibido:', req.body);
    console.log('Usuario ID:', req.userId);

    const dia = req.body.dia;
    const estudianteIds = req.body.estudianteIds;

    if (!dia) {
      return res.status(400).json({ error: 'El día es requerido' });
    }

    if (!Array.isArray(estudianteIds)) {
      return res.status(400).json({ error: 'estudianteIds debe ser un array' });
    }

    const diasValidos = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
    const diaUpper = dia.toUpperCase();

    if (!diasValidos.includes(diaUpper)) {
      return res.status(400).json({ 
        error: 'Día inválido. Debe ser: LUNES, MARTES, MIERCOLES, JUEVES o VIERNES' 
      });
    }

    // VERIFICAR QUE TODOS LOS ESTUDIANTES PERTENECEN AL USUARIO
    if (estudianteIds.length > 0) {
      const estudiantesValidos = await prisma.estudiante.findMany({
        where: {
          id: { in: estudianteIds },
          usuarioId: req.userId!
        }
      });

      if (estudiantesValidos.length !== estudianteIds.length) {
        return res.status(403).json({ 
          error: 'Algunos estudiantes no te pertenecen' 
        });
      }
    }

    // Verificar si ya existe un grupo para ese día Y USUARIO
    const existingGrupo = await prisma.grupoAseo.findFirst({
      where: { 
        dia: diaUpper as any,
        usuarioId: req.userId!
      }
    });

    let grupoAseo;

    if (existingGrupo) {
      // Primero, desconectar todos los estudiantes actuales
      await prisma.grupoAseo.update({
        where: { id: existingGrupo.id },
        data: {
          estudiantes: {
            set: []
          }
        }
      });

      // Luego, conectar los nuevos estudiantes
      grupoAseo = await prisma.grupoAseo.update({
        where: { id: existingGrupo.id },
        data: {
          estudiantes: {
            connect: estudianteIds.map((id: string) => ({ id: id }))
          }
        },
        include: {
          estudiantes: true
        }
      });

      console.log('Grupo actualizado exitosamente');
    } else {
      // Crear nuevo grupo PARA EL USUARIO AUTENTICADO
      grupoAseo = await prisma.grupoAseo.create({
        data: {
          dia: diaUpper as any,
          usuarioId: req.userId!, // ASIGNAR AL USUARIO
          estudiantes: {
            connect: estudianteIds.map((id: string) => ({ id: id }))
          }
        },
        include: {
          estudiantes: true
        }
      });

      console.log('Grupo creado exitosamente');
    }

    res.json({
      message: existingGrupo 
        ? 'Grupo de aseo actualizado exitosamente' 
        : 'Grupo de aseo creado exitosamente',
      grupoAseo
    });
  } catch (error: any) {
    console.error('❌ Error creando/actualizando grupo de aseo:', error);
    res.status(500).json({ 
      error: 'Error al procesar grupo de aseo',
      details: error.message 
    });
  }
};

// Eliminar grupo de aseo (solo si pertenece al usuario)
export const deleteGrupoAseo = async (req: Request, res: Response) => {
  try {
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const grupoAseo = await prisma.grupoAseo.findFirst({
      where: { 
        id: id,
        usuarioId: req.userId!
      }
    });

    if (!grupoAseo) {
      return res.status(404).json({ error: 'Grupo de aseo no encontrado' });
    }

    await prisma.grupoAseo.delete({
      where: { id: id }
    });

    res.json({ message: 'Grupo de aseo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando grupo de aseo:', error);
    res.status(500).json({ error: 'Error al eliminar grupo de aseo' });
  }
};