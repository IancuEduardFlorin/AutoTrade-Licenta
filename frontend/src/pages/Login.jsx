import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', parola: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/auth/login', formData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/');
            window.location.reload();
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
                    <h2 style={styles.title}>Welcome back</h2>
                    <p style={styles.subtitle}>Sign in to your account</p>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
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

                    <button type="submit" style={styles.btnSubmit} className="btn-primary-glow" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Don't have an account?{' '}
                    <Link to="/register" style={styles.footerLink} className="link-glow">Register</Link>
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
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
        borderRadius: '18px',
        padding: '36px',
        width: '100%',
        maxWidth: '400px',
    },
    header: { textAlign: 'center', marginBottom: '28px' },
    logo: {
        fontSize: '22px',
        fontWeight: '500',
        color: 'var(--text-primary)',
        textDecoration: 'none',
        display: 'block',
        marginBottom: '20px',
    },
    logoAccent: { color: 'var(--accent-light)' },
    title: { fontSize: '20px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' },
    subtitle: { fontSize: '13px', color: 'var(--text-muted)' },
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
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' },
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
    footer: { textAlign: 'center', marginTop: '22px', fontSize: '13px', color: 'var(--text-muted)' },
    footerLink: { color: 'var(--accent-light)', textDecoration: 'none', fontWeight: '500' },
};

export default Login;
