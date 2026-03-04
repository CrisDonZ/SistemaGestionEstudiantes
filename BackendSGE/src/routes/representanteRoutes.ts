import { Router } from 'express';
import {
  getAllRepresentantes,
  getRepresentantesPorTipo,
  getRepresentanteById,
  createRepresentante,
  updateRepresentante,
  deleteRepresentante
} from '../controllers/representanteController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de representantes
router.get('/', getAllRepresentantes);
router.get('/tipo/:tipo', getRepresentantesPorTipo);
router.get('/:id', getRepresentanteById);
router.post('/', createRepresentante);
router.put('/:id', updateRepresentante);
router.delete('/:id', deleteRepresentante);

export default router;