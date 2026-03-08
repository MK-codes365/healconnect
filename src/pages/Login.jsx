import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserInjured, FaUserMd, FaUserShield, FaUserNurse, FaEye, FaEyeSlash, FaLock, FaEnvelope } from 'react-icons/fa';
import './Login.css';

const roles = [
    { id: 'patient',  icon: <FaUserInjured />,  label: 'Patient',  color: '#3b82f6' },
    { id: 'worker',   icon: <FaUserNurse />,     label: 'Worker',   color: '#10b981' },
    { id: 'doctor',   icon: <FaUserMd />,        label: 'Doctor',   color: '#8b5cf6' },
    { id: 'admin',    icon: <FaUserShield />,    label: 'Admin',    color: '#f59e0b' },
];

const Login = () => {
    const [role, setRole] = useState('patient');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const cardRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const activeRole = roles.find(r => r.id === role);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const roleParam = params.get('role');
        if (roleParam) setRole(roleParam);
    }, [location]);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const mx = e.clientX - rect.left - cx;
        const my = e.clientY - rect.top - cy;
        setTilt({ x: (my / cy) * 8, y: -(mx / cx) * 8 });
    };

    const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

    const handleSubmit = (e) => {
        e.preventDefault();
        login(role, email);
        if (role === 'patient') navigate('/dashboard/patient');
        if (role === 'worker')  navigate('/dashboard/worker');
        if (role === 'doctor')  navigate('/dashboard/doctor');
        if (role === 'admin')   navigate('/dashboard/admin');
    };

    return (
        <div className="login-page">
            {/* Animated CSS Background */}
            <div className="login-animated-bg">
                <div className="mesh-gradient" style={{ '--role-color': activeRole.color }} />
                {[...Array(18)].map((_, i) => (
                    <div key={i} className="bg-particle" style={{
                        '--delay': `${Math.random() * 8}s`,
                        '--duration': `${6 + Math.random() * 8}s`,
                        '--x': `${Math.random() * 100}%`,
                        '--size': `${3 + Math.random() * 6}px`,
                        '--opacity': `${0.3 + Math.random() * 0.5}`,
                    }} />
                ))}
                <div className="bg-orb bg-orb-1" style={{ '--role-color': activeRole.color }} />
                <div className="bg-orb bg-orb-2" style={{ '--role-color': activeRole.color }} />
                <div className="bg-orb bg-orb-3" />
            </div>

            {/* Video Background (mp4 for browser support) */}
            <video
                className="login-video-bg"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/bg-login-converted.mp4" type="video/mp4" />
                <source src="/bg-login.mov" type="video/quicktime" />
            </video>

            <div className="login-video-overlay" style={{ '--role-color': activeRole.color }} />

            {/* Floating Orbs */}
            <div className="login-orb login-orb-1" />
            <div className="login-orb login-orb-2" />

            {/* Centered Login Card */}
            <div className="login-center">
                {/* Logo */}
                <div className="login-logo">
                    <span className="login-logo-icon">🩺</span>
                    <span className="login-logo-text">HealConnect</span>
                </div>

                {/* 3D Glass Card */}
                <div
                    ref={cardRef}
                    className="login-glass-card"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                        '--role-color': activeRole.color,
                    }}
                >
                    {/* Card top accent */}
                    <div className="card-accent-line" style={{ background: activeRole.color }} />

                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtitle">Sign in to your HealConnect account</p>

                    {/* Role Selector */}
                    <div className="role-selector">
                        {roles.map(r => (
                            <button
                                key={r.id}
                                className={`role-pill ${role === r.id ? 'active' : ''}`}
                                style={role === r.id ? { background: r.color, borderColor: r.color } : {}}
                                onClick={() => setRole(r.id)}
                                type="button"
                            >
                                <span className="role-pill-icon">{r.icon}</span>
                                <span>{r.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="text"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder={role === 'doctor' ? 'dr.name@hospital.com' : 'user@example.com'}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className="eye-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="login-submit"
                            style={{ '--role-color': activeRole.color }}
                        >
                            <span>Sign in as {activeRole.label}</span>
                            <div className="submit-shimmer" />
                        </button>
                    </form>

                    <p className="login-footer-text">
                        Serving rural communities with AI-powered healthcare 🌐
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;