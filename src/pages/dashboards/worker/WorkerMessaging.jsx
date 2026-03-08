import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaUserMd, FaCircle, FaShieldAlt, FaClock } from 'react-icons/fa';
import './WorkerMessaging.css';

const WorkerMessaging = () => {
    const navigate = useNavigate();
    const [selectedDoctor, setSelectedDoctor] = useState('D001');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState({
        D001: [
            { sender: 'doctor', text: 'Thank you for submitting the case. I\'ve reviewed it.', time: '10:30 AM' },
            { sender: 'worker', text: 'Should I schedule a follow-up visit?', time: '10:35 AM' }
        ],
        D002: [
            { sender: 'worker', text: 'Patient is showing improvement after medication.', time: '11:00 AM' }
        ]
    });

    const doctors = [
        { id: 'D001', name: 'Dr. Priya Sharma', specialty: 'Cardiology', status: 'online', unread: 0 },
        { id: 'D002', name: 'Dr. Anil Verma', specialty: 'General Practice', status: 'away', unread: 1 }
    ];

    const handleSend = () => {
        if (!message.trim()) return;
        const newMessage = {
            sender: 'worker',
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => ({
            ...prev,
            [selectedDoctor]: [...(prev[selectedDoctor] || []), newMessage]
        }));
        setMessage('');
    };

    const currentMessages = messages[selectedDoctor] || [];
    const currentDoctor = doctors.find(d => d.id === selectedDoctor);

    return (
        <div className="messaging-page animate-fade-in">
            <div className="messaging-header glass-nav">
                <button onClick={() => navigate('/dashboard/worker')} className="back-btn">
                    <FaArrowLeft /> Dashboard
                </button>
                <div className="header-titles">
                    <h2>Tele-Consultation Stream</h2>
                    <span className="subtitle">Secure Regional Hub Communications</span>
                </div>
                <div className="encryption-badge">
                    <FaShieldAlt /> E2E Encrypted
                </div>
            </div>

            <div className="messaging-content">
                <div className="doctors-sidebar glass-card">
                    <div className="sidebar-header">
                        <h3>Regional Specialists</h3>
                    </div>
                    <div className="doctors-list">
                        {doctors.map(doctor => (
                            <div
                                key={doctor.id}
                                className={`doctor-card ${selectedDoctor === doctor.id ? 'active' : ''}`}
                                onClick={() => setSelectedDoctor(doctor.id)}
                            >
                                <div className="doctor-avatar">
                                    <div className="avatar-initials">{doctor.name[0]}</div>
                                    <FaCircle className={`status-dot ${doctor.status}`} />
                                </div>
                                <div className="doctor-brief">
                                    <p className="d-name">{doctor.name}</p>
                                    <p className="d-specialty">{doctor.specialty}</p>
                                </div>
                                {doctor.unread > 0 && (
                                    <span className="unread-count">{doctor.unread}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chat-console glass-card">
                    <div className="chat-header">
                        <div className="chat-doctor-info">
                            <FaUserMd className="doc-icon" />
                            <div>
                                <h4>{currentDoctor?.name}</h4>
                                <span className="doc-specialty">{currentDoctor?.specialty}</span>
                            </div>
                        </div>
                        <div className="chat-actions">
                            <span className="hub-status">Connected to Hub-04</span>
                        </div>
                    </div>

                    <div className="messages-stream">
                        {currentMessages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${msg.sender}`}>
                                <div className="bubble-content">
                                    <p>{msg.text}</p>
                                    <div className="bubble-footer">
                                        <FaClock /> {msg.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="chat-input-wrapper">
                        <input
                            type="text"
                            placeholder="Type clinical observations or queries..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className="send-btn" onClick={handleSend} disabled={!message.trim()}>
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerMessaging;