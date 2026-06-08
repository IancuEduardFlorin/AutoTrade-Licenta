import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const JUDETE = ['Alba','Arad','Argeș','Bacău','Bihor','Bistrița-Năsăud','Botoșani','Brăila','Brașov','Buzău','Călărași','Cluj','Constanța','Covasna','Dâmbovița','Dolj','Galați','Giurgiu','Gorj','Harghita','Hunedoara','Ialomița','Iași','Ilfov','Maramureș','Mehedinți','Mureș','Neamț','Olt','Prahova','Sălaj','Satu Mare','Sibiu','Suceava','Teleorman','Timiș','Tulcea','Vâlcea','Vaslui','Vrancea','Municipiul București'];

function PostAnunt() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [aiText, setAiText] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [descLoading, setDescLoading] = useState(false);
    const [spamWarning, setSpamWarning] = useState('');
    const [imagini, setImagini] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(false);
    const [formData, setFormData] = useState({
        titlu: '', descriere: '', pret: '',
        marca: '', model: '', an: '',
        kilometraj: '', motorizare: '', transmisie: '',
        putere: '', tractiune: '', capacitate_cilindrica: '',
        caroserie: '', judet: '', oras: '',
    });

    if (!token) { navigate('/login'); return null; }

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleAutofill = async () => {
        if (!aiText.trim()) return;
        setAiLoading(true);
        setError('');
        try {
            const response = await api.post('/ai/completeaza', { text: aiText });
            const data = response.data;
            const campuriCompletate = Object.values(data).filter(v => v !== null && v !== '').length;
            if (campuriCompletate === 0) {
                setError('AI could not extract any details. Try adding more information like brand, model, year or price.');
                return;
            }
            setFormData(prev => ({
                ...prev,
                titlu: data.titlu || prev.titlu,
                marca: data.marca || prev.marca,
                model: data.model || prev.model,
                an: data.an || prev.an,
                kilometraj: data.kilometraj || prev.kilometraj,
                motorizare: data.motorizare || prev.motorizare,
                transmisie: data.transmisie || prev.transmisie,
                putere: data.putere || prev.putere,
                tractiune: data.tractiune || prev.tractiune,
                caroserie: data.caroserie || prev.caroserie,
                capacitate_cilindrica: data.capacitate_cilindrica || prev.capacitate_cilindrica,
                pret: data.pret || prev.pret,
            }));
        } catch (err) {
            const status = err.response?.status;
            if (status === 429) setError('AI is busy right now. Please wait a few seconds and try again.');
            else if (status === 500) setError('AI could not understand the input. Try rephrasing.');
            else setError('AI autofill failed. Please try again.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleGenerateDesc = async () => {
        setDescLoading(true);
        try {
            const response = await api.post('/ai/descriere', formData);
            setFormData(prev => ({ ...prev, descriere: response.data.descriere }));
        } catch (err) {
            setError('AI description generation failed. Please try again.');
        } finally {
            setDescLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSpamWarning('');
        setLoading(true);
        try {
            const spamRes = await api.post('/ai/spam', { titlu: formData.titlu, descriere: formData.descriere });
            if (spamRes.data.isSpam && spamRes.data.confidence > 70) {
                setSpamWarning(`⚠️ This listing was flagged as potential spam (${spamRes.data.confidence}% confidence): ${spamRes.data.reason}`);
                setLoading(false);
                return;
            }
            const anuntRes = await api.post('/anunturi', formData);
            const newAnuntId = anuntRes.data.id;
            if (imagini.length > 0) {
                setUploadProgress(true);
                const formDataImagini = new FormData();
                imagini.forEach(img => formDataImagini.append('imagini', img));
                await api.post(`/anunturi/${newAnuntId}/imagini`, formDataImagini, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            navigate('/listings');
        } catch (err) {
            setError(err.response?.data?.mesaj || 'Something went wrong');
        } finally {
            setLoading(false);
            setUploadProgress(false);
        }
    };

    return (
        <div style={styles.page} className="rsp-form-page">
            <div style={styles.container} className="rsp-form-container">
                <div style={styles.header}>
                    <h1 style={styles.title}>Post a new listing</h1>
                    <p style={styles.subtitle}>Fill in the details about your car</p>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}
                {spamWarning && <div style={styles.spamBox}>{spamWarning}</div>}

                <div style={styles.aiSection} className="gl-panel">
                    <div style={styles.aiHeader}>
                        <div style={styles.aiIconBox} className="gl-icon">✨</div>
                        <div>
                            <div style={styles.aiTitle}>AI Autofill</div>
                            <div style={styles.aiDesc}>Describe your car in plain language and AI will fill in the fields automatically</div>
                        </div>
                    </div>
                    <div style={styles.aiInputRow} className="rsp-ai-input-row">
                        <input
                            style={styles.aiInput}
                            placeholder='e.g. "2018 Volkswagen Golf 7, 1.6 TDI, manual, 85000 km, 115 HP, asking 12000 euros"'
                            value={aiText}
                            onChange={(e) => setAiText(e.target.value)}
                        />
                        <button type="button" style={styles.btnAi} className="btn-primary-glow" onClick={handleAutofill} disabled={aiLoading || !aiText.trim()}>
                            {aiLoading ? 'Filling...' : '✨ Autofill'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={styles.section} className="gl-panel">
                        <div style={styles.sectionTitle}>Basic information</div>
                        <div style={styles.grid2} className="rsp-grid2">
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Listing title *</label>
                                <input style={styles.input} name="titlu" placeholder="e.g. Volkswagen Golf 7 2018" value={formData.titlu} onChange={handleChange} required />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Price (€) *</label>
                                <input style={styles.input} name="pret" type="number" placeholder="e.g. 12000" value={formData.pret} onChange={handleChange} required />
                            </div>
                        </div>
                        <div style={styles.fieldGroup}>
                            <div style={styles.labelRow}>
                                <label style={styles.label}>Description</label>
                                <button type="button" style={styles.btnGenDesc} className="btn-ghost-hover" onClick={handleGenerateDesc} disabled={descLoading}>
                                    {descLoading ? 'Generating...' : '✨ Generate with AI'}
                                </button>
                            </div>
                            <textarea style={styles.textarea} name="descriere" placeholder="Describe the car's condition, history, extras..." value={formData.descriere} onChange={handleChange} rows={4} />
                        </div>
                    </div>

                    <div style={styles.section} className="gl-panel">
                        <div style={styles.sectionTitle}>Car details</div>
                        <div style={styles.grid3} className="rsp-grid3">
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Brand *</label>
                                <select style={styles.select} name="marca" value={formData.marca} onChange={handleChange} required>
                                    <option value="">Select brand</option>
                                    {['Alfa Romeo','Audi','BMW','Chevrolet','Chrysler','Citroën','Dacia','Fiat','Ford','Honda','Hyundai','Jeep','Kia','Lexus','Mazda','Mercedes','Mitsubishi','Nissan','Opel','Peugeot','Porsche','Renault','Seat','Skoda','Subaru','Suzuki','Toyota','Volkswagen','Volvo'].map(m => <option key={m} value={m}>{m}</option>)}
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Model *</label>
                                <input style={styles.input} name="model" placeholder="e.g. Golf 7" value={formData.model} onChange={handleChange} required />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Year *</label>
                                <input style={styles.input} name="an" type="number" placeholder="e.g. 2018" min="1900" max={new Date().getFullYear()} value={formData.an} onChange={handleChange} required />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Mileage (km) *</label>
                                <input style={styles.input} name="kilometraj" type="number" placeholder="e.g. 85000" value={formData.kilometraj} onChange={handleChange} required />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Engine</label>
                                <input style={styles.input} name="motorizare" placeholder="e.g. 1.6 TDI" value={formData.motorizare} onChange={handleChange} />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Transmission</label>
                                <select style={styles.select} name="transmisie" value={formData.transmisie} onChange={handleChange}>
                                    <option value="">Select</option>
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
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Power (HP)</label>
                                <input style={styles.input} name="putere" type="number" placeholder="e.g. 115" value={formData.putere} onChange={handleChange} />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Traction</label>
                                <select style={styles.select} name="tractiune" value={formData.tractiune} onChange={handleChange}>
                                    <option value="">Select</option>
                                    <option value="FWD">FWD</option>
                                    <option value="RWD">RWD</option>
                                    <option value="AWD">AWD</option>
                                    <option value="4x4">4x4</option>
                                </select>
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Displacement</label>
                                <input style={styles.input} name="capacitate_cilindrica" placeholder="e.g. 1598cc" value={formData.capacitate_cilindrica} onChange={handleChange} />
                            </div>
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Body type</label>
                            <div style={styles.bodyTypeGrid} className="rsp-body-type-grid">
                                {[
                                    { value: 'Small car', label: 'Small car', emoji: '🚗' },
                                    { value: 'Off-road/SUV', label: 'SUV / Off-road', emoji: '🚙' },
                                    { value: 'Limousine', label: 'Limousine', emoji: '🚘' },
                                    { value: 'Sports car/Coupe', label: 'Sports car', emoji: '🏎️' },
                                    { value: 'Van/Minibus', label: 'Van / Minibus', emoji: '🚐' },
                                    { value: 'Convertible/Roadster', label: 'Convertible', emoji: '🚗' },
                                    { value: 'Combination', label: 'Combination', emoji: '🚗' },
                                    { value: 'Other', label: 'Other', emoji: '🚗' },
                                ].map(type => (
                                    <div
                                        key={type.value}
                                        style={{
                                            ...styles.bodyTypeCard,
                                            borderColor: formData.caroserie === type.value ? 'var(--border-accent)' : 'var(--border)',
                                            background: formData.caroserie === type.value ? 'var(--accent-tint-strong)' : 'var(--bg-card)',
                                        }}
                                    className="card-hover"
                                        onClick={() => setFormData({ ...formData, caroserie: type.value })}
                                    >
                                        <span style={{ fontSize: '20px' }}>{type.emoji}</span>
                                        <span style={{ fontSize: '10px', color: formData.caroserie === type.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{type.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={styles.section} className="gl-panel">
                        <div style={styles.sectionTitle}>Location</div>
                        <div style={styles.grid2} className="rsp-grid2">
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>County (Județ)</label>
                                <select style={styles.select} name="judet" value={formData.judet} onChange={handleChange}>
                                    <option value="">Select county</option>
                                    {JUDETE.map(j => <option key={j} value={j}>{j}</option>)}
                                </select>
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>City (Oraș)</label>
                                <input style={styles.input} name="oras" placeholder="e.g. Cluj-Napoca" value={formData.oras} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div style={styles.section} className="gl-panel">
                        <div style={styles.sectionTitle}>Photos</div>
                        <div style={styles.uploadArea}>
                            <input type="file" id="imagini" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => setImagini(Array.from(e.target.files))} />
                            <label htmlFor="imagini" style={styles.uploadLabel}>
                                <div style={{ fontSize: '32px' }}>📷</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Click to add photos</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max 5 photos · JPG, PNG, WebP · Max 5MB each</div>
                            </label>
                            {imagini.length > 0 && (
                                <div style={styles.previewGrid}>
                                    {imagini.map((img, i) => (
                                        <div key={i} draggable
                                            onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => { e.preventDefault(); const from = parseInt(e.dataTransfer.getData('text/plain')); const arr = [...imagini]; const [m] = arr.splice(from, 1); arr.splice(i, 0, m); setImagini(arr); }}
                                            style={{ ...styles.previewItem, cursor: 'grab' }}
                                        >
                                            <img src={URL.createObjectURL(img)} alt={`preview ${i}`} style={styles.previewImg} />
                                            {i === 0 && <div style={styles.mainBadge}>Main</div>}
                                            <button type="button" style={styles.removeImg} onClick={() => setImagini(imagini.filter((_, idx) => idx !== i))}>✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.formFooter}>
                        <button type="button" style={styles.btnCancel} className="btn-ghost-hover" onClick={() => navigate('/listings')}>Cancel</button>
                        <button type="submit" style={styles.btnSubmit} className="btn-primary-glow" disabled={loading}>
                            {loading ? (uploadProgress ? 'Uploading photos...' : 'Checking & posting...') : 'Post listing'}
                        </button>
                    </div>
                </form>
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
    mainBadge: { position: 'absolute', bottom: '4px', left: '4px', background: 'var(--accent)', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' },
    page: { minHeight: '100vh', padding: '24px' },
    container: { maxWidth: '800px', margin: '0 auto' },
    header: { marginBottom: '24px' },
    title: { fontSize: '22px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' },
    subtitle: { fontSize: '13px', color: 'var(--text-muted)' },
    errorBox: { background: 'var(--color-error-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--color-error-border)', color: 'var(--color-error)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
    spamBox: { background: 'var(--color-warning-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--color-warning-border)', color: 'var(--color-warning)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
    aiSection: {
        ...gc,
        border: '1px solid var(--border-accent)',
        borderRadius: '12px', padding: '16px 18px', marginBottom: '16px',
    },
    aiHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
    aiIconBox: {
        width: '36px', height: '36px',
        background: 'var(--accent-tint)',
        border: '1px solid var(--border)',
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0,
    },
    aiTitle: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2px' },
    aiDesc: { fontSize: '11px', color: 'var(--text-muted)' },
    aiInputRow: { display: 'flex', gap: '8px' },
    aiInput: { flex: 1, background: 'var(--glass-input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit' },
    btnAi: { background: 'var(--btn-gradient)', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(49,75,110,0.4)' },
    section: { ...gc, borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    sectionTitle: { fontSize: '13px', fontWeight: '500', color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '12px' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '12px' },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' },
    btnGenDesc: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--accent-light)', borderRadius: '6px', padding: '3px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' },
    input: { background: 'var(--glass-input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' },
    select: { background: 'var(--glass-input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit' },
    textarea: { background: 'var(--glass-input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' },
    bodyTypeGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginTop: '6px' },
    bodyTypeCard: {
        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid', borderRadius: '8px', padding: '10px 6px',
        textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    },
    formFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', marginBottom: '24px' },
    btnCancel: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px', padding: '10px 20px', fontSize: '13px' },
    btnSubmit: { background: 'var(--btn-gradient)', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: '500', boxShadow: '0 2px 12px rgba(49,75,110,0.4)' },
    uploadArea: { border: '2px dashed var(--border-accent)', borderRadius: '10px', padding: '20px', textAlign: 'center' },
    uploadLabel: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' },
    previewGrid: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px', marginTop: '16px' },
    previewItem: { position: 'relative' },
    previewImg: { width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' },
    removeImg: { position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

export default PostAnunt;
