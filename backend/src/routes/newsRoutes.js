import express from 'express';
import {
    getArticole, getArticol, getToateArticolele,
    adaugaArticol, editeazaArticol, stergeArticol
} from '../controllers/newsController.js';
import verifyToken from '../middleware/authMiddleware.js';
import verifyAdmin from '../middleware/adminMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Ruta admin TREBUIE sa fie inaintea rutei /:id
router.get('/admin/toate', verifyToken, verifyAdmin, getToateArticolele);
router.post('/', verifyToken, verifyAdmin, upload.single('imagine'), adaugaArticol);
router.put('/:id', verifyToken, verifyAdmin, upload.single('imagine'), editeazaArticol);
router.delete('/:id', verifyToken, verifyAdmin, stergeArticol);

// Rute publice
router.get('/', getArticole);
router.get('/:id', getArticol);

export default router;