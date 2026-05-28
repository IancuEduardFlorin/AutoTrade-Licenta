import express from 'express';
import { genereazaDescriere, detecteazaSpam, completeazaCampuri, chatbot } from '../controllers/aiController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/descriere', verifyToken, genereazaDescriere);
router.post('/spam', verifyToken, detecteazaSpam);
router.post('/completeaza', verifyToken, completeazaCampuri);
router.post('/chatbot', chatbot);

export default router;