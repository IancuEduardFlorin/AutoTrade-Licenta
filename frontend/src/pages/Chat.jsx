import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { socket } from '../services/socket';
import api from '../services/api';

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
    const [altUserLastSeen, setAltUserLastSeen] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [imgFile, setImgFile] = useState(null);
    const [imgPreview, setImgPreview] = useState(null);
    const [imgUploading, setImgUploading] = useState(false);

    if (!token) { navigate('/login'); return null; }

    useEffect(() => {
        socket.emit('join', user.id);
        socket.on('newMessage', (mesaj) => {
            setMesaje(prev => {
                if (prev.find(m => m.id === mesaj.id)) return prev;
                return [...prev, mesaj];
            });
        });
        socket.on('user_status', ({ userId: statusUserId, isOnline }) => {
            if (parseInt(statusUserId) === parseInt(userId)) {
                setAltUserLastSeen(isOnline ? new Date().toISOString() : null);
            }
        });
        return () => {
            socket.off('newMessage');
            socket.off('user_status');
        };
    }, [userId]);

    useEffect(() => {
        fetchConversatii();
        if (userId) {
            setAltUserLastSeen(null); // clear stale status while loading
            fetchMesaje();
        }
    }, [userId]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mesaje]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // Poll the other user's last_seen every 30s while a conversation is open.
    useEffect(() => {
        if (!userId) return;
        const poll = async () => {
            try {
                const res = await api.get(`/user/public/${userId}`);
                setAltUserLastSeen(res.data.last_seen || null);
            } catch {}
        };
        const statusInterval = setInterval(poll, 30000);
        return () => clearInterval(statusInterval);
    }, [userId]);

    const fetchConversatii = async () => {
        try {
            const response = await api.get('/mesaje/conversatii');
            setConversatii(response.data);
        } catch (err) { console.error(err); }
    };

    const fetchMesaje = async () => {
        setLoading(true);
        try {
            const mesajeRes = await api.get(`/mesaje/${userId}`);
            setMesaje(mesajeRes.data);
        } catch (err) {
            console.error('Eroare mesaje:', err);
        }

        try {
            const userRes = await api.get(`/user/public/${userId}`);
            setAltUser({ id: parseInt(userId), nume: userRes.data.nume });
            setAltUserLastSeen(userRes.data.last_seen || null);
        } catch (err) {
            console.error('Eroare user public:', err.response?.status, err.response?.data);
            setAltUser({ id: parseInt(userId), nume: 'Utilizator' });
        }

        setLoading(false);
    };
    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
        setImgFile(file);
        setImgPreview(URL.createObjectURL(file));
        e.target.value = '';
    };

    const clearImage = () => {
        if (imgPreview) URL.revokeObjectURL(imgPreview);
        setImgFile(null);
        setImgPreview(null);
    };

    const handleTrimite = async (e) => {
        e.preventDefault();
        if (!mesajNou.trim() && !imgFile) return;
        try {
            let imagineUrl = null;
            if (imgFile) {
                setImgUploading(true);
                const fd = new FormData();
                fd.append('imagine', imgFile);
                const uploadRes = await api.post('/mesaje/imagine', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                imagineUrl = uploadRes.data.url;
                clearImage();
                setImgUploading(false);
            }
            const response = await api.post('/mesaje', {
                destinatar_id: parseInt(userId),
                continut: mesajNou.trim(),
                ...(imagineUrl && { imagine_url: imagineUrl }),
            });
            const mesajTrimis = response.data;
            socket.emit('sendMessage', { ...mesajTrimis, expeditor_id: user.id, destinatar_id: parseInt(userId) });
            setMesajNou('');
        } catch (err) { console.error(err); setImgUploading(false); }
    };

    const getStatusText = (lastSeen) => {
        if (!lastSeen) return { text: '● Offline', color: 'var(--text-muted)' };
        const diffMin = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 60000);
        if (diffMin < 2) return { text: '● Online', color: 'var(--color-online)' };
        if (diffMin < 60) return { text: `● Last seen ${diffMin}m ago`, color: 'var(--text-muted)' };
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return { text: `● Last seen ${diffH}h ago`, color: 'var(--text-muted)' };
        return { text: '● Offline', color: 'var(--text-muted)' };
    };

    return (
        <div style={styles.page} className="rsp-chat-page">
            <div style={styles.sidebar} className="rsp-chat-sidebar">
                <div style={styles.sidebarHeader}>
                    <div style={styles.sidebarTitle}>Messages</div>
                    <Link to="/profile" style={styles.backLink} className="link-glow">← Back</Link>
                </div>
                <div style={styles.sidebarList}>
                {conversatii.length === 0 ? (
                    <div style={styles.empty}>No conversations yet</div>
                ) : (
                    conversatii.map((conv, i) => (
                        <Link key={i} to={`/chat/${conv.altUserId}`}
                            style={{
                                ...styles.convItem,
                                background: conv.altUserId === parseInt(userId)
                                    ? 'var(--accent-tint-strong)'
                                    : 'transparent',
                            }}
                            className="row-hover"
                        >
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={styles.convAvatar} className="gl-avatar">{conv.altUserNume?.charAt(0).toUpperCase()}</div>
                                <span style={{ ...styles.statusDot, background: conv.altUserId === parseInt(userId) && altUserLastSeen && (Date.now() - new Date(altUserLastSeen).getTime()) < 120000 ? 'var(--color-online)' : 'rgba(129,151,172,0.35)' }} />
                            </div>
                            <div style={styles.convInfo}>
                                <div style={styles.convNume}>{conv.altUserNume}</div>
                                {conv.anunt_titlu && <div style={styles.convAnunt}>Re: {conv.anunt_titlu}</div>}
                                <div style={styles.convUltimul}>{conv.ultimulMesaj}</div>
                            </div>
                            {conv.necitite > 0 && <div style={styles.necititeBadge}>{conv.necitite}</div>}
                        </Link>
                    ))
                )}
                </div>
            </div>

            <div style={styles.chatArea} className="rsp-chat-area">
                {!userId ? (
                    <div style={styles.noChatSelected}>
                        <div style={styles.noChatIcon}>💬</div>
                        <div style={styles.noChatText}>Select a conversation to start chatting</div>
                    </div>
                ) : (
                    <>
                        <div style={styles.chatHeader} className="gl-panel chat-header-panel">
                            <div style={styles.chatAvatar} className="gl-avatar">{altUser?.nume?.charAt(0).toUpperCase() || '?'}</div>
                            <div style={styles.chatHeaderInfo}>
                                <div style={styles.chatHeaderNume}>{altUser?.nume || 'Loading...'}</div>
                                {(() => { const s = getStatusText(altUserLastSeen); return <div style={{ ...styles.chatHeaderStatus, color: s.color }}>{s.text}</div>; })()}
                            </div>
                            <Link to={`/listings?user_id=${userId}`} style={styles.btnViewListings} className="btn-ghost-hover">
                                View listings
                            </Link>
                        </div>

                        <div style={styles.messagesArea} className="rsp-chat-messages">
                            {loading ? (
                                <div style={styles.loadingMsg}>Loading messages...</div>
                            ) : mesaje.length === 0 ? (
                                <div style={styles.noMessages}>No messages yet. Say hello! 👋</div>
                            ) : (
                                mesaje.map((m, i) => {
                                    const isMe = m.expeditor_id === user.id;
                                    const bubbleBg = isMe ? 'rgba(49, 75, 110, 0.55)' : 'var(--bg-card)';
                                    const bubbleBorder = isMe ? 'var(--border-accent)' : 'var(--border)';
                                    const bubbleRadius = isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px';
                                    const time = new Date(m.creat_la).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                                    return (
                                        <div key={i} style={{ ...styles.messageRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                            {!isMe && <div style={styles.msgAvatar} className="gl-avatar">{m.expeditor_nume?.charAt(0).toUpperCase()}</div>}

                                            {m.imagine_url ? (
                                                <div style={{ ...styles.imgBubble, borderRadius: bubbleRadius, alignSelf: 'flex-end' }}>
                                                    <img
                                                        src={m.imagine_url}
                                                        alt="sent image"
                                                        style={styles.msgImage}
                                                        onClick={() => window.open(m.imagine_url, '_blank')}
                                                    />
                                                    {m.continut && (
                                                        <div style={{ ...styles.messageText, padding: '6px 12px 2px', background: bubbleBg, borderColor: bubbleBorder }}>
                                                            {m.continut}
                                                        </div>
                                                    )}
                                                    <div style={{ ...styles.messageTime, padding: '2px 10px 6px', background: bubbleBg }}>
                                                        {time}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className={`rsp-message-bubble ${isMe ? 'chat-bubble-user' : 'chat-bubble-bot'}`}
                                                    style={{ ...styles.messageBubble, background: bubbleBg, borderColor: bubbleBorder, borderRadius: bubbleRadius }}
                                                >
                                                    <div style={styles.messageText}>{m.continut}</div>
                                                    <div style={styles.messageTime}>{time}</div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {imgPreview && (
                            <div style={styles.imgPreviewBar}>
                                <div style={styles.imgPreviewWrap}>
                                    <img src={imgPreview} alt="preview" style={styles.imgPreviewThumb} />
                                    <button style={styles.imgPreviewRemove} onClick={clearImage} type="button">✕</button>
                                </div>
                                <span style={styles.imgPreviewLabel}>Image ready to send</span>
                            </div>
                        )}

                        <form onSubmit={handleTrimite} style={styles.inputArea} className="rsp-chat-input gl-panel chat-input-panel">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleImageSelect}
                            />
                            <button
                                type="button"
                                style={styles.btnImg}
                                onClick={() => fileInputRef.current?.click()}
                                title="Send image"
                            >
                                📷
                            </button>
                            <input style={styles.msgInput} placeholder="Type a message..." value={mesajNou} onChange={(e) => setMesajNou(e.target.value)} autoFocus />
                            <button type="submit" style={styles.btnTrimite} className="btn-primary-glow" disabled={(!mesajNou.trim() && !imgFile) || imgUploading}>
                                {imgUploading ? '⏳' : 'Send →'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { position: 'fixed', top: '52px', left: 0, right: 0, bottom: 0, display: 'flex', overflow: 'hidden', zIndex: 10, background: 'var(--bg-primary)' },
    sidebar: {
        width: '280px', minWidth: '280px',
        background: 'var(--glass-deep)',
        backdropFilter: 'var(--glass-blur-heavy)', WebkitBackdropFilter: 'var(--glass-blur-heavy)',
        borderRight: '1px solid var(--border-faint)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
    },
    sidebarList: { flex: 1, overflowY: 'auto' },
    sidebarHeader: {
        padding: '16px',
        borderBottom: '1px solid var(--border-faint)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    sidebarTitle: { fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' },
    backLink: { fontSize: '12px', color: 'var(--accent-light)', textDecoration: 'none' },
    empty: { padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' },
    convItem: {
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', textDecoration: 'none',
        borderBottom: '1px solid var(--border-faint)',
        cursor: 'pointer', transition: 'background 0.15s',
    },
    convAvatar: {
        width: '36px', height: '36px',
        background: 'var(--btn-gradient)',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', flexShrink: 0,
        boxShadow: '0 2px 8px rgba(49,75,110,0.4)',
    },
    convInfo: { flex: 1, overflow: 'hidden' },
    convNume: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2px' },
    convAnunt: { fontSize: '10px', color: 'var(--accent-light)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    convUltimul: { fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    necititeBadge: { background: 'var(--accent-light)', color: 'var(--bg-primary)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '500', flexShrink: 0 },
    chatArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
    noChatSelected: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' },
    noChatIcon: { fontSize: '48px' },
    noChatText: { fontSize: '14px', color: 'var(--text-muted)' },
    chatHeader: {
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-faint)',
        background: 'var(--glass-deep)',
        backdropFilter: 'var(--glass-blur-heavy)', WebkitBackdropFilter: 'var(--glass-blur-heavy)',
        display: 'flex', alignItems: 'center', gap: '12px',
        flexShrink: 0,
    },
    chatAvatar: {
        width: '36px', height: '36px',
        background: 'var(--btn-gradient)',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)',
        boxShadow: '0 2px 8px rgba(49,75,110,0.4)',
    },
    chatHeaderInfo: {},
    chatHeaderNume: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' },
    chatHeaderStatus: { fontSize: '11px', color: 'var(--color-online)' },
    btnViewListings: {
        marginLeft: 'auto',
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '5px 12px',
        fontSize: '12px',
        color: 'var(--text-muted)',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        flexShrink: 0,
    },
    messagesArea: {
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxSizing: 'border-box',
    },
    noMessages: { textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '40px' },
    messageRow: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
    },
    msgAvatar: {
        width: '28px', height: '28px', flexShrink: 0,
        background: 'var(--accent-tint)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', color: 'var(--text-primary)',
    },
    messageBubble: {
        maxWidth: '55%',
        padding: '10px 14px',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid',
        wordBreak: 'break-word', overflowWrap: 'break-word',
        display: 'flex', flexDirection: 'column', gap: '3px',
    },
    imgBubble: {
        maxWidth: '55%', overflow: 'hidden',
        border: '1px solid var(--border)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        display: 'flex', flexDirection: 'column',
    },
    inputArea: {
        padding: '14px 20px',
        borderTop: '1px solid var(--border-faint)',
        background: 'var(--glass-deep)',
        backdropFilter: 'var(--glass-blur-heavy)', WebkitBackdropFilter: 'var(--glass-blur-heavy)',
        display: 'flex', gap: '8px',
        flexShrink: 0,
    },
    msgInput: {
        flex: 1,
        background: 'var(--glass-input)',
        border: '1px solid var(--border)',
        borderRadius: '8px', padding: '10px 14px',
        color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit',
    },
    statusDot: {
        position: 'absolute',
        bottom: '1px',
        right: '1px',
        width: '9px',
        height: '9px',
        borderRadius: '50%',
        border: '2px solid var(--glass-deep)',
        pointerEvents: 'none',
    },
    btnTrimite: {
        background: 'var(--btn-gradient)',
        color: 'var(--text-primary)', border: 'none', borderRadius: '8px',
        padding: '10px 20px', fontSize: '13px', fontWeight: '500',
        boxShadow: '0 2px 10px rgba(49,75,110,0.4)',
    },
    btnImg: {
        background: 'var(--glass-input)', border: '1px solid var(--border)',
        borderRadius: '8px', width: '38px', height: '38px', fontSize: '16px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'background 0.15s',
    },
    imgPreviewBar: {
        padding: '8px 20px 0',
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'var(--glass-deep)',
        borderTop: '1px solid var(--border-faint)',
        flexShrink: 0,
    },
    imgPreviewWrap: { position: 'relative', flexShrink: 0 },
    imgPreviewThumb: { width: '52px', height: '52px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-accent)', display: 'block' },
    imgPreviewRemove: { position: 'absolute', top: '-6px', right: '-6px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '50%', width: '18px', height: '18px', fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', lineHeight: 1 },
    imgPreviewLabel: { fontSize: '11px', color: 'var(--text-muted)' },
    msgImage: { display: 'block', maxWidth: '240px', maxHeight: '300px', width: '100%', objectFit: 'cover', cursor: 'pointer' },
    loadingMsg: { textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' },
    messageText: { fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 },
    messageTime: { fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', alignSelf: 'flex-end', whiteSpace: 'nowrap' },
};

export default Chat;
