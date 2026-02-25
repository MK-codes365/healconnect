import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaVideo, FaMicrophone, FaVideoSlash, FaMicrophoneSlash, FaPhoneSlash, FaFileMedical, FaPrescription } from 'react-icons/fa';
import './Teleconsultation.css';

const Teleconsultation = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);

    const handleEndCall = () => {
        if (confirm('End consultation?')) {
            navigate('/dashboard/doctor');
        }
    };

    return (
        <div className="teleconsultation-container">
            <div className="video-area">
                <div className="main-video">
                    <div className="video-placeholder">
                        <div className="pulse-circle"></div>
                        <p>📹 Patient Video Feed</p>
                        <small>(Encrypted WebRTC Channel Active)</small>
                    </div>
                </div>
                <div className="self-video">
                    <div className="video-placeholder-small">
                        <p>Your Video</p>
                    </div>
                </div>
            </div>

            <div className="patient-sidebar">
                <div className="sidebar-header">
                    <h3><FaFileMedical /> Consultation Room</h3>
                </div>
                
                <div className="patient-details">
                    <div className="detail-item">
                        <label>Case ID</label>
                        <span>#{id || 'C-772'}</span>
                    </div>
                    <div className="detail-item">
                        <label>Symptoms</label>
                        <span>Fever, Shortness of Breath</span>
                    </div>
                    <div className="detail-item">
                        <label>Triage Risk</label>
                        <span className="urgency-tag high">HIGH</span>
                    </div>
                </div>

                <div className="vitals-snapshot">
                    <h4>Vitals Snapshot</h4>
                    <div className="vitals-grid">
                        <div className="vital">
                            <span className="label">BPM</span>
                            <span className="value">98</span>
                        </div>
                        <div className="vital">
                            <span className="label">O2</span>
                            <span className="value">96%</span>
                        </div>
                        <div className="vital">
                            <span className="label">Temp</span>
                            <span className="value">101°F</span>
                        </div>
                    </div>
                </div>

                <div className="quick-notes">
                    <h4>Consultation Notes</h4>
                    <textarea 
                        placeholder="Observe patient symptoms, breathing patterns, and document recommendations..." 
                        rows="6"
                    ></textarea>
                </div>

                <div className="sidebar-actions">
                    <button 
                        className="prescription-btn"
                        onClick={() => navigate(`/dashboard/doctor/prescription/${id || 'P001'}`)}
                    >
                        <FaPrescription /> Create Prescription
                    </button>
                </div>
            </div>

            <div className="controls-bar">
                <div className="call-duration">00:04:12</div>
                <div className="main-controls">
                    <button
                        className={`control-btn ${!videoEnabled ? 'disabled' : ''}`}
                        onClick={() => setVideoEnabled(!videoEnabled)}
                    >
                        {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
                    </button>
                    <button
                        className={`control-btn ${!audioEnabled ? 'disabled' : ''}`}
                        onClick={() => setAudioEnabled(!audioEnabled)}
                    >
                        {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    </button>
                    <button className="control-btn end-call" onClick={handleEndCall}>
                        <FaPhoneSlash /> End Call
                    </button>
                </div>
                <div className="call-quality">Excellent Connection</div>
            </div>
        </div>
    );
};

export default Teleconsultation;