import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaEye, FaCalendarDay } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../api';
import './MyVisits.css';

const MyVisits = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVisits = async () => {
            const patientId = user?.id || user?.email;
            if (!patientId) {
                setLoading(false);
                return;
            }
            try {
                const data = await api.getCasesByPatient(patientId);
                const sorted = data.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
                setVisits(sorted);
            } catch (err) {
                console.error("Error fetching visits:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVisits();
    }, [user]);

    const handleDownloadPDF = (visit) => {
        const printWindow = window.open('', '_blank');
        const content = `
            <html>
                <head><title>Clinical Visit Summary - HealConnect</title></head>
                <body style="font-family: sans-serif; padding: 40px;">
                    <h1 style="color: #10a37f;">HealConnect Clinical Summary</h1>
                    <hr/>
                    <p><strong>Date:</strong> ${new Date(visit.submittedAt).toLocaleDateString()}</p>
                    <p><strong>Specialty:</strong> ${visit.specialty}</p>
                    <p><strong>Urgency:</strong> ${visit.urgency}</p>
                    <h3>Symptoms:</h3>
                    <ul>${(visit.symptoms || []).map(s => `<li>${s}</li>`).join('')}</ul>
                    <p><strong>AI Recommendation:</strong> ${visit.recommendation || 'Consultation via HealConnect'}</p>
                    <script>window.print();</script>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
    };

    if (loading) {
        return <div className="visits-loading">Loading your health records...</div>;
    }

    return (
        <div className="my-visits-container">
            <div className="visits-header">
                <div className="visits-back-wrapper">
                    <button onClick={() => navigate('/dashboard/patient')} className="visits-back-btn">
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                </div>
                <h2>My Clinical Visits</h2>
                <p className="subtitle">View and manage your consultation history</p>
            </div>

            <div className="visits-list">
                {visits.map(visit => (
                    <div key={visit.sk} className="visit-card glass-card">
                        <div className="visit-main-info">
                            <div className="visit-status">
                                <span className={`urgency-pill ${visit.urgency}`}>
                                    {visit.urgency} Urgency
                                </span>
                                <span className={`status-tag ${visit.status}`}>
                                    {visit.status.toUpperCase()}
                                </span>
                            </div>
                            
                            <div className="visit-meta">
                                <div className="meta-item">
                                    <FaCalendarDay />
                                    <span>{new Date(visit.submittedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="specialty-badge">{visit.specialty}</div>
                            </div>

                            <div className="symptoms-section">
                                <h4>Reported Symptoms</h4>
                                <div className="symptoms-tags">
                                    {(Array.isArray(visit.symptoms) ? visit.symptoms : []).map((s, idx) => (
                                        <span key={idx} className="symptom-tag">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="visit-footer">
                            <div className="footer-actions">
                                <button className="action-btn secondary" onClick={() => handleDownloadPDF(visit)}>
                                    <FaDownload /> Summary
                                </button>
                                <button className="action-btn primary" onClick={() => navigate(`/dashboard/patient/ai-chat`)}>
                                    <FaEye /> View Chat
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {visits.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon shadow-pulse">📋</div>
                        <h3>No visits found</h3>
                        <p>Start a conversation with our AI Assistant to get your first medical triage.</p>
                        <button className="start-btn" onClick={() => navigate('/dashboard/patient/ai-chat')}>
                            Start AI Chat
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyVisits;