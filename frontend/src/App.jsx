import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
    return (
        <BrowserRouter>
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
            </Routes>
            <Footer />
            <AiChatbot />
        </BrowserRouter>
    );
}

export default App;