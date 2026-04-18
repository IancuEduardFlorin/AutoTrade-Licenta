import express from 'express';
import {
    addFavorit,
    getFavorite,
    removeFavorit
} from '../controllers/favoriteController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

// Toate rutele sunt protejate - trebuie sa fii autentificat
router.post('/:id', verifyToken, addFavorit);
router.get('/', verifyToken, getFavorite);
router.delete('/:id', verifyToken, removeFavorit);

export default router;
