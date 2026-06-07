import express from 'express';
import { getConversatii, getMesaje, trimiteMessaj, getMesajeNecitite, uploadImagineChat } from '../controllers/mesajeController.js';
import verifyToken from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/conversatii', verifyToken, getConversatii);
router.get('/necitite/count', verifyToken, getMesajeNecitite);
router.post('/imagine', verifyToken, upload.single('imagine'), uploadImagineChat);
router.get('/:userId', verifyToken, getMesaje);
router.post('/', verifyToken, trimiteMessaj);

export default router;