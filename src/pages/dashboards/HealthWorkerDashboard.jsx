import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserPlus, FaFileMedical, FaClipboardList, FaComments } from 'react-icons/fa';
import './HealthWorkerDashboard.css';

const HealthWorkerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        registeredToday: 0,
        pendingSync: 0,
        doctorFeedback: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const [patients, cases] = await Promise.all([
                    api.getPatients(),
                    api.getCases()
                ]);

                // Calculate stats based on real data
                const today = new Date().setHours(0, 0, 0, 0);
                const regToday = patients.filter(p => new Date(p.createdAt || Date.now()).setHours(0,0,0,0) === today).length;
                const pending = cases.filter(c => c.status === 'open' || c.status === 'pending').length;
                const feedback = cases.filter(c => c.doctorFeedback).length;

                setStats({
                    registeredToday: regToday,
                    pendingSync: pending,
                    doctorFeedback: feedback
                });
            } catch (error) {
                console.error("Dashboard Sync Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="worker-dashboard-container animate-fade-in">
            <div className="dashboard-header glass-nav">
                <div className="header-left">
                    <h1>Welcome, {user?.name}</h1>
                    <div className="status-badge">
                        <span className="pulse-dot"></span>
                        Field Operations Active
                    </div>
                </div>
                <button onClick={logout} className="logout-btn">Logout</button>
            </div>

            <div className="dashboard-content">
                <div className="stats-strip">
                    <div className="mini-stat glass-card">
                        <span className="value">{loading ? '...' : stats.registeredToday}</span>
                        <span className="label">Registered Today</span>
                    </div>
                    <div className="mini-stat glass-card">
                        <span className="value">{loading ? '...' : stats.pendingSync}</span>
                        <span className="label">Active Hub Cases</span>
                    </div>
                    <div className="mini-stat glass-card">
                        <span className="value">{loading ? '...' : stats.doctorFeedback}</span>
                        <span className="label">Doctor Feedback</span>
                    </div>
                </div>

                <div className="quick-actions-grid">
                    <div className="action-card glass-card" onClick={() => navigate('/dashboard/worker/register-patient')}>
                        <div className="icon-box blue">
                            <FaUserPlus />
                        </div>
                        <div className="action-info">
                            <h3>Patient Registration</h3>
                            <p>Onboard new community members to the cloud registry.</p>
                        </div>
                        <div className="action-arrow">→</div>
                    </div>

                    <div className="action-card glass-card" onClick={() => navigate('/dashboard/worker/submit-case')}>
                        <div className="icon-box green">
                            <FaFileMedical />
                        </div>
                        <div className="action-info">
                            <h3>Submit Clinical Case</h3>
                            <p>Upload vitals, symptoms, and run AI pre-triage.</p>
                        </div>
                        <div className="action-arrow">→</div>
                    </div>

                    <div className="action-card glass-card" onClick={() => navigate('/dashboard/worker/my-cases')}>
                        <div className="icon-box purple">
                            <FaClipboardList />
                        </div>
                        <div className="action-info">
                            <h3>Case History</h3>
                            <p>Track your submitted cases and review doctor responses.</p>
                        </div>
                        <div className="action-arrow">→</div>
                    </div>

                    <div className="action-card glass-card" onClick={() => navigate('/dashboard/worker/messages')}>
                        <div className="icon-box orange">
                            <FaComments />
                        </div>
                        <div className="action-info">
                            <h3>Team Communications</h3>
                            <p>Chat with specializing doctors regarding active cases.</p>
                        </div>
                        <div className="action-arrow">→</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthWorkerDashboard;