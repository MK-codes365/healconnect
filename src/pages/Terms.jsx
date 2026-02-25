import React from 'react';
import './LegalPages.css';

const Terms = () => {
    return (
        <div className="legal-page">
            <div className="legal-content">
                <h1 className="legal-title">Terms of Service</h1>
                <p className="legal-last-updated">Last updated: December 2024</p>

                <section className="legal-section">
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using this telemedicine platform, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>2. Medical Disclaimer</h2>
                    <p>
                        This platform serves as a communication tool between patients and healthcare providers. In case of a medical emergency, please contact your local emergency services immediately.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>3. User Accounts</h2>
                    <p>
                        You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Terms;