const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // --- AI Triage ---
  async getAITriage(text) {
    const response = await fetch(`${API_BASE_URL}/ai/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('AI Service Error');
    return response.json();
  },

  // --- Patients ---
  async registerPatient(patientData, photoFile) {
    const formData = new FormData();
    Object.keys(patientData).forEach(key => {
      formData.append(key, patientData[key]);
    });
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    const response = await fetch(`${API_BASE_URL}/patients/register`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Registration Error');
    return response.json();
  },

  async getPatients() {
    const response = await fetch(`${API_BASE_URL}/patients`);
    if (!response.ok) throw new Error('Fetch Error');
    return response.json();
  },

  // --- Cases ---
  async createCase(caseData) {
    const response = await fetch(`${API_BASE_URL}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseData),
    });
    if (!response.ok) throw new Error('Case Error');
    return response.json();
  },

  async getCases() {
    const response = await fetch(`${API_BASE_URL}/cases`);
    if (!response.ok) throw new Error('Fetch Cases Error');
    return response.json();
  },

  async getCasesByPatient(patientId) {
    const response = await fetch(`${API_BASE_URL}/cases/patient/${patientId}`);
    if (!response.ok) throw new Error('Fetch Patient Cases Error');
    return response.json();
  },

  // --- Chat & Prescriptions ---
  async getChatSessions(patientId) {
    const response = await fetch(`${API_BASE_URL}/chat/sessions/${patientId}`);
    if (!response.ok) throw new Error('Fetch Sessions Error');
    return response.json();
  },

  async savePrescription(data) {
    const response = await fetch(`${API_BASE_URL}/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Prescription Error');
    return response.json();
  },

  async getPrescriptions(patientId) {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${patientId}`);
    if (!response.ok) throw new Error('Fetch Prescriptions Error');
    return response.json();
  }
};
