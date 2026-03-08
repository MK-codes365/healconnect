import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHeartbeat, FaRobot, FaMicrochip, FaLink, FaUnlink, FaSync } from 'react-icons/fa';
import { triageRules } from '../../../data/mockData';
import { api } from '../../../api';
import { HardwareBridge } from '../../../utils/hardwareBridge';
import './VitalsUpload.css';

const VitalsUpload = () => {
    const navigate = useNavigate();
    const [patientName, setPatientName] = useState('');
    const [symptoms, setSymptoms] = useState([]);
    const [vitals, setVitals] = useState({
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        oxygenSaturation: ''
    });
    const [observations, setObservations] = useState('');
    const [triageResult, setTriageResult] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [patients, setPatients] = useState([]);
    const [isFetchingPatients, setIsFetchingPatients] = useState(false);
    
    // Hardware Bridge State
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const bridgeRef = useRef(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setIsFetchingPatients(true);
                const data = await api.getPatients();
                setPatients(data);
            } catch (error) {
                console.error("Failed to fetch patients:", error);
            } finally {
                setIsFetchingPatients(false);
            }
        };
        fetchPatients();

        return () => {
            if (bridgeRef.current) bridgeRef.current.disconnect();
        };
    }, []);

    const handleHardwareSync = async () => {
        setIsConnecting(true);
        try {
            if (!bridgeRef.current) {
                bridgeRef.current = new HardwareBridge((liveVitals) => {
                    setVitals(liveVitals);
                });
            }
            await bridgeRef.current.connect();
            setIsConnected(true);
        } catch (error) {
            console.error("Hardware connection failed:", error);
            alert("Could not establish connection with IoT sensing node.");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = () => {
        if (bridgeRef.current) bridgeRef.current.disconnect();
        setIsConnected(false);
    };

    const symptomOptions = [
        'Fever', 'Cough', 'Headache', 'Chest Pain', 'Shortness of Breath',
        'Dizziness', 'Nausea', 'Fatigue', 'Body Ache', 'Sore Throat'
    ];

    const toggleSymptom = (symptom) => {
        setSymptoms(prev =>
            prev.includes(symptom)
                ? prev.filter(s => s !== symptom)
                : [...prev, symptom]
        );
    };

    const handleVitalChange = (field, value) => {
        setVitals(prev => ({ ...prev, [field]: value }));
    };

    const runAITriage = () => {
        const searchText = (symptoms.join(' ') + ' ' + observations).toLowerCase();
        
        for (const rule of triageRules) {
            const matchedSymptoms = rule.symptoms.filter(s =>
                searchText.includes(s.toLowerCase())
            );
            if (matchedSymptoms.length > 0) {
                setTriageResult({
                    urgency: rule.urgency,
                    recommendation: rule.recommendation,
                    specialty: rule.specialty
                });
                return;
            }
        }
        setTriageResult({
            urgency: 'LOW',
            recommendation: 'Monitor symptoms and provide primary care.',
            specialty: 'General Practice'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!triageResult) return;
        
        setLoading(true);
        try {
            // Find patient in our registry to get more details
            const matchedPatient = patients.find(p => p.name.toLowerCase() === patientName.toLowerCase());

            const caseData = {
                patientName,
                age: matchedPatient?.age || '',
                village: matchedPatient?.village || '',
                symptoms,
                vitals,
                observations,
                urgency: triageResult.urgency,
                specialty: triageResult.specialty,
                recommendation: triageResult.recommendation,
                submittedAt: Date.now(),
                patientId: matchedPatient?.sk || `P-${Math.floor(1000 + Math.random() * 9000)}`
            };
            await api.createCase(caseData);
            navigate('/dashboard/worker/my-cases');
        } catch (error) {
            console.error(error);
            alert('Failed to sync case with cloud registry.');
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyClass = (urgency) => {
        switch (urgency) {
            case 'HIGH':
            case 'EMERGENCY': return 'urgency-emergency';
            case 'MEDIUM':
            case 'CONSULT': return 'urgency-consult';
            default: return 'urgency-self_care';
        }
    };

    return (
        <div className="vitals-upload-page animate-fade-in">
            <div className="vitals-header glass-nav">
                <button onClick={() => navigate('/dashboard/worker')} className="back-btn">
                    <FaArrowLeft /> Dashboard
                </button>
                <div className="header-titles">
                    <h2>Clinical Case Submission</h2>
                    <span className="subtitle">IoT-Enabled Field Diagnostic Console</span>
                </div>
            </div>

            <div className="vitals-content">
                <form className="vitals-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-left">
                            <div className="form-section glass-card">
                                <div className="section-header">
                                    <FaHeartbeat /> <h3>Primary Patient Identity</h3>
                                </div>
                                <div className="form-group">
                                    <label>Search Registered Patient / Enter Full Name</label>
                                    <div className="input-wrap">
                                        <input
                                            type="text"
                                            list="registry-patients"
                                            required
                                            value={patientName}
                                            onChange={(e) => setPatientName(e.target.value)}
                                            placeholder={isFetchingPatients ? "Loading registry..." : "Type to search community registry..."}
                                            className="patient-search-input"
                                        />
                                        <datalist id="registry-patients">
                                            {patients.map(p => (
                                                <option key={p.sk} value={p.name}>
                                                    {p.age}y • {p.village}
                                                </option>
                                            ))}
                                        </datalist>
                                    </div>
                                    {isFetchingPatients && <div className="fetching-indicator">Syncing with Regional Registry...</div>}
                                </div>
                            </div>

                            <div className="form-section glass-card">
                                <div className="section-header">
                                    <FaMicrochip /> <h3>Hardware Sensor Telemetry</h3>
                                    {!isConnected ? (
                                        <button 
                                            type="button" 
                                            className="hw-connect-btn" 
                                            onClick={handleHardwareSync}
                                            disabled={isConnecting}
                                        >
                                            {isConnecting ? 'Pairing...' : <><FaLink /> Pair IoT Device</>}
                                        </button>
                                    ) : (
                                        <div className="hw-status active">
                                            <span className="pulse"></span> 
                                            Live Stream Active
                                            <button type="button" className="disconnect-btn" onClick={handleDisconnect}><FaUnlink /></button>
                                        </div>
                                    )}
                                </div>
                                <div className="vitals-input-grid">
                                    <div className="vital-field">
                                        <label>BP (mmHg)</label>
                                        <div className="input-with-icon">
                                            <input
                                                type="text"
                                                value={vitals.bloodPressure}
                                                onChange={(e) => handleVitalChange('bloodPressure', e.target.value)}
                                                placeholder="120/80"
                                            />
                                            {isConnected && <FaSync className="sync-icon spin" />}
                                        </div>
                                    </div>
                                    <div className="vital-field">
                                        <label>HR (bpm)</label>
                                        <div className="input-with-icon">
                                            <input
                                                type="number"
                                                value={vitals.heartRate}
                                                onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                                                placeholder="72"
                                            />
                                            {isConnected && <FaSync className="sync-icon spin" />}
                                        </div>
                                    </div>
                                    <div className="vital-field">
                                        <label>Temp (°F)</label>
                                        <div className="input-with-icon">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={vitals.temperature}
                                                onChange={(e) => handleVitalChange('temperature', e.target.value)}
                                                placeholder="98.6"
                                            />
                                            {isConnected && <FaSync className="sync-icon spin" />}
                                        </div>
                                    </div>
                                    <div className="vital-field">
                                        <label>SpO2 (%)</label>
                                        <div className="input-with-icon">
                                            <input
                                                type="number"
                                                value={vitals.oxygenSaturation}
                                                onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
                                                placeholder="98"
                                            />
                                            {isConnected && <FaSync className="sync-icon spin" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-right">
                            <div className="form-section glass-card">
                                <h3>Observation Registry</h3>
                                <div className="symptoms-selector">
                                    <label>Observed Symptoms</label>
                                    <div className="symptoms-tags">
                                        {symptomOptions.map(opt => (
                                            <button
                                                key={opt}
                                                type="button"
                                                className={`tag-btn ${symptoms.includes(opt) ? 'active' : ''}`}
                                                onClick={() => toggleSymptom(opt)}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group" style={{marginTop: '1.5rem'}}>
                                    <label>Clinical Field Observations</label>
                                    <textarea
                                        rows="5"
                                        value={observations}
                                        onChange={(e) => setObservations(e.target.value)}
                                        placeholder="Enter behavioral notes, skin changes, or verbal complaints..."
                                    />
                                </div>
                            </div>

                            <div className="triage-action-section">
                                <button 
                                    type="button" 
                                    className="ai-triage-run-btn" 
                                    onClick={runAITriage} 
                                    disabled={symptoms.length === 0 && !observations.trim()}
                                >
                                    <FaRobot /> {symptoms.length === 0 && !observations.trim() ? 'Select Symptoms to Start AI Guard' : 'Execute AI Diagnostic Guard'}
                                </button>

                                {triageResult && (
                                    <div className={`triage-result-card glass-card ${getUrgencyClass(triageResult.urgency)}`}>
                                        <div className="diag-header">
                                            <h4>Diagnostic Summary</h4>
                                            <span className="urgency-label">{triageResult.urgency}</span>
                                        </div>
                                        <div className="diag-body">
                                            <p><strong>Rec:</strong> {triageResult.recommendation}</p>
                                            <p><strong>Specialty:</strong> {triageResult.specialty}</p>
                                        </div>
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    className="main-submit-btn btn-primary" 
                                    disabled={!triageResult || loading}
                                >
                                    {loading ? 'Finalizing Cloud Sync...' : (!triageResult ? 'Execute AI Triage to Unlock Submit' : 'Secure Submit to Doctor Console')}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VitalsUpload;