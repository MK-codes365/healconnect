import React from 'react';
import { FaRobot, FaCloud, FaUserNurse } from 'react-icons/fa';
import './DoctorAvailability.css';

const DoctorAvailability = () => {
    const steps = [
        {
            icon: <FaRobot />,
            title: "AI First-Pass Triage",
            desc: "If no doctor is online immediately, our AI instantly analyzes patient symptoms and vitals. It returns an Urgency Score (Routine, High, Critical) so the patient knows if it's an emergency right away.",
            color: "#38bdf8"
        },
        {
            icon: <FaCloud />,
            title: "The Secure Cloud Queue",
            desc: "The case doesn't get lost. It is saved to the secure cloud network with an 'Open' status, waiting for the next available professional to pick it up from the global incoming pool.",
            color: "#2dd4bf"
        },
        {
            icon: <FaUserNurse />,
            title: "Global Doctor Pickup",
            desc: "The moment ANY verified doctor on the platform logs in, they see the open cases, review the AI's triage assessment, and 'Accept' the case to begin the teleconsultation.",
            color: "#818cf8"
        }
    ];

    return (
        <section className="doc-availability-section">
            <div className="doc-availability-container">
                <div className="availability-header">
                    <span className="availability-badge">Safety First 🛡️</span>
                    <h2 className="section-title">What if a Doctor isn't available?</h2>
                    <p className="section-subtitle">
                        We never leave patients waiting in the dark. Our platform uses a blend of AI and distributed networking to ensure cases are always handled safely.
                    </p>
                </div>

                <div className="availability-steps">
                    {steps.map((step, index) => (
                        <div key={index} className="availability-card" style={{ '--card-color': step.color }}>
                            <div className="step-connector">
                                {index < steps.length - 1 && <div className="connecting-line"></div>}
                            </div>
                            <div className="card-icon" style={{ color: step.color }}>
                                {step.icon}
                            </div>
                            <div className="card-content">
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                            <div className="step-number">0{index + 1}</div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Background elements */}
            <div className="avail-bg-glow glow-left"></div>
            <div className="avail-bg-glow glow-right"></div>
        </section>
    );
};

export default DoctorAvailability;
