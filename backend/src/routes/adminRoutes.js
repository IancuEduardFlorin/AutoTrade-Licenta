import express from 'express';
import {
    getUtilizatori,
    deleteUtilizator,
    schimbaRol,
    getToateAnunturile,
    deleteAnuntAdmin
} from '../controllers/adminController.js';
import verifyToken from '../middleware/authMiddleware.js';
import verifyAdmin from '../middleware/adminMiddleware.js';

const router = express.Router();

// Toate rutele necesita autentificare SI rol de admin
router.get('/utilizatori', verifyToken, verifyAdmin, getUtilizatori);
router.delete('/utilizatori/:id', verifyToken, verifyAdmin, deleteUtilizator);
router.put('/utilizatori/:id/rol', verifyToken, verifyAdmin, schimbaRol);
router.get('/anunturi', verifyToken, verifyAdmin, getToateAnunturile);
router.delete('/anunturi/:id', verifyToken, verifyAdmin, deleteAnuntAdmin);

export default router;