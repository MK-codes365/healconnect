import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    const navigate = useNavigate();
    const heroRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!heroRef.current) return;
            const rect = heroRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            setMousePos({ x, y });
        };
        const el = heroRef.current;
        if (el) el.addEventListener('mousemove', handleMouseMove);
        return () => { if (el) el.removeEventListener('mousemove', handleMouseMove); };
    }, []);

    return (
        <div className="hero-section" ref={heroRef}>
            {/* 3D Floating Orbs */}
            <div className="orb orb-1" style={{
                transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px)`
            }} />
            <div className="orb orb-2" style={{
                transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`
            }} />
            <div className="orb orb-3" style={{
                transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`
            }} />

            {/* Floating 3D particles */}
            <div className="particles">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="particle" style={{
                        '--delay': `${Math.random() * 5}s`,
                        '--duration': `${4 + Math.random() * 6}s`,
                        '--x': `${Math.random() * 100}%`,
                        '--size': `${4 + Math.random() * 8}px`
                    }} />
                ))}
            </div>

            <div className="hero-overlay" />

            {/* 3D Depth Content */}
            <div className="hero-content" style={{
                transform: `
                    perspective(1200px)
                    rotateX(${mousePos.y * -5}deg)
                    rotateY(${mousePos.x * 5}deg)
                    translateZ(30px)
                `,
                transition: 'transform 0.1s ease-out'
            }}>
                <div className="hero-badge">🌐 AI-Powered Rural Healthcare</div>
                <h1>HealConnect</h1>
                <p>Bridging the Gap in Rural Healthcare</p>
                <p className="hero-subtext">
                    Submit symptoms, get AI urgency scoring, and connect with doctors without traveling long distances.
                </p>
                <div className="hero-actions">
                    <button className="btn-primary" onClick={() => navigate('/login')}>
                        <span>Get Started</span>
                        <div className="btn-glow" />
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/login')}>
                        Watch Demo ▶
                    </button>
                </div>

                {/* 3D Floating Stats */}
                <div className="hero-stats">
                    {[
                        { value: '10K+', label: 'Patients Served' },
                        { value: '98%', label: 'AI Accuracy' },
                        { value: '500+', label: 'Rural Clinics' },
                    ].map((stat, i) => (
                        <div key={i} className="hero-stat-card" style={{
                            animationDelay: `${i * 0.3}s`
                        }}>
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3D Grid floor */}
            <div className="hero-grid-floor" />
        </div>
    );
};

export default Hero;