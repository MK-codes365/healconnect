import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCog, FaSave, FaShieldAlt } from 'react-icons/fa';
import { api } from '../../../api';
import './PlatformSettings.css';

const PlatformSettings = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        autoApproveWorkers: false,
        maintenanceMode: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await api.getConfig();
                setSettings(data);
            } catch (error) {
                console.error("Error fetching config:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateConfig(settings);
            alert('Cloud Configuration Synchronized!');
        } catch (error) {
            alert('Sync Failed: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <button onClick={() => navigate('/dashboard/admin')} className="back-btn">
                    <FaArrowLeft /> Back
                </button>
                <h2><FaCog /> Master Platform Control</h2>
            </div>

            {loading ? (
                <div className="loading-state">Syncing Global State...</div>
            ) : (
                <div className="settings-sections">
                    <div className="settings-section">
                        <h3><FaShieldAlt /> System State</h3>
                        <div className="setting-item critical">
                            <div>
                                <h4>Maintenance Mode</h4>
                                <p>Enable globally to restrict all non-admin access.</p>
                            </div>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={settings.maintenanceMode}
                                    onChange={() => handleToggle('maintenanceMode')}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Notifications & Automation</h3>
                        <div className="setting-item">
                            <div>
                                <h4>Email Notifications</h4>
                                <p>Route clinical alerts to healthcare providers via email.</p>
                            </div>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={settings.emailNotifications}
                                    onChange={() => handleToggle('emailNotifications')}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <div className="setting-item">
                            <div>
                                <h4>SMS Emergency Alerts</h4>
                                <p>Enable prioritized SMS routing for HIGH URGENCY cases.</p>
                            </div>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={settings.smsNotifications}
                                    onChange={() => handleToggle('smsNotifications')}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <div className="setting-item">
                            <div>
                                <h4>Auto-Approve Workers</h4>
                                <p>Automatically authorize new health worker tokens (Not Recommended).</p>
                            </div>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={settings.autoApproveWorkers}
                                    onChange={() => handleToggle('autoApproveWorkers')}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            <button 
                className={`save-btn ${saving ? 'saving' : ''}`} 
                onClick={handleSave}
                disabled={loading || saving}
            >
                {saving ? 'Synchronizing...' : <><FaSave /> Commit Changes to Cloud</>}
            </button>
        </div>
    );
};

export default PlatformSettings;