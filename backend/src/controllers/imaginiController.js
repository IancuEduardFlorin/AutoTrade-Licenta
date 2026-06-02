import db from '../config/db.js';
import cloudinary, { uploadToCloudinary } from '../config/cloudinary.js';

export const uploadImagini = async (req, res) => {
    try {
        const { id } = req.params;

        const [anunt] = await db.query('SELECT * FROM anunturi WHERE id = ?', [id]);

        if (anunt.length === 0) {
            return res.status(404).json({ mesaj: 'Anuntul nu a fost gasit' });
        }

        if (anunt[0].user_id !== req.user.id && req.user.rol !== 'admin') {
            return res.status(403).json({ mesaj: 'Nu ai permisiunea sa adaugi imagini' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ mesaj: 'Nu ai selectat nicio imagine' });
        }

        const imagini = [];
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const filename = `anunt_${id}_${Date.now()}_${i}`;

            // Uploadam pe Cloudinary din buffer
            const result = await uploadToCloudinary(file.buffer, filename);

            await db.query(
                'INSERT INTO imagini_anunturi (anunt_id, url, public_id, ordine) VALUES (?, ?, ?, ?)',
                [id, result.secure_url, result.public_id, i]
            );

            imagini.push({ url: result.secure_url, public_id: result.public_id });
        }

        res.status(201).json({ mesaj: 'Imagini adaugate cu succes!', imagini });
    } catch (error) {
        console.error('uploadImagini error:', error.message);
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

export const getImagini = async (req, res) => {
    try {
        const [imagini] = await db.query(
            'SELECT * FROM imagini_anunturi WHERE anunt_id = ? ORDER BY ordine ASC',
            [req.params.id]
        );
        res.json(imagini);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

export const stergeImagine = async (req, res) => {
    try {
        const [imagine] = await db.query(
            'SELECT * FROM imagini_anunturi WHERE id = ?',
            [req.params.id]
        );

        if (imagine.length === 0) {
            return res.status(404).json({ mesaj: 'Imaginea nu a fost gasita' });
        }

        await cloudinary.uploader.destroy(imagine[0].public_id);
        await db.query('DELETE FROM imagini_anunturi WHERE id = ?', [req.params.id]);

        res.json({ mesaj: 'Imagine stearsa cu succes!' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};