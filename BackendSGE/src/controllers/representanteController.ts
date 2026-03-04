import { Request, Response } from 'express';
import prisma from '../config/database';

// Obtener todos los representantes DEL USUARIO AUTENTICADO
export const getAllRepresentantes = async (req: Request, res: Response) => {
  try {
    const representantes = await prisma.representante.findMany({
      where: {
        usuarioId: req.userId! // FILTRAR POR USUARIO
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json(representantes);
  } catch (error) {
    console.error('Error obteniendo representantes:', error);
    res.status(500).json({ error: 'Error al obtener representantes' });
  }
};

// Obtener representantes por tipo
export const getRepresentantesPorTipo = async (req: Request, res: Response) => {
  try {
    const tipoParam = req.params.tipo;
    
    // Verificar que tipoParam sea un string
    if (typeof tipoParam !== 'string') {
      return res.status(400).json({ error: 'Tipo inválido' });
    }
    
    const tipo = tipoParam.toUpperCase();

    const tiposValidos = ['PADRES', 'ESTUDIANTES'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    const representantes = await prisma.representante.findMany({
      where: { tipo: tipo as any },
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json(representantes);
  } catch (error) {
    console.error('Error obteniendo representantes:', error);
    res.status(500).json({ error: 'Error al obtener representantes' });
  }
};

// Obtener un representante por ID (solo si pertenece al usuario)
export const getRepresentanteById = async (req: Request, res: Response) => {
  try {
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const representante = await prisma.representante.findFirst({
      where: { 
        id: id,
        usuarioId: req.userId! // VERIFICAR QUE PERTENECE AL USUARIO
      }
    });

    if (!representante) {
      return res.status(404).json({ error: 'Representante no encontrado' });
    }

    res.json(representante);
  } catch (error) {
    console.error('Error obteniendo representante:', error);
    res.status(500).json({ error: 'Error al obtener representante' });
  }
};

// Crear un nuevo representante PARA EL USUARIO AUTENTICADO
export const createRepresentante = async (req: Request, res: Response) => {
  try {
    const tipo = req.body.tipo;
    const nombre = req.body.nombre;
    const email = req.body.email;
    const telefono = req.body.telefono;

    // Validar datos requeridos
    if (!tipo || !nombre || !email || !telefono) {
      return res.status(400).json({ 
        error: 'Tipo, nombre, email y teléfono son requeridos' 
      });
    }

    // Validar tipo
    const tiposValidos = ['PADRES', 'ESTUDIANTES'];
    if (!tiposValidos.includes(tipo.toUpperCase())) {
      return res.status(400).json({ 
        error: 'Tipo debe ser PADRES o ESTUDIANTES' 
      });
    }

    // Crear representante CON EL ID DEL USUARIO
    const representante = await prisma.representante.create({
      data: {
        tipo: tipo.toUpperCase(),
        nombre: nombre,
        email: email,
        telefono: telefono,
        usuarioId: req.userId! // ASIGNAR AL USUARIO AUTENTICADO
      }
    });

    res.status(201).json({
      message: 'Representante creado exitosamente',
      representante
    });
  } catch (error) {
    console.error('Error creando representante:', error);
    res.status(500).json({ error: 'Error al crear representante' });
  }
};

// Actualizar un representante (solo si pertenece al usuario)
export const updateRepresentante = async (req: Request, res: Response) => {
  try {
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const tipo = req.body.tipo;
    const nombre = req.body.nombre;
    const email = req.body.email;
    const telefono = req.body.telefono;

    // Verificar que el representante existe Y PERTENECE AL USUARIO
    const existingRepresentante = await prisma.representante.findFirst({
      where: { 
        id: id,
        usuarioId: req.userId!
      }
    });

    if (!existingRepresentante) {
      return res.status(404).json({ error: 'Representante no encontrado' });
    }

    // Validar tipo si se proporciona
    if (tipo) {
      const tiposValidos = ['PADRES', 'ESTUDIANTES'];
      if (!tiposValidos.includes(tipo.toUpperCase())) {
        return res.status(400).json({ 
          error: 'Tipo debe ser PADRES o ESTUDIANTES' 
        });
      }
    }

    // Preparar datos para actualizar
    const dataToUpdate: any = {};
    if (tipo) dataToUpdate.tipo = tipo.toUpperCase();
    if (nombre) dataToUpdate.nombre = nombre;
    if (email) dataToUpdate.email = email;
    if (telefono) dataToUpdate.telefono = telefono;

    // Actualizar representante
    const representante = await prisma.representante.update({
      where: { id: id },
      data: dataToUpdate
    });

    res.json({
      message: 'Representante actualizado exitosamente',
      representante
    });
  } catch (error) {
    console.error('Error actualizando representante:', error);
    res.status(500).json({ error: 'Error al actualizar representante' });
  }
};

// Eliminar un representante (solo si pertenece al usuario)
export const deleteRepresentante = async (req: Request, res: Response) => {
  try {
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Verificar que el representante existe Y PERTENECE AL USUARIO
    const representante = await prisma.representante.findFirst({
      where: { 
        id: id,
        usuarioId: req.userId!
      }
    });

    if (!representante) {
      return res.status(404).json({ error: 'Representante no encontrado' });
    }

    // Eliminar representante
    await prisma.representante.delete({
      where: { id: id }
    });

    res.json({ message: 'Representante eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando representante:', error);
    res.status(500).json({ error: 'Error al eliminar representante' });
  }
};