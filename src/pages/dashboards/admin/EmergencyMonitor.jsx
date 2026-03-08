import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { api } from '../../../api';
import './EmergencyMonitor.css';

const EmergencyMonitor = () => {
    const navigate = useNavigate();
    const [emergencies, setEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmergencies = async () => {
            try {
                const data = await api.getEmergencyFeed();
                setEmergencies(data);
            } catch (error) {
                console.error("Error fetching emergency feed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmergencies();
        const interval = setInterval(fetchEmergencies, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="monitor-container emergency-theme">
            <div className="monitor-header">
                <button onClick={() => navigate('/dashboard/admin')} className="back-btn">
                    <FaArrowLeft /> Back
                </button>
                <h2><FaExclamationTriangle className="pulse" /> Live Emergency Feed</h2>
            </div>

            <div className="emergency-grid">
                {loading ? (
                    <div className="loading-state">Subscribing to Cloud Feed...</div>
                ) : emergencies.length === 0 ? (
                    <div className="idle-state">
                        <FaClock /> No active emergencies reported. System Idle.
                    </div>
                ) : (
                    emergencies.map((err, index) => (
                        <div key={err.sk} className="emergency-card">
                            <div className="card-priority">HIGH URGENCY</div>
                            <div className="card-main">
                                <h3>{err.patientName || "Unknown Patient"}</h3>
                                <p className="symptoms">{Array.isArray(err.symptoms) ? err.symptoms.join(', ') : err.symptoms}</p>
                            </div>
                            <div className="card-footer">
                                <span><FaMapMarkerAlt /> {err.village || 'Remote Site'}</span>
                                <span><FaClock /> {new Date(err.submittedAt).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EmergencyMonitor;
