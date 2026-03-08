import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaVideo, FaClock, FaCalendarDay, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../api';
import './BookConsultation.css';

const BookConsultation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    // Triage data passed from AIChat
    const triageData = location.state?.triageData;
    const doctor = location.state?.doctor;

    const [bookingType, setBookingType] = useState('instant');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState('');
    const [showVideo, setShowVideo] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleBooking = async () => {
        if (!user?.id && !user?.email) {
            setError("You must be logged in to book an appointment.");
            return;
        }

        if (bookingType === 'schedule' && (!selectedDate || !selectedTime)) {
            setError("Please select both date and time.");
            return;
        }

        setLoading(true);
        setError(null);

        // Payment Simulation
        const proceed = window.confirm("Consultation Fee: ₹500. Procced with secure payment simulation?");
        if (!proceed) {
            setLoading(false);
            return;
        }

        try {
            const patientId = user?.id || user?.email;
            const newRoomName = `HealConnect-${patientId.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`;
            
            const bookingRecord = {
                id: `BOOK-${Date.now()}`,
                patientId: patientId,
                patientName: user?.name || user?.email?.split('@')[0] || "Patient",
                specialty: doctor?.specialty || triageData?.specialty || "General Medicine",
                urgency: triageData?.urgency || "NORMAL",
                status: 'scheduled',
                type: 'BOOKING',
                symptoms: triageData ? [triageData.specialty] : [],
                recommendation: triageData?.recommendation || "Consultation requested",
                submittedAt: Date.now(),
                appointmentDate: bookingType === 'schedule' ? selectedDate : 'Immediate',
                appointmentTime: bookingType === 'schedule' ? selectedTime : 'Now',
                paymentStatus: 'paid',
                roomName: newRoomName
            };

            await api.createCase(bookingRecord);
            
            if (bookingType === 'instant') {
                setRoomName(newRoomName);
                setShowVideo(true);
            } else {
                setSuccess(true);
                setTimeout(() => navigate('/dashboard/patient/visits'), 2500);
            }
        } catch (err) {
            console.error("Booking error:", err);
            setError("Failed to schedule appointment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (showVideo) {
        return (
            <div className="video-consultation-overlay">
                <div className="video-header">
                    <h3>Secure Video Consultation</h3>
                    <button onClick={() => setShowVideo(false)} className="close-video-btn">End Session</button>
                </div>
                <iframe 
                    src={`https://meet.jit.si/${roomName}`}
                    style={{ width: '100%', height: 'calc(100% - 60px)', border: 'none' }}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                ></iframe>
            </div>
        );
    }

    if (success) {
        return (
            <div className="book-consultation-container animate-fade-in">
                <div className="booking-success-container">
                    <div className="success-card glass-card">
                        <FaCheckCircle className="success-icon" />
                        <h2>Booking Confirmed!</h2>
                        <p>Your consultation has been successfully scheduled. You'll find it in your "My Visits" history.</p>
                        <p className="redirect-text">Redirecting to history...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="book-consultation-container animate-fade-in">
            <div className="booking-header">
                <button onClick={() => navigate(-1)} className="visits-back-btn">
                    <FaArrowLeft /> Back
                </button>
                <div className="header-info">
                    <h2>Book Your Consultation</h2>
                    <p className="subtitle">Secure, high-quality healthcare at your fingertips.</p>
                </div>
            </div>

            <div className="booking-layout">
                <div className="booking-main glass-card">
                    {triageData && (
                        <div className="triage-status-bar">
                            <span className="label">Recommended Specialty:</span>
                            <span className="value">{triageData.specialty}</span>
                            <span className={`urgency-tag ${triageData.urgency}`}>{triageData.urgency}</span>
                        </div>
                    )}

                    <div className="booking-options">
                        <div 
                            className={`option-card ${bookingType === 'instant' ? 'active' : ''}`}
                            onClick={() => setBookingType('instant')}
                        >
                            <div className="option-icon"><FaVideo /></div>
                            <div className="option-text">
                                <h3>Consult Now</h3>
                                <p>Connect with a specialist immediately</p>
                            </div>
                        </div>

                        <div 
                            className={`option-card ${bookingType === 'schedule' ? 'active' : ''}`}
                            onClick={() => setBookingType('schedule')}
                        >
                            <div className="option-icon"><FaClock /></div>
                            <div className="option-text">
                                <h3>Schedule</h3>
                                <p>Pick a time that works for you</p>
                            </div>
                        </div>
                    </div>

                    {bookingType === 'schedule' && (
                        <div className="schedule-form animate-fade-in">
                            <div className="form-row">
                                <div className="form-group">
                                    <label><FaCalendarDay /> Select Date</label>
                                    <input 
                                        type="date" 
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><FaClock /> Select Time Slot</label>
                                    <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                                        <option value="">Choose a slot</option>
                                        <option value="09:00 AM">09:00 AM</option>
                                        <option value="10:30 AM">10:30 AM</option>
                                        <option value="01:00 PM">01:00 PM</option>
                                        <option value="03:30 PM">03:30 PM</option>
                                        <option value="05:00 PM">05:00 PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="booking-error">
                            <FaExclamationCircle /> {error}
                        </div>
                    )}

                    <button 
                        className="confirm-booking-btn"
                        onClick={handleBooking}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (bookingType === 'instant' ? 'Start Consultation' : 'Confirm Appointment')}
                    </button>
                </div>

                <div className="booking-aside">
                    <div className="info-card glass-card">
                        <h4>Why HealConnect?</h4>
                        <ul>
                            <li>Verified AI-powered Triage</li>
                            <li>End-to-end Encrypted Calls</li>
                            <li>Instant Prescription Delivery</li>
                            <li>24/7 Specialist Availability</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookConsultation;