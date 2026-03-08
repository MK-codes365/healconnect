import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FaVideo, 
    FaPhoneSlash, 
    FaFileMedical, 
    FaPrescription, 
    FaHeartbeat, 
    FaThermometerHalf, 
    FaTint,
    FaCircle,
    FaUserCircle
} from 'react-icons/fa';
import { api } from '../../../api';
import './Teleconsultation.css';

const Teleconsultation = () => {
    const navigate = useNavigate();
    const { id: patientId } = useParams();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [roomName, setRoomName] = useState('');
    
    // Simulated Live Vitals for Healthcare Aesthetics
    const [vitals, setVitals] = useState({
        bpm: 98,
        o2: 96,
        temp: 101.2
    });

    useEffect(() => {
        const fetchCaseAndSetup = async () => {
            try {
                // 1. Fetch cases to find the specific room name
                const allCases = await api.getCases();
                const foundCase = allCases.find(c => c.patientId === patientId);
                setCaseData(foundCase);

                if (foundCase?.roomName) {
                    setRoomName(foundCase.roomName);
                } else {
                    // Fallback to deterministic name if not found (legacy/direct link)
                    const cleanId = patientId.replace(/[^a-zA-Z0-9]/g, '');
                    setRoomName(`HealConnect-${cleanId}`);
                }
            } catch (err) {
                console.error("Consultation Setup Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCaseAndSetup();

        // 2. Vitals Simulation
        const vitalInterval = setInterval(() => {
            setVitals(prev => ({
                bpm: Math.floor(prev.bpm + (Math.random() * 4 - 2)),
                o2: Math.min(100, Math.max(90, prev.o2 + (Math.random() > 0.5 ? 0.1 : -0.1))),
                temp: parseFloat((prev.temp + (Math.random() * 0.2 - 0.1)).toFixed(1))
            }));
        }, 2000);

        return () => clearInterval(vitalInterval);
    }, [patientId]);

    const handleEndCall = () => {
        if (window.confirm('Terminate clinical session?')) {
            navigate(`/dashboard/doctor/case/${encodeURIComponent(patientId)}`);
        }
    };

    if (loading) return <div className="loading-state">Initializing Clinical Link...</div>;

    return (
        <div className="teleconsultation-container animate-fade-in">
            <div className="video-area">
                <div className="main-video glass-card">
                    {roomName ? (
                        <iframe 
                            src={`https://meet.jit.si/${roomName}`}
                            title="Clinical Video Consultation"
                            allow="camera; microphone; fullscreen; display-capture; autoplay"
                            className="jitsi-iframe"
                        ></iframe>
                    ) : (
                        <div className="video-placeholder">
                            <FaVideo className="icon" />
                            <p>Connecting to secure cloud tunnel...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="patient-sidebar glass-card">
                <div className="sidebar-header">
                    <h3><FaFileMedical /> Clinic Room</h3>
                </div>
                
                <div className="patient-details">
                    <div className="patient-mini-profile">
                        <FaUserCircle className="mini-avatar" />
                        <div>
                            <h4>{caseData?.patientName || 'Patient'}</h4>
                            <span>ID: {patientId.substring(0, 10)}...</span>
                        </div>
                    </div>

                    <div className="detail-item">
                        <label>Triage Data</label>
                        <span className={`status-badge ${caseData?.urgency}`}>{caseData?.urgency || 'NORMAL'}</span>
                    </div>
                </div>

                <div className="vitals-snapshot">
                    <h4><FaHeartbeat /> Live Telemetry</h4>
                    <div className="vitals-grid">
                        <div className="vital">
                            <span className="label"><FaHeartbeat /> Heart Rate</span>
                            <span className="value">{vitals.bpm} <small>BPM</small></span>
                        </div>
                        <div className="vital">
                            <span className="label"><FaTint /> SpO2</span>
                            <span className="value">{vitals.o2.toFixed(1)} <small>%</small></span>
                        </div>
                        <div className="vital">
                            <span className="label"><FaThermometerHalf /> Temp</span>
                            <span className="value">{vitals.temp} <small>°F</small></span>
                        </div>
                    </div>
                </div>

                <div className="sidebar-actions">
                    <button 
                        className="presc-btn-action"
                        onClick={() => navigate(`/dashboard/doctor/prescription/${encodeURIComponent(patientId)}`)}
                    >
                        <FaPrescription /> Generate Prescription
                    </button>
                    <button className="end-call-btn" onClick={handleEndCall}>
                        <FaPhoneSlash /> End Session
                    </button>
                </div>

                <div className="session-security">
                    <FaCircle className="pulse-dot" /> End-to-end Encrypted
                </div>
            </div>
        </div>
    );
};

export default Teleconsultation;
