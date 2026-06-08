import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

function Home() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({ anunturi: 0, users: 0, today: 0 });
    const [recentAnunturi, setRecentAnunturi] = useState([]);
    const [imaginiRecente, setImaginiRecente] = useState({});
    const [brands, setBrands] = useState([]);
    const [newsArticole, setNewsArticole] = useState([]);
    const [featured, setFeatured] = useState(null);
    const [featuredImg, setFeaturedImg] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, anunturiRes] = await Promise.all([
                    api.get('/stats'),
                    api.get('/anunturi/search/avansat?'),
                ]);
                setStats(statsRes.data);

                const newsRes = await api.get('/news');
                setNewsArticole(newsRes.data.slice(0, 3));

                const ultimele = anunturiRes.data.slice(0, 3);
                setRecentAnunturi(ultimele);

                if (anunturiRes.data.length > 0) {
                    const randomIndex = Math.floor(Math.random() * anunturiRes.data.length);
                    const pick = anunturiRes.data[randomIndex];
                    setFeatured(pick);
                    try {
                        const imgRes = await api.get(`/anunturi/${pick.id}/imagini`);
                        if (imgRes.data.length > 0) setFeaturedImg(imgRes.data[0].url);
                    } catch { }
                }

                const imaginiMap = {};
                await Promise.all(ultimele.map(async (anunt) => {
                    try {
                        const imgRes = await api.get(`/anunturi/${anunt.id}/imagini`);
                        if (imgRes.data.length > 0) {
                            imaginiMap[anunt.id] = imgRes.data[0].url;
                        }
                    } catch { }
                }));
                setImaginiRecente(imaginiMap);

                const brandCount = {};
                anunturiRes.data.forEach(a => {
                    if (a.marca) {
                        brandCount[a.marca] = (brandCount[a.marca] || 0) + 1;
                    }
                });
                const topBrands = Object.entries(brandCount)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([name, count]) => ({ name, count }));
                setBrands(topBrands);

            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/listings?q=${search}`);
        } else {
            navigate('/listings');
        }
    };

    const quickTags = [
        { label: 'SUV',            param: 'caroserie',  value: 'Off-road/SUV' },
        { label: 'Under 10.000 €', param: 'pret_max',   value: '10000' },
        { label: 'Under 100k km',  param: 'km_max',     value: '100000' },
        { label: 'Automatic',      param: 'transmisie', value: 'automata' },
        { label: 'Electric',       param: 'motorizare', value: 'Electric' },
        { label: '2020+',          param: 'an_min',     value: '2020' },
    ];

    return (
        <div style={styles.page}>

            {/* Hero Section */}
            <div style={styles.hero} className="rsp-hero">
                <div style={styles.heroLeft}>
                    <div style={styles.heroTag} className="gl-surface">
                        <span style={styles.heroDot}></span>
                        AI-powered car platform
                    </div>
                    <h1 style={styles.heroTitle} className="rsp-hero-title">
                        Find your next<br />car with <span style={styles.heroAccent}>AutoTrade</span>
                    </h1>
                    <p style={styles.heroSub}>
                        Search thousands of listings · AI-assisted publishing<br />
                        Instant messaging · Verified sellers
                    </p>
                    <form onSubmit={handleSearch} style={styles.searchBox} className="rsp-search-box gl-surface">
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            style={styles.searchInput}
                            placeholder="Search by brand, model, keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" style={styles.btnSearch} className="btn-primary-glow">Search</button>
                    </form>
                    <div style={styles.quickTags}>
                        {quickTags.map(({ label, param, value }) => (
                            <span
                                key={label}
                                style={styles.qtag}
                                className="tag-hover"
                                onClick={() => {
                                    const p = new URLSearchParams({ [param]: value });
                                    navigate(`/listings?${p.toString()}`);
                                }}
                            >{label}</span>
                        ))}
                    </div>
                </div>

                <div style={styles.heroRight} className="rsp-hero-right">
                    {featured && (
                        <div style={styles.featuredCard} className="gl-panel">
                            <div style={styles.featuredLabel}>Featured listing</div>
                            <div style={styles.carIllustration}>
                                {featuredImg
                                    ? <img src={featuredImg} alt={featured.titlu} style={styles.featuredImg} />
                                    : '🚗'
                                }
                            </div>
                            <div style={styles.featuredName}>{featured.titlu}</div>
                            <div style={styles.featuredType}>{featured.motorizare || '—'} · {featured.an}</div>
                            <div style={styles.featuredStats}>
                                <div style={styles.statBox} className="gl-surface">
                                    <div style={styles.statVal}>{featured.kilometraj ? `${Math.round(featured.kilometraj / 1000)}k` : '—'}</div>
                                    <div style={styles.statLabel}>km</div>
                                </div>
                                <div style={styles.statBox} className="gl-surface">
                                    <div style={styles.statVal}>{featured.putere || '—'}</div>
                                    <div style={styles.statLabel}>HP</div>
                                </div>
                                <div style={styles.statBox} className="gl-surface">
                                    <div style={styles.statVal}>{featured.transmisie ? featured.transmisie.slice(0, 4) : '—'}</div>
                                    <div style={styles.statLabel}>trans.</div>
                                </div>
                            </div>
                            <div style={styles.featuredFooter}>
                                <span style={styles.featuredPrice}>{Number(featured.pret).toLocaleString()} €</span>
                                <Link to={`/listings/${featured.id}`} style={styles.btnView} className="btn-primary-glow">View →</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Bar */}
            <div style={styles.statsBar} className="rsp-stats-bar">
                {[
                    { num: stats.anunturi.toLocaleString(), label: 'Active listings' },
                    { num: stats.users.toLocaleString(), label: 'Registered users' },
                    { num: stats.today.toLocaleString(), label: 'New today' },
                    { num: '⭐ 4.9', label: 'Satisfaction rate' },
                ].map((s, i) => (
                    <div key={i} style={styles.statItem} className="rsp-stat-item">
                        <div style={styles.statNum}>{s.num}</div>
                        <div style={styles.statItemLabel}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={styles.content} className="rsp-content">

                {/* Browse by brand */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <span style={styles.sectionTitle}>Browse by brand</span>
                        <Link to="/listings" style={styles.sectionLink} className="link-glow">View all →</Link>
                    </div>
                    <div style={styles.brandsGrid} className="rsp-brands-grid">
                        {brands.map(brand => (
                            <div
                                key={brand.name}
                                style={styles.brandCard}
                                className="card-hover"
                                onClick={() => navigate(`/listings?marca=${brand.name}`)}
                            >
                                <div style={styles.brandEmoji}>🚘</div>
                                <div style={styles.brandName}>{brand.name}</div>
                                <div style={styles.brandCount}>{brand.count} ads</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Section */}
                <div style={styles.aiSection} className="rsp-ai-section">
                    <div style={styles.aiIconBox} className="gl-icon">✨</div>
                    <div style={styles.aiBody}>
                        <div style={styles.aiTag}>AI Feature</div>
                        <div style={styles.aiTitle}>Publish smarter with AI assistance</div>
                        <div style={styles.aiDesc}>Just fill in the basics — our AI generates the full description, detects spam, and helps you reach more buyers.</div>
                        <div style={styles.aiFeats}>
                            {['Auto description', 'Form autofill', 'Spam detection', 'Natural language updates'].map(f => (
                                <span key={f} style={styles.aiFeat} className="gl-chip">{f}</span>
                            ))}
                        </div>
                    </div>
                    <button style={styles.btnAi} className="btn-primary-glow" onClick={() => navigate('/listings/new')}>Try it now →</button>
                </div>

                {/* News */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <span style={styles.sectionTitle}>Latest news & reviews</span>
                        <span style={styles.sectionLink} className="link-glow">All articles →</span>
                    </div>
                    <div style={styles.newsGrid} className="rsp-news-grid">
                        {newsArticole.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No articles yet.</div>
                        ) : (
                            newsArticole.map(articol => (
                                <Link to={`/news/${articol.id}`} key={articol.id} style={{ ...styles.newsCard, textDecoration: 'none' }} className="card-hover">
                                    <div style={styles.newsThumb}>
                                        {articol.imagine_url
                                            ? <img src={articol.imagine_url} alt={articol.titlu} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : '📰'
                                        }
                                    </div>
                                    <div style={styles.newsBody}>
                                        <div style={styles.newsCat}>{articol.categorie}</div>
                                        <div style={styles.newsTitle}>{articol.titlu}</div>
                                        <div style={styles.newsDate}>{new Date(articol.creat_la).toLocaleDateString()}</div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Recently Added */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <span style={styles.sectionTitle}>Recently added</span>
                        <Link to="/listings" style={styles.sectionLink} className="link-glow">See all listings →</Link>
                    </div>
                    <div style={styles.recentList}>
                        {recentAnunturi.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                                No listings yet.
                            </div>
                        ) : (
                            recentAnunturi.map(anunt => (
                                <Link to={`/listings/${anunt.id}`} key={anunt.id} style={styles.miniCard} className="card-hover">
                                    <div style={styles.miniImg}>
                                        {imaginiRecente[anunt.id] ? (
                                            <img
                                                src={imaginiRecente[anunt.id]}
                                                alt={anunt.titlu}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: '22px' }}>🚗</span>
                                        )}
                                    </div>
                                    <div style={styles.miniInfo}>
                                        <div style={styles.miniTitle}>{anunt.titlu}</div>
                                        <div style={styles.miniSub}>
                                            {anunt.an} · {anunt.kilometraj?.toLocaleString()} km · {anunt.transmisie}
                                        </div>
                                    </div>
                                    <div style={styles.miniRight}>
                                        <div style={styles.miniPrice}>{Number(anunt.pret).toLocaleString()} €</div>
                                        <div style={styles.miniTime}>
                                            {new Date(anunt.creat_la).toLocaleDateString()}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

const glass = {
    background: 'var(--bg-navbar)',
    backdropFilter: 'var(--glass-blur-heavy)',
    WebkitBackdropFilter: 'var(--glass-blur-heavy)',
    border: '1px solid var(--border)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
};

const glassCard = {
    background: 'var(--bg-card)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--border)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
};

const styles = {
    page: { minHeight: '100vh' },
    hero: {
        ...glass,
        padding: '48px 32px 36px',
        display: 'flex', alignItems: 'center', gap: '32px',
        borderLeft: 'none', borderRight: 'none', borderTop: 'none', borderRadius: 0,
    },
    heroLeft: { flex: 1 },
    heroTag: {
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: 'var(--accent-tint)',
        border: '1px solid var(--border)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        color: 'var(--accent-light)', fontSize: '11px',
        padding: '4px 12px', borderRadius: '20px', marginBottom: '16px',
    },
    heroDot: {
        width: '6px', height: '6px', borderRadius: '50%',
        background: 'var(--accent-light)', display: 'inline-block',
        boxShadow: '0 0 6px rgba(129, 151, 172, 0.7)',
    },
    heroTitle: {
        fontSize: '32px', fontWeight: '500', color: 'var(--text-primary)',
        lineHeight: 1.25, marginBottom: '12px',
        textShadow: '0 2px 12px rgba(0,0,0,0.4)',
    },
    heroAccent: {
        color: 'var(--accent-light)',
        textShadow: '0 0 24px rgba(129, 151, 172, 0.4)',
    },
    heroSub: { fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.7 },
    searchBox: {
        display: 'flex',
        background: 'var(--glass-deep)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border)',
        borderRadius: '12px', overflow: 'hidden', maxWidth: '460px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
    },
    searchIcon: { padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: '14px' },
    searchInput: {
        flex: 1, background: 'transparent', border: 'none',
        color: 'var(--text-primary)', fontSize: '13px',
        padding: '11px 0', outline: 'none', fontFamily: 'inherit',
    },
    btnSearch: {
        background: 'var(--btn-gradient)',
        color: 'var(--text-primary)', border: 'none',
        padding: '0 22px', fontSize: '13px', fontWeight: '500',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
    },
    quickTags: { display: 'flex', gap: '6px', marginTop: '14px', flexWrap: 'wrap' },
    qtag: {
        background: 'var(--accent-tint)',
        border: '1px solid var(--border)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        color: 'var(--text-muted)', fontSize: '11px',
        padding: '4px 12px', borderRadius: '20px', cursor: 'pointer',
    },
    heroRight: {},
    featuredCard: {
        ...glassCard,
        borderRadius: '16px', padding: '18px', width: '220px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
    },
    featuredLabel: { fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px' },
    carIllustration: {
        height: '90px', marginBottom: '10px',
        borderRadius: '8px', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '44px',
        background: 'var(--glass-deep)',
    },
    featuredImg: { width: '100%', height: '100%', objectFit: 'cover' },
    featuredName: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2px' },
    featuredType: { fontSize: '12px', color: 'var(--accent-light)', marginBottom: '12px' },
    featuredStats: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '5px', marginBottom: '14px' },
    statBox: {
        background: 'var(--glass-deep)',
        border: '1px solid var(--border)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        borderRadius: '7px', padding: '6px 3px', textAlign: 'center',
    },
    statVal: { fontSize: '11px', fontWeight: '500', color: 'var(--text-primary)' },
    statLabel: { fontSize: '9px', color: 'var(--text-muted)' },
    featuredFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    featuredPrice: { fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' },
    btnView: {
        background: 'var(--btn-gradient)',
        color: 'var(--text-primary)', border: 'none',
        padding: '5px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500',
        textDecoration: 'none', boxShadow: '0 2px 12px rgba(49,75,110,0.4)',
    },
    statsBar: {
        ...glass,
        display: 'flex',
        borderLeft: 'none', borderRight: 'none', borderRadius: 0,
        borderTop: '1px solid var(--border-faint)',
    },
    statItem: {
        flex: 1, textAlign: 'center', padding: '16px',
        borderRight: '1px solid var(--border-faint)',
    },
    statNum: {
        fontSize: '25px', fontWeight: '500', color: 'var(--accent-light)',
        textShadow: '0 0 16px rgba(129, 151, 172, 0.3)',
    },
    statItemLabel: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' },
    content: {
        padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '28px',
    },
    section: {},
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
    sectionTitle: { fontSize: '17px', fontWeight: '500', color: 'var(--text-primary)' },
    sectionLink: { fontSize: '13px', color: 'var(--accent-light)', textDecoration: 'none', cursor: 'pointer' },
    brandsGrid: { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '10px' },
    brandCard: {
        ...glassCard,
        borderRadius: '12px', padding: '16px 8px',
        textAlign: 'center', cursor: 'pointer',
    },
    brandEmoji: { fontSize: '24px', marginBottom: '8px' },
    brandName: { fontSize: '13px', color: 'var(--text-secondary)' },
    brandCount: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' },
    aiSection: {
        ...glassCard,
        borderRadius: '14px', padding: '20px 22px',
        display: 'flex', gap: '18px', alignItems: 'center',
        border: '1px solid var(--border-accent)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(129,151,172,0.07)',
    },
    aiIconBox: {
        width: '46px', height: '46px',
        background: 'var(--accent-tint)',
        border: '1px solid var(--border)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        borderRadius: '12px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '20px', flexShrink: 0,
    },
    aiBody: { flex: 1 },
    aiTag: { fontSize: '10px', color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500', marginBottom: '4px' },
    aiTitle: { fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' },
    aiDesc: { fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 },
    aiFeats: { display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' },
    aiFeat: {
        background: 'var(--accent-tint)',
        border: '1px solid var(--border)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        color: 'var(--accent-light)', fontSize: '10px', padding: '3px 9px', borderRadius: '5px',
    },
    btnAi: {
        background: 'var(--btn-gradient)',
        color: 'var(--text-primary)', border: 'none',
        padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: '500',
        whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(49,75,110,0.45)',
        cursor: 'pointer',
    },
    newsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' },
    newsCard: {
        ...glassCard,
        borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
    },
    newsThumb: {
        height: '76px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '28px',
        background: 'var(--glass-deep)',
        borderBottom: '1px solid var(--border-faint)',
    },
    newsBody: { padding: '12px' },
    newsCat: { fontSize: '11px', color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '5px' },
    newsTitle: { fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: '5px' },
    newsDate: { fontSize: '11px', color: 'var(--text-muted)' },
    recentList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    miniCard: {
        ...glassCard,
        borderRadius: '11px', display: 'flex', alignItems: 'center',
        gap: '14px', padding: '12px 16px', textDecoration: 'none',
    },
    miniImg: {
        width: '64px', height: '44px',
        background: 'var(--glass-deep)',
        border: '1px solid var(--border)',
        borderRadius: '7px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '22px', flexShrink: 0,
        overflow: 'hidden',
    },
    miniInfo: { flex: 1 },
    miniTitle: { fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' },
    miniSub: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' },
    miniRight: { textAlign: 'right' },
    miniPrice: {
        fontSize: '16px', fontWeight: '500', color: 'var(--accent-light)',
        textShadow: '0 0 12px rgba(129, 151, 172, 0.25)',
    },
    miniTime: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' },
};

export default Home;
