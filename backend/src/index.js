import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import anunturiRoutes from './routes/anunturiRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/anunturi', anunturiRoutes);
app.use('/api/favorite', favoriteRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
    res.send('API AutoTrade functional!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server pornit pe portul ${PORT}`);
});