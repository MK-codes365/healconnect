import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaVideo, FaNotesMedical, FaRobot, FaUser, FaHistory, FaCheckCircle, FaClock } from 'react-icons/fa';
import ReactMarkdown from "react-markdown";
import { api } from '../../../api';
import './WorkerCaseDetail.css';

const WorkerCaseDetail = () => {
    const navigate = useNavigate();
    const { id: caseSk } = useParams(); // Using sk from DynamoDB
    const [caseData, setCaseData] = useState(null);
    const [aiSession, setAiSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch cases to find this specific one
                const allCases = await api.getCases();
                const foundCase = allCases.find(c => c.sk === caseSk);
                setCaseData(foundCase);

                if (foundCase?.patientId) {
                    // 2. Fetch AI Sessions for this patient
                    const sessions = await api.getChatSessions(foundCase.patientId);
                    const relevantSession = foundCase?.sessionId 
                        ? sessions.find(s => s.sessionId === foundCase.sessionId)
                        : sessions[0];
                    setAiSession(relevantSession);
                }

            } catch (error) {
                console.error("Error fetching case details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [caseSk]);

    if (loading) return (
        <div className="worker-detail-loading animate-fade-in">
            <div className="spinner"></div>
            <p>Decrypting clinical records from regional hub...</p>
        </div>
    );
    
    if (!caseData) return (
        <div className="worker-detail-error animate-fade-in">
            <h2>Case Not Found</h2>
            <p>The requested record could not be retrieved from the cloud registry.</p>
            <button onClick={() => navigate('/dashboard/worker/my-cases')} className="back-btn">Return to Case History</button>
        </div>
    );

    return (
        <div className="worker-case-detail-page animate-fade-in">
            <div className="case-detail-header glass-nav">
                <button onClick={() => navigate('/dashboard/worker/my-cases')} className="back-btn">
                    <FaArrowLeft /> Case History
                </button>
                <div className="header-titles">
                    <h2>Patient Clinical Record</h2>
                    <span className="case-id">Registry Token: {caseData.sk}</span>
                </div>
            </div>

            <div className="case-detail-layout">
                <div className="detail-main">
                    <div className="clinical-top-grid">
                        <div className="patient-master-card glass-card">
                            <div className="card-header">
                                <FaUser />
                                <h3>Patient Bio-Data</h3>
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
                                    <p>{caseData.village || 'Remote Site'}</p>
                                </div>
                                <div className="info-node">
                                    <label>Sync Date</label>
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
                                    <span className="label">Urgency Status:</span>
                                    <div className="badge">{caseData.urgency}</div>
                                </div>
                                <div className="symptoms-section">
                                    <span className="label">Logged Symptoms:</span>
                                    <div className="tags">
                                        {(caseData.symptoms || []).map((s, i) => (
                                            <span key={i} className="tag">{s}</span>
                                        ))}
                                        {(!caseData.symptoms || caseData.symptoms.length === 0) && <span className="no-data">No symptoms tagged</span>}
                                    </div>
                                </div>
                                <div className="rec-section">
                                    <span className="label">AI Diagnostic Lead:</span>
                                    <p>{caseData.recommendation || 'Clinical review required.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="observations-section glass-card">
                        <div className="section-header">
                            <FaNotesMedical />
                            <h3>Field Worker Observations</h3>
                        </div>
                        <div className="obs-content">
                            <p>{caseData.observations || "No additional observations provided by field worker."}</p>
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
                                <div className="no-transcript">No cloud transcript session associated with this record.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="detail-sidebar">
                    <div className="status-console glass-card">
                        <div className="console-header">
                            <FaCheckCircle />
                            <h3>Regional Hub Status</h3>
                        </div>
                        
                        <div className="status-timeline">
                            <div className={`step active`}>
                                <span className="dot"></span>
                                <div className="step-text">
                                    <h4>Case Submitted</h4>
                                    <p>{new Date(caseData.submittedAt).toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <div className={`step ${caseData.doctorFeedback ? 'active' : 'pending'}`}>
                                <span className="dot"></span>
                                <div className="step-text">
                                    <h4>Specialist Review</h4>
                                    <p>{caseData.doctorFeedback ? 'Completed' : 'Awaiting Review'}</p>
                                </div>
                            </div>
                        </div>

                        {caseData.doctorFeedback ? (
                            <div className="doctor-resp-box animate-slide-up">
                                <label>Specialist Orders</label>
                                <div className="resp-text">
                                    "{caseData.doctorFeedback}"
                                </div>
                                <button className="start-chat-btn btn-primary" onClick={() => navigate('/dashboard/worker/messages')}>
                                    Open Clinical Chat
                                </button>
                            </div>
                        ) : (
                            <div className="waiting-box">
                                <FaClock className="pulse" />
                                <p>The case is securely queued for specialist analysis at the regional hub.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerCaseDetail;
