import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function NewsDetail() {
    const { id } = useParams();
    const [articol, setArticol] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticol = async () => {
            try {
                const response = await api.get(`/news/${id}`);
                setArticol(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticol();
    }, [id]);

    if (loading) return <div style={styles.loading}>Loading article...</div>;
    if (!articol) return <div style={styles.loading}>Article not found.</div>;

    return (
        <div style={styles.page} className="rsp-news-detail-page">
            <div style={styles.container} className="rsp-news-detail-container">
                <div style={styles.breadcrumb}>
                    <Link to="/" style={styles.breadLink} className="link-glow">Home</Link>
                    <span style={styles.breadSep}> / </span>
                    <Link to="/news" style={styles.breadLink} className="link-glow">News</Link>
                    <span style={styles.breadSep}> / </span>
                    <span style={styles.breadCurrent}>{articol.titlu}</span>
                </div>

                <div style={styles.article}>
                    {articol.imagine_url && (
                        <div style={styles.heroImg} className="rsp-news-hero-img">
                            <img src={articol.imagine_url} alt={articol.titlu} style={styles.img} />
                            <div style={styles.imgOverlay} />
                        </div>
                    )}

                    <div style={styles.articleBody} className="rsp-news-article-body">
                        <div style={styles.meta}>
                            <span style={styles.catBadge}>{articol.categorie}</span>
                            <span style={styles.metaDate}>
                                {new Date(articol.creat_la).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            {articol.autor_nume && (
                                <span style={styles.metaAuthor}>By {articol.autor_nume}</span>
                            )}
                        </div>

                        <h1 style={styles.title} className="rsp-news-title">{articol.titlu}</h1>

                        <div style={styles.content}>
                            {articol.continut.split('\n').map((paragraph, i) =>
                                paragraph.trim() ? <p key={i} style={styles.paragraph}>{paragraph}</p> : null
                            )}
                        </div>
                    </div>
                </div>

                <div style={styles.backRow}>
                    <Link to="/news" style={styles.backBtn} className="btn-ghost-hover">← Back to News</Link>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', padding: '24px' },
    loading: { textAlign: 'center', padding: '60px', color: 'var(--text-muted)' },
    container: { maxWidth: '760px', margin: '0 auto' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '20px' },
    breadLink: { fontSize: '12px', color: 'var(--accent-light)', textDecoration: 'none' },
    breadSep: { fontSize: '12px', color: 'var(--text-muted)' },
    breadCurrent: { fontSize: '12px', color: 'var(--text-muted)' },
    article: {
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        borderRadius: '16px', overflow: 'hidden', marginBottom: '20px',
    },
    heroImg: { position: 'relative', height: '320px', overflow: 'hidden' },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    imgOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(6,14,24,0.6) 100%)' },
    articleBody: { padding: '28px 32px' },
    meta: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
    catBadge: {
        background: 'var(--accent-tint-strong)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)', fontSize: '10px', padding: '3px 10px',
        borderRadius: '20px', fontWeight: '500',
    },
    metaDate: { fontSize: '12px', color: 'var(--text-muted)' },
    metaAuthor: { fontSize: '12px', color: 'var(--accent-light)' },
    title: { fontSize: '26px', fontWeight: '500', color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '24px' },
    content: { display: 'flex', flexDirection: 'column', gap: '14px' },
    paragraph: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8 },
    backRow: { display: 'flex' },
    backBtn: {
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border)',
        color: 'var(--accent-light)', fontSize: '13px',
        padding: '8px 18px', borderRadius: '8px', textDecoration: 'none',
    },
};

export default NewsDetail;
