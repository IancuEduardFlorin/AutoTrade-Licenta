import db from '../config/db.js';
import cloudinary from '../config/cloudinary.js';

// PUBLIC - Vezi toate articolele publicate
export const getArticole = async (req, res) => {
    try {
        const [articole] = await db.query(
            `SELECT news.*, users.nume as autor_nume
             FROM news
             JOIN users ON news.autor_id = users.id
             WHERE news.status = 'published'
             ORDER BY news.creat_la DESC`
        );
        res.json(articole);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// PUBLIC - Vezi un articol dupa id
export const getArticol = async (req, res) => {
    try {
        const [articol] = await db.query(
            `SELECT news.*, users.nume as autor_nume
             FROM news
             JOIN users ON news.autor_id = users.id
             WHERE news.id = ? AND news.status = 'published'`,
            [req.params.id]
        );
        if (articol.length === 0) {
            return res.status(404).json({ mesaj: 'Articolul nu a fost gasit' });
        }
        res.json(articol[0]);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// ADMIN - Vezi toate articolele
export const getToateArticolele = async (req, res) => {
    try {
        const [articole] = await db.query(
            `SELECT news.*, users.nume as autor_nume
             FROM news
             JOIN users ON news.autor_id = users.id
             ORDER BY news.creat_la DESC`
        );
        res.json(articole);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// ADMIN - Adauga articol
export const adaugaArticol = async (req, res) => {
    try {
        const { titlu, continut, categorie, status } = req.body;
        let imagine_url = null;
        let imagine_public_id = null;

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'autotrade/news', transformation: [{ width: 1200, height: 600, crop: 'fill', quality: 'auto' }] },
                    (error, result) => { if (error) reject(error); else resolve(result); }
                );
                stream.end(req.file.buffer);
            });
            imagine_url = result.secure_url;
            imagine_public_id = result.public_id;
        }

        const [result] = await db.query(
            `INSERT INTO news (titlu, continut, categorie, imagine_url, imagine_public_id, status, autor_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [titlu, continut, categorie || 'News', imagine_url, imagine_public_id, status || 'draft', req.user.id]
        );

        res.status(201).json({ mesaj: 'Articol adaugat cu succes!', id: result.insertId });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// ADMIN - Editeaza articol
export const editeazaArticol = async (req, res) => {
    try {
        const { titlu, continut, categorie, status } = req.body;
        const [articol] = await db.query('SELECT * FROM news WHERE id = ?', [req.params.id]);

        if (articol.length === 0) {
            return res.status(404).json({ mesaj: 'Articolul nu a fost gasit' });
        }

        let imagine_url = articol[0].imagine_url;
        let imagine_public_id = articol[0].imagine_public_id;

        if (req.file) {
            // Sterge imaginea veche de pe Cloudinary
            if (imagine_public_id) {
                await cloudinary.uploader.destroy(imagine_public_id);
            }
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'autotrade/news', transformation: [{ width: 1200, height: 600, crop: 'fill', quality: 'auto' }] },
                    (error, result) => { if (error) reject(error); else resolve(result); }
                );
                stream.end(req.file.buffer);
            });
            imagine_url = result.secure_url;
            imagine_public_id = result.public_id;
        }

        await db.query(
            `UPDATE news SET titlu=?, continut=?, categorie=?, imagine_url=?, imagine_public_id=?, status=?
             WHERE id=?`,
            [titlu, continut, categorie, imagine_url, imagine_public_id, status, req.params.id]
        );

        res.json({ mesaj: 'Articol actualizat cu succes!' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};

// ADMIN - Sterge articol
export const stergeArticol = async (req, res) => {
    try {
        const [articol] = await db.query('SELECT * FROM news WHERE id = ?', [req.params.id]);

        if (articol.length === 0) {
            return res.status(404).json({ mesaj: 'Articolul nu a fost gasit' });
        }

        if (articol[0].imagine_public_id) {
            await cloudinary.uploader.destroy(articol[0].imagine_public_id);
        }

        await db.query('DELETE FROM news WHERE id = ?', [req.params.id]);
        res.json({ mesaj: 'Articol sters cu succes!' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server', eroare: error.message });
    }
};