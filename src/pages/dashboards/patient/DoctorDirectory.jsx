import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaStar, FaVideo, FaCalendar } from 'react-icons/fa';
import { api } from '../../../api';
import './DoctorDirectory.css';

const DoctorDirectory = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('all');
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const data = await api.getActiveDoctors();
                setDoctors(data);
            } catch (err) {
                console.error("Error fetching doctors:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const specialties = ['all', ...new Set(doctors.map(d => d.specialty))];
    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = searchQuery === '' ||
            (doctor.name && doctor.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (doctor.specialty && doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (doctor.location && doctor.location.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesSpecialty = specialtyFilter === 'all' || doctor.specialty === specialtyFilter;
        return matchesSearch && matchesSpecialty;
    });

    return (
        <div className="doctor-directory">
            <div className="directory-header">
                <button onClick={() => navigate('/dashboard/patient')} className="back-btn">
                    <FaArrowLeft /> Back
                </button>
                <h2>Find Doctors</h2>
            </div>

            <div className="search-filter-section">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search by name, specialty, or location in cloud..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>
                    {specialties.map(specialty => (
                        <option key={specialty} value={specialty}>
                            {specialty === 'all' ? 'All Specialties' : specialty}
                        </option>
                    ))}
                </select>
            </div>

            <div className="doctors-grid">
                {loading ? (
                    <div className="loading-state">Scanning Cloud Registry...</div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="empty-state">
                        <p style={{ fontSize: '3rem' }}>🔍</p>
                        <h3>No doctors found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    filteredDoctors.map(doctor => (
                        <div key={doctor.sk} className="doctor-card">
                            <div className="doctor-avatar">
                                {(doctor.name || "Doctor").split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="doctor-info">
                                <h3>{doctor.name}</h3>
                                <p className="specialty">{doctor.specialty}</p>
                                <p className="experience">{doctor.experience || 5}+ years experience</p>
                                <p className="location">📍 {doctor.location || 'Remote Hub'}</p>
                                <div className="doctor-stats">
                                    <span><FaStar style={{ color: '#f59e0b' }} /> {doctor.rating || 5.0}</span>
                                    <span>{doctor.consultations || 0}+ consultations</span>
                                </div>
                                <p className="fees">₹{doctor.fees || 500} per consultation</p>
                                <p className="languages">Languages: {(doctor.languages || ['English', 'Swahili']).join(', ')}</p>
                            </div>
                            <div className="doctor-actions">
                                <button
                                    className="consult-btn available"
                                    onClick={() => navigate('/dashboard/patient/book', { state: { doctor } })}
                                >
                                    <FaVideo /> Consult Now
                                </button>
                                <button
                                    className="schedule-btn"
                                    onClick={() => navigate('/dashboard/patient/book', { state: { doctor, scheduled: true } })}
                                >
                                    <FaCalendar /> Schedule
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DoctorDirectory;