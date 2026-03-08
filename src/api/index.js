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
    const response = await fetch(`${API_BASE_URL}/cases/patient/${encodeURIComponent(patientId)}`);
    if (!response.ok) throw new Error('Fetch Patient Cases Error');
    return response.json();
  },

  // --- Chat & Prescriptions ---
  async getChatSessions(patientId) {
    const response = await fetch(`${API_BASE_URL}/chat/sessions/${encodeURIComponent(patientId)}`);
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
    const response = await fetch(`${API_BASE_URL}/prescriptions/${encodeURIComponent(patientId)}`);
    if (!response.ok) throw new Error('Fetch Prescriptions Error');
    return response.json();
  },

  // --- Admin ---
  async getPendingDoctors() {
    const response = await fetch(`${API_BASE_URL}/admin/doctors/pending`);
    if (!response.ok) throw new Error('Fetch Pending Doctors Error');
    return response.json();
  },

  async verifyDoctor(doctorId, status) {
    const response = await fetch(`${API_BASE_URL}/admin/doctors/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId, status }),
    });
    if (!response.ok) throw new Error('Verify Doctor Error');
    return response.json();
  },

  async getAdminStats() {
    const response = await fetch(`${API_BASE_URL}/admin/stats`);
    if (!response.ok) throw new Error('Fetch Admin Stats Error');
    return response.json();
  },

  async getEmergencyFeed() {
    const response = await fetch(`${API_BASE_URL}/admin/emergency-feed`);
    if (!response.ok) throw new Error('Fetch Emergency Feed Error');
    return response.json();
  },

  async getAuditLogs() {
    const response = await fetch(`${API_BASE_URL}/admin/logs`);
    if (!response.ok) throw new Error('Fetch Audit Logs Error');
    return response.json();
  },

  async getConfig() {
    const response = await fetch(`${API_BASE_URL}/admin/config`);
    if (!response.ok) throw new Error('Fetch Config Error');
    return response.json();
  },

  async updateConfig(config) {
    const response = await fetch(`${API_BASE_URL}/admin/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Update Config Error');
    return response.json();
  },

  // --- Doctor Specific ---
  async getActiveDoctors() {
    const response = await fetch(`${API_BASE_URL}/doctors/active`);
    if (!response.ok) throw new Error('Fetch Active Doctors Error');
    return response.json();
  },

  async getAdminUsersAll() {
    const response = await fetch(`${API_BASE_URL}/admin/users/all`);
    if (!response.ok) throw new Error('Fetch All Users Error');
    return response.json();
  },

  async getDoctorAppointments(doctorId) {
    const response = await fetch(`${API_BASE_URL}/doctors/appointments/${encodeURIComponent(doctorId)}`);
    if (!response.ok) throw new Error('Fetch Doctor Appointments Error');
    return response.json();
  },

  async createUser(userData) {
    const response = await fetch(`${API_BASE_URL}/admin/users/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create user');
    }
    return response.json();
  },

  async updateUser(userData) {
    const response = await fetch(`${API_BASE_URL}/admin/users/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Update User Error');
    return response.json();
  },

  async toggleUserStatus(userId, currentStatus) {
    const response = await fetch(`${API_BASE_URL}/admin/users/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, currentStatus }),
    });
    if (!response.ok) throw new Error('Toggle Status Error');
    return response.json();
  },

  async deleteUser(userId) {
    const response = await fetch(`${API_BASE_URL}/admin/users/delete/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Delete User Error');
    }
    return response.json();
  }
};
