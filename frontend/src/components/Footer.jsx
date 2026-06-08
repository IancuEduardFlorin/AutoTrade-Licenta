import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer style={styles.footer} className="rsp-footer">
            <div style={styles.footerLeft}>
                <span style={styles.logo}>Auto<span style={styles.logoAccent}>Trade</span></span>
                <span style={styles.copy}>© 2026 AutoTrade · All rights reserved</span>
            </div>
            <div style={styles.footerLinks}>
                <Link to="/terms" style={styles.link} className="link-glow">Terms</Link>
                <Link to="/privacy" style={styles.link} className="link-glow">Privacy</Link>
                <Link to="/contact" style={styles.link} className="link-glow">Contact</Link>
            </div>
        </footer>
    );
}

const styles = {
    footer: {
        background: 'var(--glass-deep)',
        backdropFilter: 'var(--glass-blur-heavy)',
        WebkitBackdropFilter: 'var(--glass-blur-heavy)',
        borderTop: '1px solid var(--border-faint)',
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.2)',
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
