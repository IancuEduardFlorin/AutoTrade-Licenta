import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ nume: '', email: '', parola: '', confirmaParola: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.parola !== formData.confirmaParola) {
            setError('Passwords do not match');
            return;
        }

        if (formData.parola.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/register', {
                nume: formData.nume,
                email: formData.email,
                parola: formData.parola,
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.mesaj || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                <div style={styles.header}>
                    <Link to="/" style={styles.logo}>Auto<span style={styles.logoAccent}>Trade</span></Link>
                    <h2 style={styles.title}>Create an account</h2>
                    <p style={styles.subtitle}>Join AutoTrade today</p>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Full name</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="nume"
                            placeholder="John Doe"
                            value={formData.nume}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            name="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            style={styles.input}
                            type="password"
                            name="parola"
                            placeholder="••••••••"
                            value={formData.parola}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Confirm password</label>
                        <input
                            style={styles.input}
                            type="password"
                            name="confirmaParola"
                            placeholder="••••••••"
                            value={formData.confirmaParola}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" style={styles.btnSubmit} disabled={loading}>
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.footerLink}>Sign in</Link>
                </p>

            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '20px',
    },
    card: {
        background: 'var(--bg-card)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-accent)',
        borderRadius: '14px',
        padding: '32px',
        width: '100%',
        maxWidth: '400px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '28px',
    },
    logo: {
        fontSize: '20px',
        fontWeight: '500',
        color: 'var(--text-primary)',
        textDecoration: 'none',
        display: 'block',
        marginBottom: '16px',
    },
    logoAccent: {
        color: 'var(--accent-light)',
    },
    title: {
        fontSize: '20px',
        fontWeight: '500',
        color: 'var(--text-primary)',
        marginBottom: '6px',
    },
    subtitle: {
        fontSize: '13px',
        color: 'var(--text-muted)',
    },
    errorBox: {
        background: '#2a1010',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#5a2020',
        color: '#f08080',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        marginBottom: '16px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '12px',
        color: 'var(--text-secondary)',
        fontWeight: '500',
    },
    input: {
        background: 'var(--bg-navbar)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: 'var(--text-primary)',
        fontSize: '13px',
        outline: 'none',
        fontFamily: 'inherit',
        width: '100%',
        boxSizing: 'border-box',
    },
    btnSubmit: {
        background: 'var(--accent)',
        color: 'var(--text-primary)',
        border: 'none',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '14px',
        fontWeight: '500',
        marginTop: '8px',
    },
    footer: {
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '13px',
        color: 'var(--text-muted)',
    },
    footerLink: {
        color: 'var(--accent-light)',
        textDecoration: 'none',
        fontWeight: '500',
    },
};

export default Register;