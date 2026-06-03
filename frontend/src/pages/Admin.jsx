import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Admin() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [activeTab, setActiveTab] = useState('utilizatori');
    const [utilizatori, setUtilizatori] = useState([]);
    const [anunturi, setAnunturi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mesaj, setMesaj] = useState('');
    const [error, setError] = useState('');
    const [articole, setArticole] = useState([]);
    const [showNewsForm, setShowNewsForm] = useState(false);
    const [newsForm, setNewsForm] = useState({
        titlu: '', continut: '', categorie: 'News', status: 'draft'
    });
    const [newsImagine, setNewsImagine] = useState(null);
    const [editingNews, setEditingNews] = useState(null);
    if (!token || user?.rol !== 'admin') {
        navigate('/');
        return null;
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [utilizatoriRes, anunturiRes, newsRes] = await Promise.all([
                    api.get('/admin/utilizatori'),
                    api.get('/admin/anunturi'),
                    api.get('/news/admin/toate'),
                ]);
                setUtilizatori(utilizatoriRes.data);
                setAnunturi(anunturiRes.data);
                setArticole(newsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const showMesaj = (text, isError = false) => {
        if (isError) setError(text);
        else setMesaj(text);
        setTimeout(() => { setMesaj(''); setError(''); }, 3000);
    };

    const handleSchimbaRol = async (userId, rolCurent) => {
        const rolNou = rolCurent === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`Change role to ${rolNou}?`)) return;
        try {
            await api.put(`/admin/utilizatori/${userId}/rol`, { rol: rolNou });
            setUtilizatori(utilizatori.map(u =>
                u.id === userId ? { ...u, rol: rolNou } : u
            ));
            showMesaj(`Role changed to ${rolNou} successfully!`);
        } catch (err) {
            showMesaj(err.response?.data?.mesaj || 'Something went wrong', true);
        }
    };

    const handleDeleteUtilizator = async (userId) => {
        if (!window.confirm('Delete this user and all their listings?')) return;
        try {
            await api.delete(`/admin/utilizatori/${userId}`);
            setUtilizatori(utilizatori.filter(u => u.id !== userId));
            showMesaj('User deleted successfully!');
        } catch (err) {
            showMesaj(err.response?.data?.mesaj || 'Something went wrong', true);
        }
    };

    const handleDeleteAnunt = async (anuntId) => {
        if (!window.confirm('Delete this listing?')) return;
        try {
            await api.delete(`/admin/anunturi/${anuntId}`);
            setAnunturi(anunturi.filter(a => a.id !== anuntId));
            showMesaj('Listing deleted successfully!');
        } catch (err) {
            showMesaj(err.response?.data?.mesaj || 'Something went wrong', true);
        }
    };
    const handleSaveNews = async () => {
        try {
            const formData = new FormData();
            formData.append('titlu', newsForm.titlu);
            formData.append('continut', newsForm.continut);
            formData.append('categorie', newsForm.categorie);
            formData.append('status', newsForm.status);
            if (newsImagine) formData.append('imagine', newsImagine);

            if (editingNews) {
                await api.put(`/news/${editingNews.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showMesaj('Article updated successfully!');
            } else {
                await api.post('/news', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showMesaj('Article published successfully!');
            }

            // Refresh news
            const newsRes = await api.get('/news/admin/toate');
            setArticole(newsRes.data);
            setShowNewsForm(false);
            setEditingNews(null);
            setNewsForm({ titlu: '', continut: '', categorie: 'News', status: 'draft' });
            setNewsImagine(null);
        } catch (err) {
            showMesaj(err.response?.data?.mesaj || 'Something went wrong', true);
        }
    };

    const handleDeleteNews = async (id) => {
        if (!window.confirm('Delete this article?')) return;
        try {
            await api.delete(`/news/${id}`);
            setArticole(articole.filter(a => a.id !== id));
            showMesaj('Article deleted successfully!');
        } catch (err) {
            showMesaj(err.response?.data?.mesaj || 'Something went wrong', true);
        }
    };

    const handleEditNews = (articol) => {
        setEditingNews(articol);
        setNewsForm({
            titlu: articol.titlu,
            continut: articol.continut,
            categorie: articol.categorie,
            status: articol.status,
        });
        setShowNewsForm(true);
    };
    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Admin Panel</h1>
                        <p style={styles.subtitle}>Manage users and listings</p>
                    </div>
                    <div style={styles.statsRow}>
                        <div style={styles.statCard}>
                            <div style={styles.statNum}>{utilizatori.length}</div>
                            <div style={styles.statLabel}>Total users</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statNum}>{anunturi.length}</div>
                            <div style={styles.statLabel}>Total listings</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statNum}>{utilizatori.filter(u => u.rol === 'admin').length}</div>
                            <div style={styles.statLabel}>Admins</div>
                        </div>
                    </div>
                </div>

                {mesaj && <div style={styles.mesajBox}>{mesaj}</div>}
                {error && <div style={styles.errorBox}>{error}</div>}

                {/* Tabs */}
                <div style={styles.tabs}>
                    {[
                        { key: 'utilizatori', label: `Users (${utilizatori.length})` },
                        { key: 'anunturi', label: `Listings (${anunturi.length})` },
                        { key: 'news', label: `News (${articole.length})` },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            style={{
                                ...styles.tab,
                                borderBottomColor: activeTab === tab.key ? 'var(--accent-light)' : 'transparent',
                                color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                            }}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab: Utilizatori */}
                {activeTab === 'utilizatori' && (
                    <div style={styles.card}>
                        <div style={styles.tableWrap}>
                            <table style={styles.table}>
                                <thead>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Role</th>
                                    <th style={styles.th}>Joined</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {utilizatori.map(u => (
                                    <tr key={u.id} style={styles.tr}>
                                        <td style={styles.td}>{u.id}</td>
                                        <td style={styles.td}>
                                            <div style={styles.userCell}>
                                                <div style={styles.userAvatar}>{u.nume?.charAt(0).toUpperCase()}</div>
                                                {u.nume}
                                            </div>
                                        </td>
                                        <td style={styles.td}>{u.email}</td>
                                        <td style={styles.td}>
                        <span style={{
                            ...styles.roleBadge,
                            background: u.rol === 'admin' ? '#1a2a10' : 'var(--pill-bg)',
                            borderColor: u.rol === 'admin' ? 'var(--accent-light)' : 'var(--border)',
                            color: u.rol === 'admin' ? 'var(--accent-light)' : 'var(--text-muted)',
                        }}>
                          {u.rol === 'admin' ? '⚙️ Admin' : '👤 User'}
                        </span>
                                        </td>
                                        <td style={styles.td}>{new Date(u.creat_la).toLocaleDateString()}</td>
                                        <td style={styles.td}>
                                            <div style={styles.actionBtns}>
                                                {u.id !== user.id && (
                                                    <>
                                                        <button
                                                            style={styles.btnRole}
                                                            onClick={() => handleSchimbaRol(u.id, u.rol)}
                                                        >
                                                            {u.rol === 'admin' ? 'Make user' : 'Make admin'}
                                                        </button>
                                                        <button
                                                            style={styles.btnDel}
                                                            onClick={() => handleDeleteUtilizator(u.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                                {u.id === user.id && (
                                                    <span style={styles.youBadge}>You</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab: Anunturi */}
                {activeTab === 'anunturi' && (
                    <div style={styles.card}>
                        <div style={styles.tableWrap}>
                            <table style={styles.table}>
                                <thead>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Title</th>
                                    <th style={styles.th}>Posted by</th>
                                    <th style={styles.th}>Price</th>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {anunturi.map(a => (
                                    <tr key={a.id} style={styles.tr}>
                                        <td style={styles.td}>{a.id}</td>
                                        <td style={styles.td}>
                                            <div style={styles.listingCell}>
                                                <span style={{fontSize: '18px'}}>🚗</span>
                                                <div>
                                                    <div style={styles.listingCellTitle}>{a.titlu}</div>
                                                    <div style={styles.listingCellSub}>{a.an} · {a.kilometraj?.toLocaleString()} km</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>{a.nume_utilizator}</td>
                                        <td style={styles.td} style={{color: 'var(--accent-light)', fontWeight: '500'}}>
                                            {Number(a.pret).toLocaleString()} €
                                        </td>
                                        <td style={styles.td}>{new Date(a.creat_la).toLocaleDateString()}</td>
                                        <td style={styles.td}>
                                            <div style={styles.actionBtns}>
                                                <Link to={`/listings/${a.id}`} style={styles.btnView}>View</Link>
                                                <button style={styles.btnDel} onClick={() => handleDeleteAnunt(a.id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'news' && (
                    <div style={styles.card}>
                        <div style={styles.cardTitleRow}>
                            <div style={styles.cardTitle}>News & Articles</div>
                            <button style={styles.btnNew} onClick={() => { setShowNewsForm(true); setEditingNews(null); setNewsForm({ titlu: '', continut: '', categorie: 'News', status: 'draft' }); }}>
                                + New article
                            </button>
                        </div>

                        {/* Form adaugare/editare */}
                        {showNewsForm && (
                            <div style={styles.newsForm}>
                                <div style={styles.newsFormTitle}>{editingNews ? 'Edit article' : 'New article'}</div>

                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>Title *</label>
                                    <input
                                        style={styles.input}
                                        value={newsForm.titlu}
                                        onChange={(e) => setNewsForm({ ...newsForm, titlu: e.target.value })}
                                        placeholder="Article title..."
                                    />
                                </div>

                                <div style={styles.grid2}>
                                    <div style={styles.fieldGroup}>
                                        <label style={styles.label}>Category</label>
                                        <select style={styles.select} value={newsForm.categorie} onChange={(e) => setNewsForm({ ...newsForm, categorie: e.target.value })}>
                                            <option value="News">News</option>
                                            <option value="Electric">Electric</option>
                                            <option value="Guide">Guide</option>
                                            <option value="Review">Review</option>
                                            <option value="Tips">Tips</option>
                                        </select>
                                    </div>
                                    <div style={styles.fieldGroup}>
                                        <label style={styles.label}>Status</label>
                                        <select style={styles.select} value={newsForm.status} onChange={(e) => setNewsForm({ ...newsForm, status: e.target.value })}>
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>Cover image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setNewsImagine(e.target.files[0])}
                                        style={styles.input}
                                    />
                                    {editingNews?.imagine_url && !newsImagine && (
                                        <img src={editingNews.imagine_url} alt="current" style={{width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px'}} />
                                    )}
                                </div>

                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>Content *</label>
                                    <textarea
                                        style={{...styles.input, minHeight: '200px', resize: 'vertical', padding: '10px'}}
                                        value={newsForm.continut}
                                        onChange={(e) => setNewsForm({ ...newsForm, continut: e.target.value })}
                                        placeholder="Write your article here..."
                                    />
                                </div>

                                <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px'}}>
                                    <button style={styles.btnReset} onClick={() => { setShowNewsForm(false); setEditingNews(null); }}>Cancel</button>
                                    <button style={styles.btnNew} onClick={handleSaveNews}>
                                        {editingNews ? 'Save changes' : 'Publish article'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Lista articole */}
                        {articole.length === 0 ? (
                            <div style={styles.empty}>No articles yet. Create your first article!</div>
                        ) : (
                            <div style={styles.tableWrap}>
                                <table style={styles.table}>
                                    <thead>
                                    <tr>
                                        <th style={styles.th}>Title</th>
                                        <th style={styles.th}>Category</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={styles.th}>Date</th>
                                        <th style={styles.th}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {articole.map(articol => (
                                        <tr key={articol.id} style={styles.tr}>
                                            <td style={styles.td}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                    {articol.imagine_url && (
                                                        <img src={articol.imagine_url} alt="" style={{width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px'}} />
                                                    )}
                                                    <span style={{fontSize: '13px', color: 'var(--text-primary)'}}>{articol.titlu}</span>
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                    <span style={{...styles.roleBadge, background: 'var(--pill-bg)', borderColor: 'var(--border)', color: 'var(--accent-light)'}}>
                                        {articol.categorie}
                                    </span>
                                            </td>
                                            <td style={styles.td}>
                                    <span style={{
                                        ...styles.roleBadge,
                                        background: articol.status === 'published' ? '#0d2010' : 'var(--pill-bg)',
                                        borderColor: articol.status === 'published' ? '#2a4a20' : 'var(--border)',
                                        color: articol.status === 'published' ? '#80c880' : 'var(--text-muted)',
                                    }}>
                                        {articol.status === 'published' ? '● Published' : '○ Draft'}
                                    </span>
                                            </td>
                                            <td style={styles.td}>{new Date(articol.creat_la).toLocaleDateString()}</td>
                                            <td style={styles.td}>
                                                <div style={styles.actionBtns}>
                                                    <button style={styles.btnRole} onClick={() => handleEditNews(articol)}>Edit</button>
                                                    <button style={styles.btnDel} onClick={() => handleDeleteNews(articol.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

const styles = {
    newsForm: { background: 'var(--bg-navbar)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-accent)', borderRadius: '10px', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
    newsFormTitle: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' },
    input: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' },
    select: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit' },
    btnReset: { background: 'transparent', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', color: 'var(--text-muted)', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' },
    page: { minHeight: '100vh', padding: '24px', background: 'var(--bg-primary)' },
    loading: { textAlign: 'center', padding: '60px', color: 'var(--text-muted)' },
    container: { maxWidth: '1000px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
    title: { fontSize: '22px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' },
    subtitle: { fontSize: '13px', color: 'var(--text-muted)' },
    statsRow: { display: 'flex', gap: '10px' },
    statCard: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '10px', padding: '12px 20px', textAlign: 'center' },
    statNum: { fontSize: '22px', fontWeight: '500', color: 'var(--accent-light)' },
    statLabel: { fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' },
    mesajBox: { background: '#0d2010', borderWidth: '1px', borderStyle: 'solid', borderColor: '#2a4a20', color: '#80c880', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
    errorBox: { background: '#2a1010', borderWidth: '1px', borderStyle: 'solid', borderColor: '#5a2020', color: '#f08080', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
    tabs: { display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '16px', gap: '4px' },
    tab: { background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: 'var(--text-muted)', padding: '10px 16px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' },
    card: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '12px', overflow: 'hidden' },
    tableWrap: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid var(--border)', background: 'var(--bg-navbar)' },
    tr: { borderBottom: '1px solid var(--border)' },
    td: { padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' },
    userCell: { display: 'flex', alignItems: 'center', gap: '8px' },
    userAvatar: { width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)', flexShrink: 0 },
    roleBadge: { fontSize: '11px', padding: '2px 8px', borderRadius: '20px', borderWidth: '1px', borderStyle: 'solid' },
    actionBtns: { display: 'flex', gap: '6px' },
    btnRole: { background: 'var(--accent)', color: 'var(--text-primary)', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' },
    btnDel: { background: '#2a1010', color: '#f08080', borderWidth: '1px', borderStyle: 'solid', borderColor: '#5a2020', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' },
    btnView: { background: 'var(--pill-bg)', color: 'var(--text-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', textDecoration: 'none' },
    youBadge: { fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' },
    listingCell: { display: 'flex', alignItems: 'center', gap: '8px' },
    listingCellTitle: { fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' },
    listingCellSub: { fontSize: '10px', color: 'var(--text-muted)' },
};

export default Admin;