import { Router } from 'express';
import {
  enviarMensajeWhatsApp,
  enviarCircular,
  getHistorialMensajes
} from '../controllers/mensajeController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/enviar', enviarMensajeWhatsApp);
router.post('/circular', enviarCircular);
router.get('/historial/:id', getHistorialMensajes); // ← :id en lugar de :estudianteId

export default router;