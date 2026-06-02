import express from 'express';
import { uploadImagini, getImagini, stergeImagine } from '../controllers/imaginiController.js';
import verifyToken from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import db from '../config/db.js';

const router = express.Router();

router.post('/:id/imagini', verifyToken, upload.array('imagini', 5), uploadImagini);
router.get('/:id/imagini', getImagini);
router.delete('/imagini/:id', verifyToken, stergeImagine);
router.put('/imagini/:id/ordine', verifyToken, async (req, res) => {
    try {
        await db.query('UPDATE imagini_anunturi SET ordine = ? WHERE id = ?', [req.body.ordine, req.params.id]);
        res.json({ mesaj: 'Ordine actualizata' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server' });
    }
});
export default router;