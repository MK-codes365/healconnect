import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUpload, FaShoppingCart, FaPrescription, FaUserMd, FaCalendarAlt } from "react-icons/fa";
import { api } from "../../../api";
import "./Prescriptions.css";

const Prescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);

  const getPatientId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("healconnect_user") || "{}");
      return user.id || user.email || "demo-patient";
    } catch {
      return "demo-patient";
    }
  };

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const id = getPatientId();
        const data = await api.getPrescriptions(id);
        setPrescriptions(data);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const patientId = getPatientId();
      await api.uploadPrescription(patientId, file);
      setUploadedFile(file.name);
      
      // Refresh list
      const data = await api.getPrescriptions(patientId);
      setVisits(data); 
      alert("Prescription uploaded successfully to vault!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload prescription.");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderMedicine = (prescription) => {
    alert(`Order placed successfully! Medicines for ${prescription.doctorName}'s prescription are being prepared for fast delivery.`);
  };

  const handlePrintSummary = (prescription) => {
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head><title>Clinical Prescription - HealConnect</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1 style="color: #10a37f;">HealConnect Clinical Record</h1>
          <hr/>
          <p><strong>Doctor:</strong> ${prescription.doctorName}</p>
          <p><strong>Date:</strong> ${new Date(prescription.createdAt).toLocaleDateString()}</p>
          <h3>Medications:</h3>
          <ul>${prescription.medicines.map(m => `<li>${m.name} - ${m.dosage} (${m.duration})</li>`).join('')}</ul>
          <p><strong>Notes:</strong> ${prescription.notes || 'None'}</p>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <div className="prescriptions-container">
      <div className="prescriptions-header">
        <button onClick={() => navigate("/dashboard/patient")} className="back-btn">
          <FaArrowLeft /> Back
        </button>
        <div className="header-info">
          <h2>My Prescriptions</h2>
          <p className="subtitle">Official clinical records from your doctors</p>
        </div>
      </div>

      <div className="upload-section glass-card">
        <div className="upload-content">
          <h3>Upload Prescription</h3>
          <p>Have a physical prescription? Scan and store it here safely.</p>
        </div>
        <label className="upload-btn">
          <FaUpload /> Choose File
          <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} style={{ display: "none" }} />
        </label>
        {uploadedFile && <p className="upload-success">✓ Uploaded: {uploadedFile}</p>}
      </div>

      <div className="prescriptions-list">
        <h3>Clinical History</h3>
        
        {loading ? (
          <div className="loading-state">Syncing with medical vault...</div>
        ) : prescriptions.length > 0 ? (
          prescriptions.map((prescription) => (
            <div key={prescription.sk} className="prescription-card glass-card">
              <div className="card-top">
                <div className="doctor-info">
                  <div className="doc-avatar">
                    <FaUserMd />
                  </div>
                  <div>
                    <h4>{prescription.doctorName}</h4>
                    <p className="doc-id">Specialist Registration: {prescription.doctorId}</p>
                  </div>
                </div>
                <div className="date-badge">
                  <FaCalendarAlt />
                  <span>{new Date(prescription.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="medicines-grid">
                <h5><FaPrescription /> Prescribed Medications</h5>
                {prescription.medicines.map((med, index) => (
                  <div key={index} className="medicine-item">
                    <div className="med-main">
                      <strong>{med.name}</strong>
                      <span className="med-dosage">{med.dosage}</span>
                    </div>
                    <div className="med-meta">
                      <span>{med.duration}</span> • <span>{med.instructions}</span>
                    </div>
                  </div>
                ))}
              </div>

              {prescription.tests && prescription.tests.length > 0 && (
                <div className="tests-list">
                  <h5>Recommended Lab Tests</h5>
                  <div className="test-tags">
                    {prescription.tests.map((test, index) => (
                      <span key={index} className="test-tag">{test}</span>
                    ))}
                  </div>
                </div>
              )}

              {prescription.notes && (
                <div className="prescription-notes">
                  <h5>Clinical Notes</h5>
                  <p>{prescription.notes}</p>
                </div>
              )}

              <div className="card-actions">
                <button className="download-btn" onClick={() => handlePrintSummary(prescription)}>
                  Download Clinical Record
                </button>
                <button className="order-btn" onClick={() => handleOrderMedicine(prescription)}>
                  <FaShoppingCart /> Order Fast Delivery
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3>No Cloud Prescriptions Found</h3>
            <p>Your prescriptions will appear here after a doctor reviews your case.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;