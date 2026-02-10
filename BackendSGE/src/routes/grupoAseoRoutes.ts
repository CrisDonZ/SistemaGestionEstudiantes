import {Router} from 'express';
import {
    getAllGrupoAseo,
    createGrupoAseo,
    deleteGrupoAseo
} from '../controllers/grupoAseoController';
import { authMiddleware } from '../middleware/auth';
const router = Router();

//Todas las rutas requieres autenticación 

router.use(authMiddleware);

//Rutas de grupos de aseo

router.get('/', getAllGrupoAseo);
router.post('/', createGrupoAseo);
router.delete('/:id', deleteGrupoAseo);

export default router;