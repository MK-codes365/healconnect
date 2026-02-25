import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendar, FaVideo, FaClock, FaChevronLeft, FaChevronRight, FaList } from 'react-icons/fa';
import { getAppointments } from '../../../utils/storage';
import './Appointments.css';

const Appointments = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('upcoming');
    const [calendarView, setCalendarView] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointmentsList, setAppointmentsList] = useState([]);

    useEffect(() => {
        setAppointmentsList(getAppointments());
    }, []);

    const upcomingAppointments = appointmentsList.filter(a => a.status === 'scheduled');
    const pastAppointments = appointmentsList.filter(a => a.status === 'completed');
    const appointments = view === 'upcoming' ? upcomingAppointments : pastAppointments;

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const getAppointmentsForDate = (date) => {
        return upcomingAppointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate.toDateString() === date.toDateString();
        });
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const renderCalendar = () => {
        const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
        const days = [];
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayAppointments = getAppointmentsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            days.push(
                <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
                    <div className="day-number">{day}</div>
                    {dayAppointments.length > 0 && (
                        <div className="appointments-indicator">
                            {dayAppointments.map((apt, idx) => (
                                <div key={idx} className="apt-dot" title={`${apt.date.toLocaleTimeString()}`}>
                                    •
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="calendar-grid">
                <div className="calendar-header">
                    {weekDays.map(day => (
                        <div key={day} className="weekday-header">{day}</div>
                    ))}
                </div>
                <div className="calendar-days">{days}</div>
            </div>
        );
    };

    return (
        <div className="appointments-container">
            <div className="appointments-header">
                <button onClick={() => navigate('/dashboard/doctor')} className="back-btn">
                    <FaArrowLeft /> Back
                </button>
                <h2><FaCalendar /> Appointments</h2>
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

            {calendarView && view === 'upcoming' ? (
                <div className="calendar-view">
                    <div className="calendar-navigation">
                        <button onClick={() => navigateMonth(-1)}>
                            <FaChevronLeft />
                        </button>
                        <h3>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                        <button onClick={() => navigateMonth(1)}>
                            <FaChevronRight />
                        </button>
                    </div>
                    {renderCalendar()}
                </div>
            ) : (
                <div className="appointments-list">
                    {appointments.map(appointment => (
                        <div key={appointment.id} className="appointment-card">
                            <div className="appointment-time">
                                <FaClock />
                                <div>
                                    <p className="date">{appointment.date.toLocaleDateString()}</p>
                                    <p className="time">{appointment.date.toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <div className="appointment-patient">
                                <h3>Patient #{appointment.patientId}</h3>
                                <p>Symptoms: {appointment.symptoms.join(', ')}</p>
                                <p className="triage">Triage: {appointment.triageResult}</p>
                            </div>
                            <div className="appointment-type">
                                <FaVideo />
                                <span>{appointment.type === 'video' ? 'Video Call' : 'In-person'}</span>
                            </div>
                            {view === 'upcoming' && (
                                <button
                                    className="join-btn"
                                    onClick={() => navigate(`/dashboard/doctor/consult/${appointment.id}`)}
                                >
                                    Join Consultation
                                </button>
                            )}
                            {view === 'past' && appointment.doctorNotes && (
                                <div className="notes-preview">
                                    <strong>Notes:</strong> {appointment.doctorNotes}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {appointments.length === 0 && !calendarView && (
                <div className="empty-state">
                    <p style={{ fontSize: '3rem' }}>📅</p>
                    <h3>No {view} appointments</h3>
                </div>
            )}
        </div>
    );
};

export default Appointments;