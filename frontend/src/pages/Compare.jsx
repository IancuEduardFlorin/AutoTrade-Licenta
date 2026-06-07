import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCompareList, removeFromCompare, clearCompare } from '../services/compareService';

const ROWS = [
    { key: 'pret',        label: 'Price',        format: v => v ? `${Number(v).toLocaleString()} €` : '-', best: 'min' },
    { key: 'an',          label: 'Year',          format: v => v || '-',                                    best: 'max' },
    { key: 'kilometraj',  label: 'Mileage',       format: v => v ? `${Number(v).toLocaleString()} km` : '-', best: 'min' },
    { key: 'putere',      label: 'Power',         format: v => v ? `${v} HP` : '-',                        best: 'max' },
    { key: 'motorizare',  label: 'Engine',        format: v => v || '-',                                    best: null },
    { key: 'transmisie',  label: 'Transmission',  format: v => v || '-',                                    best: null },
    { key: 'caroserie',   label: 'Body type',     format: v => v || '-',                                    best: null },
    { key: 'tractiune',   label: 'Traction',      format: v => v || '-',                                    best: null },
];

function getBestIndex(cars, row) {
    if (!row.best) return null;
    const vals = cars.map(c => Number(c[row.key])).filter(v => !isNaN(v) && v > 0);
    if (vals.length < 2) return null;
    const target = row.best === 'min' ? Math.min(...vals) : Math.max(...vals);
    return cars.findIndex(c => Number(c[row.key]) === target);
}

function Compare() {
    const [list, setList] = useState(getCompareList());

    useEffect(() => {
        const sync = () => setList(getCompareList());
        window.addEventListener('compareUpdated', sync);
        return () => window.removeEventListener('compareUpdated', sync);
    }, []);

    if (list.length === 0) {
        return (
            <div style={styles.empty}>
                <div style={styles.emptyIcon}>⚖️</div>
                <div style={styles.emptyTitle}>No cars to compare</div>
                <p style={styles.emptyText}>Add up to 3 cars from the listings page to compare them side by side.</p>
                <Link to="/listings" style={styles.btnGo} className="btn-primary-glow">Browse listings</Link>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.topBar}>
                <h1 style={styles.title}>Car Comparison</h1>
                <div style={styles.topActions}>
                    <Link to="/listings" style={styles.btnAdd} className="btn-ghost-hover">+ Add car</Link>
                    <button style={styles.btnClear} className="btn-ghost-hover" onClick={clearCompare}>Clear all</button>
                </div>
            </div>

            <div style={styles.tableWrap} className="gl-panel">
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.thLabel} />
                            {list.map(car => (
                                <th key={car.id} style={styles.thCar}>
                                    <div style={styles.carHeader}>
                                        <Link to={`/listings/${car.id}`} style={styles.carTitle} className="link-glow">
                                            {car.marca} {car.model}
                                        </Link>
                                        <div style={styles.carYear}>{car.an}</div>
                                        <button style={styles.removeBtn} onClick={() => removeFromCompare(car.id)} title="Remove">✕</button>
                                    </div>
                                </th>
                            ))}
                            {list.length < 3 && (
                                <th style={styles.thEmpty}>
                                    <Link to="/listings" style={styles.addSlot}>
                                        <span style={styles.addIcon}>+</span>
                                        <span style={styles.addLabel}>Add car</span>
                                    </Link>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {ROWS.map(row => {
                            const bestIdx = getBestIndex(list, row);
                            return (
                                <tr key={row.key} style={styles.tr}>
                                    <td style={styles.tdLabel}>{row.label}</td>
                                    {list.map((car, i) => {
                                        const isBest = bestIdx !== null && i === bestIdx;
                                        return (
                                            <td key={car.id} style={{ ...styles.tdVal, ...(isBest ? styles.tdBest : {}) }}>
                                                {row.format(car[row.key])}
                                                {isBest && <span style={styles.bestBadge}>best</span>}
                                            </td>
                                        );
                                    })}
                                    {list.length < 3 && <td style={styles.tdEmpty} />}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const gc = {
    background: 'var(--bg-card)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--border)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
};

const styles = {
    page: { padding: '24px', minHeight: '100vh' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
    title: { fontSize: '20px', fontWeight: '500', color: 'var(--text-primary)' },
    topActions: { display: 'flex', gap: '8px' },
    btnAdd: { background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none' },
    btnClear: { background: 'transparent', border: '1px solid var(--color-error-border)', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: 'var(--color-error)', cursor: 'pointer', fontFamily: 'inherit' },
    tableWrap: { ...gc, borderRadius: '14px', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '480px' },
    thLabel: { width: '130px', minWidth: '110px', padding: '14px 16px', textAlign: 'left', borderBottom: '1px solid var(--border-faint)' },
    thCar: { padding: '14px 16px', borderBottom: '1px solid var(--border-faint)', borderLeft: '1px solid var(--border-faint)', minWidth: '170px' },
    thEmpty: { padding: '14px 16px', borderBottom: '1px solid var(--border-faint)', borderLeft: '1px solid var(--border-faint)', minWidth: '150px' },
    carHeader: { display: 'flex', flexDirection: 'column', gap: '3px', position: 'relative' },
    carTitle: { fontSize: '14px', fontWeight: '500', color: 'var(--accent-light)', textDecoration: 'none', paddingRight: '20px' },
    carYear: { fontSize: '12px', color: 'var(--text-muted)' },
    removeBtn: { position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', padding: 0, lineHeight: 1 },
    addSlot: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-muted)', padding: '8px' },
    addIcon: { fontSize: '24px', lineHeight: 1 },
    addLabel: { fontSize: '11px' },
    tr: { borderBottom: '1px solid var(--border-faint)' },
    tdLabel: { padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.4px' },
    tdVal: { padding: '12px 16px', fontSize: '14px', color: 'var(--text-primary)', borderLeft: '1px solid var(--border-faint)', position: 'relative' },
    tdBest: { background: 'var(--color-success-bg)', color: 'var(--color-online)' },
    tdEmpty: { borderLeft: '1px solid var(--border-faint)' },
    bestBadge: { position: 'absolute', top: '6px', right: '8px', background: 'var(--color-online)', color: '#fff', fontSize: '9px', fontWeight: '600', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' },
    empty: { minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px', textAlign: 'center' },
    emptyIcon: { fontSize: '56px' },
    emptyTitle: { fontSize: '20px', fontWeight: '500', color: 'var(--text-primary)' },
    emptyText: { fontSize: '14px', color: 'var(--text-muted)', maxWidth: '360px', lineHeight: 1.6 },
    btnGo: { background: 'var(--btn-gradient)', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: '500', textDecoration: 'none', boxShadow: '0 2px 12px rgba(49,75,110,0.4)', marginTop: '4px' },
};

export default Compare;
