import {Router} from 'express';
import {
    getAllGrupos,
    getGrupoById,
    createGrupo,
    updateGrupo,
    deleteGrupo
} from '../controllers/grupoController';
import { authMiddleware } from '../middleware/auth';
const router = Router();

// Todas las rutas requieren autenticación 

router.use(authMiddleware);

//Rutas de grupos

router.get('/', getAllGrupos);
router.get('/:id', getGrupoById);
router.post('/', createGrupo);
router.put('/:id', updateGrupo);
router.delete('/:id', deleteGrupo);

export default router;