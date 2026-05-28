import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function AiChatbot() {
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
            {/* Buton flotant */}
            {!open && (
                <button style={styles.fab} onClick={() => setOpen(true)}>
                    <span style={{fontSize: '24px'}}>✨</span>
                </button>
            )}

            {/* Fereastra chat */}
            {open && (
                <div style={styles.window}>
                    <div style={styles.header}>
                        <div style={styles.headerLeft}>
                            <div style={styles.headerIcon}>✨</div>
                            <div>
                                <div style={styles.headerTitle}>AI Assistant</div>
                                <div style={styles.headerStatus}>● Always here to help</div>
                            </div>
                        </div>
                        <button style={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
                    </div>

                    <div style={styles.messages}>
                        {mesaje.map((m, i) => (
                            <div key={i}>
                                <div style={{
                                    ...styles.bubble,
                                    alignSelf: m.tip === 'user' ? 'flex-end' : 'flex-start',
                                    background: m.tip === 'user' ? 'var(--accent)' : 'var(--bg-card)',
                                    borderColor: m.tip === 'user' ? 'var(--accent)' : 'var(--border)',
                                    marginLeft: m.tip === 'user' ? 'auto' : '0',
                                }}>
                                    {m.text}
                                </div>
                                {/* Anunturi recomandate */}
                                {m.recomandate && m.recomandate.length > 0 && (
                                    <div style={styles.recomandate}>
                                        {m.recomandate.map(anunt => (
                                            <Link key={anunt.id} to={`/listings/${anunt.id}`} style={styles.recCard} onClick={() => setOpen(false)}>
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
                            <div style={{...styles.bubble, alignSelf: 'flex-start', background: 'var(--bg-card)', borderColor: 'var(--border)'}}>
                                <span style={styles.typing}>Thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} style={styles.inputArea}>
                        <input
                            style={styles.input}
                            placeholder="e.g. I need an SUV under 20000€"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" style={styles.sendBtn} disabled={loading || !input.trim()}>→</button>
                    </form>
                </div>
            )}
        </>
    );
}

const styles = {
    fab: { position: 'fixed', bottom: '24px', right: '24px', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent)', border: '1px solid var(--accent-light)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    window: { position: 'fixed', bottom: '24px', right: '24px', width: '360px', height: '500px', background: 'var(--bg-navbar)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-accent)', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    header: { padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    headerIcon: { width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' },
    headerTitle: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' },
    headerStatus: { fontSize: '10px', color: '#4caf50' },
    closeBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer' },
    messages: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
    bubble: { maxWidth: '85%', padding: '10px 14px', borderRadius: '12px', borderWidth: '1px', borderStyle: 'solid', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 },
    typing: { color: 'var(--text-muted)', fontStyle: 'italic' },
    recomandate: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' },
    recCard: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-accent)', borderRadius: '8px', padding: '10px', textDecoration: 'none' },
    recTitle: { fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' },
    recSub: { fontSize: '10px', color: 'var(--text-muted)', margin: '2px 0' },
    recPrice: { fontSize: '13px', fontWeight: '500', color: 'var(--accent-light)' },
    inputArea: { padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', background: 'var(--bg-card)' },
    input: { flex: 1, background: 'var(--bg-navbar)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' },
    sendBtn: { background: 'var(--accent)', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', width: '38px', fontSize: '16px', fontWeight: '500' },
};

export default AiChatbot;