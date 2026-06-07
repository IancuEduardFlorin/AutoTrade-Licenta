import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const formatNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
const unformatNumber = (value) => value.replace(/\./g, '');

function Listings() {
    const [anunturi, setAnunturi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [filtre, setFiltre] = useState({
        marca:     searchParams.get('marca')     || '',
        pret_min:  searchParams.get('pret_min')  || '',
        pret_max:  searchParams.get('pret_max')  || '',
        an_min:    searchParams.get('an_min')    || '',
        an_max:    searchParams.get('an_max')    || '',
        transmisie: searchParams.get('transmisie') || '',
        caroserie: searchParams.get('caroserie') || '',
        km_max:    searchParams.get('km_max')    || '',
        putere_min: searchParams.get('putere_min') || '',
        motorizare: searchParams.get('motorizare') || '',
    });
    const [sortare, setSortare] = useState('newest');
    const [yearError, setYearError] = useState('');
    const [imaginiAnunturi, setImaginiAnunturi] = useState({});
    const [filtersOpen, setFiltersOpen] = useState(false);

    const fetchAnunturi = async () => {
        setLoading(true);
        setImaginiAnunturi({});
        try {
            let response;
            if (search.trim()) {
                response = await api.get(`/anunturi/search?q=${search}`);
            } else {
                const params = new URLSearchParams();
                const filtreClean = {
                    ...filtre,
                    pret_min: unformatNumber(filtre.pret_min),
                    pret_max: unformatNumber(filtre.pret_max),
                    km_max: unformatNumber(filtre.km_max),
                };
                Object.entries(filtreClean).forEach(([key, val]) => {
                    if (val) params.append(key, val);
                });
                response = await api.get(`/anunturi/search/avansat?${params.toString()}`);
            }
            setAnunturi(response.data);
            fetchImaginiPrincipale(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchImaginiPrincipale = async (anunturiList) => {
        const imaginiMap = {};
        await Promise.all(
            anunturiList.map(async (anunt) => {
                try {
                    const res = await api.get(`/anunturi/${anunt.id}/imagini`);
                    if (res.data.length > 0) imaginiMap[anunt.id] = res.data[0].url;
                } catch { }
            })
        );
        setImaginiAnunturi(imaginiMap);
    };

    useEffect(() => { fetchAnunturi(); }, []);

    const handleSearch = (e) => { e.preventDefault(); fetchAnunturi(); };

    const handleFiltreChange = (e) => {
        const { name, value } = e.target;
        if (['pret_min', 'pret_max', 'km_max', 'putere_min'].includes(name)) {
            setFiltre({ ...filtre, [name]: formatNumber(value) });
            return;
        }
        if (name === 'an_min') {
            setYearError(filtre.an_max && value && parseInt(value) > parseInt(filtre.an_max) ? 'Min year cannot be greater than max year' : '');
        }
        if (name === 'an_max') {
            setYearError(filtre.an_min && value && parseInt(filtre.an_min) > parseInt(value) ? 'Min year cannot be greater than max year' : '');
        }
        setFiltre({ ...filtre, [name]: value });
    };

    const handleAplicaFiltre = () => { if (yearError) return; setSearch(''); fetchAnunturi(); };
    const handleReset = () => {
        setFiltre({ marca: '', pret_min: '', pret_max: '', an_min: '', an_max: '', transmisie: '', caroserie: '', km_max: '', putere_min: '', motorizare: '' });
        setSearch('');
        setYearError('');
        setTimeout(fetchAnunturi, 100);
    };

    const anunturiSortate = [...anunturi].sort((a, b) => {
        if (sortare === 'pret_asc') return a.pret - b.pret;
        if (sortare === 'pret_desc') return b.pret - a.pret;
        if (sortare === 'km_asc') return a.kilometraj - b.kilometraj;
        return new Date(b.creat_la) - new Date(a.creat_la);
    });

    return (
        <div style={styles.page}>
            <div style={styles.searchBar} className="rsp-search-bar">
                <form onSubmit={handleSearch} style={styles.searchForm}>
                    <div style={styles.searchWrap} className="gl-surface">
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            style={styles.searchInput}
                            placeholder="Search by brand, model, keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button type="submit" style={styles.btnSearch} className="btn-primary-glow">Search</button>
                </form>
            </div>

            <div style={styles.body} className="rsp-listings-body">
                <div style={styles.sidebar} className={`rsp-listings-sidebar${filtersOpen ? '' : ' collapsed'}`}>
                    <div style={styles.filterTitle}>Filters</div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Brand</label>
                        <select style={styles.filterSelect} name="marca" value={filtre.marca} onChange={handleFiltreChange}>
                            <option value="">All brands</option>
                            {['Alfa Romeo','Audi','BMW','Chevrolet','Chrysler','Citroën','Dacia','Fiat','Ford','Honda','Hyundai','Jeep','Kia','Lexus','Mazda','Mercedes','Mitsubishi','Nissan','Opel','Peugeot','Porsche','Renault','Seat','Skoda','Subaru','Suzuki','Toyota','Volkswagen','Volvo'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Price (€)</label>
                        <div style={styles.filterRow}>
                            <input style={styles.filterInput} name="pret_min" placeholder="Min" value={filtre.pret_min} onChange={handleFiltreChange} />
                            <input style={styles.filterInput} name="pret_max" placeholder="Max" value={filtre.pret_max} onChange={handleFiltreChange} />
                        </div>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Year</label>
                        <div style={styles.filterRow}>
                            <input style={{ ...styles.filterInput, borderColor: yearError ? 'var(--color-error-border)' : 'var(--border)' }} name="an_min" placeholder="From" value={filtre.an_min} onChange={handleFiltreChange} maxLength={4} />
                            <input style={{ ...styles.filterInput, borderColor: yearError ? 'var(--color-error-border)' : 'var(--border)' }} name="an_max" placeholder="To" value={filtre.an_max} onChange={handleFiltreChange} maxLength={4} />
                        </div>
                        {yearError && <div style={styles.yearError}>{yearError}</div>}
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Transmission</label>
                        <select style={styles.filterSelect} name="transmisie" value={filtre.transmisie} onChange={handleFiltreChange}>
                            <option value="">All</option>
                            <option value="manuala">Manual</option>
                            <option value="automata">Automatic</option>
                            <option value="semi-automata">Semi-automatic</option>
                            <option value="DSG">DSG</option>
                            <option value="CVT">CVT</option>
                            <option value="PDK">PDK</option>
                            <option value="Distronic">Distronic</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Body type</label>
                        <select style={styles.filterSelect} name="caroserie" value={filtre.caroserie} onChange={handleFiltreChange}>
                            <option value="">All types</option>
                            <option value="Small car">Small car</option>
                            <option value="Off-road/SUV">SUV / Off-road</option>
                            <option value="Limousine">Limousine</option>
                            <option value="Sports car/Coupe">Sports car / Coupé</option>
                            <option value="Van/Minibus">Van / Minibus</option>
                            <option value="Convertible/Roadster">Convertible / Roadster</option>
                            <option value="Combination">Combination</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Max km</label>
                        <input style={{ ...styles.filterInput, width: '100%', boxSizing: 'border-box' }} name="km_max" placeholder="e.g. 100.000" value={filtre.km_max} onChange={handleFiltreChange} />
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Min power (HP)</label>
                        <input style={{ ...styles.filterInput, width: '100%', boxSizing: 'border-box' }} name="putere_min" placeholder="e.g. 100" value={filtre.putere_min} onChange={handleFiltreChange} />
                    </div>

                    <button style={{ ...styles.btnApply, opacity: yearError ? 0.5 : 1 }} className="btn-primary-glow" onClick={handleAplicaFiltre} disabled={!!yearError}>Apply filters</button>
                    <button style={styles.btnReset} className="btn-ghost-hover" onClick={handleReset}>Reset</button>
                </div>

                <div style={styles.main}>
                    <button
                        className="rsp-filter-toggle"
                        onClick={() => setFiltersOpen(o => !o)}
                    >
                        ⚙ {filtersOpen ? 'Hide filters' : 'Show filters'}
                    </button>
                    <div style={styles.resultsBar} className="rsp-results-bar">
                        <span style={styles.resultsCount}>
                            <strong style={{ color: 'var(--text-primary)' }}>{anunturiSortate.length}</strong> listings found
                        </span>
                        <div style={styles.sortWrap}>
                            <span style={styles.sortLabel}>Sort by</span>
                            <select style={styles.sortSelect} value={sortare} onChange={(e) => setSortare(e.target.value)}>
                                <option value="newest">Newest first</option>
                                <option value="pret_asc">Price: low to high</option>
                                <option value="pret_desc">Price: high to low</option>
                                <option value="km_asc">Lowest km</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div style={styles.loading}>Loading listings...</div>
                    ) : anunturiSortate.length === 0 ? (
                        <div style={styles.empty}>No listings found. Try adjusting your filters.</div>
                    ) : (
                        <div style={styles.cardsList}>
                            {anunturiSortate.map(anunt => (
                                <Link to={`/listings/${anunt.id}`} key={anunt.id} style={styles.card} className="card-hover rsp-listing-card">
                                    <div style={styles.cardImg} className="rsp-listing-card-img gl-surface">
                                        {imaginiAnunturi[anunt.id] ? (
                                            <img src={imaginiAnunturi[anunt.id]} alt={anunt.titlu} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '36px' }}>🚗</span>
                                        )}
                                    </div>
                                    <div style={styles.cardBody}>
                                        <div style={styles.cardTop}>
                                            <div style={styles.cardTitle}>{anunt.titlu}</div>
                                            <div style={styles.cardPrice}>{Number(anunt.pret).toLocaleString()} €</div>
                                        </div>
                                        <div style={styles.cardSub}>{anunt.an} · {anunt.kilometraj?.toLocaleString()} km · {anunt.transmisie}</div>
                                        <div style={styles.cardTags}>
                                            {anunt.motorizare && <span style={styles.tag}>{anunt.motorizare}</span>}
                                            {anunt.putere && <span style={styles.tag}>{anunt.putere} HP</span>}
                                            {anunt.caroserie && <span style={styles.tag}>{anunt.caroserie}</span>}
                                            {anunt.tractiune && <span style={styles.tag}>{anunt.tractiune}</span>}
                                        </div>
                                        <div style={styles.cardFooter}>
                                            <span style={styles.cardMeta}>Posted by {anunt.nume_utilizator} · {new Date(anunt.creat_la).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh' },
    searchBar: {
        background: 'var(--glass-deep)',
        backdropFilter: 'var(--glass-blur-heavy)', WebkitBackdropFilter: 'var(--glass-blur-heavy)',
        borderBottom: '1px solid var(--border)',
        padding: '10px 20px',
        position: 'sticky',
        top: '52px',
        zIndex: 10,
    },
    searchForm: { display: 'flex', gap: '8px' },
    searchWrap: {
        flex: 1,
        background: 'var(--glass-deep)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border)',
        borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px',
    },
    searchIcon: { fontSize: '14px' },
    searchInput: { flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '13px', padding: '9px 0', outline: 'none', fontFamily: 'inherit' },
    btnSearch: {
        background: 'var(--btn-gradient)',
        color: 'var(--text-primary)', border: 'none', borderRadius: '8px',
        padding: '9px 20px', fontSize: '12px', fontWeight: '500',
        boxShadow: '0 2px 12px rgba(49,75,110,0.4)',
    },
    body: { display: 'flex', minHeight: 'calc(100vh - 120px)', alignItems: 'flex-start' },
    sidebar: {
        width: '185px', minWidth: '185px',
        background: 'var(--glass-deep)',
        backdropFilter: 'var(--glass-blur-heavy)', WebkitBackdropFilter: 'var(--glass-blur-heavy)',
        borderRight: '1px solid var(--border-faint)',
        padding: '16px',
        position: 'sticky',
        top: '106px',
        maxHeight: 'calc(100vh - 106px)',
        overflowY: 'auto',
    },
    filterTitle: { fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' },
    filterGroup: { marginBottom: '14px' },
    filterLabel: { fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' },
    filterSelect: {
        width: '100%',
        background: 'var(--glass-input)',
        border: '1px solid var(--border)',
        borderRadius: '6px', color: 'var(--text-secondary)',
        padding: '5px 7px', fontSize: '11px', fontFamily: 'inherit',
    },
    filterRow: { display: 'flex', gap: '4px' },
    filterInput: {
        width: '100%',
        background: 'var(--glass-input)',
        border: '1px solid var(--border)',
        borderRadius: '6px', color: 'var(--text-primary)',
        padding: '5px 7px', fontSize: '11px', fontFamily: 'inherit', outline: 'none',
    },
    yearError: { fontSize: '10px', color: 'var(--color-error)', marginTop: '4px' },
    btnApply: {
        width: '100%',
        background: 'var(--btn-gradient)',
        color: 'var(--text-primary)', border: 'none', borderRadius: '6px',
        padding: '8px', fontSize: '12px', fontWeight: '500', marginBottom: '6px',
        boxShadow: '0 2px 10px rgba(49,75,110,0.35)',
    },
    btnReset: {
        width: '100%', background: 'transparent',
        color: 'var(--text-muted)',
        border: '1px solid var(--border)',
        borderRadius: '6px', padding: '6px', fontSize: '11px',
    },
    main: { flex: 1, padding: '14px 16px' },
    resultsBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    resultsCount: { fontSize: '13px', color: 'var(--text-secondary)' },
    sortWrap: { display: 'flex', gap: '8px', alignItems: 'center' },
    sortLabel: { fontSize: '11px', color: 'var(--text-muted)' },
    sortSelect: {
        background: 'var(--glass-input)',
        border: '1px solid var(--border)',
        borderRadius: '6px', color: 'var(--text-secondary)',
        padding: '4px 8px', fontSize: '11px', fontFamily: 'inherit',
    },
    loading: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '14px' },
    empty: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '14px' },
    cardsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    card: {
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        borderRadius: '10px', display: 'flex', overflow: 'hidden', textDecoration: 'none',
    },
    cardImg: {
        width: '130px', minWidth: '130px',
        background: 'var(--glass-deep)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    cardBody: { flex: 1, padding: '12px 14px' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' },
    cardTitle: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' },
    cardPrice: { fontSize: '15px', fontWeight: '500', color: 'var(--accent-light)', whiteSpace: 'nowrap', textShadow: '0 0 12px rgba(129,151,172,0.25)' },
    cardSub: { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' },
    cardTags: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' },
    tag: {
        background: 'var(--pill-bg)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        color: 'var(--text-secondary)', fontSize: '10px', padding: '2px 8px',
        borderRadius: '4px', border: '1px solid var(--border)',
    },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    cardMeta: { fontSize: '11px', color: 'var(--text-muted)' },
};

export default Listings;
