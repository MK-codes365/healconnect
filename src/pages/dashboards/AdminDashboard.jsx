import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserShield, FaChartPie, FaStethoscope, FaBroadcastTower, FaHistory, FaCogs } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <div className="header-info">
                    <h1>Command Center</h1>
                    <p className="subtitle">Welcome back, Administrator {user?.name}</p>
                </div>
                <button onClick={logout} className="logout-btn">Log Out</button>
            </div>

            <div className="quick-actions">
                <div className="action-card" onClick={() => navigate('/dashboard/admin/users')}>
                    <FaUserShield className="card-icon blue" />
                    <div className="card-text">
                        <h3>User Registry</h3>
                        <p>Audit and Manage all platform actors</p>
                    </div>
                </div>

                <div className="action-card" onClick={() => navigate('/dashboard/admin/analytics')}>
                    <FaChartPie className="card-icon teal" />
                    <div className="card-text">
                        <h3>Regional Analytics</h3>
                        <p>Identify disease hotspots and trends</p>
                    </div>
                </div>

                <div className="action-card" onClick={() => navigate('/dashboard/admin/verification')}>
                    <FaStethoscope className="card-icon purple" />
                    <div className="card-text">
                        <h3>Doctor Verification</h3>
                        <p>Verify clinical credentials in the cloud</p>
                    </div>
                </div>

                <div className="action-card alert" onClick={() => navigate('/dashboard/admin/emergency-monitor')}>
                    <FaBroadcastTower className="card-icon red" />
                    <div className="card-text">
                        <h3>Emergency Monitor</h3>
                        <p>Live High-Urgency Clinical Feed</p>
                    </div>
                </div>

                <div className="action-card" onClick={() => navigate('/dashboard/admin/audit-logs')}>
                    <FaHistory className="card-icon gold" />
                    <div className="card-text">
                        <h3>Audit Trails</h3>
                        <p>Full administrative compliance log</p>
                    </div>
                </div>

                <div className="action-card" onClick={() => navigate('/dashboard/admin/settings')}>
                    <FaCogs className="card-icon gray" />
                    <div className="card-text">
                        <h3>System Control</h3>
                        <p>Configure global platform state</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;