import { Request, Response } from 'express';
import prisma from '../config/database';


// Obtener todos los grupos de aseo

export const getAllGrupoAseo = async(req: Request,  res: Response) => {
    try {
        const grupoAseo = await prisma.grupoAseo.findMany({
            include: {
                estudiantes: true
            },
            orderBy:{
                dia: 'asc'
            }
        });
        res.json(grupoAseo);
    } catch (error) {
        console.error('Error obteniendo grupos de aseo: ', error);
        res.status(500).json({error: 'Error al obtener grupos de aseo'});
        
    }
}


// Crear un grupo de aseo 

export const createGrupoAseo = async(req: Request, res: Response) => {
    try {
        const dia = req.body.dia;
        const estudiantesIds = req.body.estudiantesIds;

        //Validar datos requeridos

        if(!dia || !estudiantesIds || !Array.isArray(estudiantesIds)){
            return res.status(400).json({
                error: 'Día y lista de IDs de estudiantes son requeridos'
            });
        }

        //Crear grupo de aseo
        const nuevoGrupoAseo = await prisma.grupoAseo.create({
            data: {
                dia: dia,
                estudiantes:{
                    connect: estudiantesIds.map((id: string) => ({id}) )
                }
            },
            include: {
                estudiantes: true
            }
        });

        res.status(201).json(nuevoGrupoAseo);
        
    } catch (error) {
        console.error('Error creando grupo de aseo: ', error);
        res.status(500).json({error: 'Error al crear grupo de aseo'});  
    }
}

//Eliminar grupo de aseo

export const deleteGrupoAseo = async(req:Request, res: Response) => {
    try {
        const grupoAseoId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const grupoAseo = await prisma.grupoAseo.findUnique({
            where: {id: grupoAseoId}
        });
        if(!grupoAseo){
            return res.status(404).json({error: 'Grupo de aseo no encontrado'});
        }

        await prisma.grupoAseo.delete({
            where: {id: grupoAseoId}
        });

        res.json({message: 'Grupo de aseo eliminado correctamente'});

        
    } catch (error) {
        console.error('Error eliminando grupo de aseo: ', error);
        res.status(500).json({error: 'Error al eliminar grupo de aseo'});   
    }
}