import db from '../config/db.js';
import { v2 as cloudinary } from 'cloudinary';

// Obtine toate conversatiile unui utilizator
export const getConversatii = async (req, res) => {
    try {
        const [conversatii] = await db.query(
            `SELECT 
        m.*,
        u1.nume as expeditor_nume,
        u2.nume as destinatar_nume,
        a.titlu as anunt_titlu
       FROM mesaje m
       JOIN users u1 ON m.expeditor_id = u1.id
       JOIN users u2 ON m.destinatar_id = u2.id
       LEFT JOIN anunturi a ON m.anunt_id = a.id
       WHERE m.expeditor_id = ? OR m.destinatar_id = ?
       ORDER BY m.creat_la DESC`,
            [req.user.id, req.user.id]
        );

        // Grupeaza mesajele pe conversatii unice
        const conversatiiMap = {};
        conversatii.forEach(m => {
            const altUserId = m.expeditor_id === req.user.id ? m.destinatar_id : m.expeditor_id;
            const altUserNume = m.expeditor_id === req.user.id ? m.destinatar_nume : m.expeditor_nume;
            const key = `${Math.min(m.expeditor_id, m.destinatar_id)}_${Math.max(m.expeditor_id, m.destinatar_id)}`;

            if (!conversatiiMap[key]) {
                conversatiiMap[key] = {
                    altUserId,
                    altUserNume,
                    anunt_id: m.anunt_id,
                    anunt_titlu: m.anunt_titlu,
                    ultimulMesaj: m.imagine_url ? '📷 Photo' : m.continut,
                    creat_la: m.creat_la,
                    necitite: 0,
                };
            }
            if (!m.citit && m.destinatar_id === req.user.id) {
                conversatiiMap[key].necitite++;
            }
        });

        res.json(Object.values(conversatiiMap));
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// Obtine mesajele dintre doi utilizatori
export const getMesaje = async (req, res) => {
    try {
        const { userId } = req.params;

        const [mesaje] = await db.query(
            `SELECT m.*, u.nume as expeditor_nume
       FROM mesaje m
       JOIN users u ON m.expeditor_id = u.id
       WHERE (m.expeditor_id = ? AND m.destinatar_id = ?)
          OR (m.expeditor_id = ? AND m.destinatar_id = ?)
       ORDER BY m.creat_la ASC`,
            [req.user.id, userId, userId, req.user.id]
        );

        // Marcheaza mesajele ca citite
        await db.query(
            `UPDATE mesaje SET citit = TRUE 
       WHERE destinatar_id = ? AND expeditor_id = ?`,
            [req.user.id, userId]
        );

        res.json(mesaje);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// Trimite un mesaj (text sau imagine)
export const trimiteMessaj = async (req, res) => {
    try {
        const { destinatar_id, continut, anunt_id, imagine_url } = req.body;

        if (!continut?.trim() && !imagine_url) {
            return res.status(400).json({ mesaj: 'Mesajul nu poate fi gol' });
        }

        const [result] = await db.query(
            `INSERT INTO mesaje (expeditor_id, destinatar_id, continut, anunt_id, imagine_url)
       VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, destinatar_id, continut || '', anunt_id || null, imagine_url || null]
        );

        const [mesaj] = await db.query(
            `SELECT m.*, u.nume as expeditor_nume
       FROM mesaje m
       JOIN users u ON m.expeditor_id = u.id
       WHERE m.id = ?`,
            [result.insertId]
        );

        res.status(201).json(mesaj[0]);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// Incarca o imagine pentru chat pe Cloudinary
export const uploadImagineChat = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ mesaj: 'No image provided' });

        const filename = `chat_${req.user.id}_${Date.now()}`;
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'chat_images', public_id: filename, transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }] },
                (err, data) => err ? reject(err) : resolve(data)
            );
            stream.end(req.file.buffer);
        });

        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('uploadImagineChat error:', error.message);
        res.status(500).json({ mesaj: 'Upload failed', eroare: error.message });
    }
};

// Numarul de mesaje necitite
export const getMesajeNecitite = async (req, res) => {
    try {
        const [result] = await db.query(
            `SELECT COUNT(*) as necitite FROM mesaje 
       WHERE destinatar_id = ? AND citit = FALSE`,
            [req.user.id]
        );
        res.json({ necitite: result[0].necitite });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};