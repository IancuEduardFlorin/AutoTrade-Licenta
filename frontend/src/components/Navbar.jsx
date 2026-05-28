import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [active, setActive] = useState('home');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload();
    };

    return (
        <nav style={styles.navbar}>
            <Link to="/" style={styles.logo} onClick={() => setActive('home')}>
                Auto<span style={styles.logoAccent}>Trade</span>
            </Link>

            <div style={styles.navCenter}>
                <Link to="/" style={{...styles.pill, ...(active === 'home' ? styles.pillActive : {})}} onClick={() => setActive('home')}>Home</Link>
                <Link to="/listings" style={{...styles.pill, ...(active === 'listings' ? styles.pillActive : {})}} onClick={() => setActive('listings')}>Listings</Link>
                {token && (
                    <Link to="/listings/new" style={{...styles.pill, ...(active === 'post' ? styles.pillActive : {})}} onClick={() => setActive('post')}>Post an ad</Link>
                )}
                <Link to="/listings" style={{...styles.pill, ...(active === 'news' ? styles.pillActive : {})}} onClick={() => setActive('news')}>News</Link>
            </div>

            <div style={styles.navActions}>
                {token ? (
                    <>
                        <Link to="/profile" style={styles.btnSignin}>Profile</Link>
                        {token && user?.rol === 'admin' && (
                            <Link to="/admin" style={{...styles.pill, ...(active === 'admin' ? styles.pillActive : {})}} onClick={() => setActive('admin')}>Admin</Link>
                        )}
                        {token && (
                            <Link to="/chat" style={styles.btnSignin}>💬</Link>
                        )}
                        <button style={styles.btnPost} onClick={handleLogout}>Sign out</button>

                    </>

                ) : (
                    <>
                        <Link to="/login" style={styles.btnSignin}>Sign in</Link>
                        <Link to="/register" style={styles.btnPost}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        background: 'var(--bg-navbar)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
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
    navCenter: {
        display: 'flex',
        gap: '6px',
    },
    pill: {
        background: 'var(--pill-bg)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border)',
        color: 'var(--text-muted)',
        fontSize: '12px',
        padding: '5px 14px',
        borderRadius: '20px',
        textDecoration: 'none',
        transition: 'all 0.15s',
    },
    pillActive: {
        background: 'var(--accent)',
        color: 'var(--text-primary)',
        borderColor: 'var(--accent)',
        fontWeight: '500',
    },
    navActions: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    btnSignin: {
        background: 'transparent',
        border: '1px solid var(--border-accent)',
        color: 'var(--text-secondary)',
        padding: '5px 13px',
        borderRadius: '20px',
        fontSize: '12px',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
    },
    btnPost: {
        background: 'var(--accent)',
        border: 'none',
        color: 'var(--text-primary)',
        padding: '5px 14px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
    },
};

export default Navbar;