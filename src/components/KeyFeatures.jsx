import React, { useEffect, useRef, useState } from 'react';
import { 
    FaUserLock, 
    FaRobot, 
    FaUserMd, 
    FaVideo, 
    FaHeartbeat, 
    FaFilePrescription 
} from 'react-icons/fa';
import './KeyFeatures.css';

const features = [
    { icon: <FaUserLock />, title: "Multi-Role Secure Access", description: "Separate login workflows for Patients, Doctors, Admins, and Health Workers to streamline coordinated care.", color: "#3b82f6" },
    { icon: <FaRobot />, title: "AI Symptom Chat & Smart Triage", description: "A multilingual AI chatbot that collects symptoms, asks structured follow-up questions, and classifies urgency.", color: "#8b5cf6" },
    { icon: <FaUserMd />, title: "AI-Driven Specialist Recommendation", description: "Suggests the best specialist based on symptoms, triage output, and patient profile.", color: "#14b8a6" },
    { icon: <FaVideo />, title: "Teleconsultation & Appointment System", description: "Instant 'Consult Now' or scheduled visits with auto-generated video links, queueing, and in-visit messaging.", color: "#f59e0b" },
    { icon: <FaHeartbeat />, title: "Health Worker Vitals & Data Capture", description: "Health workers can submit vitals and patient data to support doctors during remote or pre-clinic assessments.", color: "#ef4444" },
    { icon: <FaFilePrescription />, title: "Prescription & Medicine Ordering", description: "Doctors issue digital prescriptions, OCR parsing for uploads, mock pharmacy quotes, and basic order tracking.", color: "#10b981" }
];

const Feature3DCard = ({ feature, index, isVisible }) => {
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const mx = e.clientX - rect.left - cx;
        const my = e.clientY - rect.top - cy;
        setTilt({ x: (my / cy) * 12, y: -(mx / cx) * 12 });
        setGlowPos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
        setIsHovered(false);
    };

    return (
        <div
            ref={cardRef}
            className={`feature-card-3d ${isVisible ? 'animate-up' : ''}`}
            style={{
                transitionDelay: `${index * 100}ms`,
                transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? 'translateZ(20px)' : 'translateZ(0)'}`,
                '--card-color': feature.color,
                '--glow-x': `${glowPos.x}%`,
                '--glow-y': `${glowPos.y}%`,
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
        >
            {/* Spotlight glow that follows cursor */}
            <div className="card-spotlight" style={{ opacity: isHovered ? 1 : 0 }} />

            {/* Top border glow line */}
            <div className="card-top-line" style={{ background: feature.color }} />

            <div className="feature-icon-wrapper-3d" style={{ borderColor: feature.color, color: feature.color }}>
                {feature.icon}
                <div className="icon-glow" style={{ background: feature.color }} />
            </div>

            <h3>{feature.title}</h3>
            <p>{feature.description}</p>

            {/* Corner accent */}
            <div className="card-corner-accent" style={{ borderColor: feature.color }} />
        </div>
    );
};

const KeyFeatures = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.1 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
    }, []);

    return (
        <section className="key-features-section" ref={sectionRef}>
            <div className="features-container">
                <div className={`features-header ${isVisible ? 'animate-up' : ''}`}>
                    <div className="features-badge">💡 Platform Features</div>
                    <h2>Innovative & High-Impact Features</h2>
                    <p>Designed to revolutionize rural healthcare delivery</p>
                </div>
                <div className="features-grid-3d">
                    {features.map((feature, index) => (
                        <Feature3DCard key={index} feature={feature} index={index} isVisible={isVisible} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default KeyFeatures;