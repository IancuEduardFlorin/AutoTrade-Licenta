import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/anunturi', anunturiRoutes);
app.use('/api/favorite', favoriteRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mesaje', mesajeRoutes);

app.get('/', (req, res) => {
    res.send('API AutoTrade functional!');
});

// Socket.io - gestionare conexiuni real-time
io.on('connection', (socket) => {
    console.log('User conectat:', socket.id);

    // Utilizatorul intra in camera sa personala
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} a intrat in camera user_${userId}`);
    });

    // Trimite mesaj real-time
    socket.on('sendMessage', (data) => {
        // Trimite mesajul destinatarului
        io.to(`user_${data.destinatar_id}`).emit('newMessage', data);
        // Trimite si expeditorului ca confirmare
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