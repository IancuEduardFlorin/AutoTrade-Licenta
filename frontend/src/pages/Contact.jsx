import { useState } from 'react';

function Contact() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [sent, setSent] = useState(false);

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header} className="gl-panel">
                    <div style={styles.badge}>Support</div>
                    <h1 style={styles.title}>Contact Us</h1>
                    <p style={styles.meta}>We typically respond within 1–2 business days</p>
                </div>

                <div style={styles.grid}>
                    <div style={styles.infoCard} className="gl-panel">
                        <h2 style={styles.cardTitle}>Get in Touch</h2>
                        <p style={styles.cardText}>
                            Have a question about a listing, need help with your account, or want to report
                            an issue? We're here to help.
                        </p>

                        <div style={styles.contactItem}>
                            <div style={styles.contactIcon}>✉</div>
                            <div>
                                <div style={styles.contactLabel}>Email</div>
                                <a href="mailto:contact@autotrade.ro" style={styles.contactValue}>
                                    contact@autotrade.ro
                                </a>
                            </div>
                        </div>

                        <div style={styles.contactItem}>
                            <div style={styles.contactIcon}>📍</div>
                            <div>
                                <div style={styles.contactLabel}>Location</div>
                                <div style={styles.contactValue}>Bucharest, Romania</div>
                            </div>
                        </div>

                        <div style={styles.contactItem}>
                            <div style={styles.contactIcon}>🕐</div>
                            <div>
                                <div style={styles.contactLabel}>Response Time</div>
                                <div style={styles.contactValue}>1–2 business days</div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.formCard} className="gl-panel">
                        {sent ? (
                            <div style={styles.successBox}>
                                <div style={styles.successIcon}>✓</div>
                                <h3 style={styles.successTitle}>Message Sent</h3>
                                <p style={styles.successText}>
                                    Thank you for reaching out. We'll get back to you at {form.email} shortly.
                                </p>
                                <button style={styles.resetBtn} onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}>
                                    Send Another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <h2 style={styles.cardTitle}>Send a Message</h2>

                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>Name</label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        required
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="your@email.com"
                                        required
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>Message</label>
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        placeholder="Describe your issue or question..."
                                        required
                                        rows={6}
                                        style={{ ...styles.input, resize: 'vertical', fontFamily: 'inherit' }}
                                    />
                                </div>

                                <button type="submit" style={styles.submitBtn}>
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', padding: '32px 20px', display: 'flex', justifyContent: 'center' },
    container: { width: '100%', maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '20px' },
    header: {
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        borderRadius: '14px', padding: '28px 32px',
    },
    badge: {
        display: 'inline-block', fontSize: '11px', fontWeight: '500',
        color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.8px',
        background: 'var(--accent-tint)', border: '1px solid var(--border-accent)',
        borderRadius: '6px', padding: '3px 10px', marginBottom: '12px',
    },
    title: { fontSize: '26px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' },
    meta: { fontSize: '13px', color: 'var(--text-muted)' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '20px' },
    infoCard: {
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        borderRadius: '14px', padding: '28px',
    },
    formCard: {
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        borderRadius: '14px', padding: '28px',
    },
    cardTitle: { fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '14px' },
    cardText: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' },
    contactItem: { display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '20px' },
    contactIcon: {
        width: '36px', height: '36px', borderRadius: '10px',
        background: 'var(--accent-tint)', border: '1px solid var(--border-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '15px', flexShrink: 0,
    },
    contactLabel: { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' },
    contactValue: { fontSize: '14px', color: 'var(--text-primary)', textDecoration: 'none' },
    fieldGroup: { marginBottom: '18px' },
    label: { display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: {
        width: '100%', boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
        borderRadius: '8px', padding: '10px 14px',
        color: 'var(--text-primary)', fontSize: '14px',
        outline: 'none',
    },
    submitBtn: {
        width: '100%', padding: '12px',
        background: 'var(--accent-tint)', border: '1px solid var(--border-accent)',
        borderRadius: '8px', color: 'var(--accent-light)',
        fontSize: '14px', fontWeight: '500', cursor: 'pointer',
        marginTop: '4px',
    },
    successBox: { textAlign: 'center', padding: '32px 0' },
    successIcon: {
        width: '56px', height: '56px', borderRadius: '50%',
        background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
        color: 'rgb(34,197,94)', fontSize: '22px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
    },
    successTitle: { fontSize: '18px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '10px' },
    successText: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' },
    resetBtn: {
        padding: '9px 24px',
        background: 'var(--accent-tint)', border: '1px solid var(--border-accent)',
        borderRadius: '8px', color: 'var(--accent-light)',
        fontSize: '13px', cursor: 'pointer',
    },
};

export default Contact;
