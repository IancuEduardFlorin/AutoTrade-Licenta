import express from 'express';
import {
    getProfil,
    updateProfil,
    schimbaParola,
    getAnunturiProprii
} from '../controllers/userController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

// Toate rutele sunt protejate
router.get('/profil', verifyToken, getProfil);
router.put('/profil', verifyToken, updateProfil);
router.put('/parola', verifyToken, schimbaParola);
router.get('/anunturi', verifyToken, getAnunturiProprii);

export default router;