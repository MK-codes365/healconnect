import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { api } from '../../api';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('all');
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const data = await api.getCases();
                setCases(data);
            } catch (error) {
                console.error("Error fetching cases:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, []);

    const filteredCases = cases.filter(c => {
        const matchesSearch = searchQuery === '' || 
            (c.patientName && c.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (c.village && c.village.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesUrgency = urgencyFilter === 'all' || c.urgency === urgencyFilter;
        return matchesSearch && matchesUrgency;
    });

    const getUrgencyConfig = (urgency) => {
        switch (urgency) {
            case 'HIGH':
            case 'EMERGENCY':
                return { icon: FaExclamationTriangle, color: '#ef4444', label: 'High' };
            case 'MEDIUM':
            case 'CONSULT':
                return { icon: FaInfoCircle, color: '#f59e0b', label: 'Medium' };
            default:
                return { icon: FaCheckCircle, color: '#14b8a6', label: 'Low' };
        }
    };

    const getTimeAgo = (timestamp) => {
        const minutes = Math.floor((Date.now() - timestamp) / 60000);
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    return (
        <div className="doctor-dashboard-container animate-fade-in">
            <div className="dashboard-header glass-nav">
                <div className="header-left">
                    <h1>Welcome, {user?.name}</h1>
                    <span className="status-indicator">Cloud Portal Active</span>
                </div>
                <div className="header-actions">
                    <button onClick={() => navigate('/dashboard/doctor/profile')} className="action-nav-btn">
                        My Profile
                    </button>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </div>
            </div>
            
            <div className="dashboard-content">
                <div className="stats-grid">
                    <div className="stat-card glass-card high">
                        <div className="stat-value">{cases.filter(c => c.urgency === 'HIGH' || c.urgency === 'EMERGENCY').length}</div>
                        <div className="stat-label">Critical Cases</div>
                        <div className="stat-glow"></div>
                    </div>
                    <div className="stat-card glass-card total">
                        <div className="stat-value">{cases.length}</div>
                        <div className="stat-label">Total Cloud Registry</div>
                    </div>
                </div>

                <div className="search-filter-section glass-card">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search patient records in cloud..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filter-tabs">
                        {['all', 'EMERGENCY', 'CONSULT', 'SELF_CARE'].map(u => (
                            <button 
                                key={u}
                                className={`filter-tab ${urgencyFilter === u ? 'active' : ''}`}
                                onClick={() => setUrgencyFilter(u)}
                            >
                                {u === 'all' ? 'All Cases' : u}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="cases-grid">
                    {loading ? (
                        <div className="loading-state">Syncing medical records...</div>
                    ) : filteredCases.length === 0 ? (
                        <div className="empty-state glass-card">
                            <div className="empty-icon">✅</div>
                            <h3>All Clear</h3>
                            <p>No pending cases found in the cloud registry.</p>
                        </div>
                    ) : (
                        filteredCases.map(caseItem => {
                            const urgencyConfig = getUrgencyConfig(caseItem.urgency);
                            return (
                                <div 
                                    key={caseItem.sk} 
                                    className={`case-card glass-card urgency-${caseItem.urgency?.toLowerCase()}`}
                                    onClick={() => navigate(`/dashboard/doctor/case/${encodeURIComponent(caseItem.patientId)}`)}
                                >
                                    <div className="case-header">
                                        <div className="urgency-indicator">
                                            <urgencyConfig.icon style={{ color: urgencyConfig.color }} />
                                            <span style={{ color: urgencyConfig.color }}>{caseItem.urgency}</span>
                                        </div>
                                        <div className="case-time">{getTimeAgo(caseItem.submittedAt)}</div>
                                    </div>

                                    <div className="patient-snippet">
                                        <h3>{caseItem.patientName}</h3>
                                        <p>{caseItem.age || '??'}y • {caseItem.village || 'Remote'}</p>
                                    </div>

                                    <div className="symptoms-preview">
                                        <span className="label">Symptoms:</span>
                                        <div className="tags">
                                            {Array.isArray(caseItem.symptoms) ? 
                                                caseItem.symptoms.slice(0, 3).map((s, i) => <span key={i} className="tag">{s}</span>) : 
                                                <span className="tag">{caseItem.symptoms}</span>
                                            }
                                        </div>
                                    </div>
                                    
                                    <div className="case-footer">
                                        <span className="view-link">Examine Case →</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;