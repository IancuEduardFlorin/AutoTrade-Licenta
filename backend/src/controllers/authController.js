import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { nume, email, parola } = req.body;

        const [existingUser] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ mesaj: 'Email-ul este deja folosit' });
        }

        const parolaCriptata = await bcrypt.hash(parola, 10);

        await db.query(
            'INSERT INTO users (nume, email, parola) VALUES (?, ?, ?)',
            [nume, email, parolaCriptata]
        );

        res.status(201).json({ mesaj: 'Cont creat cu succes!' });

    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, parola } = req.body;

        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        if (users.length === 0) {
            return res.status(400).json({ mesaj: 'Email sau parola incorecte' });
        }

        const user = users[0];

        const parolaCorecta = await bcrypt.compare(parola, user.parola);
        if (!parolaCorecta) {
            return res.status(400).json({ mesaj: 'Email sau parola incorecte' });
        }

        const token = jwt.sign(
            { id: user.id, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            mesaj: 'Autentificare reusita!',
            token,
            user: {
                id: user.id,
                nume: user.nume,
                email: user.email,
                rol: user.rol
            }
        });

    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};