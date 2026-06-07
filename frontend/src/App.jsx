import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { socket } from './services/socket';
import api from './services/api';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Listings from './pages/Listings';
import Login from './pages/Login';
import Register from './pages/Register';
import AnuntDetail from './pages/AnuntDetail';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import PostAnunt from './pages/PostAnunt';
import EditAnunt from './pages/EditAnunt';
import Chat from './pages/Chat';
import AiChatbot from './components/AiChatbot';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';

function App() {
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user?.id) return;

        socket.emit('user_online', user.id);

        const ping = () => api.put('/user/ping').catch(() => {});
        ping();
        const pingInterval = setInterval(ping, 30000);

        const handleBeforeUnload = () => socket.emit('user_offline', user.id);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(pingInterval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            socket.emit('user_offline', user.id);
        };
    }, []);

    return (
        <ThemeProvider>
            <BrowserRouter>
                {/* Global glassmorphism background orbs */}
                <div style={orbBase} className="rsp-orb1" />
                <div style={orbBase} className="rsp-orb2" />
                <div style={orbBase} className="rsp-orb3" />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <Navbar />
                    <Routes>
                        <Route path="/listings/:id/edit" element={<EditAnunt />} />
                        <Route path="/" element={<Home />} />
                        <Route path="/listings" element={<Listings />} />
                        <Route path="/listings/:id" element={<AnuntDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/listings/new" element={<PostAnunt />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/chat/:userId" element={<Chat />} />
                        <Route path="/news" element={<News />} />
                        <Route path="/news/:id" element={<NewsDetail />} />
                    </Routes>
                    <Footer />
                    <AiChatbot />
                </div>
            </BrowserRouter>
        </ThemeProvider>
    );
}

/* Orb sizes/positions stay in inline style; colors are overridden per-theme via CSS classes */
const orbBase = {
    position: 'fixed',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 0,
};

export default App;
