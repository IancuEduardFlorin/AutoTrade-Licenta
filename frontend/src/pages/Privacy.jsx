function Privacy() {
    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header} className="gl-panel">
                    <div style={styles.badge}>Legal</div>
                    <h1 style={styles.title}>Privacy Policy</h1>
                    <p style={styles.meta}>Last updated: January 2026 · Applies to all AutoTrade users</p>
                </div>

                <div style={styles.body} className="gl-panel">
                    <Section title="1. Who We Are">
                        AutoTrade is a car marketplace platform operated in Romania. We are committed to protecting your
                        personal data in compliance with the General Data Protection Regulation (GDPR) and applicable
                        Romanian data protection law. Data controller: AutoTrade SRL, Bucharest, Romania.
                        Contact: <a href="mailto:contact@autotrade.ro" style={styles.emailLink}>contact@autotrade.ro</a>
                    </Section>

                    <Section title="2. Data We Collect">
                        We collect the following categories of personal data:
                        <ul style={styles.list}>
                            <li><strong>Account data:</strong> name, email address, hashed password.</li>
                            <li><strong>Listing data:</strong> vehicle details, photos, and descriptions you publish.</li>
                            <li><strong>Usage data:</strong> pages visited, search queries, timestamps, and IP address.</li>
                            <li><strong>Communication data:</strong> messages exchanged with other users on the Platform.</li>
                        </ul>
                    </Section>

                    <Section title="3. How We Use Your Data">
                        We use your personal data to:
                        <ul style={styles.list}>
                            <li>Provide, maintain, and improve the Platform.</li>
                            <li>Authenticate your identity and secure your account.</li>
                            <li>Enable messaging between buyers and sellers.</li>
                            <li>Send service-related notifications (no marketing without consent).</li>
                            <li>Detect and prevent fraud, spam, and abuse.</li>
                            <li>Comply with legal obligations.</li>
                        </ul>
                    </Section>

                    <Section title="4. Legal Basis for Processing">
                        We process your data under the following legal bases: <strong>performance of a contract</strong> (providing
                        the service), <strong>legitimate interests</strong> (security, fraud prevention), <strong>legal obligation</strong>
                        (compliance with Romanian and EU law), and <strong>consent</strong> where explicitly obtained.
                    </Section>

                    <Section title="5. Data Sharing">
                        We do not sell your personal data. We may share data with:
                        <ul style={styles.list}>
                            <li><strong>Cloudinary</strong> — for image storage and delivery.</li>
                            <li><strong>Groq / AI providers</strong> — for AI-assisted features (only listing content, never personal data).</li>
                            <li><strong>Law enforcement</strong> — when required by a valid legal request.</li>
                        </ul>
                        All third-party processors are bound by data processing agreements.
                    </Section>

                    <Section title="6. Data Retention">
                        We retain your account data for as long as your account is active. Deleted account data is purged
                        within 30 days. Message history is retained for 12 months for dispute resolution purposes.
                        Anonymised usage statistics may be retained indefinitely.
                    </Section>

                    <Section title="7. Your Rights">
                        Under GDPR you have the right to:
                        <ul style={styles.list}>
                            <li><strong>Access</strong> a copy of your personal data.</li>
                            <li><strong>Rectify</strong> inaccurate data.</li>
                            <li><strong>Erase</strong> your data ("right to be forgotten").</li>
                            <li><strong>Restrict</strong> or <strong>object</strong> to processing.</li>
                            <li><strong>Data portability</strong> in a machine-readable format.</li>
                            <li><strong>Lodge a complaint</strong> with the Romanian Data Protection Authority (ANSPDCP).</li>
                        </ul>
                        To exercise your rights, email us at{' '}
                        <a href="mailto:contact@autotrade.ro" style={styles.emailLink}>contact@autotrade.ro</a>.
                    </Section>

                    <Section title="8. Cookies">
                        We use essential cookies only — for session management and security. We do not use tracking or
                        advertising cookies. You can clear cookies via your browser settings at any time.
                    </Section>

                    <Section title="9. Security">
                        We implement industry-standard security measures including HTTPS, password hashing (bcrypt),
                        rate limiting, and input validation. No method of transmission over the internet is 100% secure;
                        we cannot guarantee absolute security but take reasonable precautions.
                    </Section>

                    <Section title="10. Changes to This Policy">
                        We may update this Privacy Policy from time to time. We will notify registered users by email of
                        any material changes. The "last updated" date at the top of this page will always reflect the
                        most recent revision.
                    </Section>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={sectionStyles.wrap}>
            <h2 style={sectionStyles.title}>{title}</h2>
            <p style={sectionStyles.body}>{children}</p>
        </div>
    );
}

const sectionStyles = {
    wrap: { marginBottom: '28px' },
    title: { fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '10px' },
    body: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8 },
};

const styles = {
    page: { minHeight: '100vh', padding: '32px 20px', display: 'flex', justifyContent: 'center' },
    container: { width: '100%', maxWidth: '740px', display: 'flex', flexDirection: 'column', gap: '20px' },
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
    body: {
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        borderRadius: '14px', padding: '32px',
    },
    list: { paddingLeft: '18px', marginTop: '10px', lineHeight: 2, fontSize: '14px', color: 'var(--text-secondary)' },
    emailLink: { color: 'var(--accent-light)', textDecoration: 'none' },
};

export default Privacy;
