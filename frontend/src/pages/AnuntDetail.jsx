import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { addToCompare, removeFromCompare, isInCompare } from '../services/compareService';

function AnuntDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [anunt, setAnunt] = useState(null);
    const [imagini, setImagini] = useState([]);
    const [imagineActiva, setImagineActiva] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const [zoom, setZoom] = useState(false);
    const [loading, setLoading] = useState(true);
    const [favorit, setFavorit] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    const [mesaj, setMesaj] = useState('');
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);
    const [inCompare, setInCompare] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (anunt) setInCompare(isInCompare(anunt.id));
    }, [anunt]);

    useEffect(() => {
        const fetchAnunt = async () => {
            try {
                const [anuntRes, imaginiRes] = await Promise.all([
                    api.get(`/anunturi/${id}`),
                    api.get(`/anunturi/${id}/imagini`),
                ]);
                setAnunt(anuntRes.data);
                setImagini(imaginiRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnunt();
    }, [id]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') { setLightbox(false); setZoom(false); }
            if (e.key === 'ArrowLeft' && lightbox) handlePrev();
            if (e.key === 'ArrowRight' && lightbox) handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightbox, imagineActiva]);

    const handleAiAnalysis = async () => {
        if (!aiOpen) { setAiOpen(true); }
        else { setAiOpen(false); return; }
        if (aiAnalysis) return;
        setAiLoading(true);
        try {
            const res = await api.post('/ai/analizeaza-anunt', {
                marca: anunt.marca, model: anunt.model, an: anunt.an,
                km: anunt.kilometraj, pret: anunt.pret,
                motorizare: anunt.motorizare, putere: anunt.putere, transmisie: anunt.transmisie,
            });
            setAiAnalysis(res.data);
        } catch (err) { console.error(err); }
        finally { setAiLoading(false); }
    };

    const handleCompare = () => {
        if (inCompare) {
            removeFromCompare(anunt.id);
            setInCompare(false);
        } else {
            const ok = addToCompare({
                id: anunt.id, titlu: anunt.titlu, marca: anunt.marca, model: anunt.model,
                an: anunt.an, pret: anunt.pret, kilometraj: anunt.kilometraj,
                motorizare: anunt.motorizare, putere: anunt.putere, transmisie: anunt.transmisie,
                caroserie: anunt.caroserie, tractiune: anunt.tractiune,
            });
            if (ok) setInCompare(true);
            else setMesaj('Compare list is full (max 3 cars)');
        }
    };

    const handleFavorit = async () => {
        if (!token) { navigate('/login'); return; }
        setFavLoading(true);
        try {
            if (favorit) {
                await api.delete(`/favorite/${id}`);
                setFavorit(false);
                setMesaj('Removed from favorites');
            } else {
                await api.post(`/favorite/${id}`);
                setFavorit(true);
                setMesaj('Added to favorites!');
            }
            setTimeout(() => setMesaj(''), 2500);
        } catch (err) {
            setMesaj(err.response?.data?.mesaj || 'Something went wrong');
            setTimeout(() => setMesaj(''), 2500);
        } finally {
            setFavLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        try {
            await api.delete(`/anunturi/${id}`);
            navigate('/listings');
        } catch (err) {
            setMesaj(err.response?.data?.mesaj || 'Something went wrong');
        }
    };

    const handlePrev = () => { setImagineActiva(prev => prev === 0 ? imagini.length - 1 : prev - 1); setDragOffset({ x: 0, y: 0 }); setZoom(false); };
    const handleNext = () => { setImagineActiva(prev => prev === imagini.length - 1 ? 0 : prev + 1); setDragOffset({ x: 0, y: 0 }); setZoom(false); };

    if (loading) return <div style={styles.loading}>Loading...</div>;
    if (!anunt) return <div style={styles.loading}>Listing not found.</div>;

    const isOwner = user && user.id === anunt.user_id;
    const isAdmin = user && user.rol === 'admin';

    return (
        <div style={styles.page} className="rsp-detail-page">
            {lightbox && imagini.length > 0 && (
                <div style={styles.lightboxOverlay} onClick={() => { setLightbox(false); setZoom(false); }}>
                    <button style={styles.lightboxClose} onClick={() => { setLightbox(false); setZoom(false); }}>✕</button>
                    <div style={styles.lightboxContent} onClick={e => e.stopPropagation()}>
                        <button style={{ ...styles.lightboxNav, left: '10px' }} onClick={handlePrev}>‹</button>
                        <div
                            style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: zoom ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
                            onMouseDown={(e) => { if (!zoom) return; setIsDragging(true); setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }); }}
                            onMouseMove={(e) => { if (!isDragging || !zoom) return; setDragOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }}
                            onMouseUp={() => setIsDragging(false)}
                            onMouseLeave={() => setIsDragging(false)}
                        >
                            <img
                                src={imagini[imagineActiva]?.url}
                                alt={anunt.titlu}
                                style={{ ...styles.lightboxImg, transform: zoom ? `scale(2.5) translate(${dragOffset.x / 2.5}px, ${dragOffset.y / 2.5}px)` : 'scale(1)', cursor: zoom ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in', userSelect: 'none', transition: isDragging ? 'none' : 'transform 0.3s ease' }}
                                onClick={() => { if (!isDragging) { setZoom(!zoom); setDragOffset({ x: 0, y: 0 }); } }}
                                draggable={false}
                            />
                        </div>
                        <button style={{ ...styles.lightboxNav, right: '10px' }} onClick={handleNext}>›</button>
                        <div style={styles.lightboxCounter}>{imagineActiva + 1} / {imagini.length}</div>
                    </div>
                </div>
            )}

            <div style={styles.breadcrumb}>
                <Link to="/" style={styles.breadLink} className="link-glow">Home</Link>
                <span style={styles.breadSep}> / </span>
                <Link to="/listings" style={styles.breadLink} className="link-glow">Listings</Link>
                <span style={styles.breadSep}> / </span>
                <span style={styles.breadCurrent}>{anunt.titlu}</span>
            </div>

            {mesaj && <div style={styles.mesajBox}>{mesaj}</div>}

            <div style={styles.imgSection} className="gl-panel">
                {imagini.length > 0 ? (
                    <>
                        <div style={styles.imgMainWrap}>
                            <div style={{ position: 'absolute', inset: '-20px', backgroundImage: `url(${imagini[imagineActiva]?.url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px)', transform: 'scale(1.15)', opacity: 0.5, zIndex: 1 }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1 }} />
                            <img src={imagini[imagineActiva]?.url} alt={anunt.titlu} style={styles.imgMain} onClick={() => setLightbox(true)} />
                            <div style={styles.imgOverlay}><span style={styles.imgZoomHint}>🔍 Click to zoom</span></div>
                            {imagini.length > 1 && (
                                <>
                                    <button style={{ ...styles.imgNavBtn, left: '10px' }} onClick={handlePrev}>‹</button>
                                    <button style={{ ...styles.imgNavBtn, right: '10px' }} onClick={handleNext}>›</button>
                                </>
                            )}
                            <div style={styles.imgCounter}>{imagineActiva + 1} / {imagini.length}</div>
                        </div>
                        {imagini.length > 1 && (
                            <div style={styles.imgThumbs}>
                                {imagini.map((img, i) => (
                                    <img key={img.id} src={img.url} alt={`${anunt.titlu} ${i + 1}`}
                                        style={{ ...styles.imgThumb, borderColor: i === imagineActiva ? 'var(--accent-light)' : 'var(--border)', opacity: i === imagineActiva ? 1 : 0.55 }}
                                        onClick={() => setImagineActiva(i)}
                                    className="thumb-hover"
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={styles.imgPlaceholderBox}>
                        <span style={{ fontSize: '80px' }}>🚗</span>
                        <div style={styles.imgPlaceholder}>No images available</div>
                    </div>
                )}
            </div>

            <div style={styles.layout} className="rsp-detail-layout">
                <div style={styles.leftCol} className="rsp-detail-left">
                    <div style={styles.priceBox} className="gl-panel">
                        <div style={styles.priceLabel}>Price</div>
                        <div style={styles.priceBig}>{Number(anunt.pret).toLocaleString()} €</div>
                    </div>

                    <div style={styles.actionsBox}>
                        <button
                            style={{ ...styles.btnFav, background: favorit ? 'var(--color-success-bg)' : 'var(--bg-card)', borderColor: favorit ? 'var(--border-accent)' : 'var(--border)' }}
                            onClick={handleFavorit}
                            disabled={favLoading}
                            className="btn-ghost-hover"
                        >
                            {favorit ? '♥ Saved' : '♡ Save to favorites'}
                        </button>

                        <button
                            style={{ ...styles.btnFav, background: inCompare ? 'var(--accent-tint-strong)' : 'var(--bg-card)', borderColor: inCompare ? 'var(--border-accent)' : 'var(--border)' }}
                            onClick={handleCompare}
                            className="btn-ghost-hover"
                        >
                            {inCompare ? '⊖ Remove from compare' : '⊕ Add to compare'}
                        </button>

                        {inCompare && (
                            <Link to="/compare" style={{ ...styles.btnContact, textAlign: 'center', display: 'block', marginTop: 0 }} className="btn-primary-glow">
                                View comparison →
                            </Link>
                        )}

                        {(isOwner || isAdmin) && (
                            <div style={styles.ownerActions}>
                                <Link to={`/listings/${id}/edit`} style={styles.btnEdit} className="btn-primary-glow">Edit listing</Link>
                                <button style={styles.btnDelete} className="btn-danger-hover" onClick={handleDelete}>Delete</button>
                            </div>
                        )}
                    </div>

                    <div style={styles.sellerBox} className="gl-panel">
                        <div style={styles.sellerTitle}>Seller information</div>
                        <div style={styles.sellerName}>👤 {anunt.nume_utilizator}</div>
                        <div style={styles.sellerSince}>Member since {new Date(anunt.creat_la).getFullYear()}</div>
                        {token && anunt.user_id !== user?.id ? (
                            <Link to={`/chat/${anunt.user_id}`} style={styles.btnContact} className="btn-primary-glow">💬 Contact seller</Link>
                        ) : !token ? (
                            <Link to="/login" style={styles.btnContact} className="btn-primary-glow">Sign in to contact</Link>
                        ) : null}
                    </div>
                </div>

                <div style={styles.rightCol}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>{anunt.titlu}</h1>
                        <div style={styles.subtitle}>{anunt.marca} {anunt.model} · {anunt.an}</div>
                        {(anunt.oras || anunt.judet) && (
                            <div style={styles.location}>📍 {[anunt.oras, anunt.judet].filter(Boolean).join(', ')}</div>
                        )}
                    </div>

                    <div style={styles.specsGrid} className="rsp-specs-grid">
                        {[
                            { label: 'Year', value: anunt.an },
                            { label: 'Mileage', value: anunt.kilometraj ? `${anunt.kilometraj.toLocaleString()} km` : '-' },
                            { label: 'Engine', value: anunt.motorizare || '-' },
                            { label: 'Transmission', value: anunt.transmisie || '-' },
                            { label: 'Power', value: anunt.putere ? `${anunt.putere} HP` : '-' },
                            { label: 'Traction', value: anunt.tractiune || '-' },
                            { label: 'Body type', value: anunt.caroserie || '-' },
                            { label: 'Displacement', value: anunt.capacitate_cilindrica || '-' },
                            { label: 'County', value: anunt.judet || '-' },
                            { label: 'City', value: anunt.oras || '-' },
                        ].map(spec => (
                            <div key={spec.label} style={styles.specItem} className="gl-panel">
                                <div style={styles.specLabel}>{spec.label}</div>
                                <div style={styles.specValue}>{spec.value}</div>
                            </div>
                        ))}
                    </div>

                    {anunt.descriere && (
                        <div style={styles.descBox} className="gl-panel">
                            <div style={styles.descTitle}>Description</div>
                            <p style={styles.descText}>{anunt.descriere}</p>
                        </div>
                    )}

                    <div style={styles.aiSection} className="gl-panel">
                        <button
                            style={styles.btnAi}
                            onClick={handleAiAnalysis}
                            disabled={aiLoading}
                            className="btn-primary-glow"
                        >
                            {aiLoading ? '⏳ Analyzing...' : aiOpen ? '▲ Hide AI analysis' : '🤖 Analyze with AI'}
                        </button>

                        {aiOpen && (
                            <div style={styles.aiResult}>
                                {aiLoading ? (
                                    <div style={styles.aiLoadingText}>AI is analyzing this car for you...</div>
                                ) : aiAnalysis ? (
                                    <>
                                        <div style={styles.aiCategory}>
                                            <div style={{ ...styles.aiCatTitle, color: 'var(--color-online)' }}>✅ Strengths</div>
                                            {aiAnalysis.puncteFort?.map((p, i) => <div key={i} style={styles.aiItem}>• {p}</div>)}
                                        </div>
                                        <div style={styles.aiCategory}>
                                            <div style={{ ...styles.aiCatTitle, color: '#e8a838' }}>⚠️ Concerns</div>
                                            {aiAnalysis.puncteSlabe?.map((p, i) => <div key={i} style={styles.aiItem}>• {p}</div>)}
                                        </div>
                                        <div style={styles.aiCategory}>
                                            <div style={{ ...styles.aiCatTitle, color: 'var(--accent-light)' }}>❓ Questions to ask the seller</div>
                                            {aiAnalysis.intrebari?.map((p, i) => <div key={i} style={styles.aiItem}>• {p}</div>)}
                                        </div>
                                        <div style={styles.aiCategory}>
                                            <div style={{ ...styles.aiCatTitle, color: 'var(--text-primary)' }}>💰 Price assessment</div>
                                            <div style={styles.aiText}>{aiAnalysis.evaluarePret}</div>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        )}
                    </div>

                    <div style={styles.postedAt}>
                        Posted on {new Date(anunt.creat_la).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </div>
        </div>
    );
}

const gc = {
    background: 'var(--bg-card)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--border)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
};

const styles = {
    page: { padding: '20px 24px', minHeight: '100vh' },
    loading: { textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '15px' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' },
    breadLink: { fontSize: '12px', color: 'var(--accent-light)', textDecoration: 'none' },
    breadSep: { fontSize: '12px', color: 'var(--text-muted)' },
    breadCurrent: { fontSize: '12px', color: 'var(--text-muted)' },
    mesajBox: {
        ...gc,
        color: 'var(--accent-light)', borderRadius: '8px',
        padding: '10px 14px', fontSize: '13px', marginBottom: '16px',
    },
    imgSection: {
        ...gc,
        marginBottom: '24px', borderRadius: '14px', overflow: 'hidden',
    },
    imgMainWrap: { position: 'relative', width: '100%', height: '420px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    imgMain: { position: 'relative', zIndex: 2, maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', cursor: 'zoom-in' },
    imgOverlay: { position: 'absolute', bottom: '10px', right: '10px', pointerEvents: 'none', zIndex: 3 },
    imgZoomHint: { background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '4px' },
    imgNavBtn: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', width: '36px', height: '36px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 },
    imgCounter: { position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', zIndex: 3 },
    imgThumbs: { display: 'flex', gap: '8px', padding: '10px', overflowX: 'auto', background: 'var(--glass-deep)' },
    imgThumb: { width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', borderWidth: '2px', borderStyle: 'solid', flexShrink: 0, transition: 'opacity 0.15s' },
    imgPlaceholderBox: { height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' },
    imgPlaceholder: { fontSize: '13px', color: 'var(--text-muted)' },
    lightboxOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' },
    lightboxContent: { position: 'relative', width: '90vw', height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    lightboxImg: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform 0.3s ease' },
    lightboxClose: { position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: '18px', cursor: 'pointer', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    lightboxNav: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', fontSize: '24px', cursor: 'pointer', zIndex: 10 },
    lightboxCounter: { position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: '13px' },
    layout: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
    leftCol: { width: '260px', minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '12px' },
    priceBox: {
        ...gc,
        borderRadius: '12px', padding: '16px', textAlign: 'center',
        border: '1px solid var(--border-accent)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    },
    priceLabel: { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' },
    priceBig: { fontSize: '28px', fontWeight: '500', color: 'var(--accent-light)', textShadow: '0 0 20px rgba(129,151,172,0.3)' },
    actionsBox: { display: 'flex', flexDirection: 'column', gap: '8px' },
    btnFav: {
        width: '100%',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid',
        color: 'var(--text-primary)', borderRadius: '8px',
        padding: '10px', fontSize: '13px', fontWeight: '500',
    },
    ownerActions: { display: 'flex', gap: '8px' },
    btnEdit: {
        flex: 1,
        background: 'var(--btn-gradient)',
        color: 'var(--text-primary)', border: 'none', borderRadius: '8px',
        padding: '8px', fontSize: '12px', fontWeight: '500',
        textDecoration: 'none', textAlign: 'center',
        boxShadow: '0 2px 10px rgba(49,75,110,0.4)',
    },
    btnDelete: { flex: 1, background: 'var(--color-danger-bg)', backdropFilter: 'var(--glass-blur)', color: 'var(--color-error)', border: '1px solid var(--color-error-border)', borderRadius: '8px', padding: '8px', fontSize: '12px' },
    sellerBox: { ...gc, borderRadius: '12px', padding: '16px' },
    sellerTitle: { fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' },
    sellerName: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' },
    sellerSince: { fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' },
    btnContact: {
        width: '100%',
        background: 'var(--btn-gradient)',
        color: 'var(--text-primary)', border: 'none', borderRadius: '8px',
        padding: '10px', fontSize: '13px', fontWeight: '500',
        textDecoration: 'none', textAlign: 'center', display: 'block',
        boxShadow: '0 2px 12px rgba(49,75,110,0.4)',
    },
    rightCol: { flex: 1 },
    header: { marginBottom: '20px' },
    title: { fontSize: '22px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' },
    subtitle: { fontSize: '14px', color: 'var(--text-muted)' },
    location: { fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' },
    specsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' },
    specItem: { ...gc, borderRadius: '8px', padding: '12px' },
    specLabel: { fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
    specValue: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' },
    descBox: { ...gc, borderRadius: '10px', padding: '16px', marginBottom: '16px' },
    descTitle: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '10px' },
    descText: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 },
    postedAt: { fontSize: '11px', color: 'var(--text-muted)' },
    aiSection: { ...gc, borderRadius: '10px', padding: '16px', marginBottom: '16px' },
    btnAi: {
        width: '100%', background: 'var(--btn-gradient)', color: 'var(--text-primary)',
        border: 'none', borderRadius: '8px', padding: '10px 16px',
        fontSize: '13px', fontWeight: '500', boxShadow: '0 2px 12px rgba(49,75,110,0.4)',
    },
    aiResult: { marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' },
    aiLoadingText: { textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '12px 0' },
    aiCategory: { display: 'flex', flexDirection: 'column', gap: '5px' },
    aiCatTitle: { fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' },
    aiItem: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '4px' },
    aiText: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 },
};

export default AnuntDetail;
