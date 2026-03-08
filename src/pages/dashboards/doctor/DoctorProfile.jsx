import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaArrowLeft, 
    FaSave, 
    FaUserMd, 
    FaStethoscope, 
    FaClock, 
    FaMapMarkerAlt,
    FaGraduationCap
} from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import './DoctorProfile.css';

const DoctorProfile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        name: user?.name || 'Dr. Anil Verma',
        specialty: 'General Medicine',
        experience: 15,
        fees: 500,
        location: 'District Hospital, Dharampur',
        languages: ['Hindi', 'English'],
        availability: 'Available',
        about: 'Experienced general physician with focus on rural healthcare and digital triage systems.',
        education: 'MBBS, MD - General Medicine',
        consultationHours: '9:00 AM - 5:00 PM'
    });

    const handleChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        alert('Clinical profile updated successfully!');
        navigate('/dashboard/doctor');
    };

    return (
        <div className="doctor-profile-wrapper animate-fade-in">
            <div className="profile-top-nav">
                <button onClick={() => navigate('/dashboard/doctor')} className="back-btn">
                    <FaArrowLeft /> Dashboard
                </button>
            </div>

            <main className="profile-content">
                <header className="profile-hero-card solid-card">
                    <div className="hero-main">
                        <div className="hero-avatar">
                            <FaUserMd />
                        </div>
                        <div className="hero-text">
                            <h1>{profile.name}</h1>
                            <div className="hero-tags">
                                <span className="tag specialty">{profile.specialty}</span>
                                <span className="tag experience">{profile.experience} Years Exp.</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="profile-grid">
                    <section className="profile-section solid-card">
                        <h3 className="section-title"><FaStethoscope /> Clinical Specialties</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Primary Specialization</label>
                                <select 
                                    value={profile.specialty} 
                                    onChange={(e) => handleChange('specialty', e.target.value)}
                                >
                                    <option>General Medicine</option>
                                    <option>Cardiology</option>
                                    <option>Pediatrics</option>
                                    <option>Orthopedics</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Consultation Fee (₹)</label>
                                <input 
                                    type="number" 
                                    value={profile.fees} 
                                    onChange={(e) => handleChange('fees', e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="profile-section solid-card">
                        <h3 className="section-title"><FaClock /> Availability</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Working Hours</label>
                                <input 
                                    type="text" 
                                    value={profile.consultationHours} 
                                    onChange={(e) => handleChange('consultationHours', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Current Status</label>
                                <select 
                                    value={profile.availability} 
                                    onChange={(e) => handleChange('availability', e.target.value)}
                                >
                                    <option>Available</option>
                                    <option>Busy</option>
                                    <option>Offline</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="profile-section solid-card full-width">
                        <h3 className="section-title"><FaGraduationCap /> Professional Background</h3>
                        <div className="form-group">
                            <label>Education & Qualifications</label>
                            <input 
                                type="text" 
                                value={profile.education} 
                                onChange={(e) => handleChange('education', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Professional Bio</label>
                            <textarea 
                                rows="4" 
                                value={profile.about} 
                                onChange={(e) => handleChange('about', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label><FaMapMarkerAlt /> Practice Location</label>
                            <input 
                                type="text" 
                                value={profile.location} 
                                onChange={(e) => handleChange('location', e.target.value)}
                            />
                        </div>
                    </section>
                </div>

                <div className="profile-actions">
                    <button className="save-profile-btn" onClick={handleSave}>
                        <FaSave /> Sync Clinical Profile
                    </button>
                </div>
            </main>

            <style>{`
                .doctor-profile-wrapper {
                    padding: 2rem;
                    max-width: 1000px;
                    margin: 0 auto;
                    color: white;
                    font-family: 'Inter', sans-serif;
                }

                .profile-top-nav { margin-bottom: 2rem; }

                .back-btn {
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

                .back-btn:hover { background: #334155; color: white; }

                .solid-card {
                    background: #1e293b;
                    border: 1px solid #334155;
                    border-radius: 24px;
                    padding: 2.5rem;
                }

                .profile-hero-card {
                    margin-bottom: 2.5rem;
                    border-left: 6px solid #10a37f;
                }

                .hero-main { display: flex; align-items: center; gap: 2.5rem; }

                .hero-avatar {
                    font-size: 4rem;
                    color: #10a37f;
                    background: #0f172a;
                    width: 100px;
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border: 3px solid #334155;
                }

                .hero-text h1 { margin: 0; font-size: 2.5rem; letter-spacing: -0.025em; }

                .hero-tags { display: flex; gap: 1rem; margin-top: 1rem; }

                .tag {
                    font-size: 0.75rem;
                    padding: 0.4rem 1rem;
                    border-radius: 100px;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .tag.specialty { background: rgba(16, 163, 127, 0.1); color: #10a37f; }
                .tag.experience { background: #0f172a; color: #94a3b8; border: 1px solid #334155; }

                .profile-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }

                .full-width { grid-column: 1 / -1; }

                .section-title {
                    font-size: 1.1rem;
                    color: #10a37f;
                    margin-top: 0;
                    margin-bottom: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

                .form-group { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }

                .form-group label { font-size: 0.85rem; color: #64748b; font-weight: 600; }

                .form-group input, .form-group select, .form-group textarea {
                    background: #0f172a;
                    border: 1px solid #334155;
                    color: white;
                    padding: 0.8rem 1.2rem;
                    border-radius: 12px;
                    font-size: 1rem;
                    outline: none;
                    transition: border-color 0.3s ease;
                }

                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    border-color: #10a37f;
                }

                .profile-actions { margin-top: 3rem; display: flex; justify-content: flex-end; }

                .save-profile-btn {
                    background: #10a37f;
                    color: white;
                    border: none;
                    padding: 1rem 2.5rem;
                    border-radius: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 15px -3px rgba(16, 163, 127, 0.2);
                }

                .save-profile-btn:hover { background: #0d8a6a; transform: translateY(-2px); }

                @media (max-width: 768px) {
                    .profile-grid { grid-template-columns: 1fr; }
                    .form-grid { grid-template-columns: 1fr; }
                    .hero-main { flex-direction: column; text-align: center; }
                }
            `}</style>
        </div>
    );
};

export default DoctorProfile;