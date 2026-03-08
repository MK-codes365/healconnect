import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaTrash, FaDownload, FaShare } from 'react-icons/fa';
import { api } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './PrescriptionCreator.css';

const PrescriptionCreator = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { patientId } = useParams();
    
    const [medicines, setMedicines] = useState([
        { name: '', dosage: '', duration: '', instructions: '' }
    ]);
    const [tests, setTests] = useState(['']);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const addMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', duration: '', instructions: '' }]);
    };

    const removeMedicine = (index) => {
        setMedicines(medicines.filter((_, i) => i !== index));
    };

    const updateMedicine = (index, field, value) => {
        const updated = [...medicines];
        updated[index][field] = value;
        setMedicines(updated);
    };

    const addTest = () => {
        setTests([...tests, '']);
    };

    const removeTest = (index) => {
        setTests(tests.filter((_, i) => i !== index));
    };

    const updateTest = (index, value) => {
        const updated = [...tests];
        updated[index] = value;
        setTests(updated);
    };

    const handleShareWithPatient = async () => {
        if (medicines.every(m => !m.name)) {
            alert("Please add at least one medicine.");
            return;
        }

        setIsSaving(true);
        try {
            const prescriptionData = {
                doctorId: user?.id || 'doc-1',
                doctorName: user?.name || 'Dr. Specialist',
                patientId,
                medicines: medicines.filter(m => m.name),
                tests: tests.filter(t => t),
                notes,
                createdAt: new Date().toISOString()
            };

            await api.savePrescription(prescriptionData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard/doctor');
            }, 3000);
        } catch (error) {
            console.error("Prescription Error:", error);
            alert("Failed to sync prescription with cloud.");
        } finally {
            setIsSaving(false);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        
        doc.setFillColor(15, 23, 42); 
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("HealConnect", 15, 25);
        doc.setFontSize(12);
        doc.text("Secure Clinical Prescription", 15, 33);
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(11);
        doc.text(`Doctor: ${user?.name || 'Specialist'}`, 15, 50);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 50);
        doc.text(`Patient ID: ${patientId}`, 15, 60);

        let yPos = 75;

        const filledMedicines = medicines.filter(m => m.name.trim() !== '');
        if (filledMedicines.length > 0) {
            doc.setFontSize(14);
            doc.text("Medications", 15, yPos);
            yPos += 5;
            
            const tableData = filledMedicines.map(m => [
                m.name, m.dosage, m.duration, m.instructions
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Medicine', 'Dosage', 'Duration', 'Instructions']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [16, 163, 127] }, 
            });
            yPos = doc.lastAutoTable.finalY + 15;
        }

        const validTests = tests.filter(t => t.trim() !== '');
        if (validTests.length > 0) {
            doc.setFontSize(14);
            doc.text("Diagnostic Tests", 15, yPos);
            yPos += 10;
            validTests.forEach((t, i) => {
                doc.setFontSize(11);
                doc.text(`• ${t}`, 20, yPos + (i * 7));
            });
            yPos += (validTests.length * 7) + 10;
        }

        if (notes.trim() !== '') {
            yPos += 5;
            doc.setFontSize(14);
            doc.text("Clinical Notes", 15, yPos);
            doc.setFontSize(11);
            const splitNotes = doc.splitTextToSize(notes, 180);
            doc.text(splitNotes, 15, yPos + 10);
        }

        if (filledMedicines.length === 0 && validTests.length === 0 && notes.trim() === '') {
            alert("Please add at least one medicine, test, or note before generating a PDF.");
            return;
        }

        doc.save(`Prescription_${patientId}_${Date.now()}.pdf`);
    };

    if (success) {
        return (
            <div className="prescription-success-page animate-fade-in">
                <div className="success-container glass-card">
                    <div className="success-icon-wrap">
                        <FaShare className="success-icon" />
                    </div>
                    <h2>Prescription Shared!</h2>
                    <p>The clinical record has been securely synced to the cloud and is now visible on the patient's dashboard.</p>
                    <div className="redirect-hint">Finalizing case records...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="prescription-console-page animate-fade-in">
            <div className="console-header glass-nav">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <FaArrowLeft /> Discard
                </button>
                <div className="header-titles">
                    <h2>Digital Prescription Pad</h2>
                    <span className="subtitle">Secure Clinical Documentation Console</span>
                </div>
            </div>

            <div className="console-content">
                <div className="prescription-workspace glass-card">
                    <div className="workspace-header">
                        <div className="patient-meta">
                            <label>Designated Patient</label>
                            <h4>{patientId}</h4>
                        </div>
                        <div className="date-meta">
                            <label>Issuance Date</label>
                            <h4>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</h4>
                        </div>
                    </div>

                    <div className="entry-section">
                        <div className="section-title">
                            <h3><FaPlus /> Medication Entry</h3>
                            <button className="add-node-btn" onClick={addMedicine}>Add Row</button>
                        </div>
                        <div className="medicine-table">
                            <div className="table-header">
                                <span>Medicine Name</span>
                                <span>Dosage</span>
                                <span>Duration</span>
                                <span>Instructions</span>
                                <span></span>
                            </div>
                            {medicines.map((medicine, index) => (
                                <div key={index} className="medicine-row animate-fade-in">
                                    <input
                                        type="text"
                                        placeholder="E.g. Paracetamol"
                                        value={medicine.name}
                                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="500mg"
                                        value={medicine.dosage}
                                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="5 Days"
                                        value={medicine.duration}
                                        onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Twice daily"
                                        value={medicine.instructions}
                                        onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                                    />
                                    <button 
                                        className="row-remove" 
                                        onClick={() => removeMedicine(index)}
                                        disabled={medicines.length === 1}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="entry-section tests">
                        <div className="section-title">
                            <h3><FaPlus /> Diagnostic Lab Requests</h3>
                            <button className="add-node-btn" onClick={addTest}>Add Test</button>
                        </div>
                        <div className="tests-grid">
                            {tests.map((test, index) => (
                                <div key={index} className="test-node animate-fade-in">
                                    <input
                                        type="text"
                                        placeholder="E.g. Blood Glucose"
                                        value={test}
                                        onChange={(e) => updateTest(index, e.target.value)}
                                    />
                                    <button 
                                        className="node-remove" 
                                        onClick={() => removeTest(index)}
                                        disabled={tests.length === 1}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="entry-section">
                        <h3>Clinical Observations & Notes</h3>
                        <textarea
                            className="workspace-textarea"
                            rows="4"
                            placeholder="Enter dietary restrictions, follow-up instructions, or general observations..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="workspace-footer">
                        <div className="security-notice">
                            ✓ Encrypted Cloud Transmission
                        </div>
                        <div className="footer-actions">
                            <button className="secondary-btn" onClick={generatePDF}>
                                <FaDownload /> Draft PDF
                            </button>
                            <button 
                                className="primary-btn btn-primary" 
                                onClick={handleShareWithPatient}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Syncing...' : <><FaShare /> Finalize & Share</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionCreator;