import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaSearch, FaFilter, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { workerCases } from '../../../data/mockData';
import { api } from '../../../api';
import './MyCases.css';

const MyCases = () => {
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchCases = async () => {
            try {
                setLoading(true);
                const cloudCases = await api.getCases();
                setCases(cloudCases.sort((a, b) => b.submittedAt - a.submittedAt));
            } catch (error) {
                console.error("Sync Error:", error);
                setCases([]); // No mock data fallback
            } finally {
                setLoading(false);
            }
        };

        fetchCases();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <FaClock className="status-icon pending" />;
            case 'reviewed': return <FaCheckCircle className="status-icon reviewed" />;
            case 'closed': return <FaCheckCircle className="status-icon closed" />;
            default: return <FaExclamationTriangle className="status-icon" />;
        }
    };

    const getUrgencyClass = (urgency) => {
        switch (urgency) {
            case 'HIGH':
            case 'EMERGENCY': return 'urgency-high';
            case 'MEDIUM':
            case 'CONSULT': return 'urgency-medium';
            default: return 'urgency-low';
        }
    };

    const filteredCases = cases.filter(c => {
        const matchesSearch = c.patientName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || c.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="my-cases-page animate-fade-in">
            <div className="cases-header glass-nav">
                <button onClick={() => navigate('/dashboard/worker')} className="back-btn">
                    <FaArrowLeft /> Dashboard
                </button>
                <div className="header-titles">
                    <h2>Clinical Case History</h2>
                    <span className="subtitle">Sync Status & Regional Hub Feedback</span>
                </div>
            </div>

            <div className="cases-content">
                <div className="cases-controls glass-card">
                    <div className="search-box">
                        <FaSearch />
                        <input 
                            type="text" 
                            placeholder="Search by Patient Name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-tabs">
                        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All Cases</button>
                        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending</button>
                        <button className={filter === 'reviewed' ? 'active' : ''} onClick={() => setFilter('reviewed')}>Reviewed</button>
                    </div>
                </div>

                <div className="cases-grid">
                    {filteredCases.map(caseItem => (
                        <div key={caseItem.sk || caseItem.id} className="case-list-card glass-card">
                            <div className="case-main-info">
                                <div className="patient-avatar">
                                    {(caseItem.patientName || 'P')[0]}
                                </div>
                                <div className="patient-meta">
                                    <h3>{caseItem.patientName || 'New Patient'}</h3>
                                    <p>
                                        {caseItem.age ? `${caseItem.age} • ` : ''} 
                                        {caseItem.village || (caseItem.isMock ? 'Demo Center' : 'Regional Hub')}
                                    </p>
                                </div>
                                <div className="case-status-wrap">
                                    <div className={`urgency-dot ${getUrgencyClass(caseItem.urgency)}`}></div>
                                    <span className="status-text">{(caseItem.status || 'pending').toUpperCase()}</span>
                                    {getStatusIcon(caseItem.status || 'pending')}
                                </div>
                            </div>
                            
                            <div className="case-brief">
                                <div className="brief-item">
                                    <label>Primary Symptoms</label>
                                    <div className="symptom-chips">
                                        {(caseItem.symptoms || []).slice(0, 3).map((s, idx) => <span key={idx}>{s}</span>)}
                                        {(caseItem.symptoms || []).length > 3 && <span>+{(caseItem.symptoms || []).length - 3}</span>}
                                        {(caseItem.symptoms || []).length === 0 && <span className="no-data">No symptoms logged</span>}
                                    </div>
                                </div>
                                <div className="brief-item">
                                    <label>Specialty Assigned</label>
                                    <p>{caseItem.specialty || 'General Practice'}</p>
                                </div>
                            </div>

                            {caseItem.doctorFeedback && (
                                <div className="doctor-feedback-preview">
                                    <label>Regional Hub Response</label>
                                    <p>"{caseItem.doctorFeedback}"</p>
                                </div>
                            )}

                            {!caseItem.doctorFeedback && !caseItem.isMock && (
                                <div className="sync-status-badge">
                                    <FaClock /> Awaiting Specialist Review
                                </div>
                            )}

                            <div className="case-footer">
                                <span className="timestamp">
                                    {caseItem.submittedAt ? new Date(caseItem.submittedAt).toLocaleDateString() : 'Just Now'}
                                </span>
                                <button className="view-details-btn" onClick={() => navigate(`/dashboard/worker/case/${encodeURIComponent(caseItem.sk)}`)}>
                                    <FaEye /> Open Record
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Syncing cases from regional hub...</p>
                    </div>
                )}

                {!loading && filteredCases.length === 0 && (
                    <div className="empty-results glass-card">
                        <div className="empty-icon">📂</div>
                        <h3>No matching clinical records found.</h3>
                        <p>Adjust your search filters or submit a new case.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCases;