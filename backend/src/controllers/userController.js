import db from '../config/db.js';
import bcrypt from 'bcryptjs';

// Vezi profilul propriu
export const getProfil = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, nume, email, rol, creat_la FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ mesaj: 'Utilizatorul nu a fost gasit' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// Editeaza profilul propriu
export const updateProfil = async (req, res) => {
    try {
        const { nume, email } = req.body;

        // Verificam daca emailul nou nu e deja folosit de altcineva
        const [existingUser] = await db.query(
            'SELECT * FROM users WHERE email = ? AND id != ?',
            [email, req.user.id]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ mesaj: 'Email-ul este deja folosit' });
        }

        await db.query(
            'UPDATE users SET nume = ?, email = ? WHERE id = ?',
            [nume, email, req.user.id]
        );

        res.json({ mesaj: 'Profil actualizat cu succes!' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// Schimba parola
export const schimbaParola = async (req, res) => {
    try {
        const { parola_veche, parola_noua } = req.body;

        // Luam utilizatorul din baza de date
        const [users] = await db.query(
            'SELECT * FROM users WHERE id = ?',
            [req.user.id]
        );

        const user = users[0];

        // Verificam parola veche
        const parolaCorecta = await bcrypt.compare(parola_veche, user.parola);
        if (!parolaCorecta) {
            return res.status(400).json({ mesaj: 'Parola veche este incorecta' });
        }

        // Criptam parola noua
        const parolaCriptata = await bcrypt.hash(parola_noua, 10);

        await db.query(
            'UPDATE users SET parola = ? WHERE id = ?',
            [parolaCriptata, req.user.id]
        );

        res.json({ mesaj: 'Parola schimbata cu succes!' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// Vezi anunturile proprii
export const getAnunturiProprii = async (req, res) => {
    try {
        const [anunturi] = await db.query(
            `SELECT * FROM anunturi 
             WHERE user_id = ? 
             ORDER BY creat_la DESC`,
            [req.user.id]
        );

        res.json(anunturi);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};