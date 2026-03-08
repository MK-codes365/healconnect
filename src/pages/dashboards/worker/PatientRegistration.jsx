import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserPlus, FaHistory, FaMapMarkerAlt, FaPhone, FaUser } from 'react-icons/fa';
import { api } from '../../../api';
import './PatientRegistration.css';

const PatientRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'male',
        village: '',
        phone: '',
        medicalHistory: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.registerPatient(formData);
            navigate('/dashboard/worker');
        } catch (error) {
            console.error(error);
            alert('Cloud Sync Failed: Please verify connectivity to the regional hub.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registration-page animate-fade-in">
            <div className="registration-header glass-nav">
                <button onClick={() => navigate('/dashboard/worker')} className="back-btn">
                    <FaArrowLeft /> Dashboard
                </button>
                <div className="header-titles">
                    <h2>Community Enrollment</h2>
                    <span className="subtitle">Secure Cloud Patient Registry</span>
                </div>
            </div>

            <div className="registration-content">
                <form className="registration-form-box glass-card" onSubmit={handleSubmit}>
                    <div className="form-sections">
                        <section className="reg-section">
                            <div className="section-title">
                                <FaUser /> <h3>Biographic Details</h3>
                            </div>
                            <div className="reg-grid">
                                <div className="reg-group">
                                    <label>Legal Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div className="reg-group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.age}
                                        onChange={(e) => handleChange('age', e.target.value)}
                                        placeholder="Years"
                                    />
                                </div>
                                <div className="reg-group">
                                    <label>Gender Identification</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => handleChange('gender', e.target.value)}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="reg-section">
                            <div className="section-title">
                                <FaMapMarkerAlt /> <h3>Contact & Location</h3>
                            </div>
                            <div className="reg-grid">
                                <div className="reg-group">
                                    <label>Village / Sector</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.village}
                                        onChange={(e) => handleChange('village', e.target.value)}
                                        placeholder="Location Name"
                                    />
                                </div>
                                <div className="reg-group">
                                    <label>Contact Number (Optional)</label>
                                    <div className="input-wrap">
                                        <FaPhone className="input-icon" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            placeholder="+91..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="reg-section">
                            <div className="section-title">
                                <FaHistory /> <h3>Clinical Background</h3>
                            </div>
                            <div className="reg-group full-width">
                                <label>Known Conditions / Allergies</label>
                                <textarea
                                    rows="4"
                                    value={formData.medicalHistory}
                                    onChange={(e) => handleChange('medicalHistory', e.target.value)}
                                    placeholder="Briefly list any existing medical history or known allergies..."
                                />
                            </div>
                        </section>
                    </div>

                    <div className="reg-footer">
                        <p className="privacy-notice">✓ Data encrypted via AES-256 for cloud transmission.</p>
                        <button type="submit" className="main-reg-btn btn-primary" disabled={loading}>
                            {loading ? 'Enrollment in Progress...' : <><FaUserPlus /> Finalize Enrollment</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientRegistration;