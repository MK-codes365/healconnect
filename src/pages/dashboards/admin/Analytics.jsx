import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartLine, FaUserMd, FaStethoscope, FaExclamationTriangle, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import { api } from '../../../api';
import './Analytics.css';

const Analytics = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalConsultations: 0,
        activePatients: 0,
        activeDoctors: 0,
        triageStats: { EMERGENCY: 0, CONSULT: 0, SELF_CARE: 0 },
        hotspots: {},
        doctorPerformance: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.getAdminStats();
                setStats(data);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <button onClick={() => navigate('/dashboard/admin')} className="back-btn">
                    <FaArrowLeft /> Back
                </button>
                <h2><FaChartLine /> Regional Health Analytics</h2>
            </div>
            
            <div className="stats-grid">
                {loading ? (
                    <div className="loading-state">Calculating Cloud Intelligence...</div>
                ) : (
                    <>
                        <div className="stat-card blue">
                            <FaStethoscope className="stat-icon" />
                            <div className="stat-content">
                                <h3>{stats.totalConsultations}</h3>
                                <p>Total Consultations</p>
                            </div>
                        </div>
                        <div className="stat-card teal">
                            <FaUserMd className="stat-icon" />
                            <div className="stat-content">
                                <h3>{stats.activeDoctors}</h3>
                                <p>Active Doctors</p>
                            </div>
                        </div>
                        <div className="stat-card purple">
                            <div className="stat-content">
                                <h3>{stats.activePatients}</h3>
                                <p>Active Patients</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="triage-section">
                <div className="hotspots-card">
                    <h3><FaMapMarkerAlt /> Clinical Hotspots (By Region)</h3>
                    <div className="hotspots-list">
                        {Object.entries(stats.hotspots || {}).length === 0 ? (
                            <div className="empty-state">No regional data available.</div>
                        ) : (
                            Object.entries(stats.hotspots).map(([village, count]) => (
                                <div key={village} className="hotspot-row">
                                    <span>{village}</span>
                                    <div className="hotspot-bar-container">
                                        <div className="hotspot-bar" style={{ width: `${(count / (stats.totalConsultations || 1)) * 100}%` }}></div>
                                    </div>
                                    <span className="hotspot-count">{count} cases</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="triage-stats">
                    <h3>AI Triage Distribution</h3>
                    <div className="triage-grid">
                        <div className="triage-card emergency">
                            <FaExclamationTriangle />
                            <div>
                                <h4>{stats.triageStats?.EMERGENCY || 0}</h4>
                                <p>Emergency</p>
                            </div>
                        </div>
                        <div className="triage-card consult">
                            <div>
                                <h4>{stats.triageStats?.CONSULT || 0}</h4>
                                <p>Consult</p>
                            </div>
                        </div>
                        <div className="triage-card selfcare">
                            <div>
                                <h4>{stats.triageStats?.SELF_CARE || 0}</h4>
                                <p>Self-Care</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="doctor-performance">
                <h3>👨‍⚕️ Specialist Impact Scores (Live)</h3>
                <div className="performance-table">
                    {!stats.doctorPerformance || stats.doctorPerformance.length === 0 ? (
                        <div className="empty-state">Gathering Specialist Data...</div>
                    ) : (
                        stats.doctorPerformance.slice(0, 5).map((doctor, index) => (
                            <div key={index} className="performance-row">
                                <div className="doctor-info">
                                    <h4>{doctor.name}</h4>
                                    <p>{doctor.specialty}</p>
                                </div>
                                <div className="performance-metrics">
                                    <div className="metric">
                                        <span className="metric-value">{doctor.consultations}</span>
                                        <span className="metric-label">Cases</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-value">⭐ {(doctor.rating || 5).toFixed(1)}</span>
                                        <span className="metric-label">Rating</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-value">{doctor.villageReach || 1}</span>
                                        <span className="metric-label">Villages</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;