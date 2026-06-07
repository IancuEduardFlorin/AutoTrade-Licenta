import express from 'express';
import { getConversatii, getMesaje, trimiteMessaj, getMesajeNecitite } from '../controllers/mesajeController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversatii', verifyToken, getConversatii);
router.get('/necitite/count', verifyToken, getMesajeNecitite);
router.get('/:userId', verifyToken, getMesaje);
router.post('/', verifyToken, trimiteMessaj);

export default router;