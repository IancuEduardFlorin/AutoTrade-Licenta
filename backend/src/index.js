import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import anunturiRoutes from './routes/anunturiRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import mesajeRoutes from './routes/mesajeRoutes.js';
import imaginiRoutes from './routes/imaginiRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

// Mentine conexiunea MySQL activa
setInterval(async () => {
    try {
        await db.query('SELECT 1');
    } catch (err) {
        console.error('DB keepalive error:', err.message);
    }
}, 30000);

// Securitate HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// CORS
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting strict pentru autentificare
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { mesaj: 'Too many login attempts, please try again in 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting pentru AI
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { mesaj: 'Too many AI requests, please slow down' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting general - fara limita pentru imagini
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    message: { mesaj: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.includes('/imagini'),
});

app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/ai', aiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/anunturi', anunturiRoutes);
app.use('/api/favorite', favoriteRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mesaje', mesajeRoutes);
app.use('/api/anunturi', imaginiRoutes);

app.get('/', (req, res) => {
    res.send('API AutoTrade functional!');
});

// Socket.io
io.on('connection', (socket) => {
    console.log('User conectat:', socket.id);

    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} a intrat in camera user_${userId}`);
    });

    socket.on('sendMessage', (data) => {
        io.to(`user_${data.destinatar_id}`).emit('newMessage', data);
        io.to(`user_${data.expeditor_id}`).emit('newMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('User deconectat:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server pornit pe portul ${PORT}`);
});