import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function EditAnunt() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        titlu: '', descriere: '', pret: '',
        marca: '', model: '', an: '',
        kilometraj: '', motorizare: '', transmisie: '',
        putere: '', tractiune: '', capacitate_cilindrica: '',
        caroserie: '',
    });

    if (!token) {
        navigate('/login');
        return null;
    }

    useEffect(() => {
        const fetchAnunt = async () => {
            try {
                const response = await api.get(`/anunturi/${id}`);
                const anunt = response.data;

                // Verificam daca userul e proprietarul sau admin
                if (anunt.user_id !== user?.id && user?.rol !== 'admin') {
                    navigate('/listings');
                    return;
                }

                setFormData({
                    titlu: anunt.titlu || '',
                    descriere: anunt.descriere || '',
                    pret: anunt.pret || '',
                    marca: anunt.marca || '',
                    model: anunt.model || '',
                    an: anunt.an || '',
                    kilometraj: anunt.kilometraj || '',
                    motorizare: anunt.motorizare || '',
                    transmisie: anunt.transmisie || '',
                    putere: anunt.putere || '',
                    tractiune: anunt.tractiune || '',
                    capacitate_cilindrica: anunt.capacitate_cilindrica || '',
                    caroserie: anunt.caroserie || '',
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            await api.put(`/anunturi/${id}`, formData);
            navigate(`/listings/${id}`);
        } catch (err) {
            setError(err.response?.data?.mesaj || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Edit listing</h1>
                    <p style={styles.subtitle}>Update the details of your listing</p>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit}>

                    {/* Informatii de baza */}
                    <div style={styles.section}>
                        <div style={styles.sectionTitle}>Basic information</div>
                        <div style={styles.grid2}>
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

                    {/* Detalii masina */}
                    <div style={styles.section}>
                        <div style={styles.sectionTitle}>Car details</div>
                        <div style={styles.grid3}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Brand *</label>
                                <select style={styles.select} name="marca" value={formData.marca} onChange={handleChange} required>
                                    <option value="">Select brand</option>
                                    {['Alfa Romeo','Audi','BMW','Chevrolet','Chrysler','Citroën','Dacia','Fiat','Ford','Honda','Hyundai','Jeep','Kia','Lexus','Mazda','Mercedes','Mitsubishi','Nissan','Opel','Peugeot','Porsche','Renault','Seat','Skoda','Subaru','Suzuki','Toyota','Volkswagen','Volvo'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
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
                            <div style={styles.bodyTypeGrid}>
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
                                            borderColor: formData.caroserie === type.value ? 'var(--accent-light)' : 'var(--border)',
                                            background: formData.caroserie === type.value ? 'var(--accent)' : 'var(--bg-card)',
                                        }}
                                        onClick={() => setFormData({ ...formData, caroserie: type.value })}
                                    >
                                        <span style={{fontSize: '20px'}}>{type.emoji}</span>
                                        <span style={{fontSize: '10px', color: formData.caroserie === type.value ? 'var(--text-primary)' : 'var(--text-secondary)'}}>{type.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={styles.formFooter}>
                        <button type="button" style={styles.btnCancel} onClick={() => navigate(`/listings/${id}`)}>Cancel</button>
                        <button type="submit" style={styles.btnSubmit} disabled={saving}>
                            {saving ? 'Saving...' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', padding: '24px', background: 'var(--bg-primary)' },
    loading: { textAlign: 'center', padding: '60px', color: 'var(--text-muted)' },
    container: { maxWidth: '800px', margin: '0 auto' },
    header: { marginBottom: '24px' },
    title: { fontSize: '22px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' },
    subtitle: { fontSize: '13px', color: 'var(--text-muted)' },
    errorBox: { background: '#2a1010', borderWidth: '1px', borderStyle: 'solid', borderColor: '#5a2020', color: '#f08080', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
    section: { background: 'var(--bg-card)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    sectionTitle: { fontSize: '13px', fontWeight: '500', color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '12px' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '12px' },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' },
    input: { background: 'var(--bg-navbar)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' },
    select: { background: 'var(--bg-navbar)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit' },
    textarea: { background: 'var(--bg-navbar)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' },
    bodyTypeGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginTop: '6px' },
    bodyTypeCard: { borderWidth: '1px', borderStyle: 'solid', borderRadius: '8px', padding: '10px 6px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
    formFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' },
    btnCancel: { background: 'transparent', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', color: 'var(--text-muted)', borderRadius: '8px', padding: '10px 20px', fontSize: '13px' },
    btnSubmit: { background: 'var(--accent)', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: '500' },
};

export default EditAnunt;