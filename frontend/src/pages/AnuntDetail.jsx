import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function AnuntDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [anunt, setAnunt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [favorit, setFavorit] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    const [mesaj, setMesaj] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchAnunt = async () => {
            try {
                const response = await api.get(`/anunturi/${id}`);
                setAnunt(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnunt();
    }, [id]);

    const handleFavorit = async () => {
        if (!token) {
            navigate('/login');
            return;
        }
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

    if (loading) return <div style={styles.loading}>Loading...</div>;
    if (!anunt) return <div style={styles.loading}>Listing not found.</div>;

    const isOwner = user && user.id === anunt.user_id;
    const isAdmin = user && user.rol === 'admin';

    return (
        <div style={styles.page}>

            {/* Breadcrumb */}
            <div style={styles.breadcrumb}>
                <Link to="/" style={styles.breadLink}>Home</Link>
                <span style={styles.breadSep}> / </span>
                <Link to="/listings" style={styles.breadLink}>Listings</Link>
                <span style={styles.breadSep}> / </span>
                <span style={styles.breadCurrent}>{anunt.titlu}</span>
            </div>

            {mesaj && <div style={styles.mesajBox}>{mesaj}</div>}

            <div style={styles.layout}>

                {/* Stanga - Imagine + Actiuni */}
                <div style={styles.leftCol}>
                    <div style={styles.imgBox}>
                        <span style={{fontSize: '80px'}}>🚗</span>
                        <div style={styles.imgPlaceholder}>No image available</div>
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

                    {/* Info vanzator */}
                    <div style={styles.sellerBox}>
                        <div style={styles.sellerTitle}>Seller information</div>
                        <div style={styles.sellerName}>👤 {anunt.nume_utilizator}</div>
                        <div style={styles.sellerSince}>Member since {new Date(anunt.creat_la).getFullYear()}</div>
                        {token ? (
                            <button style={styles.btnContact}>💬 Contact seller</button>
                        ) : (
                            <Link to="/login" style={styles.btnContact}>Sign in to contact</Link>
                        )}
                    </div>
                </div>

                {/* Dreapta - Detalii */}
                <div style={styles.rightCol}>
                    <div style={styles.header}>
                        <div>
                            <h1 style={styles.title}>{anunt.titlu}</h1>
                            <div style={styles.subtitle}>{anunt.marca} {anunt.model} · {anunt.an}</div>
                        </div>
                        <div style={styles.price}>{Number(anunt.pret).toLocaleString()} €</div>
                    </div>

                    {/* Specificatii principale */}
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

                    {/* Descriere */}
                    {anunt.descriere && (
                        <div style={styles.descBox}>
                            <div style={styles.descTitle}>Description</div>
                            <p style={styles.descText}>{anunt.descriere}</p>
                        </div>
                    )}

                    {/* Data postare */}
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
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '20px' },
    breadLink: { fontSize: '12px', color: 'var(--accent-light)', textDecoration: 'none' },
    breadSep: { fontSize: '12px', color: 'var(--text-muted)' },
    breadCurrent: { fontSize: '12px', color: 'var(--text-muted)' },
    mesajBox: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-accent)', color: 'var(--accent-light)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
    layout: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
    leftCol: { width: '280px', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' },
    imgBox: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '12px', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    imgPlaceholder: { fontSize: '12px', color: 'var(--text-muted)' },
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
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
    title: { fontSize: '22px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' },
    subtitle: { fontSize: '14px', color: 'var(--text-muted)' },
    price: { fontSize: '26px', fontWeight: '500', color: 'var(--accent-light)', whiteSpace: 'nowrap' },
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