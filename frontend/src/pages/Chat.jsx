import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../services/api';

const socket = io('http://localhost:5000');

function Chat() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [mesaje, setMesaje] = useState([]);
    const [conversatii, setConversatii] = useState([]);
    const [mesajNou, setMesajNou] = useState('');
    const [altUser, setAltUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    if (!token) {
        navigate('/login');
        return null;
    }

    useEffect(() => {
        // Intra in camera personala
        socket.emit('join', user.id);

        // Asculta mesaje noi
        socket.on('newMessage', (mesaj) => {
            setMesaje(prev => {
                // Evita duplicatele
                if (prev.find(m => m.id === mesaj.id)) return prev;
                return [...prev, mesaj];
            });
        });

        return () => {
            socket.off('newMessage');
        };
    }, []);

    useEffect(() => {
        fetchConversatii();
        if (userId) fetchMesaje();
    }, [userId]);

    useEffect(() => {
        scrollToBottom();
    }, [mesaje]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversatii = async () => {
        try {
            const response = await api.get('/mesaje/conversatii');
            setConversatii(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMesaje = async () => {
        setLoading(true);
        try {
            const [mesajeRes, userRes] = await Promise.all([
                api.get(`/mesaje/${userId}`),
                api.get(`/user/public/${userId}`),
            ]);

            setMesaje(mesajeRes.data);
            setAltUser({ id: parseInt(userId), nume: userRes.data.nume });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTrimite = async (e) => {
        e.preventDefault();
        if (!mesajNou.trim()) return;

        try {
            const response = await api.post('/mesaje', {
                destinatar_id: parseInt(userId),
                continut: mesajNou,
            });

            const mesajTrimis = response.data;

            // Trimite prin Socket.io pentru real-time
            socket.emit('sendMessage', {
                ...mesajTrimis,
                expeditor_id: user.id,
                destinatar_id: parseInt(userId),
            });

            setMesajNou('');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={styles.page}>

            {/* Sidebar conversatii */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <div style={styles.sidebarTitle}>Messages</div>
                    <Link to="/profile" style={styles.backLink}>← Back</Link>
                </div>
                {conversatii.length === 0 ? (
                    <div style={styles.empty}>No conversations yet</div>
                ) : (
                    conversatii.map((conv, i) => (
                        <Link
                            key={i}
                            to={`/chat/${conv.altUserId}`}
                            style={{
                                ...styles.convItem,
                                background: conv.altUserId === parseInt(userId) ? 'var(--accent)' : 'transparent',
                            }}
                        >
                            <div style={styles.convAvatar}>
                                {conv.altUserNume?.charAt(0).toUpperCase()}
                            </div>
                            <div style={styles.convInfo}>
                                <div style={styles.convNume}>{conv.altUserNume}</div>
                                {conv.anunt_titlu && (
                                    <div style={styles.convAnunt}>Re: {conv.anunt_titlu}</div>
                                )}
                                <div style={styles.convUltimul}>{conv.ultimulMesaj}</div>
                            </div>
                            {conv.necitite > 0 && (
                                <div style={styles.necititeBadge}>{conv.necitite}</div>
                            )}
                        </Link>
                    ))
                )}
            </div>

            {/* Chat area */}
            <div style={styles.chatArea}>
                {!userId ? (
                    <div style={styles.noChatSelected}>
                        <div style={styles.noChatIcon}>💬</div>
                        <div style={styles.noChatText}>Select a conversation to start chatting</div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div style={styles.chatHeader}>
                            <div style={styles.chatAvatar}>
                                {altUser?.nume?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div style={styles.chatHeaderInfo}>
                                <div style={styles.chatHeaderNume}>{altUser?.nume || 'Loading...'}</div>
                                <div style={styles.chatHeaderStatus}>● Online</div>
                            </div>
                        </div>

                        {/* Mesaje */}
                        <div style={styles.messagesArea}>
                            {loading ? (
                                <div style={styles.loadingMsg}>Loading messages...</div>
                            ) : mesaje.length === 0 ? (
                                <div style={styles.noMessages}>No messages yet. Say hello! 👋</div>
                            ) : (
                                mesaje.map((m, i) => {
                                    const isMe = m.expeditor_id === user.id;
                                    return (
                                        <div key={i} style={{
                                            ...styles.messageRow,
                                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                                        }}>
                                            {!isMe && (
                                                <div style={styles.msgAvatar}>
                                                    {m.expeditor_nume?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div style={{
                                                ...styles.messageBubble,
                                                background: isMe ? 'var(--accent)' : 'var(--bg-card)',
                                                borderColor: isMe ? 'var(--accent)' : 'var(--border)',
                                                borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                            }}>
                                                <div style={styles.messageText}>{m.continut}</div>
                                                <div style={styles.messageTime}>
                                                    {new Date(m.creat_la).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input mesaj */}
                        <form onSubmit={handleTrimite} style={styles.inputArea}>
                            <input
                                style={styles.msgInput}
                                placeholder="Type a message..."
                                value={mesajNou}
                                onChange={(e) => setMesajNou(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" style={styles.btnTrimite} disabled={!mesajNou.trim()}>
                                Send →
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { display: 'flex', height: 'calc(100vh - 52px)', background: 'var(--bg-primary)' },
    sidebar: { width: '280px', minWidth: '280px', background: 'var(--bg-navbar)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' },
    sidebarHeader: { padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    sidebarTitle: { fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' },
    backLink: { fontSize: '12px', color: 'var(--accent-light)', textDecoration: 'none' },
    empty: { padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' },
    convItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', textDecoration: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer' },
    convAvatar: { width: '36px', height: '36px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', flexShrink: 0 },
    convInfo: { flex: 1, overflow: 'hidden' },
    convNume: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2px' },
    convAnunt: { fontSize: '10px', color: 'var(--accent-light)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    convUltimul: { fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    necititeBadge: { background: 'var(--accent-light)', color: 'var(--bg-primary)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '500', flexShrink: 0 },
    chatArea: { flex: 1, display: 'flex', flexDirection: 'column' },
    noChatSelected: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' },
    noChatIcon: { fontSize: '48px' },
    noChatText: { fontSize: '14px', color: 'var(--text-muted)' },
    chatHeader: { padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-navbar)', display: 'flex', alignItems: 'center', gap: '12px' },
    chatAvatar: { width: '36px', height: '36px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' },
    chatHeaderInfo: {},
    chatHeaderNume: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' },
    chatHeaderStatus: { fontSize: '11px', color: '#4caf50' },
    messagesArea: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
    loadingMsg: { textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' },
    noMessages: { textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '40px' },
    messageRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
    msgAvatar: { width: '28px', height: '28px', background: 'var(--accent-dim)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--text-primary)', flexShrink: 0 },
    messageBubble: { maxWidth: '60%', padding: '10px 14px', borderWidth: '1px', borderStyle: 'solid' },
    messageText: { fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 },
    messageTime: { fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' },
    inputArea: { padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-navbar)', display: 'flex', gap: '8px' },
    msgInput: { flex: 1, background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' },
    btnTrimite: { background: 'var(--accent)', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '500' },
};

export default Chat;