import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

// Validatori
export const registerValidators = [
    body('nume')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('parola')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginValidators = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('parola')
        .notEmpty().withMessage('Password is required'),
];

export const register = async (req, res) => {
    // Verifica erorile de validare
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ mesaj: errors.array()[0].msg });
    }

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ mesaj: errors.array()[0].msg });
    }

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