import express from 'express';
import { genereazaDescriere, detecteazaSpam, completeazaCampuri, chatbot, analizeazaAnunt, estimeazaPret } from '../controllers/aiController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/descriere', verifyToken, genereazaDescriere);
router.post('/spam', verifyToken, detecteazaSpam);
router.post('/completeaza', verifyToken, completeazaCampuri);
router.post('/chatbot', chatbot);
router.post('/analizeaza-anunt', analizeazaAnunt);
router.post('/estimeaza-pret', estimeazaPret);

export default router;