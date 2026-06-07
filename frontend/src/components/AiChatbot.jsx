import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

function AiChatbot() {
    const location = useLocation();
    if (location.pathname.startsWith('/chat')) return null;
    const [open, setOpen] = useState(false);
    const [mesaje, setMesaje] = useState([
        { tip: 'bot', text: "Hi! 👋 I'm your AutoTrade assistant. Tell me what kind of car you're looking for and I'll help you find it!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mesaje]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setMesaje(prev => [...prev, { tip: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/ai/chatbot', { mesaj: userMsg });
            setMesaje(prev => [...prev, {
                tip: 'bot',
                text: response.data.raspuns,
                recomandate: response.data.recomandate || [],
            }]);
        } catch (err) {
            setMesaje(prev => [...prev, {
                tip: 'bot',
                text: 'Sorry, something went wrong. Please try again.',
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {!open && (
                <button style={styles.fab} className="fab-hover rsp-chatbot-fab" onClick={() => setOpen(true)}>
                    <span style={{ fontSize: '24px' }}>✨</span>
                </button>
            )}

            {open && (
                <div style={styles.window} className="rsp-chatbot-window">
                    <div style={styles.header} className="rsp-chatbot-header">
                        <div style={styles.headerLeft}>
                            <div style={styles.headerIcon}>✨</div>
                            <div>
                                <div style={styles.headerTitle}>AI Assistant</div>
                                <div style={styles.headerStatus}>● Always here to help</div>
                            </div>
                        </div>
                        <button style={styles.closeBtn} className="btn-ghost-hover" onClick={() => setOpen(false)}>✕</button>
                    </div>

                    <div style={styles.messages}>
                        {mesaje.map((m, i) => (
                            <div key={i}>
                                <div
                                    className={m.tip === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}
                                    style={{
                                        ...styles.bubble,
                                        alignSelf: m.tip === 'user' ? 'flex-end' : 'flex-start',
                                        background: m.tip === 'user'
                                            ? 'var(--accent-tint-strong)'
                                            : 'var(--bg-card)',
                                        borderColor: m.tip === 'user'
                                            ? 'var(--border-accent)'
                                            : 'var(--border)',
                                        marginLeft: m.tip === 'user' ? 'auto' : '0',
                                    }}>
                                    {m.text}
                                </div>
                                {m.recomandate && m.recomandate.length > 0 && (
                                    <div style={styles.recomandate}>
                                        {m.recomandate.map(anunt => (
                                            <Link key={anunt.id} to={`/listings/${anunt.id}`} style={styles.recCard} className="rec-card-hover" onClick={() => setOpen(false)}>
                                                <div style={styles.recTitle}>{anunt.titlu}</div>
                                                <div style={styles.recSub}>{anunt.an} · {anunt.kilometraj?.toLocaleString()} km</div>
                                                <div style={styles.recPrice}>{Number(anunt.pret).toLocaleString()} €</div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-bubble-bot" style={{ ...styles.bubble, alignSelf: 'flex-start', background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                <span style={styles.typing}>Thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} style={styles.inputArea} className="rsp-chatbot-input-area">
                        <input
                            style={styles.input}
                            placeholder="e.g. I need an SUV under 20000€"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" style={styles.sendBtn} className="btn-primary-glow" disabled={loading || !input.trim()}>→</button>
                    </form>
                </div>
            )}
        </>
    );
}

const styles = {
    fab: {
        position: 'fixed', bottom: '24px', right: '24px',
        width: '56px', height: '56px', borderRadius: '50%',
        background: 'var(--accent-tint-strong)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border-accent)',
        boxShadow: '0 8px 32px rgba(49, 75, 110, 0.5)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    window: {
        position: 'fixed', bottom: '24px', right: '24px',
        width: '360px', height: '500px',
        background: 'var(--glass-deep)',
        backdropFilter: 'var(--glass-blur-heavy)', WebkitBackdropFilter: 'var(--glass-blur-heavy)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
        zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    },
    header: {
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    headerIcon: {
        width: '32px', height: '32px',
        background: 'var(--accent-tint)',
        border: '1px solid var(--border)',
        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
    },
    headerTitle: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' },
    headerStatus: { fontSize: '10px', color: 'var(--color-online)' },
    closeBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer' },
    messages: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
    bubble: {
        maxWidth: '85%', padding: '10px 14px', borderRadius: '12px',
        border: '1px solid',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5,
    },
    typing: { color: 'var(--text-muted)', fontStyle: 'italic' },
    recomandate: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' },
    recCard: {
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border-accent)',
        borderRadius: '8px', padding: '10px', textDecoration: 'none',
    },
    recTitle: { fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' },
    recSub: { fontSize: '10px', color: 'var(--text-muted)', margin: '2px 0' },
    recPrice: { fontSize: '13px', fontWeight: '500', color: 'var(--accent-light)' },
    inputArea: {
        padding: '12px',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: '8px',
        background: 'var(--bg-card)',
    },
    input: {
        flex: 1,
        background: 'var(--glass-input)',
        border: '1px solid var(--border)',
        borderRadius: '8px', padding: '9px 12px',
        color: 'var(--text-primary)', fontSize: '13px',
        outline: 'none', fontFamily: 'inherit',
    },
    sendBtn: {
        background: 'var(--btn-gradient)',
        color: 'var(--text-primary)', border: 'none',
        borderRadius: '8px', width: '38px', fontSize: '16px', fontWeight: '500',
        boxShadow: '0 2px 10px rgba(49, 75, 110, 0.4)',
    },
};

export default AiChatbot;
