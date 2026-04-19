import db from '../config/db.js';

// Vezi toti utilizatorii
export const getUtilizatori = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, nume, email, rol, creat_la FROM users ORDER BY creat_la DESC'
        );
        res.json(users);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// Sterge un utilizator
export const deleteUtilizator = async (req, res) => {
    try {
        const [user] = await db.query(
            'SELECT * FROM users WHERE id = ?',
            [req.params.id]
        );

        if (user.length === 0) {
            return res.status(404).json({ mesaj: 'Utilizatorul nu a fost gasit' });
        }

        // Nu permitem stergerea unui alt admin
        if (user[0].rol === 'admin') {
            return res.status(403).json({ mesaj: 'Nu poti sterge un alt administrator' });
        }

        // Stergem mai intai favoritele utilizatorului
        await db.query('DELETE FROM favorite WHERE user_id = ?', [req.params.id]);

        // Stergem anunturile utilizatorului
        await db.query('DELETE FROM anunturi WHERE user_id = ?', [req.params.id]);

        // Stergem utilizatorul
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);

        res.json({ mesaj: 'Utilizator sters cu succes!' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// Schimba rolul unui utilizator
export const schimbaRol = async (req, res) => {
    try {
        const { rol } = req.body;

        if (!['user', 'admin'].includes(rol)) {
            return res.status(400).json({ mesaj: 'Rol invalid' });
        }

        const [user] = await db.query(
            'SELECT * FROM users WHERE id = ?',
            [req.params.id]
        );

        if (user.length === 0) {
            return res.status(404).json({ mesaj: 'Utilizatorul nu a fost gasit' });
        }

        await db.query(
            'UPDATE users SET rol = ? WHERE id = ?',
            [rol, req.params.id]
        );

        res.json({ mesaj: `Rol schimbat la ${rol} cu succes!` });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// Vezi toate anunturile (inclusiv cele inactive)
export const getToateAnunturile = async (req, res) => {
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

// Sterge orice anunt (ca admin)
export const deleteAnuntAdmin = async (req, res) => {
    try {
        const [anunt] = await db.query(
            'SELECT * FROM anunturi WHERE id = ?',
            [req.params.id]
        );

        if (anunt.length === 0) {
            return res.status(404).json({ mesaj: 'Anuntul nu a fost gasit' });
        }

        // Stergem mai intai din favorite
        await db.query('DELETE FROM favorite WHERE anunt_id = ?', [req.params.id]);

        await db.query('DELETE FROM anunturi WHERE id = ?', [req.params.id]);

        res.json({ mesaj: 'Anunt sters cu succes de catre admin!' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};