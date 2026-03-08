import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaVideo, FaNotesMedical, FaRobot, FaUser, FaHistory } from 'react-icons/fa';
import ReactMarkdown from "react-markdown";
import { api } from '../../../api';
import './CaseDetail.css';

const CaseDetail = () => {
    const navigate = useNavigate();
    const { id: patientId } = useParams(); // patientId is passed as :id
    const [notes, setNotes] = useState('');
    const [caseData, setCaseData] = useState(null);
    const [aiSession, setAiSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch cases to find this specific one
                const allCases = await api.getCases();
                const foundCase = allCases.find(c => c.patientId === patientId);
                setCaseData(foundCase);

                // 2. Fetch AI Sessions for this patient
                const sessions = await api.getChatSessions(patientId);
                // If the case points to a specific session, find it, otherwise take newest
                const relevantSession = foundCase?.sessionId 
                    ? sessions.find(s => s.sessionId === foundCase.sessionId)
                    : sessions[0];
                setAiSession(relevantSession);

            } catch (error) {
                console.error("Error fetching case details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [patientId]);

    if (loading) return <div className="loading-state">Loading clinical data...</div>;
    if (!caseData) return <div className="error-state">Case not found in cloud registry.</div>;

    const handleStartConsultation = () => {
        navigate(`/dashboard/doctor/consult/${encodeURIComponent(patientId)}`);
    };

    const handleCreatePrescription = () => {
        navigate(`/dashboard/doctor/prescription/${encodeURIComponent(patientId)}`);
    };

    return (
        <div className="case-detail-page animate-fade-in">
            <div className="case-detail-header glass-nav">
                <button onClick={() => navigate('/dashboard/doctor')} className="back-btn">
                    <FaArrowLeft /> Dashboard
                </button>
                <div className="header-titles">
                    <h2>Clinical Case Review</h2>
                    <span className="case-id">Registry ID: {caseData.sk}</span>
                </div>
            </div>

            <div className="case-detail-layout">
                <div className="detail-primary">
                    <div className="clinical-grid">
                        <div className="patient-master-card glass-card">
                            <div className="card-header">
                                <FaUser />
                                <h3>Patient Master File</h3>
                            </div>
                            <div className="info-grid">
                                <div className="info-node">
                                    <label>Full Name</label>
                                    <p>{caseData.patientName}</p>
                                </div>
                                <div className="info-node">
                                    <label>Clinical Age</label>
                                    <p>{caseData.age || 'N/A'} Yrs</p>
                                </div>
                                <div className="info-node">
                                    <label>Origin Village</label>
                                    <p>{caseData.village || 'Remote'}</p>
                                </div>
                                <div className="info-node">
                                    <label>Registry Entry</label>
                                    <p>{new Date(caseData.submittedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`ai-assessment-card glass-card urgency-${caseData.urgency?.toLowerCase()}`}>
                            <div className="card-header">
                                <FaRobot />
                                <h3>AI Triage Assessment</h3>
                                <div className="urgency-glow"></div>
                            </div>
                            <div className="assessment-body">
                                <div className="urgency-status">
                                    <span className="label">Urgency Level:</span>
                                    <div className="badge">{caseData.urgency}</div>
                                </div>
                                <div className="symptoms-section">
                                    <span className="label">Captured Symptoms:</span>
                                    <div className="tags">
                                        {Array.isArray(caseData.symptoms) ? caseData.symptoms.map((s, i) => (
                                            <span key={i} className="tag">{s}</span>
                                        )) : <span className="tag">{caseData.symptoms}</span>}
                                    </div>
                                </div>
                                <div className="rec-section">
                                    <span className="label">AI Recommendation:</span>
                                    <p>{caseData.recommendation || 'Consultation recommended based on symptoms.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="transcript-section glass-card">
                        <div className="section-header">
                            <FaHistory />
                            <h3>AI Consultation Transcript</h3>
                        </div>
                        <div className="transcript-viewport">
                            {aiSession ? (
                                aiSession.messages.map((msg, idx) => (
                                    <div key={idx} className={`transcript-bubble ${msg.sender}`}>
                                        <div className="bubble-header">
                                            {msg.sender === 'ai' ? 'HealAssist AI' : 'Patient'}
                                        </div>
                                        <div className="bubble-content">
                                            {msg.sender === 'ai' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-transcript">No cloud transcript found for this case.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="detail-sidebar">
                    <div className="notes-console glass-card">
                        <div className="console-header">
                            <FaNotesMedical />
                            <h3>Doctor's Console</h3>
                        </div>
                        <textarea
                            className="clinical-textarea"
                            placeholder="Type clinical observations, differential diagnosis, and treatment plans here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <div className="console-actions">
                            <button className="tele-btn" onClick={handleStartConsultation}>
                                <FaVideo /> Teleconsultation
                            </button>
                            <button className="presc-btn btn-primary" onClick={handleCreatePrescription}>
                                Finalize Prescription
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseDetail;