function Terms() {
    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header} className="gl-panel">
                    <div style={styles.badge}>Legal</div>
                    <h1 style={styles.title}>Terms of Service</h1>
                    <p style={styles.meta}>Last updated: January 2026 · Effective immediately</p>
                </div>

                <div style={styles.body} className="gl-panel">
                    <Section title="1. Acceptance of Terms">
                        By accessing or using AutoTrade ("the Platform"), you agree to be bound by these Terms of Service.
                        If you do not agree to these terms, you may not use the Platform. We reserve the right to modify
                        these terms at any time; continued use of the Platform constitutes acceptance of the revised terms.
                    </Section>

                    <Section title="2. Eligibility">
                        You must be at least 18 years old and capable of forming a legally binding contract to use AutoTrade.
                        By registering an account, you confirm that all information you provide is accurate, current, and complete.
                        Accounts may not be transferred to another person without our prior written consent.
                    </Section>

                    <Section title="3. Listings and Content">
                        Users may post car listings subject to the following conditions:
                        <ul style={styles.list}>
                            <li>All information in a listing must be accurate and not misleading.</li>
                            <li>Listings must relate to a vehicle that you own or have the legal right to sell.</li>
                            <li>Prohibited content includes stolen vehicles, fraudulent offers, duplicate listings, and any content that violates applicable law.</li>
                            <li>AutoTrade reserves the right to remove any listing at its sole discretion without notice.</li>
                        </ul>
                    </Section>

                    <Section title="4. User Conduct">
                        You agree not to use the Platform to harass, threaten, or defraud other users; to distribute spam or malware;
                        to scrape or bulk-download listings; or to circumvent any security measures. Violations may result in immediate
                        account suspension or termination.
                    </Section>

                    <Section title="5. Transactions">
                        AutoTrade is a listing platform only. We do not participate in, facilitate, or guarantee any transaction
                        between buyers and sellers. All sales are strictly between the parties involved. We strongly recommend
                        meeting in a safe public place and verifying vehicle documentation before completing any purchase.
                    </Section>

                    <Section title="6. Intellectual Property">
                        All content on the Platform — including logos, design, text, and software — is owned by AutoTrade or its
                        licensors and is protected by copyright and trademark law. You may not reproduce, distribute, or create
                        derivative works without explicit written permission.
                    </Section>

                    <Section title="7. Disclaimer of Warranties">
                        The Platform is provided "as is" without warranties of any kind, express or implied. AutoTrade does not
                        warrant that the Platform will be uninterrupted, error-free, or free of viruses. Your use of the Platform
                        is at your sole risk.
                    </Section>

                    <Section title="8. Limitation of Liability">
                        To the maximum extent permitted by applicable law, AutoTrade shall not be liable for any indirect,
                        incidental, special, or consequential damages arising out of your use of the Platform, even if advised
                        of the possibility of such damages.
                    </Section>

                    <Section title="9. Governing Law">
                        These Terms shall be governed by and construed in accordance with the laws of Romania. Any disputes
                        shall be subject to the exclusive jurisdiction of the courts located in Bucharest, Romania.
                    </Section>

                    <Section title="10. Contact">
                        If you have questions about these Terms, please contact us at{' '}
                        <a href="mailto:contact@autotrade.ro" style={styles.emailLink}>contact@autotrade.ro</a>.
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

export default Terms;
