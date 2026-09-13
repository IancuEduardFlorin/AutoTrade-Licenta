import express from 'express';
import {
    getAnunturi, getAnuntById, createAnunt, updateAnunt,
    deleteAnunt, cautareSimple, cautareAvansata, anuntValidators,
    raporteazaAnunt
} from '../controllers/anunturiController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAnunturi);
router.get('/search', cautareSimple);
router.get('/search/avansat', cautareAvansata);
router.get('/:id', getAnuntById);
router.post('/', verifyToken, anuntValidators, createAnunt);
router.post('/:id/raporteaza', verifyToken, raporteazaAnunt);
router.put('/:id', verifyToken, updateAnunt);
router.delete('/:id', verifyToken, deleteAnunt);

export default router;