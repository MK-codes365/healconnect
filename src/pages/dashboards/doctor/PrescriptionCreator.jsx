import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaTrash, FaDownload, FaShare } from 'react-icons/fa';
import './PrescriptionCreator.css';

const PrescriptionCreator = () => {
    const navigate = useNavigate();
    const { patientId } = useParams();
    const [medicines, setMedicines] = useState([
        { name: '', dosage: '', duration: '', instructions: '' }
    ]);
    const [tests, setTests] = useState(['']);
    const [notes, setNotes] = useState('');

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

    const handleDownloadPDF = () => {
        alert('Generating PDF... (jsPDF integration required)');
    };

    const handleShareWithPatient = () => {
        const newPrescription = {
            doctorName: "Dr. Current User", // Mock name
            doctorId: "D_CURRENT",
            patientId: patientId,
            medicines,
            tests,
            notes
        };
        
        import('../../../utils/storage').then(module => {
            module.addPrescription(newPrescription);
            alert('Prescription shared with patient!');
            navigate('/dashboard/doctor');
        });
    };

    return (
        <div className="prescription-creator-container">
            <div className="prescription-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <FaArrowLeft /> Back
                </button>
                <h2>Create Prescription</h2>
            </div>

            <div className="prescription-form">
                <div className="patient-info-section">
                    <h3>Patient: {patientId}</h3>
                    <p>Date: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="medicines-section">
                    <div className="section-header">
                        <h3>Medicines</h3>
                        <button className="add-btn" onClick={addMedicine}>
                            <FaPlus /> Add Medicine
                        </button>
                    </div>
                    {medicines.map((medicine, index) => (
                        <div key={index} className="medicine-row">
                            <input
                                type="text"
                                placeholder="Medicine Name"
                                value={medicine.name}
                                onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Dosage (e.g., 500mg)"
                                value={medicine.dosage}
                                onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Duration (e.g., 7 days)"
                                value={medicine.duration}
                                onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Instructions (e.g., After meals)"
                                value={medicine.instructions}
                                onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                            />
                            {medicines.length > 1 && (
                                <button className="remove-btn" onClick={() => removeMedicine(index)}>
                                    <FaTrash />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="tests-section">
                    <div className="section-header">
                        <h3>Recommended Tests</h3>
                        <button className="add-btn" onClick={addTest}>
                            <FaPlus /> Add Test
                        </button>
                    </div>
                    {tests.map((test, index) => (
                        <div key={index} className="test-row">
                            <input
                                type="text"
                                placeholder="Test Name (e.g., Complete Blood Count)"
                                value={test}
                                onChange={(e) => updateTest(index, e.target.value)}
                            />
                            {tests.length > 1 && (
                                <button className="remove-btn" onClick={() => removeTest(index)}>
                                    <FaTrash />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="notes-section">
                    <h3>Additional Notes</h3>
                    <textarea
                        rows="4"
                        placeholder="Enter any additional instructions or notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <div className="action-buttons">
                    <button className="download-btn" onClick={handleDownloadPDF}>
                        <FaDownload /> Download PDF
                    </button>
                    <button className="share-btn" onClick={handleShareWithPatient}>
                        <FaShare /> Share with Patient
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionCreator;