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
import newsRoutes from './routes/newsRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

// Add imagine_url column to mesaje if it doesn't exist yet
db.query('ALTER TABLE mesaje ADD COLUMN imagine_url VARCHAR(500) NULL').catch(() => {});
// Add location columns to anunturi if they don't exist yet
db.query('ALTER TABLE anunturi ADD COLUMN oras VARCHAR(100) NULL').catch(() => {});
db.query('ALTER TABLE anunturi ADD COLUMN judet VARCHAR(100) NULL').catch(() => {});

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

// CORS - trebuie sa fie primul middleware
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { mesaj: 'Too many login attempts, please try again in 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { mesaj: 'Too many AI requests, please slow down' },
    standardHeaders: true,
    legacyHeaders: false,
});

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

// Rute
app.use('/api/auth', authRoutes);
app.use('/api/anunturi', anunturiRoutes);
app.use('/api/favorite', favoriteRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mesaje', mesajeRoutes);
app.use('/api/anunturi', imaginiRoutes);
app.use('/api/news', newsRoutes);

app.get('/api/stats', async (req, res) => {
    try {
        const [anunturi] = await db.query('SELECT COUNT(*) as total FROM anunturi');
        const [users] = await db.query('SELECT COUNT(*) as total FROM users');
        const [today] = await db.query(
            'SELECT COUNT(*) as total FROM anunturi WHERE DATE(creat_la) = CURDATE()'
        );
        res.json({
            anunturi: anunturi[0].total,
            users: users[0].total,
            today: today[0].total,
        });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare server' });
    }
});

app.get('/', (req, res) => {
    res.send('API AutoTrade functional!');
});

// userId -> Set<socketId>  (handles multiple tabs per user)
const onlineUsers = new Map();

// Socket.io
io.on('connection', (socket) => {
    console.log('[Socket] User connected:', socket.id);
    let connectedUserId = null;

    // ── MESSAGING ──────────────────────────────────────────
    // Puts this socket into the user's message-routing room.
    // sendMessage targets these rooms via io.to(`user_${id}`).
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`[Socket] join: userId=${userId} joined room user_${userId}`);
    });

    // ── PRESENCE ───────────────────────────────────────────
    // Separate event — only updates the online Map and broadcasts
    // status. Does NOT touch rooms so messaging is unaffected.
    socket.on('user_online', (userId) => {
        connectedUserId = userId;
        console.log(`[Socket] user_online received: userId=${userId}, socketId=${socket.id}`);

        if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
        onlineUsers.get(userId).add(socket.id);

        console.log(`[Socket] Broadcasting user_status {userId:${userId}, isOnline:true}`);
        socket.broadcast.emit('user_status', { userId, isOnline: true });
    });

    // Returns current online state for a single user (with ack callback).
    socket.on('check_status', (userId, callback) => {
        const isOnline = onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
        console.log(`[Socket] check_status: userId=${userId}, isOnline=${isOnline}`);
        callback(isOnline);
    });

    // Bulk status check — used when loading the conversation list.
    socket.on('get_statuses', (userIds, callback) => {
        const statuses = {};
        userIds.forEach(id => {
            statuses[id] = onlineUsers.has(id) && onlineUsers.get(id).size > 0;
        });
        callback(statuses);
    });

    // Explicit offline — emitted by the frontend on logout so the
    // server doesn't have to wait for the TCP disconnect.
    socket.on('user_offline', (userId) => {
        console.log(`[Socket] user_offline received: userId=${userId}`);
        const sockets = onlineUsers.get(userId);
        if (sockets) {
            sockets.delete(socket.id);
            if (sockets.size === 0) {
                onlineUsers.delete(userId);
                console.log(`[Socket] Broadcasting user_status {userId:${userId}, isOnline:false} (logout)`);
                socket.broadcast.emit('user_status', { userId, isOnline: false });
            }
        }
        connectedUserId = null;
    });

    socket.on('sendMessage', (data) => {
        io.to(`user_${data.destinatar_id}`).emit('newMessage', data);
        io.to(`user_${data.expeditor_id}`).emit('newMessage', data);
    });

    // Fallback: tab closed / network drop — clean up just like user_offline.
    socket.on('disconnect', () => {
        console.log('[Socket] User disconnected:', socket.id);
        if (connectedUserId === null) return;
        const sockets = onlineUsers.get(connectedUserId);
        if (!sockets) return;
        sockets.delete(socket.id);
        if (sockets.size === 0) {
            onlineUsers.delete(connectedUserId);
            console.log(`[Socket] Broadcasting user_status {userId:${connectedUserId}, isOnline:false} (disconnect)`);
            socket.broadcast.emit('user_status', { userId: connectedUserId, isOnline: false });
        }
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server pornit pe portul ${PORT}`);
});