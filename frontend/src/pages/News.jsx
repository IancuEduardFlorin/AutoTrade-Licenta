import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function News() {
    const [articole, setArticole] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtru, setFiltru] = useState('All');

    useEffect(() => {
        const fetchArticole = async () => {
            try {
                const response = await api.get('/news');
                setArticole(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticole();
    }, []);

    const categorii = ['All', 'News', 'Electric', 'Guide', 'Review', 'Tips'];
    const articoleFiltrate = filtru === 'All' ? articole : articole.filter(a => a.categorie === filtru);

    if (loading) return <div style={styles.loading}>Loading articles...</div>;

    return (
        <div style={styles.page} className="rsp-news-page">
            <div style={styles.header}>
                <h1 style={styles.title}>News & Reviews</h1>
                <p style={styles.subtitle}>Latest automotive news, guides and reviews</p>
            </div>

            <div style={styles.categorii}>
                {categorii.map(cat => (
                    <button
                        key={cat}
                        style={{
                            ...styles.catBtn,
                            background: filtru === cat ? 'var(--accent-tint-strong)' : 'var(--pill-bg)',
                            color: filtru === cat ? 'var(--text-primary)' : 'var(--text-muted)',
                            borderColor: filtru === cat ? 'var(--border-accent)' : 'var(--border)',
                        }}
                        className="pill-hover"
                        onClick={() => setFiltru(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {articoleFiltrate.length === 0 ? (
                <div style={styles.empty}>No articles found.</div>
            ) : (
                <div style={styles.grid} className="rsp-news-page-grid">
                    {articoleFiltrate.map(articol => (
                        <Link to={`/news/${articol.id}`} key={articol.id} style={styles.card} className="card-hover">
                            <div style={styles.cardImg}>
                                {articol.imagine_url ? (
                                    <img src={articol.imagine_url} alt={articol.titlu} style={styles.img} />
                                ) : (
                                    <div style={styles.imgPlaceholder}>📰</div>
                                )}
                                <span style={styles.catBadge}>{articol.categorie}</span>
                            </div>
                            <div style={styles.cardBody}>
                                <div style={styles.cardTitle}>{articol.titlu}</div>
                                <div style={styles.cardMeta}>
                                    By {articol.autor_nume} · {new Date(articol.creat_la).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <div style={styles.cardExcerpt}>{articol.continut.substring(0, 120)}...</div>
                                <div style={styles.readMore}>Read more →</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    page: { padding: '24px', minHeight: '100vh' },
    loading: { textAlign: 'center', padding: '60px', color: 'var(--text-muted)' },
    header: { marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' },
    subtitle: { fontSize: '13px', color: 'var(--text-muted)' },
    categorii: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
    catBtn: {
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid', borderRadius: '20px',
        padding: '5px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.15s',
    },
    empty: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
    card: {
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        borderRadius: '12px', overflow: 'hidden', textDecoration: 'none',
        display: 'flex', flexDirection: 'column',
    },
    cardImg: {
        position: 'relative', height: '180px',
        background: 'var(--glass-deep)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    imgPlaceholder: { fontSize: '40px' },
    catBadge: {
        position: 'absolute', top: '10px', left: '10px',
        background: 'var(--accent-tint-strong)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', fontWeight: '500',
    },
    cardBody: { padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
    cardTitle: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', lineHeight: 1.4 },
    cardMeta: { fontSize: '11px', color: 'var(--text-muted)' },
    cardExcerpt: { fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 },
    readMore: { fontSize: '12px', color: 'var(--accent-light)', marginTop: '4px' },
};

export default News;
