import db from '../config/db.js';

// Adauga la favorite
export const addFavorit = async (req, res) => {
    try {
        // Verificam daca anuntul exista
        const [anunt] = await db.query(
            'SELECT * FROM anunturi WHERE id = ?',
            [req.params.id]
        );

        if (anunt.length === 0) {
            return res.status(404).json({ mesaj: 'Anuntul nu a fost gasit' });
        }

        // Verificam daca e deja la favorite
        const [existing] = await db.query(
            'SELECT * FROM favorite WHERE user_id = ? AND anunt_id = ?',
            [req.user.id, req.params.id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ mesaj: 'Anuntul este deja la favorite' });
        }

        await db.query(
            'INSERT INTO favorite (user_id, anunt_id) VALUES (?, ?)',
            [req.user.id, req.params.id]
        );

        res.status(201).json({ mesaj: 'Anunt adaugat la favorite!' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// Vezi toate favoritele utilizatorului
export const getFavorite = async (req, res) => {
    try {
        const [favorite] = await db.query(
            `SELECT anunturi.*, users.nume as nume_utilizator
             FROM favorite
             JOIN anunturi ON favorite.anunt_id = anunturi.id
             JOIN users ON anunturi.user_id = users.id
             WHERE favorite.user_id = ?
             ORDER BY favorite.id DESC`,
            [req.user.id]
        );

        res.json(favorite);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// Sterge din favorite
export const removeFavorit = async (req, res) => {
    try {
        const [favorit] = await db.query(
            'SELECT * FROM favorite WHERE user_id = ? AND anunt_id = ?',
            [req.user.id, req.params.id]
        );

        if (favorit.length === 0) {
            return res.status(404).json({ mesaj: 'Anuntul nu este la favorite' });
        }

        await db.query(
            'DELETE FROM favorite WHERE user_id = ? AND anunt_id = ?',
            [req.user.id, req.params.id]
        );

        res.json({ mesaj: 'Anunt eliminat din favorite!' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};