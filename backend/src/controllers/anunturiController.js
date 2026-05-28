import db from '../config/db.js';
import { body, validationResult } from 'express-validator';

export const anuntValidators = [
    body('titlu')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('pret')
        .notEmpty().withMessage('Price is required')
        .isNumeric().withMessage('Price must be a number')
        .isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('an')
        .notEmpty().withMessage('Year is required')
        .isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Invalid year'),
    body('kilometraj')
        .notEmpty().withMessage('Mileage is required')
        .isInt({ min: 0 }).withMessage('Mileage must be positive'),
];
// PUBLIC - Vezi toate anunturile
export const getAnunturi = async (req, res) => {
    try {
        const [anunturi] = await db.query(
            `SELECT anunturi.*, users.nume as nume_utilizator
             FROM anunturi
                      JOIN users ON anunturi.user_id = users.id
             ORDER BY anunturi.creat_la DESC`
        );
        res.json(anunturi);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// PUBLIC - Vezi un anunt dupa id
export const getAnuntById = async (req, res) => {
    try {
        const [anunt] = await db.query(
            `SELECT anunturi.*, users.nume as nume_utilizator
             FROM anunturi
                      JOIN users ON anunturi.user_id = users.id
             WHERE anunturi.id = ?`,
            [req.params.id]
        );

        if (anunt.length === 0) {
            return res.status(404).json({ mesaj: 'Anuntul nu a fost gasit' });
        }

        res.json(anunt[0]);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// PROTEJAT - Adauga anunt nou
export const createAnunt = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ mesaj: errors.array()[0].msg });
    }
    // ... restul codului rămâne la fel
    try {
        const {
            titlu, descriere, pret, marca, model, an,
            kilometraj, motorizare, transmisie,
            putere, tractiune, capacitate_cilindrica, caroserie
        } = req.body;

        await db.query(
            `INSERT INTO anunturi
             (titlu, descriere, pret, marca, model, an, kilometraj, motorizare,
              transmisie, putere, tractiune, capacitate_cilindrica, caroserie, user_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [titlu, descriere, pret, marca, model, an, kilometraj, motorizare,
                transmisie, putere, tractiune, capacitate_cilindrica, caroserie, req.user.id]
        );

        res.status(201).json({ mesaj: 'Anunt adaugat cu succes!' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// PROTEJAT - Editeaza anunt
export const updateAnunt = async (req, res) => {
    try {
        const [anunt] = await db.query(
            'SELECT * FROM anunturi WHERE id = ?',
            [req.params.id]
        );

        if (anunt.length === 0) {
            return res.status(404).json({ mesaj: 'Anuntul nu a fost gasit' });
        }

        if (anunt[0].user_id !== req.user.id && req.user.rol !== 'admin') {
            return res.status(403).json({ mesaj: 'Nu ai permisiunea sa editezi acest anunt' });
        }

        const {
            titlu, descriere, pret, marca, model, an,
            kilometraj, motorizare, transmisie,
            putere, tractiune, capacitate_cilindrica, caroserie
        } = req.body;

        await db.query(
            `UPDATE anunturi SET
                                 titlu=?, descriere=?, pret=?, marca=?, model=?, an=?, kilometraj=?,
                                 motorizare=?, transmisie=?, putere=?, tractiune=?,
                                 capacitate_cilindrica=?, caroserie=?
             WHERE id=?`,
            [titlu, descriere, pret, marca, model, an, kilometraj, motorizare,
                transmisie, putere, tractiune, capacitate_cilindrica, caroserie, req.params.id]
        );

        res.json({ mesaj: 'Anunt actualizat cu succes!' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// PROTEJAT - Sterge anunt
export const deleteAnunt = async (req, res) => {
    try {
        const [anunt] = await db.query(
            'SELECT * FROM anunturi WHERE id = ?',
            [req.params.id]
        );

        if (anunt.length === 0) {
            return res.status(404).json({ mesaj: 'Anuntul nu a fost gasit' });
        }

        if (anunt[0].user_id !== req.user.id && req.user.rol !== 'admin') {
            return res.status(403).json({ mesaj: 'Nu ai permisiunea sa stergi acest anunt' });
        }

        await db.query('DELETE FROM anunturi WHERE id = ?', [req.params.id]);

        res.json({ mesaj: 'Anunt sters cu succes!' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};
// PUBLIC - Cautare simpla dupa cuvinte cheie
export const cautareSimple = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ mesaj: 'Introduceti un termen de cautare' });
        }

        const termen = `%${q}%`;

        const [anunturi] = await db.query(
            `SELECT anunturi.*, users.nume as nume_utilizator
             FROM anunturi
             JOIN users ON anunturi.user_id = users.id
             WHERE anunturi.titlu LIKE ?
             OR anunturi.marca LIKE ?
             OR anunturi.model LIKE ?
             OR anunturi.descriere LIKE ?
             ORDER BY anunturi.creat_la DESC`,
            [termen, termen, termen, termen]
        );

        res.json(anunturi);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// PUBLIC - Cautare avansata cu filtre multiple
export const cautareAvansata = async (req, res) => {
    try {
        const {
            marca, model, an_min, an_max,
            pret_min, pret_max, motorizare,
            transmisie, caroserie, tractiune,
            km_max, putere_min
        } = req.query;

        // Construim query-ul dinamic in functie de filtrele trimise
        let query = `
            SELECT anunturi.*, users.nume as nume_utilizator
            FROM anunturi
            JOIN users ON anunturi.user_id = users.id
            WHERE 1=1
        `;
        const params = [];

        if (marca) {
            query += ' AND anunturi.marca LIKE ?';
            params.push(`%${marca}%`);
        }
        if (model) {
            query += ' AND anunturi.model LIKE ?';
            params.push(`%${model}%`);
        }
        if (an_min) {
            query += ' AND anunturi.an >= ?';
            params.push(an_min);
        }
        if (an_max) {
            query += ' AND anunturi.an <= ?';
            params.push(an_max);
        }
        if (pret_min) {
            query += ' AND anunturi.pret >= ?';
            params.push(pret_min);
        }
        if (pret_max) {
            query += ' AND anunturi.pret <= ?';
            params.push(pret_max);
        }
        if (motorizare) {
            query += ' AND anunturi.motorizare LIKE ?';
            params.push(`%${motorizare}%`);
        }
        if (transmisie) {
            query += ' AND anunturi.transmisie = ?';
            params.push(transmisie);
        }
        if (caroserie) {
            query += ' AND anunturi.caroserie = ?';
            params.push(caroserie);
        }
        if (tractiune) {
            query += ' AND anunturi.tractiune = ?';
            params.push(tractiune);
        }
        if (km_max) {
            query += ' AND anunturi.kilometraj <= ?';
            params.push(km_max);
        }
        if (putere_min) {
            query += ' AND anunturi.putere >= ?';
            params.push(putere_min);
        }

        query += ' ORDER BY anunturi.creat_la DESC';

        const [anunturi] = await db.query(query, params);
        res.json(anunturi);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};
