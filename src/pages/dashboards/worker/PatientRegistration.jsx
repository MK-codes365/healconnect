import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserPlus } from 'react-icons/fa';
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

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        import('../../../utils/storage').then(module => {
            module.addPatient(formData);
            alert(`Patient ${formData.name} registered successfully!`);
            navigate('/dashboard/worker');
        });
    };

    return (
        <div className="patient-registration-container">
            <div className="registration-header">
                <button onClick={() => navigate('/dashboard/worker')} className="back-btn">
                    <FaArrowLeft /> Back
                </button>
                <h2><FaUserPlus /> Register New Patient</h2>
            </div>

            <form className="registration-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Patient Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Enter patient name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Age *</label>
                            <input
                                type="number"
                                required
                                value={formData.age}
                                onChange={(e) => handleChange('age', e.target.value)}
                                placeholder="Enter age"
                            />
                        </div>
                        <div className="form-group">
                            <label>Gender *</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => handleChange('gender', e.target.value)}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Village/Location *</label>
                            <input
                                type="text"
                                required
                                value={formData.village}
                                onChange={(e) => handleChange('village', e.target.value)}
                                placeholder="Enter village name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Medical History</h3>
                    <div className="form-group">
                        <label>Previous Conditions / Allergies</label>
                        <textarea
                            rows="4"
                            value={formData.medicalHistory}
                            onChange={(e) => handleChange('medicalHistory', e.target.value)}
                            placeholder="Enter any known medical conditions, allergies, or previous treatments..."
                        />
                    </div>
                </div>

                <button type="submit" className="submit-btn">
                    <FaUserPlus /> Register Patient
                </button>
            </form>
        </div>
    );
};

export default PatientRegistration;