import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer style={styles.footer}>
            <div style={styles.footerLeft}>
                <span style={styles.logo}>Auto<span style={styles.logoAccent}>Trade</span></span>
                <span style={styles.copy}>© 2026 AutoTrade · All rights reserved</span>
            </div>
            <div style={styles.footerLinks}>
                <Link to="/" style={styles.link}>Terms</Link>
                <Link to="/" style={styles.link}>Privacy</Link>
                <Link to="/" style={styles.link}>Contact</Link>
            </div>
        </footer>
    );
}

const styles = {
    footer: {
        background: 'var(--bg-navbar)',
        borderTop: '1px solid var(--border)',
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    logo: {
        fontSize: '14px',
        fontWeight: '500',
        color: 'var(--text-primary)',
    },
    logoAccent: {
        color: 'var(--accent-light)',
    },
    copy: {
        fontSize: '11px',
        color: 'var(--text-muted)',
    },
    footerLinks: {
        display: 'flex',
        gap: '20px',
    },
    link: {
        fontSize: '11px',
        color: 'var(--text-muted)',
        textDecoration: 'none',
    },
};

export default Footer;