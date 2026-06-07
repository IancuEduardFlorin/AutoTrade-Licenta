import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { socket } from '../services/socket';

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [active, setActive] = useState('home');
    const [mobileOpen, setMobileOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const { theme, toggle } = useTheme();

    const handleLogout = () => {
        if (user?.id) {
            console.log('[Navbar] Emitting user_offline, userId:', user.id);
            socket.emit('user_offline', user.id);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload();
    };

    const close = () => setMobileOpen(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) setMobileOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <nav style={styles.navbar} className="glass-navbar">
                <Link to="/" style={styles.logo} className="logo-hover" onClick={() => { setActive('home'); close(); }}>
                    Auto<span style={styles.logoAccent} className="logo-accent">Trade</span>
                </Link>

                <div style={styles.navCenter} className="rsp-nav-center">
                    <Link to="/" style={{ ...styles.pill, ...(active === 'home' ? styles.pillActive : {}) }} className="pill-hover" onClick={() => setActive('home')}>Home</Link>
                    <Link to="/listings" style={{ ...styles.pill, ...(active === 'listings' ? styles.pillActive : {}) }} className="pill-hover" onClick={() => setActive('listings')}>Listings</Link>
                    {token && (
                        <Link to="/listings/new" style={{ ...styles.pill, ...(active === 'post' ? styles.pillActive : {}) }} className="pill-hover" onClick={() => setActive('post')}>Post an ad</Link>
                    )}
                    <Link to="/news" style={{ ...styles.pill, ...(active === 'news' ? styles.pillActive : {}) }} className="pill-hover" onClick={() => setActive('news')}>News</Link>
                    <Link to="/estimeaza-pret" style={{ ...styles.pill, ...(active === 'estimator' ? styles.pillActive : {}) }} className="pill-hover" onClick={() => setActive('estimator')}>Price AI</Link>
                </div>

                <div style={styles.navActions} className="rsp-nav-actions">
                    {token ? (
                        <>
                            <Link to="/profile" style={styles.btnSignin} className="pill-hover">Profile</Link>
                            {user?.rol === 'admin' && (
                                <Link to="/admin" style={{ ...styles.pill, ...(active === 'admin' ? styles.pillActive : {}) }} className="pill-hover" onClick={() => setActive('admin')}>Admin</Link>
                            )}
                            <Link to="/chat" style={styles.btnSignin} className="pill-hover">💬</Link>
                            <button style={styles.btnPost} className="btn-primary-glow" onClick={handleLogout}>Sign out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.btnSignin} className="pill-hover">Sign in</Link>
                            <Link to="/register" style={styles.btnPost} className="btn-primary-glow">Register</Link>
                        </>
                    )}
                    <button style={styles.themeToggle} className="pill-hover" onClick={toggle} title="Toggle theme">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>

                <button className="nav-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
                    {mobileOpen ? '✕' : '☰'}
                </button>
            </nav>

            <div className={`nav-mobile-drawer${mobileOpen ? ' open' : ''}`}>
                <Link to="/" style={styles.drawerLink} className="pill-hover" onClick={() => { setActive('home'); close(); }}>🏠 Home</Link>
                <Link to="/listings" style={styles.drawerLink} className="pill-hover" onClick={() => { setActive('listings'); close(); }}>🚗 Listings</Link>
                <Link to="/news" style={styles.drawerLink} className="pill-hover" onClick={() => { setActive('news'); close(); }}>📰 News</Link>
                <Link to="/estimeaza-pret" style={styles.drawerLink} className="pill-hover" onClick={() => { setActive('estimator'); close(); }}>💰 Price AI</Link>
                <div className="nav-mobile-divider" />
                {token ? (
                    <>
                        <Link to="/listings/new" style={styles.drawerLink} className="pill-hover" onClick={close}>➕ Post an ad</Link>
                        <Link to="/profile" style={styles.drawerLink} className="pill-hover" onClick={close}>👤 Profile</Link>
                        <Link to="/chat" style={styles.drawerLink} className="pill-hover" onClick={close}>💬 Messages</Link>
                        {user?.rol === 'admin' && (
                            <Link to="/admin" style={styles.drawerLink} className="pill-hover" onClick={close}>⚙️ Admin</Link>
                        )}
                        <div className="nav-mobile-divider" />
                        <button style={styles.drawerBtn} className="btn-primary-glow" onClick={() => { handleLogout(); close(); }}>Sign out</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.drawerLink} className="pill-hover" onClick={close}>Sign in</Link>
                        <Link to="/register" style={{ ...styles.drawerLink, ...styles.drawerRegister }} className="btn-primary-glow" onClick={close}>Register</Link>
                    </>
                )}
                <div className="nav-mobile-divider" />
                <button style={styles.drawerTheme} onClick={toggle}>
                    {theme === 'dark' ? '☀️  Switch to light mode' : '🌙  Switch to dark mode'}
                </button>
            </div>
        </>
    );
}

const styles = {
    navbar: {
        background: 'var(--glass-deep)',
        backdropFilter: 'var(--glass-blur-heavy)',
        WebkitBackdropFilter: 'var(--glass-blur-heavy)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
    },
    logo: {
        fontSize: '17px',
        fontWeight: '500',
        color: 'var(--text-primary)',
        textDecoration: 'none',
    },
    logoAccent: {
        color: 'var(--accent-light)',
    },
    navCenter: { display: 'flex', gap: '6px' },
    pill: {
        background: 'var(--pill-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
        fontSize: '12px',
        padding: '5px 14px',
        borderRadius: '20px',
        textDecoration: 'none',
        transition: 'all 0.15s',
    },
    pillActive: {
        background: 'var(--accent-tint-strong)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        color: 'var(--text-primary)',
        borderColor: 'var(--border-accent)',
        fontWeight: '500',
    },
    navActions: { display: 'flex', gap: '8px', alignItems: 'center' },
    btnSignin: {
        background: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        padding: '5px 13px',
        borderRadius: '20px',
        fontSize: '12px',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
    },
    btnPost: {
        background: 'var(--btn-gradient)',
        border: 'none',
        color: 'var(--text-primary)',
        padding: '5px 14px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        boxShadow: '0 2px 12px rgba(49, 75, 110, 0.4)',
    },
    themeToggle: {
        background: 'var(--pill-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        padding: '5px 10px',
        borderRadius: '20px',
        fontSize: '15px',
        lineHeight: 1,
    },
    drawerLink: {
        color: 'var(--text-primary)',
        textDecoration: 'none',
        fontSize: '14px',
        padding: '11px 16px',
        borderRadius: '10px',
        background: 'transparent',
        border: '1px solid var(--border-faint)',
        display: 'block',
    },
    drawerBtn: {
        background: 'var(--btn-gradient)',
        color: 'var(--text-primary)',
        border: 'none',
        padding: '11px 16px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    drawerRegister: {
        background: 'var(--accent-tint)',
        textAlign: 'center',
        fontWeight: '500',
    },
    drawerTheme: {
        background: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
        padding: '11px 16px',
        borderRadius: '10px',
        fontSize: '14px',
        fontFamily: 'inherit',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
    },
};

export default Navbar;
