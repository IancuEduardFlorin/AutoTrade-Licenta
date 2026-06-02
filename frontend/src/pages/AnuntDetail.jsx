import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

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

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');

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

    const handlePrev = () => {
        setImagineActiva(prev => prev === 0 ? imagini.length - 1 : prev - 1);
        setDragOffset({ x: 0, y: 0 });
        setZoom(false);
    };
    const handleNext = () => {
        setImagineActiva(prev => prev === imagini.length - 1 ? 0 : prev + 1);
        setDragOffset({ x: 0, y: 0 });
        setZoom(false);
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;
    if (!anunt) return <div style={styles.loading}>Listing not found.</div>;

    const isOwner = user && user.id === anunt.user_id;
    const isAdmin = user && user.rol === 'admin';

    return (
        <div style={styles.page}>

            {/* Lightbox */}
            {lightbox && imagini.length > 0 && (
                <div style={styles.lightboxOverlay} onClick={() => { setLightbox(false); setZoom(false); }}>
                    <button style={styles.lightboxClose} onClick={() => { setLightbox(false); setZoom(false); }}>✕</button>
                    <div style={styles.lightboxContent} onClick={e => e.stopPropagation()}>
                        <button style={{...styles.lightboxNav, left: '10px'}} onClick={handlePrev}>‹</button>
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: zoom ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                            }}
                            onMouseDown={(e) => {
                                if (!zoom) return;
                                setIsDragging(true);
                                setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
                            }}
                            onMouseMove={(e) => {
                                if (!isDragging || !zoom) return;
                                setDragOffset({
                                    x: e.clientX - dragStart.x,
                                    y: e.clientY - dragStart.y,
                                });
                            }}
                            onMouseUp={() => setIsDragging(false)}
                            onMouseLeave={() => setIsDragging(false)}
                        >
                            <img
                                src={imagini[imagineActiva]?.url}
                                alt={anunt.titlu}
                                style={{
                                    ...styles.lightboxImg,
                                    transform: zoom
                                        ? `scale(2.5) translate(${dragOffset.x / 2.5}px, ${dragOffset.y / 2.5}px)`
                                        : 'scale(1)',
                                    cursor: zoom ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                                    userSelect: 'none',
                                    transition: isDragging ? 'none' : 'transform 0.3s ease',
                                }}
                                onClick={() => {
                                    if (!isDragging) {
                                        setZoom(!zoom);
                                        setDragOffset({ x: 0, y: 0 });
                                    }
                                }}
                                draggable={false}
                            />
                        </div>
                        <button style={{...styles.lightboxNav, right: '10px'}} onClick={handleNext}>›</button>
                        <div style={styles.lightboxCounter}>{imagineActiva + 1} / {imagini.length}</div>
                    </div>                </div>
            )}

            <div style={styles.breadcrumb}>
                <Link to="/" style={styles.breadLink}>Home</Link>
                <span style={styles.breadSep}> / </span>
                <Link to="/listings" style={styles.breadLink}>Listings</Link>
                <span style={styles.breadSep}> / </span>
                <span style={styles.breadCurrent}>{anunt.titlu}</span>
            </div>

            {mesaj && <div style={styles.mesajBox}>{mesaj}</div>}

            {/* Sectiunea principala de imagini - full width */}
            <div style={styles.imgSection}>
                {imagini.length > 0 ? (
                    <>
                        <div style={styles.imgMainWrap}>
                            {/* Fundal blur din aceeași imagine */}
                            <div style={{
                                position: 'absolute',
                                inset: '-20px',
                                backgroundImage: `url(${imagini[imagineActiva]?.url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'blur(20px)',
                                transform: 'scale(1.15)',
                                opacity: 0.5,
                                zIndex: 1,
                            }} />
                            {/* Overlay întunecat peste blur */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.35)',
                                zIndex: 1,
                            }} />
                            <img
                                src={imagini[imagineActiva]?.url}
                                alt={anunt.titlu}
                                style={styles.imgMain}
                                onClick={() => setLightbox(true)}
                            />
                            <div style={styles.imgOverlay}>
                                <span style={styles.imgZoomHint}>🔍 Click to zoom</span>
                            </div>
                            {imagini.length > 1 && (
                                <>
                                    <button style={{...styles.imgNavBtn, left: '10px'}} onClick={handlePrev}>‹</button>
                                    <button style={{...styles.imgNavBtn, right: '10px'}} onClick={handleNext}>›</button>
                                </>
                            )}
                            <div style={styles.imgCounter}>{imagineActiva + 1} / {imagini.length}</div>
                        </div>                        {imagini.length > 1 && (
                            <div style={styles.imgThumbs}>
                                {imagini.map((img, i) => (
                                    <img
                                        key={img.id}
                                        src={img.url}
                                        alt={`${anunt.titlu} ${i + 1}`}
                                        style={{
                                            ...styles.imgThumb,
                                            borderColor: i === imagineActiva ? 'var(--accent-light)' : 'var(--border)',
                                            opacity: i === imagineActiva ? 1 : 0.6,
                                        }}
                                        onClick={() => setImagineActiva(i)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={styles.imgPlaceholderBox}>
                        <span style={{fontSize: '80px'}}>🚗</span>
                        <div style={styles.imgPlaceholder}>No images available</div>
                    </div>
                )}
            </div>

            <div style={styles.layout}>

                {/* Stanga - Actiuni + Vanzator */}
                <div style={styles.leftCol}>
                    <div style={styles.priceBox}>
                        <div style={styles.priceLabel}>Price</div>
                        <div style={styles.priceBig}>{Number(anunt.pret).toLocaleString()} €</div>
                    </div>

                    <div style={styles.actionsBox}>
                        <button
                            style={{...styles.btnFav, background: favorit ? '#2a3a1a' : 'var(--bg-card)', borderColor: favorit ? 'var(--accent)' : 'var(--border)'}}
                            onClick={handleFavorit}
                            disabled={favLoading}
                        >
                            {favorit ? '♥ Saved' : '♡ Save to favorites'}
                        </button>

                        {(isOwner || isAdmin) && (
                            <div style={styles.ownerActions}>
                                <Link to={`/listings/${id}/edit`} style={styles.btnEdit}>Edit listing</Link>
                                <button style={styles.btnDelete} onClick={handleDelete}>Delete</button>
                            </div>
                        )}
                    </div>

                    <div style={styles.sellerBox}>
                        <div style={styles.sellerTitle}>Seller information</div>
                        <div style={styles.sellerName}>👤 {anunt.nume_utilizator}</div>
                        <div style={styles.sellerSince}>Member since {new Date(anunt.creat_la).getFullYear()}</div>
                        {token && anunt.user_id !== user?.id ? (
                            <Link to={`/chat/${anunt.user_id}`} style={styles.btnContact}>💬 Contact seller</Link>
                        ) : !token ? (
                            <Link to="/login" style={styles.btnContact}>Sign in to contact</Link>
                        ) : null}
                    </div>
                </div>

                {/* Dreapta - Detalii */}
                <div style={styles.rightCol}>
                    <div style={styles.header}>
                        <div>
                            <h1 style={styles.title}>{anunt.titlu}</h1>
                            <div style={styles.subtitle}>{anunt.marca} {anunt.model} · {anunt.an}</div>
                        </div>
                    </div>

                    <div style={styles.specsGrid}>
                        {[
                            { label: 'Year', value: anunt.an },
                            { label: 'Mileage', value: anunt.kilometraj ? `${anunt.kilometraj.toLocaleString()} km` : '-' },
                            { label: 'Engine', value: anunt.motorizare || '-' },
                            { label: 'Transmission', value: anunt.transmisie || '-' },
                            { label: 'Power', value: anunt.putere ? `${anunt.putere} HP` : '-' },
                            { label: 'Traction', value: anunt.tractiune || '-' },
                            { label: 'Body type', value: anunt.caroserie || '-' },
                            { label: 'Displacement', value: anunt.capacitate_cilindrica || '-' },
                        ].map(spec => (
                            <div key={spec.label} style={styles.specItem}>
                                <div style={styles.specLabel}>{spec.label}</div>
                                <div style={styles.specValue}>{spec.value}</div>
                            </div>
                        ))}
                    </div>

                    {anunt.descriere && (
                        <div style={styles.descBox}>
                            <div style={styles.descTitle}>Description</div>
                            <p style={styles.descText}>{anunt.descriere}</p>
                        </div>
                    )}

                    <div style={styles.postedAt}>
                        Posted on {new Date(anunt.creat_la).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { padding: '20px 24px', minHeight: '100vh' },
    loading: { textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '15px' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' },
    breadLink: { fontSize: '12px', color: 'var(--accent-light)', textDecoration: 'none' },
    breadSep: { fontSize: '12px', color: 'var(--text-muted)' },
    breadCurrent: { fontSize: '12px', color: 'var(--text-muted)' },
    mesajBox: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-accent)', color: 'var(--accent-light)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },

    // Imagini sectiune principala
    imgSection: { marginBottom: '24px', background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '12px', overflow: 'hidden' },
    imgMainWrap: { position: 'relative', width: '100%', height: '420px', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    imgMain: { position: 'relative', zIndex: 2, maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', cursor: 'zoom-in' },
    imgOverlay: { position: 'absolute', bottom: '10px', right: '10px', pointerEvents: 'none', zIndex: 3 },
    imgZoomHint: { background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '4px' },
    imgNavBtn: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 },
    imgCounter: { position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', zIndex: 3 },
    imgThumbs: { display: 'flex', gap: '8px', padding: '10px', overflowX: 'auto' },
    imgThumb: { width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', borderWidth: '2px', borderStyle: 'solid', flexShrink: 0, transition: 'opacity 0.15s' },
    imgPlaceholderBox: { height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' },
    imgPlaceholder: { fontSize: '13px', color: 'var(--text-muted)' },

    // Lightbox
    lightboxOverlay: {
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',  // mai transparent
        zIndex: 9999, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',  // blur pe fundal
    },
    lightboxContent: { position: 'relative', width: '90vw', height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    lightboxImg: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform 0.3s ease' },
    lightboxClose: {
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.3)',
        color: '#fff',
        fontSize: '18px',
        cursor: 'pointer',
        zIndex: 10,
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lightboxNav: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', fontSize: '24px', cursor: 'pointer', zIndex: 10 },
    lightboxCounter: { position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: '13px' },

    layout: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
    leftCol: { width: '260px', minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '12px' },
    priceBox: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-accent)', borderRadius: '12px', padding: '16px', textAlign: 'center' },
    priceLabel: { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' },
    priceBig: { fontSize: '28px', fontWeight: '500', color: 'var(--accent-light)' },
    actionsBox: { display: 'flex', flexDirection: 'column', gap: '8px' },
    btnFav: { width: '100%', borderWidth: '1px', borderStyle: 'solid', color: 'var(--text-primary)', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: '500' },
    ownerActions: { display: 'flex', gap: '8px' },
    btnEdit: { flex: 1, background: 'var(--accent)', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: '500', textDecoration: 'none', textAlign: 'center' },
    btnDelete: { flex: 1, background: '#2a1010', color: '#f08080', borderWidth: '1px', borderStyle: 'solid', borderColor: '#5a2020', borderRadius: '8px', padding: '8px', fontSize: '12px' },
    sellerBox: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '12px', padding: '16px' },
    sellerTitle: { fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' },
    sellerName: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' },
    sellerSince: { fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' },
    btnContact: { width: '100%', background: 'var(--accent)', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: '500', textDecoration: 'none', textAlign: 'center', display: 'block' },
    rightCol: { flex: 1 },
    header: { marginBottom: '20px' },
    title: { fontSize: '22px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' },
    subtitle: { fontSize: '14px', color: 'var(--text-muted)' },
    specsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' },
    specItem: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '8px', padding: '12px' },
    specLabel: { fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
    specValue: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' },
    descBox: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '10px', padding: '16px', marginBottom: '16px' },
    descTitle: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '10px' },
    descText: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 },
    postedAt: { fontSize: '11px', color: 'var(--text-muted)' },
};

export default AnuntDetail;