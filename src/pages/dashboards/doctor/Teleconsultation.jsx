import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaVideo, FaMicrophone, FaVideoSlash, FaMicrophoneSlash, FaPhoneSlash, FaFileMedical, FaPrescription, FaHeartbeat, FaThermometerHalf, FaTint } from 'react-icons/fa';
import './Teleconsultation.css';

const Teleconsultation = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const videoRef = useRef(null);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [stream, setStream] = useState(null);
    
    // Simulated Live Vitals
    const [vitals, setVitals] = useState({
        bpm: 98,
        o2: 96,
        temp: 101.2
    });

    useEffect(() => {
        const startVideo = async () => {
            try {
                const userStream = await navigator.mediaDevices.getUserMedia({ 
                    video: true, 
                    audio: true 
                });
                setStream(userStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = userStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        };

        startVideo();

        // Simulate fluctuating vitals
        const vitalInterval = setInterval(() => {
            setVitals(prev => ({
                bpm: Math.floor(prev.bpm + (Math.random() * 4 - 2)),
                o2: Math.min(100, Math.max(90, prev.o2 + (Math.random() > 0.5 ? 0.1 : -0.1))),
                temp: parseFloat((prev.temp + (Math.random() * 0.2 - 0.1)).toFixed(1))
            }));
        }, 2000);

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            clearInterval(vitalInterval);
        };
    }, []);

    const handleEndCall = () => {
        if (confirm('End consultation?')) {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            navigate('/dashboard/doctor');
        }
    };

    return (
        <div className="teleconsultation-container animate-fade-in">
            <div className="video-area">
                <div className="main-video glass-card">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        playsInline 
                        className={`remote-video ${!videoEnabled ? 'hidden' : ''}`}
                    />
                    {!videoEnabled && (
                        <div className="video-placeholder">
                            <div className="pulse-circle"></div>
                            <p>📹 Connection Secured</p>
                            <small>Camera feed hidden by participant</small>
                        </div>
                    )}
                </div>
                <div className="self-video glass-card">
                    {/* In a real app, this would be the doctor's feed */}
                    <div className="video-placeholder-small">
                        <p>Doctor (You)</p>
                    </div>
                </div>
            </div>

            <div className="patient-sidebar glass-card">
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
                        <span>Persistent Fever, Shortness of Breath</span>
                    </div>
                    <div className="detail-item">
                        <label>AI Triage Risk</label>
                        <span className="status-badge status-urgent">HIGH</span>
                    </div>
                </div>

                <div className="vitals-snapshot">
                    <h4><FaHeartbeat /> Live Vitals (IoT Linked)</h4>
                    <div className="vitals-grid">
                        <div className="vital glass-card">
                            <span className="label"><FaHeartbeat /> BPM</span>
                            <span className="value">{vitals.bpm}</span>
                        </div>
                        <div className="vital glass-card">
                            <span className="label"><FaTint /> O2</span>
                            <span className="value">{vitals.o2.toFixed(1)}%</span>
                        </div>
                        <div className="vital glass-card">
                            <span className="label"><FaThermometerHalf /> Temp</span>
                            <span className="value">{vitals.temp}°F</span>
                        </div>
                    </div>
                </div>

                <div className="quick-notes">
                    <h4>Clinical Observations</h4>
                    <textarea 
                        className="glass-input"
                        placeholder="Observe patient symptoms, breathing patterns, and document recommendations..." 
                        rows="6"
                    ></textarea>
                </div>

                <div className="sidebar-actions">
                    <button 
                        className="btn-primary"
                        onClick={() => navigate(`/dashboard/doctor/prescription/${id || 'P001'}`)}
                    >
                        <FaPrescription /> Generate Digital Prescription
                    </button>
                </div>
            </div>

            <div className="controls-bar glass-nav">
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
                <div className="call-quality">Connection: High Bandwidth</div>
            </div>
        </div>
    );
};

export default Teleconsultation;
