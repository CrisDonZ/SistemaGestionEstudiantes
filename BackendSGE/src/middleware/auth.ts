import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';


// se extiende el tipo Request apara incluir al userId

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // En esta parte se obtiene el toker del header 
        const token = req.headers.authorization?.replace('Bearer ','');
        if (!token) {
            return res.status(401).json({message: 'No autorizado'});
        }

        //Luego se verifica que el token es válido

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {userId: string}


        // agrega el userId al objeto request para usarlo
        req.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(401).json({error : 'Token Inválido'});
        
    }
};
