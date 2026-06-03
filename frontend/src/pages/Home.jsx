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

    return (
        <div style={styles.page}>

            {/* Hero Section */}
            <div style={styles.hero}>
                <div style={styles.heroLeft}>
                    <div style={styles.heroTag}>
                        <span style={styles.heroDot}></span>
                        AI-powered car platform
                    </div>
                    <h1 style={styles.heroTitle}>
                        Find your next<br />car with <span style={styles.heroAccent}>AutoTrade</span>
                    </h1>
                    <p style={styles.heroSub}>
                        Search thousands of listings · AI-assisted publishing<br />
                        Instant messaging · Verified sellers
                    </p>
                    <form onSubmit={handleSearch} style={styles.searchBox}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            style={styles.searchInput}
                            placeholder="Search by brand, model, keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" style={styles.btnSearch}>Search</button>
                    </form>
                    <div style={styles.quickTags}>
                        {['SUV', 'Under 10.000 €', 'Under 100k km', 'Automatic', 'Electric', '2020+'].map(tag => (
                            <span key={tag} style={styles.qtag} onClick={() => navigate('/listings')}>{tag}</span>
                        ))}
                    </div>
                </div>

                <div style={styles.heroRight}>
                    <div style={styles.featuredCard}>
                        <div style={styles.featuredLabel}>Featured listing</div>
                        <div style={styles.carIllustration}>🚗</div>
                        <div style={styles.featuredName}>Volkswagen Golf 7</div>
                        <div style={styles.featuredType}>Gasoline · 2018</div>
                        <div style={styles.featuredStats}>
                            <div style={styles.statBox}><div style={styles.statVal}>85k</div><div style={styles.statLabel}>km</div></div>
                            <div style={styles.statBox}><div style={styles.statVal}>115</div><div style={styles.statLabel}>HP</div></div>
                            <div style={styles.statBox}><div style={styles.statVal}>Man.</div><div style={styles.statLabel}>trans.</div></div>
                        </div>
                        <div style={styles.featuredFooter}>
                            <span style={styles.featuredPrice}>12.000 €</span>
                            <Link to="/listings/2" style={styles.btnView}>View →</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={styles.statsBar}>
                {[
                    { num: stats.anunturi.toLocaleString(), label: 'Active listings' },
                    { num: stats.users.toLocaleString(), label: 'Registered users' },
                    { num: stats.today.toLocaleString(), label: 'New today' },
                    { num: '⭐ 4.9', label: 'Satisfaction rate' },
                ].map((s, i) => (
                    <div key={i} style={styles.statItem}>
                        <div style={styles.statNum}>{s.num}</div>
                        <div style={styles.statItemLabel}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={styles.content}>

                {/* Browse by brand */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <span style={styles.sectionTitle}>Browse by brand</span>
                        <Link to="/listings" style={styles.sectionLink}>View all →</Link>
                    </div>
                    <div style={styles.brandsGrid}>
                        {brands.map(brand => (
                            <div
                                key={brand.name}
                                style={styles.brandCard}
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
                <div style={styles.aiSection}>
                    <div style={styles.aiIconBox}>✨</div>
                    <div style={styles.aiBody}>
                        <div style={styles.aiTag}>AI Feature</div>
                        <div style={styles.aiTitle}>Publish smarter with AI assistance</div>
                        <div style={styles.aiDesc}>Just fill in the basics — our AI generates the full description, detects spam, and helps you reach more buyers.</div>
                        <div style={styles.aiFeats}>
                            {['Auto description', 'Form autofill', 'Spam detection', 'Natural language updates'].map(f => (
                                <span key={f} style={styles.aiFeat}>{f}</span>
                            ))}
                        </div>
                    </div>
                    <button style={styles.btnAi} onClick={() => navigate('/listings/new')}>Try it now →</button>
                </div>

                {/* News */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <span style={styles.sectionTitle}>Latest news & reviews</span>
                        <span style={styles.sectionLink}>All articles →</span>
                    </div>
                    <div style={styles.newsGrid}>
                        {newsArticole.length === 0 ? (
                            <div style={{color: 'var(--text-muted)', fontSize: '13px'}}>No articles yet.</div>
                        ) : (
                            newsArticole.map(articol => (
                                <Link to={`/news/${articol.id}`} key={articol.id} style={{...styles.newsCard, textDecoration: 'none'}}>
                                    <div style={styles.newsThumb}>
                                        {articol.imagine_url
                                            ? <img src={articol.imagine_url} alt={articol.titlu} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
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
                    </div>                </div>

                {/* Recently Added */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <span style={styles.sectionTitle}>Recently added</span>
                        <Link to="/listings" style={styles.sectionLink}>See all listings →</Link>
                    </div>
                    <div style={styles.recentList}>
                        {recentAnunturi.length === 0 ? (
                            <div style={{color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px'}}>
                                No listings yet.
                            </div>
                        ) : (
                            recentAnunturi.map(anunt => (
                                <Link to={`/listings/${anunt.id}`} key={anunt.id} style={styles.miniCard}>
                                    <div style={styles.miniImg}>
                                        {imaginiRecente[anunt.id] ? (
                                            <img
                                                src={imaginiRecente[anunt.id]}
                                                alt={anunt.titlu}
                                                style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px'}}
                                            />
                                        ) : (
                                            <span style={{fontSize: '22px'}}>🚗</span>
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

const styles = {
    page: { minHeight: '100vh' },
    hero: { background: 'var(--bg-navbar)', padding: '40px 24px 32px', display: 'flex', alignItems: 'center', gap: '24px', borderBottom: '1px solid var(--border)' },
    heroLeft: { flex: 1 },
    heroTag: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--pill-bg)', border: '1px solid var(--border-accent)', color: 'var(--accent-light)', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', marginBottom: '14px' },
    heroDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-light)', display: 'inline-block' },
    heroTitle: { fontSize: '30px', fontWeight: '500', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '10px' },
    heroAccent: { color: 'var(--accent-light)' },
    heroSub: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '22px', lineHeight: 1.6 },
    searchBox: { display: 'flex', background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-accent)', borderRadius: '10px', overflow: 'hidden', maxWidth: '460px' },
    searchIcon: { padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: '14px' },
    searchInput: { flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '13px', padding: '10px 0', outline: 'none', fontFamily: 'inherit' },
    btnSearch: { background: 'var(--accent)', color: 'var(--text-primary)', border: 'none', padding: '0 20px', fontSize: '12px', fontWeight: '500' },
    quickTags: { display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' },
    qtag: { background: 'var(--pill-bg)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', color: 'var(--text-muted)', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', cursor: 'pointer' },
    heroRight: {},
    featuredCard: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-accent)', borderRadius: '14px', padding: '16px', width: '210px' },
    featuredLabel: { fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px' },
    carIllustration: { fontSize: '40px', textAlign: 'center', marginBottom: '10px', display: 'block' },
    featuredName: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2px' },
    featuredType: { fontSize: '11px', color: 'var(--accent-light)', marginBottom: '10px' },
    featuredStats: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '5px', marginBottom: '12px' },
    statBox: { background: 'var(--bg-navbar)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '6px', padding: '5px 3px', textAlign: 'center' },
    statVal: { fontSize: '11px', fontWeight: '500', color: 'var(--text-primary)' },
    statLabel: { fontSize: '9px', color: 'var(--text-muted)' },
    featuredFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    featuredPrice: { fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' },
    btnView: { background: 'var(--accent)', color: 'var(--text-primary)', border: 'none', padding: '5px 12px', borderRadius: '7px', fontSize: '11px', fontWeight: '500', textDecoration: 'none' },
    statsBar: { display: 'flex', background: 'var(--bg-navbar)', borderBottom: '1px solid var(--border)' },
    statItem: { flex: 1, textAlign: 'center', padding: '14px', borderRight: '1px solid var(--border)' },
    statNum: { fontSize: '18px', fontWeight: '500', color: 'var(--accent-light)' },
    statItemLabel: { fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' },
    content: { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '24px' },
    section: {},
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    sectionTitle: { fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' },
    sectionLink: { fontSize: '12px', color: 'var(--accent-light)', textDecoration: 'none', cursor: 'pointer' },
    brandsGrid: { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '8px' },
    brandCard: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '10px', padding: '14px 6px', textAlign: 'center', cursor: 'pointer' },
    brandEmoji: { fontSize: '22px', marginBottom: '6px' },
    brandName: { fontSize: '11px', color: 'var(--text-secondary)' },
    brandCount: { fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' },
    aiSection: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-accent)', borderRadius: '12px', padding: '16px 18px', display: 'flex', gap: '16px', alignItems: 'center' },
    aiIconBox: { width: '44px', height: '44px', background: 'var(--pill-bg)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-accent)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
    aiBody: { flex: 1 },
    aiTag: { fontSize: '10px', color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500', marginBottom: '4px' },
    aiTitle: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' },
    aiDesc: { fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 },
    aiFeats: { display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' },
    aiFeat: { background: 'var(--pill-bg)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-accent)', color: 'var(--accent-light)', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' },
    btnAi: { background: 'var(--accent)', color: 'var(--text-primary)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' },
    newsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' },
    newsCard: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer' },
    newsThumb: { height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', background: 'var(--pill-bg)' },
    newsBody: { padding: '10px' },
    newsCat: { fontSize: '10px', color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' },
    newsTitle: { fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '4px' },
    newsDate: { fontSize: '10px', color: 'var(--text-muted)' },
    recentList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    miniCard: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '9px', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', textDecoration: 'none' },
    miniImg: { width: '60px', height: '40px', background: 'var(--pill-bg)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 },
    miniInfo: { flex: 1 },
    miniTitle: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' },
    miniSub: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' },
    miniRight: { textAlign: 'right' },
    miniPrice: { fontSize: '14px', fontWeight: '500', color: 'var(--accent-light)' },
    miniTime: { fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' },
};

export default Home;