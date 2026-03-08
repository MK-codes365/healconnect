import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHistory, FaCheckCircle, FaUserShield, FaCogs } from 'react-icons/fa';
import { api } from '../../../api';
import './AuditLogs.css';

const AuditLogs = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await api.getAuditLogs();
                setLogs(data);
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const getIcon = (action) => {
        if (action.includes('VERIFY')) return <FaCheckCircle className="icon verify" />;
        if (action.includes('USER')) return <FaUserShield className="icon user" />;
        if (action.includes('CONFIG')) return <FaCogs className="icon config" />;
        return <FaHistory className="icon default" />;
    };

    return (
        <div className="audit-container">
            <div className="audit-header">
                <button onClick={() => navigate('/dashboard/admin')} className="back-btn">
                    <FaArrowLeft /> Back
                </button>
                <h2><FaHistory /> Administrative Audit Trails</h2>
            </div>

            <div className="logs-list">
                {loading ? (
                    <div className="loading-state">Decrypting Logs...</div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">No administrative activity recorded.</div>
                ) : (
                    logs.map(log => (
                        <div key={log.sk} className="log-row">
                            <div className="log-action">
                                {getIcon(log.action)}
                                <div>
                                    <h4>{log.action}</h4>
                                    <p>{JSON.stringify(log.details)}</p>
                                </div>
                            </div>
                            <div className="log-meta">
                                <span className="timestamp">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
