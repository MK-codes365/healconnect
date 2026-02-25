import { mockAppointments, mockPrescriptions } from "../data/mockData";

const STORAGE_KEYS = {
  APPOINTMENTS: "healconnect_appointments",
  PRESCRIPTIONS: "healconnect_prescriptions",
  PATIENTS: "healconnect_patients",
};

export const initializeData = () => {
  // Only initialize if not already present to avoid overwriting user actions
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    // Convert Date objects to strings for storage, then handle parsing back
    const initialAppointments = mockAppointments.map((apt) => ({
      ...apt,
      date: apt.date.toISOString(), // Store as ISO string
    }));
    localStorage.setItem(
      STORAGE_KEYS.APPOINTMENTS,
      JSON.stringify(initialAppointments),
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS)) {
    const initialPrescriptions = mockPrescriptions.map((rx) => ({
      ...rx,
      date: rx.date.toISOString(),
    }));
    localStorage.setItem(
      STORAGE_KEYS.PRESCRIPTIONS,
      JSON.stringify(initialPrescriptions),
    );
  }
};

// --- Appointments ---

export const getAppointments = () => {
  const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
  if (!data) return [];

  try {
    return JSON.parse(data).map((apt) => ({
      ...apt,
      date: new Date(apt.date), // Restore Date object
    }));
  } catch (e) {
    console.error("Failed to parse appointments", e);
    return [];
  }
};

export const addAppointment = (appointment) => {
  const appointments = getAppointments();
  // Ensure the new appointment has a date object converted properly if needed, although usually passed as Date
  // If passed as string, ensure it's Date
  const newAppointment = {
    ...appointment,
    id: `A${Date.now()}`,
    status: "scheduled",
    // Ensure date is stored consistently
  };

  // Prepare for storage (convert dates to strings)
  const updatedAppointments = [...appointments, newAppointment].map((apt) => ({
    ...apt,
    date: apt.date instanceof Date ? apt.date.toISOString() : apt.date,
  }));

  localStorage.setItem(
    STORAGE_KEYS.APPOINTMENTS,
    JSON.stringify(updatedAppointments),
  );
  return newAppointment;
};

// --- Prescriptions ---

export const getPrescriptions = () => {
  const data = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
  if (!data) return [];

  try {
    return JSON.parse(data).map((rx) => ({
      ...rx,
      date: new Date(rx.date),
    }));
  } catch (e) {
    console.error("Failed to parse prescriptions", e);
    return [];
  }
};

export const addPrescription = (prescription) => {
  const prescriptions = getPrescriptions();
  const newPrescription = {
    ...prescription,
    id: `RX${Date.now()}`,
    date: new Date(),
  };

  const updatedPrescriptions = [...prescriptions, newPrescription].map(
    (rx) => ({
      ...rx,
      date: rx.date instanceof Date ? rx.date.toISOString() : rx.date,
    }),
  );

  localStorage.setItem(
    STORAGE_KEYS.PRESCRIPTIONS,
    JSON.stringify(updatedPrescriptions),
  );
  return newPrescription;
};

// --- Patients ---

export const addPatient = (patient) => {
  const patientsKey = "healconnect_patients_list";
  const existingData = localStorage.getItem(patientsKey);
  const existing = existingData ? JSON.parse(existingData) : [];

  const newPatient = {
    ...patient,
    id: `P${Date.now()}`,
    registeredAt: new Date().toISOString(),
  };

  const updatedPatients = [...existing, newPatient];
  localStorage.setItem(patientsKey, JSON.stringify(updatedPatients));
  return newPatient;
};
