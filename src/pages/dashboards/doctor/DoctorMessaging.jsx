import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaUserCircle, FaCircle } from 'react-icons/fa';
import { api } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import './DoctorMessaging.css';

const DoctorMessaging = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    // 1. Fetch patients (from cases)
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const cases = await api.getCases();
                // Get unique patients from cases
                const uniquePatients = Array.from(new Set(cases.map(c => c.patientId)))
                    .map(id => {
                        const firstCase = cases.find(c => c.patientId === id);
                        return {
                            id: id,
                            name: firstCase.patientName || id.split('@')[0],
                            lastActive: firstCase.submittedAt
                        };
                    });
                setPatients(uniquePatients);
                if (uniquePatients.length > 0 && !selectedPatientId) {
                    setSelectedPatientId(uniquePatients[0].id);
                }
            } catch (err) {
                console.error("Error fetching patients:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    // 2. Poll for messages
    useEffect(() => {
        if (!selectedPatientId || !user?.id && !user?.email) return;

        const doctorId = user.id || user.email;
        const fetchMessages = async () => {
            try {
                const data = await api.getMessages(selectedPatientId, doctorId);
                setMessages(data);
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [selectedPatientId, user]);

    // 3. Scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!message.trim() || !selectedPatientId || !user) return;

        const doctorId = user.id || user.email;
        const messageData = {
            senderId: doctorId,
            receiverId: selectedPatientId,
            text: message,
            timestamp: Date.now()
        };

        try {
            await api.sendMessage(messageData);
            setMessages(prev => [...prev, messageData]);
            setMessage('');
        } catch (err) {
            console.error("Send error:", err);
            alert("Failed to send message.");
        }
    };

    const currentPatient = patients.find(p => p.id === selectedPatientId);

    if (loading) return <div className="loading-state">Syncing secure channel...</div>;

    return (
        <div className="doctor-messaging-container animate-fade-in">
            <div className="messaging-header glass-nav">
                <button onClick={() => navigate('/dashboard/doctor')} className="back-btn">
                    <FaArrowLeft /> Dashboard
                </button>
                <div className="header-info">
                    <h2>Clinical Messaging Portal</h2>
                    <span className="sync-status"><FaCircle className="pulse-dot" /> Live Sync Active</span>
                </div>
            </div>

            <div className="messaging-layout">
                <div className="patients-list glass-card">
                    <div className="list-title">Active Consultations</div>
                    <div className="patients-scroll">
                        {patients.map(patient => (
                            <div
                                key={patient.id}
                                className={`patient-item ${selectedPatientId === patient.id ? 'active' : ''}`}
                                onClick={() => setSelectedPatientId(patient.id)}
                            >
                                <div className="patient-avatar">
                                    <FaUserCircle />
                                </div>
                                <div className="patient-info">
                                    <p className="patient-name">{patient.name}</p>
                                    <p className="patient-id">ID: {patient.id.substring(0, 8)}...</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chat-area glass-card">
                    {selectedPatientId ? (
                        <>
                            <div className="chat-header">
                                <div className="active-patient">
                                    <FaUserCircle className="header-avatar" />
                                    <div>
                                        <h3>{currentPatient?.name}</h3>
                                        <p>Secure Peer-to-Peer Tunnel</p>
                                    </div>
                                </div>
                            </div>

                            <div className="messages-list">
                                {messages.map((msg, index) => {
                                    const isDoctor = msg.senderId === (user.id || user.email);
                                    return (
                                        <div key={index} className={`message-wrapper ${isDoctor ? 'doctor' : 'patient'}`}>
                                            <div className="message-content">
                                                <p>{msg.text}</p>
                                                <span className="message-time">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>

                            <div className="message-input-area">
                                <input
                                    type="text"
                                    placeholder="Type clinical advice or follow-up instructions..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button onClick={handleSend} disabled={!message.trim()} className="send-btn">
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="no-selection">
                            <FaUserCircle className="large-icon" />
                            <p>Select a patient to begin clinical correspondence.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorMessaging;
