import express from 'express';
import {
    getProfil,
    updateProfil,
    schimbaParola,
    getAnunturiProprii
} from '../controllers/userController.js';
import verifyToken from '../middleware/authMiddleware.js';
import db from '../config/db.js';
const router = express.Router();

// Toate rutele sunt protejate
router.get('/profil', verifyToken, getProfil);
router.put('/profil', verifyToken, updateProfil);
router.put('/parola', verifyToken, schimbaParola);
router.get('/anunturi', verifyToken, getAnunturiProprii);
router.get('/public/:id', async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, nume FROM users WHERE id = ?',
            [req.params.id]
        );
        if (users.length === 0) {
            return res.status(404).json({ mesaj: 'Utilizatorul nu a fost gasit' });
        }
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
});
export default router;