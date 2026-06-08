import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const JUDETE = ['Alba','Arad','Argeș','Bacău','Bihor','Bistrița-Năsăud','Botoșani','Brăila','Brașov','Buzău','Călărași','Cluj','Constanța','Covasna','Dâmbovița','Dolj','Galați','Giurgiu','Gorj','Harghita','Hunedoara','Ialomița','Iași','Ilfov','Maramureș','Mehedinți','Mureș','Neamț','Olt','Prahova','Sălaj','Satu Mare','Sibiu','Suceava','Teleorman','Timiș','Tulcea','Vâlcea','Vaslui','Vrancea','Municipiul București'];

function EditAnunt() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [loading, setLoading] = useState(true);
    const [imaginiExistente, setImaginiExistente] = useState([]);
    const [imaginiNoi, setImaginiNoi] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        titlu: '', descriere: '', pret: '',
        marca: '', model: '', an: '',
        kilometraj: '', motorizare: '', transmisie: '',
        putere: '', tractiune: '', capacitate_cilindrica: '',
        caroserie: '', judet: '', oras: '',
    });

    if (!token) { navigate('/login'); return null; }

    useEffect(() => {
        const fetchAnunt = async () => {
            try {
                const [anuntRes, imaginiRes] = await Promise.all([
                    api.get(`/anunturi/${id}`),
                    api.get(`/anunturi/${id}/imagini`),
                ]);
                const anunt = anuntRes.data;
                if (anunt.user_id !== user?.id && user?.rol !== 'admin') { navigate('/listings'); return; }
                setImaginiExistente(imaginiRes.data);
                setFormData({
                    titlu: anunt.titlu || '', descriere: anunt.descriere || '', pret: anunt.pret || '',
                    marca: anunt.marca || '', model: anunt.model || '', an: anunt.an || '',
                    kilometraj: anunt.kilometraj || '', motorizare: anunt.motorizare || '',
                    transmisie: anunt.transmisie || '', putere: anunt.putere || '',
                    tractiune: anunt.tractiune || '', capacitate_cilindrica: anunt.capacitate_cilindrica || '',
                    caroserie: anunt.caroserie || '', judet: anunt.judet || '', oras: anunt.oras || '',
                });
            } catch (err) {
                console.error(err);
                navigate('/listings');
            } finally {
                setLoading(false);
            }
        };
        fetchAnunt();
    }, [id]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            await api.put(`/anunturi/${id}`, formData);
            if (imaginiExistente.length > 0) {
                await Promise.all(imaginiExistente.map((img, i) =>
                    api.put(`/anunturi/imagini/${img.id}/ordine`, { ordine: i })
                ));
            }
            if (imaginiNoi.length > 0) {
                setUploadProgress(true);
                const fd = new FormData();
                imaginiNoi.forEach(img => fd.append('imagini', img));
                await api.post(`/anunturi/${id}/imagini`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            navigate(`/listings/${id}`);
        } catch (err) {
            setError(err.response?.data?.mesaj || 'Something went wrong');
        } finally {
            setSaving(false);
            setUploadProgress(false);
        }
    };

    const handleStergeImagine = async (imagineId) => {
        if (!window.confirm('Delete this image?')) return;
        try {
            await api.delete(`/anunturi/imagini/${imagineId}`);
            setImaginiExistente(imaginiExistente.filter(img => img.id !== imagineId));
        } catch (err) {
            setError('Could not delete image');
        }
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.page} className="rsp-form-page">
            <div style={styles.container} className="rsp-form-container">
                <div style={styles.header}>
                    <h1 style={styles.title}>Edit listing</h1>
                    <p style={styles.subtitle}>Update the details of your listing</p>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.section} className="gl-panel">
                        <div style={styles.sectionTitle}>Basic information</div>
                        <div style={styles.grid2} className="rsp-grid2">
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Listing title *</label>
                                <input style={styles.input} name="titlu" value={formData.titlu} onChange={handleChange} required />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Price (€) *</label>
                                <input style={styles.input} name="pret" type="number" value={formData.pret} onChange={handleChange} required />
                            </div>
                        </div>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Description</label>
                            <textarea style={styles.textarea} name="descriere" value={formData.descriere} onChange={handleChange} rows={4} />
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
                                <input style={styles.input} name="model" value={formData.model} onChange={handleChange} required />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Year *</label>
                                <input style={styles.input} name="an" type="number" min="1900" max={new Date().getFullYear()} value={formData.an} onChange={handleChange} required />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Mileage (km) *</label>
                                <input style={styles.input} name="kilometraj" type="number" value={formData.kilometraj} onChange={handleChange} required />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Engine</label>
                                <input style={styles.input} name="motorizare" value={formData.motorizare} onChange={handleChange} />
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
                                <input style={styles.input} name="putere" type="number" value={formData.putere} onChange={handleChange} />
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
                                <input style={styles.input} name="capacitate_cilindrica" value={formData.capacitate_cilindrica} onChange={handleChange} />
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
                                    <div key={type.value}
                                        style={{ ...styles.bodyTypeCard, borderColor: formData.caroserie === type.value ? 'var(--border-accent)' : 'var(--border)', background: formData.caroserie === type.value ? 'var(--accent-tint-strong)' : 'var(--bg-card)' }}
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
                        {imaginiExistente.length > 0 && (
                            <div style={styles.existingImgs}>
                                <div style={{ ...styles.label, marginBottom: '8px' }}>Current photos — drag to reorder</div>
                                <div style={styles.previewGrid}>
                                    {imaginiExistente.map((img, i) => (
                                        <div key={img.id} draggable
                                            onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'existing', index: i }))}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => { e.preventDefault(); const data = JSON.parse(e.dataTransfer.getData('text/plain')); if (data.type === 'existing') { const arr = [...imaginiExistente]; const [m] = arr.splice(data.index, 1); arr.splice(i, 0, m); setImaginiExistente(arr); } }}
                                            style={{ ...styles.previewItem, cursor: 'grab' }}
                                        >
                                            <img src={img.url} alt="car" style={styles.previewImg} />
                                            {i === 0 && <div style={styles.mainBadge}>Main</div>}
                                            <button type="button" style={styles.removeImg} onClick={() => handleStergeImagine(img.id)}>✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div style={{ ...styles.uploadArea, marginTop: imaginiExistente.length > 0 ? '16px' : '0' }}>
                            <input type="file" id="imagini-noi" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => setImaginiNoi(Array.from(e.target.files))} />
                            <label htmlFor="imagini-noi" style={styles.uploadLabel}>
                                <div style={{ fontSize: '28px' }}>📷</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Click to add more photos</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max 5 photos · JPG, PNG, WebP · Max 5MB each</div>
                            </label>
                            {imaginiNoi.length > 0 && (
                                <div style={{ marginTop: '16px' }}>
                                    <div style={{ ...styles.label, marginBottom: '8px' }}>New photos — drag to reorder</div>
                                    <div style={styles.previewGrid}>
                                        {imaginiNoi.map((img, i) => (
                                            <div key={i} draggable
                                                onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'new', index: i }))}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => { e.preventDefault(); const data = JSON.parse(e.dataTransfer.getData('text/plain')); if (data.type === 'new') { const arr = [...imaginiNoi]; const [m] = arr.splice(data.index, 1); arr.splice(i, 0, m); setImaginiNoi(arr); } }}
                                                style={{ ...styles.previewItem, cursor: 'grab' }}
                                            >
                                                <img src={URL.createObjectURL(img)} alt={`new ${i}`} style={styles.previewImg} />
                                                {i === 0 && imaginiExistente.length === 0 && <div style={styles.mainBadge}>Main</div>}
                                                <button type="button" style={styles.removeImg} onClick={() => setImaginiNoi(imaginiNoi.filter((_, idx) => idx !== i))}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.formFooter}>
                        <button type="button" style={styles.btnCancel} className="btn-ghost-hover" onClick={() => navigate(`/listings/${id}`)}>Cancel</button>
                        <button type="submit" style={styles.btnSubmit} className="btn-primary-glow" disabled={saving}>
                            {saving ? 'Saving...' : 'Save changes'}
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
    loading: { textAlign: 'center', padding: '60px', color: 'var(--text-muted)' },
    container: { maxWidth: '800px', margin: '0 auto' },
    header: { marginBottom: '24px' },
    title: { fontSize: '22px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' },
    subtitle: { fontSize: '13px', color: 'var(--text-muted)' },
    errorBox: { background: 'var(--color-error-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--color-error-border)', color: 'var(--color-error)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
    section: { ...gc, borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    sectionTitle: { fontSize: '13px', fontWeight: '500', color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '12px' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '12px' },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' },
    input: { background: 'var(--glass-input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' },
    select: { background: 'var(--glass-input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit' },
    textarea: { background: 'var(--glass-input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' },
    bodyTypeGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginTop: '6px' },
    bodyTypeCard: { backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', border: '1px solid', borderRadius: '8px', padding: '10px 6px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
    formFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' },
    btnCancel: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px', padding: '10px 20px', fontSize: '13px' },
    btnSubmit: { background: 'var(--btn-gradient)', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: '500', boxShadow: '0 2px 12px rgba(49,75,110,0.4)' },
    existingImgs: { marginBottom: '12px' },
    uploadArea: { border: '2px dashed var(--border-accent)', borderRadius: '10px', padding: '20px', textAlign: 'center' },
    uploadLabel: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' },
    previewGrid: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px', marginTop: '10px' },
    previewItem: { position: 'relative' },
    previewImg: { width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' },
    removeImg: { position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

export default EditAnunt;
