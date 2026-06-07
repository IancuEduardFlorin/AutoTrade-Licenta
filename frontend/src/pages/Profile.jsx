import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Profile() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [activeTab, setActiveTab] = useState('profile');
    const [profil, setProfil] = useState(null);
    const [anunturi, setAnunturi] = useState([]);
    const [favorite, setFavorite] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mesaj, setMesaj] = useState('');
    const [error, setError] = useState('');
    const [profilForm, setProfilForm] = useState({ nume: '', email: '' });
    const [parolaForm, setParolaForm] = useState({ parola_veche: '', parola_noua: '', confirma_parola: '' });

    if (!token) { navigate('/login'); return null; }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profilRes, anunturiRes, favoriteRes] = await Promise.all([
                    api.get('/user/profil'),
                    api.get('/user/anunturi'),
                    api.get('/favorite'),
                ]);
                setProfil(profilRes.data);
                setProfilForm({ nume: profilRes.data.nume, email: profilRes.data.email });
                setAnunturi(anunturiRes.data);
                setFavorite(favoriteRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const showMesaj = (text, isError = false) => {
        if (isError) setError(text); else setMesaj(text);
        setTimeout(() => { setMesaj(''); setError(''); }, 3000);
    };

    const handleProfilSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/user/profil', profilForm);
            showMesaj('Profile updated successfully!');
            setProfil({ ...profil, ...profilForm });
        } catch (err) {
            showMesaj(err.response?.data?.mesaj || 'Something went wrong', true);
        }
    };

    const handleParolaSubmit = async (e) => {
        e.preventDefault();
        if (parolaForm.parola_noua !== parolaForm.confirma_parola) { showMesaj('Passwords do not match', true); return; }
        if (parolaForm.parola_noua.length < 6) { showMesaj('Password must be at least 6 characters', true); return; }
        try {
            await api.put('/user/parola', { parola_veche: parolaForm.parola_veche, parola_noua: parolaForm.parola_noua });
            showMesaj('Password changed successfully!');
            setParolaForm({ parola_veche: '', parola_noua: '', confirma_parola: '' });
        } catch (err) {
            showMesaj(err.response?.data?.mesaj || 'Something went wrong', true);
        }
    };

    const handleDeleteAnunt = async (id) => {
        if (!window.confirm('Delete this listing?')) return;
        try {
            await api.delete(`/anunturi/${id}`);
            setAnunturi(anunturi.filter(a => a.id !== id));
            showMesaj('Listing deleted successfully!');
        } catch (err) {
            showMesaj(err.response?.data?.mesaj || 'Something went wrong', true);
        }
    };

    const handleRemoveFavorit = async (anuntId) => {
        try {
            await api.delete(`/favorite/${anuntId}`);
            setFavorite(favorite.filter(f => f.id !== anuntId));
            showMesaj('Removed from favorites');
        } catch (err) {
            showMesaj(err.response?.data?.mesaj || 'Something went wrong', true);
        }
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.page} className="rsp-profile-page">
            <div style={styles.container}>
                <div style={styles.profileHeader} className="rsp-profile-header gl-panel">
                    <div style={styles.avatar} className="gl-avatar">{profil?.nume?.charAt(0).toUpperCase()}</div>
                    <div>
                        <div style={styles.profileName}>{profil?.nume}</div>
                        <div style={styles.profileEmail}>{profil?.email}</div>
                        <div style={styles.profileRole}>
                            <span style={{
                                ...styles.roleBadge,
                                background: profil?.rol === 'admin' ? 'var(--color-success-bg)' : 'var(--pill-bg)',
                                borderColor: profil?.rol === 'admin' ? 'var(--border-accent)' : 'var(--border)',
                                color: profil?.rol === 'admin' ? 'var(--accent-light)' : 'var(--text-muted)',
                            }}>
                                {profil?.rol === 'admin' ? '⚙️ Admin' : '👤 User'}
                            </span>
                        </div>
                    </div>
                </div>

                {mesaj && <div style={styles.mesajBox}>{mesaj}</div>}
                {error && <div style={styles.errorBox}>{error}</div>}

                <div style={styles.tabs} className="rsp-tabs">
                    {[
                        { key: 'profile', label: 'My Profile' },
                        { key: 'listings', label: `My Listings (${anunturi.length})` },
                        { key: 'favorites', label: `Favorites (${favorite.length})` },
                        { key: 'password', label: 'Change Password' },
                    ].map(tab => (
                        <button key={tab.key}
                            style={{ ...styles.tab, borderBottomColor: activeTab === tab.key ? 'var(--accent-light)' : 'transparent', color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)' }}
                            className="tab-btn"
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'profile' && (
                    <div style={styles.card} className="gl-panel">
                        <div style={styles.cardTitle}>Personal information</div>
                        <form onSubmit={handleProfilSubmit} style={styles.form}>
                            <div style={styles.grid2} className="rsp-grid2">
                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>Full name</label>
                                    <input style={styles.input} value={profilForm.nume} onChange={(e) => setProfilForm({ ...profilForm, nume: e.target.value })} required />
                                </div>
                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>Email</label>
                                    <input style={styles.input} type="email" value={profilForm.email} onChange={(e) => setProfilForm({ ...profilForm, email: e.target.value })} required />
                                </div>
                            </div>
                            <div style={styles.formFooter}>
                                <button type="submit" style={styles.btnSave} className="btn-primary-glow">Save changes</button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'listings' && (
                    <div style={styles.card} className="gl-panel">
                        <div style={styles.cardTitleRow}>
                            <div style={styles.cardTitle}>My listings</div>
                            <Link to="/listings/new" style={styles.btnNew} className="btn-primary-glow">+ New listing</Link>
                        </div>
                        {anunturi.length === 0 ? (
                            <div style={styles.empty}>You haven't posted any listings yet.</div>
                        ) : (
                            <div style={styles.listingsList}>
                                {anunturi.map(anunt => (
                                    <div key={anunt.id} style={styles.listingItem} className="row-hover">
                                        <div style={styles.listingImg} className="gl-surface">🚗</div>
                                        <div style={styles.listingInfo}>
                                            <div style={styles.listingTitle}>{anunt.titlu}</div>
                                            <div style={styles.listingSub}>{anunt.an} · {anunt.kilometraj?.toLocaleString()} km · {anunt.transmisie}</div>
                                        </div>
                                        <div style={styles.listingRight}>
                                            <div style={styles.listingPrice}>{Number(anunt.pret).toLocaleString()} €</div>
                                            <div style={styles.listingActions}>
                                                <Link to={`/listings/${anunt.id}`} style={styles.btnView} className="btn-primary-glow">View</Link>
                                                <button style={styles.btnDel} className="btn-danger-hover" onClick={() => handleDeleteAnunt(anunt.id)}>Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'favorites' && (
                    <div style={styles.card} className="gl-panel">
                        <div style={styles.cardTitle}>Saved listings</div>
                        {favorite.length === 0 ? (
                            <div style={styles.empty}>You haven't saved any listings yet.</div>
                        ) : (
                            <div style={styles.listingsList}>
                                {favorite.map(anunt => (
                                    <div key={anunt.id} style={styles.listingItem} className="row-hover">
                                        <div style={styles.listingImg} className="gl-surface">🚗</div>
                                        <div style={styles.listingInfo}>
                                            <div style={styles.listingTitle}>{anunt.titlu}</div>
                                            <div style={styles.listingSub}>{anunt.an} · {anunt.kilometraj?.toLocaleString()} km</div>
                                        </div>
                                        <div style={styles.listingRight}>
                                            <div style={styles.listingPrice}>{Number(anunt.pret).toLocaleString()} €</div>
                                            <div style={styles.listingActions}>
                                                <Link to={`/listings/${anunt.id}`} style={styles.btnView} className="btn-primary-glow">View</Link>
                                                <button style={styles.btnDel} className="btn-danger-hover" onClick={() => handleRemoveFavorit(anunt.id)}>Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'password' && (
                    <div style={styles.card} className="gl-panel">
                        <div style={styles.cardTitle}>Change password</div>
                        <form onSubmit={handleParolaSubmit} style={styles.form}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Current password</label>
                                <input style={styles.input} type="password" placeholder="••••••••" value={parolaForm.parola_veche} onChange={(e) => setParolaForm({ ...parolaForm, parola_veche: e.target.value })} required />
                            </div>
                            <div style={styles.grid2} className="rsp-grid2">
                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>New password</label>
                                    <input style={styles.input} type="password" placeholder="••••••••" value={parolaForm.parola_noua} onChange={(e) => setParolaForm({ ...parolaForm, parola_noua: e.target.value })} required />
                                </div>
                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>Confirm new password</label>
                                    <input style={styles.input} type="password" placeholder="••••••••" value={parolaForm.confirma_parola} onChange={(e) => setParolaForm({ ...parolaForm, confirma_parola: e.target.value })} required />
                                </div>
                            </div>
                            <div style={styles.formFooter}>
                                <button type="submit" style={styles.btnSave} className="btn-primary-glow">Change password</button>
                            </div>
                        </form>
                    </div>
                )}
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
    page: { minHeight: '100vh', padding: '24px' },
    loading: { textAlign: 'center', padding: '60px', color: 'var(--text-muted)' },
    container: { maxWidth: '800px', margin: '0 auto' },
    profileHeader: {
        ...gc,
        display: 'flex', alignItems: 'center', gap: '16px',
        marginBottom: '24px', borderRadius: '14px', padding: '20px',
        border: '1px solid var(--border-accent)',
    },
    avatar: {
        width: '56px', height: '56px',
        background: 'var(--btn-gradient)',
        boxShadow: '0 4px 16px rgba(49,75,110,0.5)',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', fontWeight: '500', color: 'var(--text-primary)', flexShrink: 0,
    },
    profileName: { fontSize: '18px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2px' },
    profileEmail: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' },
    profileRole: {},
    roleBadge: {
        fontSize: '11px', padding: '2px 10px', borderRadius: '20px',
        border: '1px solid',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
    },
    mesajBox: { background: 'var(--color-success-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--color-success-border)', color: 'var(--color-success)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
    errorBox: { background: 'var(--color-error-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--color-error-border)', color: 'var(--color-error)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
    tabs: { display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '16px', gap: '4px' },
    tab: { background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: 'var(--text-muted)', padding: '10px 16px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
    card: { ...gc, borderRadius: '12px', padding: '20px' },
    cardTitle: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '16px' },
    cardTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    btnNew: { background: 'var(--btn-gradient)', color: 'var(--text-primary)', border: 'none', borderRadius: '7px', padding: '6px 14px', fontSize: '12px', fontWeight: '500', textDecoration: 'none', boxShadow: '0 2px 10px rgba(49,75,110,0.4)' },
    form: { display: 'flex', flexDirection: 'column', gap: '14px' },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' },
    input: { background: 'var(--glass-input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' },
    formFooter: { display: 'flex', justifyContent: 'flex-end' },
    btnSave: { background: 'var(--btn-gradient)', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '500', boxShadow: '0 2px 10px rgba(49,75,110,0.4)' },
    empty: { textAlign: 'center', color: 'var(--text-muted)', padding: '30px', fontSize: '13px' },
    listingsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    listingItem: {
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px',
        background: 'var(--glass-deep)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
    },
    listingImg: { width: '50px', height: '36px', background: 'var(--glass-input)', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
    listingInfo: { flex: 1 },
    listingTitle: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2px' },
    listingSub: { fontSize: '11px', color: 'var(--text-muted)' },
    listingRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
    listingPrice: { fontSize: '14px', fontWeight: '500', color: 'var(--accent-light)', textShadow: '0 0 10px rgba(129,151,172,0.2)' },
    listingActions: { display: 'flex', gap: '6px' },
    btnView: { background: 'var(--accent-tint-strong)', backdropFilter: 'var(--glass-blur)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', textDecoration: 'none' },
    btnDel: { background: 'var(--color-danger-bg)', backdropFilter: 'var(--glass-blur)', color: 'var(--color-error)', border: '1px solid var(--color-danger-border)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px' },
};

export default Profile;
