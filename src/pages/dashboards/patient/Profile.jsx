import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaArrowLeft, 
    FaUserCircle, 
    FaEnvelope, 
    FaMapMarkerAlt, 
    FaVenusMars, 
    FaIdCard,
    FaHeartbeat,
    FaHistory
} from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import '../PatientDashboard.css';

const Profile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="patient-dashboard-wrapper">
            <div className="profile-page-wrapper animate-fade-in">
            <div className="profile-top-nav">
                <button onClick={() => navigate('/dashboard/patient')} className="profile-back-btn">
                    <FaArrowLeft /> Dashboard
                </button>
            </div>

            <main className="profile-main-content">
                {/* Hero Header - Solid Design */}
                <header className="profile-hero solid-card">
                    <div className="hero-avatar-section">
                        <div className="avatar-inner">
                            <FaUserCircle />
                        </div>
                        <div className="hero-text">
                            <h1 className="user-title">{user.name}</h1>
                            <div className="hero-badges">
                                <span className="badge active">Verified Patient</span>
                                <span className="badge sync">Cloud Synced</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="profile-grid">
                    {/* Primary Info - Solid Card */}
                    <section className="profile-section solid-card">
                        <h3 className="section-title"><FaIdCard /> Personal Identity</h3>
                        <div className="info-list">
                            <div className="info-item">
                                <span className="label">Email Address</span>
                                <span className="value"><FaEnvelope className="icon" /> {user.email}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Age</span>
                                <span className="value">{user.age || '24'} years</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Gender</span>
                                <span className="value"><FaVenusMars className="icon" /> {user.gender || 'Not Specified'}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Location</span>
                                <span className="value"><FaMapMarkerAlt className="icon" /> {user.village || 'Remote Hub'}</span>
                            </div>
                        </div>
                    </section>

                    {/* Medical Summary - Solid Card */}
                    <section className="profile-section solid-card highlight-border">
                        <h3 className="section-title"><FaHeartbeat /> Health Profile</h3>
                        <div className="health-content">
                            <p className="medical-text">
                                {user.medicalHistory || "No critical medical history recorded. Your profile is automatically synced with HealConnect's digital health vault for seamless doctor access."}
                            </p>
                            <div className="health-status-indicator">
                                <div className="pulse"></div>
                                <span>Live Monitoring Active</span>
                            </div>
                        </div>
                    </section>
                </div>

                <section className="profile-footer-actions solid-card">
                    <div className="footer-info">
                        <FaHistory /> Last profile update: {new Date().toLocaleDateString()}
                    </div>
                    <button className="edit-profile-btn" onClick={() => alert("Profile editing coming soon!")}>
                        Edit Profile
                    </button>
                </section>
            </main>

            <style>{`
                .profile-page-wrapper {
                    padding: 2rem;
                    max-width: 1000px;
                    margin: 0 auto;
                    color: #f1f5f9;
                    font-family: 'Inter', sans-serif;
                }

                .profile-top-nav {
                    margin-bottom: 2rem;
                }

                .profile-back-btn {
                    background: #1e293b;
                    border: 1px solid #334155;
                    color: #94a3b8;
                    padding: 0.6rem 1.2rem;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }

                .profile-back-btn:hover {
                    background: #334155;
                    color: #fff;
                    transform: translateX(-5px);
                }

                /* Solid Card Design - No Glassmorphism */
                .solid-card {
                    background: #1e293b;
                    border: 1px solid #334155;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    border-radius: 24px;
                }

                .profile-hero {
                    padding: 3rem;
                    margin-bottom: 2.5rem;
                    background: #1e293b;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-left: 6px solid #10a37f;
                }

                .hero-avatar-section {
                    display: flex;
                    align-items: center;
                    gap: 2.5rem;
                }

                .avatar-inner {
                    font-size: 5rem;
                    color: #10a37f;
                    background: #0f172a;
                    width: 120px;
                    height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border: 3px solid #334155;
                }

                .user-title {
                    font-size: 3rem;
                    margin: 0;
                    color: #ffffff !important; /* Ensure visibility */
                    font-weight: 800;
                    letter-spacing: -0.025em;
                }

                .hero-badges {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .badge {
                    font-size: 0.75rem;
                    padding: 0.4rem 1rem;
                    border-radius: 100px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .badge.active {
                    background: rgba(16, 163, 127, 0.1);
                    color: #10a37f;
                    border: 1px solid rgba(16, 163, 127, 0.2);
                }

                .badge.sync {
                    background: #0f172a;
                    color: #94a3b8;
                    border: 1px solid #334155;
                }

                .profile-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                .profile-section {
                    padding: 2.5rem;
                }

                .highlight-border {
                    border-top: 4px solid #10a37f;
                }

                .section-title {
                    font-size: 1.25rem;
                    color: #10a37f;
                    margin-top: 0;
                    margin-bottom: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-weight: 700;
                }

                .info-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                    padding-bottom: 1rem;
                }

                .info-item .label {
                    color: #64748b;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .info-item .value {
                    font-size: 1.15rem;
                    color: #f1f5f9;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 600;
                }

                .info-item .icon {
                    color: #10a37f;
                    font-size: 1rem;
                }

                .medical-text {
                    line-height: 1.8;
                    color: #cbd5e1;
                    font-size: 1.05rem;
                    background: #0f172a;
                    padding: 1.5rem;
                    border-radius: 16px;
                    border-left: 3px solid #10a37f;
                }

                .health-status-indicator {
                    margin-top: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-size: 1rem;
                    color: #10a37f;
                    font-weight: 600;
                }

                .pulse {
                    width: 12px;
                    height: 12px;
                    background: #10a37f;
                    border-radius: 50%;
                    box-shadow: 0 0 0 rgba(16, 163, 127, 0.4);
                    animation: pulse-ring 2s infinite;
                }

                @keyframes pulse-ring {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 163, 127, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 163, 127, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 163, 127, 0); }
                }

                .profile-footer-actions {
                    padding: 2rem 3rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .footer-info {
                    color: #64748b;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .edit-profile-btn {
                    background: #10a37f;
                    color: white;
                    border: none;
                    padding: 1rem 2.5rem;
                    border-radius: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }

                .edit-profile-btn:hover {
                    background: #0d8a6a;
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
                }

                @media (max-width: 768px) {
                    .profile-grid { grid-template-columns: 1fr; }
                    .profile-hero { flex-direction: column; text-align: center; gap: 2rem; border-left: none; border-top: 6px solid #10a37f; }
                    .hero-avatar-section { flex-direction: column; }
                    .profile-footer-actions { flex-direction: column; gap: 1.5rem; text-align: center; }
                }
            `}</style>
            </div>
        </div>
    );
};

export default Profile;
