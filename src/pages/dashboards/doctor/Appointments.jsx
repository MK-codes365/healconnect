import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendar, FaVideo, FaClock, FaChevronLeft, FaChevronRight, FaList } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../api';
import './Appointments.css';

const Appointments = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [view, setView] = useState('upcoming');
    const [calendarView, setCalendarView] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointmentsList, setAppointmentsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!user?.id && !user?.email) return;
            try {
                const data = await api.getDoctorAppointments(user.id || user.email);
                setAppointmentsList(data);
            } catch (err) {
                console.error("Error fetching appointments:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, [user]);

    const upcomingAppointments = appointmentsList.filter(a => a.status === 'scheduled');
    const pastAppointments = appointmentsList.filter(a => a.status === 'completed');
    const appointments = view === 'upcoming' ? upcomingAppointments : pastAppointments;

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    return (
        <div className="appointments-container">
            <div className="appointments-header">
                <button onClick={() => navigate('/dashboard/doctor')} className="back-btn">
                    <FaArrowLeft /> Back
                </button>
                <h2><FaCalendar /> Live Medical Appointments</h2>
            </div>

            <div className="view-controls">
                <div className="view-toggle">
                    <button
                        className={view === 'upcoming' ? 'active' : ''}
                        onClick={() => setView('upcoming')}
                    >
                        Upcoming ({upcomingAppointments.length})
                    </button>
                    <button
                        className={view === 'past' ? 'active' : ''}
                        onClick={() => setView('past')}
                    >
                        Past ({pastAppointments.length})
                    </button>
                </div>
                <button 
                    className="calendar-toggle-btn"
                    onClick={() => setCalendarView(!calendarView)}
                >
                    {calendarView ? <><FaList /> List View</> : <><FaCalendar /> Calendar View</>}
                </button>
            </div>

            <div className="appointments-list">
                {loading ? (
                    <div className="loading-state">Syncing with Registry...</div>
                ) : appointments.length === 0 ? (
                    <div className="empty-state">
                        <p style={{ fontSize: '3rem' }}>📅</p>
                        <h3>No {view} appointments</h3>
                        <p>All clear in the cloud registry.</p>
                    </div>
                ) : (
                    appointments.map(appointment => (
                        <div key={appointment.sk} className="appointment-card glass-card">
                            <div className="appointment-time">
                                <FaClock />
                                <div>
                                    <p className="date">{appointment.appointmentDate || new Date(appointment.submittedAt).toLocaleDateString()}</p>
                                    <p className="time">{appointment.appointmentTime || 'Immediate'}</p>
                                </div>
                            </div>
                            <div className="appointment-patient">
                                <h3>{appointment.patientName || "Unknown Patient"}</h3>
                                <p>Specialty: {appointment.specialty}</p>
                                <p className="triage">Urgency: {appointment.urgency}</p>
                            </div>
                            <div className="appointment-type">
                                <FaVideo />
                                <span>Cloud Consultation</span>
                            </div>
                            {view === 'upcoming' && (
                                <button
                                    className="join-btn"
                                    onClick={() => navigate(`/dashboard/doctor/case/${encodeURIComponent(appointment.patientId)}`)}
                                >
                                    Examine Record
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Appointments;