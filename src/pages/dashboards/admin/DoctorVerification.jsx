import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';
import { api } from '../../../api';
import './DoctorVerification.css';

const DoctorVerification = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('pending');
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [verifiedDoctors, setVerifiedDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            // In a real app, we'd have a getVerifiedDoctors call too.
            // For now, we'll fetch pending and use static for verified if needed,
            // or better, find a way to fetch all and filter.
            const pending = await api.getPendingDoctors();
            setPendingDoctors(pending);
            
            // For the demo, we'll keep the verified list static or fetch all if API allowed
            setVerifiedDoctors([
                { id: 'D001', name: 'Dr. Priya Sharma', specialty: 'Cardiology', verifiedOn: '2024-01-15' },
                { id: 'D002', name: 'Dr. Anil Verma', specialty: 'General Medicine', verifiedOn: '2024-01-10' }
            ]);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (doctorId, status) => {
        try {
            await api.verifyDoctor(doctorId, status);
            alert(`Doctor ${status === 'active' ? 'Approved' : 'Rejected'}!`);
            fetchDoctors(); // Refresh list
        } catch (error) {
            alert("Action failed: " + error.message);
        }
    };

    return (
        <div className="verification-container">
            <div className="verification-header">
                <button onClick={() => navigate('/dashboard/admin')} className="back-btn">
                    <FaArrowLeft /> Back
                </button>
                <h2>Doctor Verification</h2>
            </div>

            <div className="verification-tabs">
                <button
                    className={tab === 'pending' ? 'active' : ''}
                    onClick={() => setTab('pending')}
                >
                    Pending ({pendingDoctors.length})
                </button>
                <button
                    className={tab === 'verified' ? 'active' : ''}
                    onClick={() => setTab('verified')}
                >
                    Verified ({verifiedDoctors.length})
                </button>
            </div>

            {loading ? (
                <div className="loading-state">Updating Registry...</div>
            ) : tab === 'pending' ? (
                <div className="doctors-list">
                    {pendingDoctors.length === 0 ? (
                        <div className="empty-state">No pending applications.</div>
                    ) : (
                        pendingDoctors.map(doctor => (
                            <div key={doctor.id || doctor.sk} className="doctor-card pending">
                                <div className="doctor-header">
                                    <div>
                                        <h3>{doctor.name}</h3>
                                        <p className="doctor-id">{doctor.id || doctor.sk}</p>
                                    </div>
                                    <span className="pending-badge">PENDING REVIEW</span>
                                </div>
                                <div className="doctor-details">
                                    <p><strong>Specialty:</strong> {doctor.specialty}</p>
                                    <p><strong>Experience:</strong> {doctor.experience || 'Not specified'}</p>
                                    <p><strong>Submitted:</strong> {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : 'Recently'}</p>
                                </div>
                                <div className="verification-actions">
                                    <button className="view-btn">
                                        <FaEye /> View Credentials
                                    </button>
                                    <button className="approve-btn" onClick={() => handleAction(doctor.sk, 'active')}>
                                        <FaCheckCircle /> Approve
                                    </button>
                                    <button className="reject-btn" onClick={() => handleAction(doctor.sk, 'rejected')}>
                                        <FaTimesCircle /> Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="doctors-list">
                    {verifiedDoctors.map(doctor => (
                        <div key={doctor.id} className="doctor-card verified">
                            <div className="doctor-header">
                                <div>
                                    <h3>{doctor.name}</h3>
                                    <p className="doctor-id">{doctor.id}</p>
                                </div>
                                <span className="verified-badge">✓ VERIFIED</span>
                            </div>
                            <div className="doctor-details">
                                <p><strong>Specialty:</strong> {doctor.specialty}</p>
                                <p><strong>Verified On:</strong> {doctor.verifiedOn}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorVerification;