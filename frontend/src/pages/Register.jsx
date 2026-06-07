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
        <div style={styles.page} className="rsp-auth-page">
            <div style={styles.card} className="rsp-auth-card">
                <div style={styles.header}>
                    <Link to="/" style={styles.logo}>
                        Auto<span style={styles.logoAccent}>Trade</span>
                    </Link>
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

                    <button type="submit" style={styles.btnSubmit} className="btn-primary-glow" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.footerLink} className="link-glow">Sign in</Link>
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
        padding: '20px',
    },
    card: {
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur-heavy)',
        WebkitBackdropFilter: 'var(--glass-blur-heavy)',
        border: '1px solid var(--border)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        borderRadius: '18px',
        padding: '36px',
        width: '100%',
        maxWidth: '400px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '28px',
    },
    logo: {
        fontSize: '22px',
        fontWeight: '500',
        color: 'var(--text-primary)',
        textDecoration: 'none',
        display: 'block',
        marginBottom: '20px',
    },
    logoAccent: {
        color: 'var(--accent-light)',
        textShadow: '0 0 20px rgba(129, 151, 172, 0.4)',
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
        background: 'var(--color-error-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--color-error-border)',
        color: 'var(--color-error)',
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
        background: 'var(--glass-input)',
        border: '1px solid var(--border)',
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
        background: 'var(--btn-gradient)',
        color: 'var(--text-primary)',
        border: 'none',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '14px',
        fontWeight: '500',
        marginTop: '8px',
        boxShadow: '0 4px 16px rgba(49, 75, 110, 0.45)',
    },
    footer: {
        textAlign: 'center',
        marginTop: '22px',
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
