import React from 'react';
import './LegalPages.css';

const Privacy = () => {
    return (
        <div className="legal-page">
            <div className="legal-content">
                <h1 className="legal-title">Privacy Policy</h1>
                <p className="legal-last-updated">Last updated: December 2024</p>
                
                <section className="legal-section">
                    <h2>1. Data Collection</h2>
                    <p>
                        We collect personal information such as name, contact details, and medical history only when explicitly provided by you for the purpose of medical triage and consultation.
                    </p>
                </section>
                
                <section className="legal-section">
                    <h2>2. Data Security</h2>
                    <p>
                        All patient data is encrypted end-to-end. We use HIPAA-compliant servers and do not share your sensitive health information with third parties without your consent.
                    </p>
                </section>
                
                <section className="legal-section">
                    <h2>3. AI Usage</h2>
                    <p>
                        Our AI tools are used for triage and preliminary assessment only. They do not replace professional medical advice. A qualified doctor always reviews the final diagnosis.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Privacy;