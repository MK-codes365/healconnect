import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import { FaRobot, FaUserMd, FaCalendarAlt, FaHistory, FaComments, FaPrescriptionBottle, FaSignOutAlt, FaChevronRight } from 'react-icons/fa';
import './PatientDashboard.css';

const DASHBOARD_FEATURES = [
    {
        id: 'ai-chat',
        title: 'AI Health Assistant',
        desc: 'Instant triage & symptoms check',
        icon: FaRobot,
        path: '/dashboard/patient/ai-chat',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    },
    {
        id: 'rx',
        title: 'Prescriptions',
        desc: 'Manage & order your medicines',
        icon: FaPrescriptionBottle,
        path: '/dashboard/patient/prescriptions',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
        id: 'visits',
        title: 'My Visits',
        desc: 'History & clinical summaries',
        icon: FaHistory,
        path: '/dashboard/patient/visits',
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    {
        id: 'book',
        title: 'Book Consultation',
        desc: 'Schedule or start video call',
        icon: FaCalendarAlt,
        path: '/dashboard/patient/book',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    }
];

const PatientDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div className="patient-dashboard-wrapper">
            <header className="dashboard-top-nav">
                <div className="nav-brand">
                    <span className="brand-dot"></span>
                    <span className="brand-name">Heal Connect</span>
                </div>
                <div className="nav-user">
                    <span className="user-name">{user.name}</span>
                    <button onClick={logout} className="logout-btn-minimal" title="Logout">
                        <FaSignOutAlt />
                    </button>
                </div>
            </header>

            <main className="dashboard-main-content">
                <section className="welcome-hero">
                    <h1>Good Day, <span className="gradient-text">{user.name.split(' ')[0]}</span></h1>
                    <p>What can we help you with today?</p>
                </section>

                <div className="feature-grid">
                    {DASHBOARD_FEATURES.map((item, index) => (
                        <div 
                            key={item.id} 
                            className="feature-card"
                            onClick={() => navigate(item.path)}
                            style={{ '--delay': `${index * 0.1}s` }}
                        >
                            <div className="card-top-section">
                                <div className="feature-icon" style={{ background: item.gradient }}>
                                    <item.icon size={24} />
                                </div>
                                <div className="feature-arrow">
                                    <FaChevronRight size={14} />
                                </div>
                            </div>
                            <div className="feature-info">
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                            <div className="card-blur-glow" style={{ background: item.color }}></div>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="dashboard-footer">
                <p>&copy; 2026 Heal Connect AI. Secure & Encrypted.</p>
            </footer>
        </div>
    );
};

export default PatientDashboard;