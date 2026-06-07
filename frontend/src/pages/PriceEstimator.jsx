import { useState } from 'react';
import api from '../services/api';

const MARCI = ['Alfa Romeo','Audi','BMW','Chevrolet','Citroën','Dacia','Fiat','Ford','Honda','Hyundai','Jeep','Kia','Lexus','Mazda','Mercedes','Mitsubishi','Nissan','Opel','Peugeot','Porsche','Renault','Seat','Skoda','Subaru','Suzuki','Toyota','Volkswagen','Volvo'];

const EVAL_COLORS = {
    fair: 'var(--color-online)',
    overpriced: 'var(--color-error)',
    underpriced: '#e8a838',
    'no price to compare': 'var(--text-muted)',
};

const EVAL_LABELS = {
    fair: '✅ Fair price',
    overpriced: '⚠️ Overpriced',
    underpriced: '🔥 Underpriced',
    'no price to compare': '📊 Market estimate',
};

function PriceEstimator() {
    const [form, setForm] = useState({ marca: '', model: '', an: '', km: '', pret: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.marca || !form.model || !form.an || !form.km) {
            setError('Please fill in brand, model, year and mileage.');
            return;
        }
        setError('');
        setLoading(true);
        setResult(null);
        try {
            const res = await api.post('/ai/estimeaza-pret', {
                marca: form.marca, model: form.model,
                an: parseInt(form.an), km: parseInt(form.km),
                pret: form.pret ? parseInt(form.pret) : null,
            });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.mesaj || 'Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <div style={styles.icon}>💰</div>
                    <h1 style={styles.title}>AI Price Estimator</h1>
                    <p style={styles.subtitle}>Get an instant AI-powered price estimate for any car in the Romanian market</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.card} className="gl-panel">
                    <div style={styles.grid}>
                        <div style={styles.field}>
                            <label style={styles.label}>Brand *</label>
                            <select name="marca" value={form.marca} onChange={handleChange} style={styles.input}>
                                <option value="">Select brand</option>
                                {MARCI.map(m => <option key={m} value={m}>{m}</option>)}
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Model *</label>
                            <input name="model" value={form.model} onChange={handleChange} placeholder="e.g. Golf, Series 3, Duster" style={styles.input} />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Year *</label>
                            <input name="an" value={form.an} onChange={handleChange} placeholder="e.g. 2018" maxLength={4} style={styles.input} />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Mileage (km) *</label>
                            <input name="km" value={form.km} onChange={handleChange} placeholder="e.g. 80000" style={styles.input} />
                        </div>

                        <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                            <label style={styles.label}>Listed price (€) — optional</label>
                            <input name="pret" value={form.pret} onChange={handleChange} placeholder="Leave empty for pure estimate" style={styles.input} />
                        </div>
                    </div>

                    {error && <div style={styles.error}>{error}</div>}

                    <button type="submit" disabled={loading} style={styles.btnSubmit} className="btn-primary-glow">
                        {loading ? '⏳ AI is estimating...' : '🤖 Estimate price'}
                    </button>
                </form>

                {result && (
                    <div style={styles.result} className="gl-panel">
                        <div style={styles.resultTop}>
                            <div style={styles.resultMain}>
                                <div style={styles.resultLabel}>Estimated fair price</div>
                                <div style={styles.resultPrice}>{result.pretEstimat?.toLocaleString()} €</div>
                                <div style={styles.resultRange}>
                                    Range: {result.intervalMin?.toLocaleString()} – {result.intervalMax?.toLocaleString()} €
                                </div>
                            </div>

                            {result.evaluare && result.evaluare !== 'no price to compare' && (
                                <div style={{ ...styles.evalBadge, color: EVAL_COLORS[result.evaluare] || 'var(--text-muted)', borderColor: EVAL_COLORS[result.evaluare] || 'var(--border)' }}>
                                    {EVAL_LABELS[result.evaluare] || result.evaluare}
                                </div>
                            )}
                        </div>

                        <div style={styles.divider} />

                        <p style={styles.explanation}>{result.explicatie}</p>

                        {result.sfaturi?.length > 0 && (
                            <div style={styles.tipsSection}>
                                <div style={styles.tipsTitle}>💡 Tips</div>
                                {result.sfaturi.map((tip, i) => (
                                    <div key={i} style={styles.tip}>• {tip}</div>
                                ))}
                            </div>
                        )}
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
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
};

const styles = {
    page: { minHeight: '100vh', padding: '32px 20px', display: 'flex', justifyContent: 'center' },
    container: { width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '24px' },
    header: { textAlign: 'center' },
    icon: { fontSize: '48px', marginBottom: '12px' },
    title: { fontSize: '24px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' },
    subtitle: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 },
    card: { ...gc, borderRadius: '14px', padding: '24px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: {
        background: 'var(--glass-input)', border: '1px solid var(--border)',
        borderRadius: '8px', color: 'var(--text-primary)', padding: '9px 12px',
        fontSize: '13px', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
    },
    error: { color: 'var(--color-error)', fontSize: '12px', marginBottom: '10px' },
    btnSubmit: {
        width: '100%', background: 'var(--btn-gradient)', color: 'var(--text-primary)',
        border: 'none', borderRadius: '8px', padding: '12px',
        fontSize: '14px', fontWeight: '500', boxShadow: '0 2px 12px rgba(49,75,110,0.4)',
    },
    result: { ...gc, borderRadius: '14px', padding: '24px' },
    resultTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' },
    resultMain: {},
    resultLabel: { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' },
    resultPrice: { fontSize: '32px', fontWeight: '500', color: 'var(--accent-light)', textShadow: '0 0 20px rgba(129,151,172,0.3)' },
    resultRange: { fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' },
    evalBadge: {
        border: '1px solid', borderRadius: '8px', padding: '8px 14px',
        fontSize: '14px', fontWeight: '500',
    },
    divider: { height: '1px', background: 'var(--border-faint)', margin: '16px 0' },
    explanation: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 },
    tipsSection: { marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' },
    tipsTitle: { fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
    tip: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 },
};

export default PriceEstimator;
