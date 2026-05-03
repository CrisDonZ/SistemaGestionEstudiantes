import { Request, Response } from 'express';
import prisma from '../config/database';

// Enviar mensaje de WhatsApp (simulado)
export const enviarMensajeWhatsApp = async (req: Request, res: Response) => {
  try {
    const tipo = req.body.tipo;
    const mensaje = req.body.mensaje;
    const estudianteId = req.body.estudianteId;
    const telefono = req.body.telefono;

    // Validar datos
    if (!tipo || !mensaje || !estudianteId || !telefono) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Validar tipo de mensaje
    const tiposValidos = ['FELICITACION', 'DISCIPLINA', 'CIRCULAR'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de mensaje inválido' });
    }

    // Verificar que el estudiante pertenece al usuario
    const estudiante = await prisma.estudiante.findFirst({
      where: {
        id: estudianteId,
        usuarioId: req.userId!
      }
    });

    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // NUEVO: Determinar el teléfono según el tipo de mensaje
    let telefonoDestino = telefono;
    let destinatario = '';
    
    if (tipo === 'DISCIPLINA') {
      // Para mensajes de disciplina, enviar al acudiente
      telefonoDestino = estudiante.telefonoAcu;
      destinatario = estudiante.acudiente;
    } else {
      // Para felicitaciones, enviar al estudiante
      telefonoDestino = estudiante.telefono;
      destinatario = `${estudiante.nombre} ${estudiante.apellido}`;
    }


    // Guardar registro del mensaje
    const mensajeEnviado = await prisma.mensajeEnviado.create({
      data: {
        tipo: tipo as any,
        mensaje: mensaje,
        estudianteId: estudianteId,
        telefono: telefonoDestino,
        usuarioId: req.userId!
      }
    });

    // Aquí iría la integración real con WhatsApp API
    // Por ahora, solo generamos el enlace de WhatsApp Web
    const mensajeCodificado = encodeURIComponent(mensaje);
    const telefonoLimpio = telefono.replace(/\D/g, ''); // Eliminar caracteres no numéricos
    const whatsappUrl = `https://wa.me/57${telefonoLimpio}?text=${mensajeCodificado}`;

    res.json({
      message: 'Mensaje preparado para envío',
      whatsappUrl: whatsappUrl,
      mensajeId: mensajeEnviado.id
    });
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};

// Enviar circular a múltiples estudiantes
export const enviarCircular = async (req: Request, res: Response) => {
  try {
    const mensaje = req.body.mensaje;
    const estudianteIds = req.body.estudianteIds;

    if (!mensaje || !Array.isArray(estudianteIds) || estudianteIds.length === 0) {
      return res.status(400).json({ error: 'Mensaje y estudiantes son requeridos' });
    }

    // Verificar que todos los estudiantes pertenecen al usuario
    const estudiantes = await prisma.estudiante.findMany({
      where: {
        id: { in: estudianteIds },
        usuarioId: req.userId!
      }
    });

    if (estudiantes.length !== estudianteIds.length) {
      return res.status(403).json({ error: 'Algunos estudiantes no te pertenecen' });
    }

    // Crear registros de mensajes
    const mensajes = await Promise.all(
      estudiantes.map(estudiante =>
        prisma.mensajeEnviado.create({
          data: {
            tipo: 'CIRCULAR' as any,
            mensaje: mensaje,
            estudianteId: estudiante.id,
            telefono: estudiante.telefono,
            usuarioId: req.userId!
          }
        })
      )
    );

    // Generar URLs de WhatsApp
    const mensajeCodificado = encodeURIComponent(mensaje);
    const whatsappUrls = estudiantes.map(e => {
      const telefonoLimpio = e.telefono.replace(/\D/g, '');
      return {
        estudianteId: e.id,
        nombre: `${e.nombre} ${e.apellido}`,
        url: `https://wa.me/57${telefonoLimpio}?text=${mensajeCodificado}`
      };
    });

    res.json({
      message: `Circular preparada para ${estudiantes.length} estudiante(s)`,
      whatsappUrls: whatsappUrls,
      totalEnviados: mensajes.length
    });
  } catch (error) {
    console.error('Error enviando circular:', error);
    res.status(500).json({ error: 'Error al enviar circular' });
  }
};

// Obtener historial de mensajes de un estudiante
export const getHistorialMensajes = async (req: Request, res: Response) => {
  try {
    const estudianteId: string = req.params.id as string;

    // Verificar que el estudiante pertenece al usuario
    const estudiante = await prisma.estudiante.findFirst({
      where: {
        id: estudianteId,
        usuarioId: req.userId!
      }
    });

    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    const mensajes = await prisma.mensajeEnviado.findMany({
      where: {
        estudianteId: estudianteId,
        usuarioId: req.userId!
      },
      orderBy: {
        fechaEnvio: 'desc'
      },
      take: 10 // Últimos 10 mensajes
    });

    res.json(mensajes);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};