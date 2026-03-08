import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaUserMd } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../api';
import './Messaging.css';

const Messaging = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const scrollRef = useRef();

    const patientId = user?.id || user?.email;

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState(location.state?.doctorId || '');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch available doctors
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const activeDocs = await api.getActiveDoctors();
                if (activeDocs && activeDocs.length > 0) {
                    setDoctors(activeDocs);
                    if (!selectedDoctorId) {
                        setSelectedDoctorId(activeDocs[0].email || activeDocs[0].id);
                    }
                } else {
                    // Fallback list for demo purposes if DB is empty
                    const fallbackDocs = [
                        { id: 'dr.anil@healconnect.com', name: 'Dr. Anil Verma' },
                        { id: 'dr.priya@healconnect.com', name: 'Dr. Priya Sharma' }
                    ];
                    setDoctors(fallbackDocs);
                    if (!selectedDoctorId) {
                        setSelectedDoctorId(fallbackDocs[0].id);
                    }
                }
            } catch (err) {
                console.error("Fetch doctors error:", err);
            }
        };
        fetchDoctors();
    }, [selectedDoctorId]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!patientId || !selectedDoctorId) return;
            try {
                const data = await api.getMessages(patientId, selectedDoctorId);
                setMessages(data);
            } catch (err) {
                console.error("Fetch messages error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Polling faster for better UX
        return () => clearInterval(interval);
    }, [patientId, selectedDoctorId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !selectedDoctorId) return;
        const msgData = {
            senderId: patientId,
            receiverId: selectedDoctorId,
            text: input,
            senderRole: 'patient',
            timestamp: Date.now()
        };

        try {
            await api.sendMessage(msgData);
            setMessages(prev => [...prev, msgData]);
            setInput('');
        } catch (err) {
            console.error(err);
            alert("Failed to send message");
        }
    };

    const currentDoctor = doctors.find(d => (d.email || d.id) === selectedDoctorId) || { name: 'Doctor' };

    return (
        <div className="messaging-container animate-fade-in">
            <div className="messaging-header solid-nav">
                <button onClick={() => navigate('/dashboard/patient')} className="back-btn">
                    <FaArrowLeft /> Dashboard
                </button>
                <div className="header-doctor-select">
                    <FaUserMd className="doctor-icon" />
                    <select 
                        value={selectedDoctorId} 
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="doctor-dropdown"
                    >
                        {doctors.map(doc => (
                            <option key={doc.email || doc.id} value={doc.email || doc.id}>
                                {doc.name || 'Doctor'}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="messages-list solid-card">
                {messages.length === 0 && !loading && (
                    <div className="empty-messages">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                )}
                {messages.map((msg, index) => {
                    const isPatient = msg.senderId === patientId;
                    return (
                        <div key={index} className={`message-wrapper ${isPatient ? 'patient' : 'doctor'}`}>
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

            <div className="message-input-area solid-card">
                <input
                    type="text"
                    placeholder="Type your secure message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend} disabled={!input.trim() || !selectedDoctorId} className="send-btn">
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
};

export default Messaging;
