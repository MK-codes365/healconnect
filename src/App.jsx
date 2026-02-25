import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import PatientDashboard from './pages/dashboards/PatientDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import HealthWorkerDashboard from './pages/dashboards/HealthWorkerDashboard';
import AIChat from './pages/dashboards/patient/AIChat';
import DoctorDirectory from './pages/dashboards/patient/DoctorDirectory';
import BookConsultation from './pages/dashboards/patient/BookConsultation';
import MyVisits from './pages/dashboards/patient/MyVisits';
import Messaging from './pages/dashboards/patient/Messaging';
import Prescriptions from './pages/dashboards/patient/Prescriptions';
import DoctorProfile from './pages/dashboards/doctor/DoctorProfile';
import Appointments from './pages/dashboards/doctor/Appointments';
import CaseDetail from './pages/dashboards/doctor/CaseDetail';
import Teleconsultation from './pages/dashboards/doctor/Teleconsultation';
import DoctorMessaging from './pages/dashboards/doctor/DoctorMessaging';
import PrescriptionCreator from './pages/dashboards/doctor/PrescriptionCreator';
import PatientRegistration from './pages/dashboards/worker/PatientRegistration';
import VitalsUpload from './pages/dashboards/worker/VitalsUpload';
import MyCases from './pages/dashboards/worker/MyCases';
import WorkerMessaging from './pages/dashboards/worker/WorkerMessaging';
import UserManagement from './pages/dashboards/admin/UserManagement';
import Analytics from './pages/dashboards/admin/Analytics';
import DoctorVerification from './pages/dashboards/admin/DoctorVerification';
import AppointmentOversight from './pages/dashboards/admin/AppointmentOversight';
import MessagingMonitor from './pages/dashboards/admin/MessagingMonitor';
import PlatformSettings from './pages/dashboards/admin/PlatformSettings';

function App() {
  React.useEffect(() => {
    // Initialize mock data in localStorage
    import('./utils/storage').then(module => module.initializeData());
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/patient/ai-chat" element={<AIChat />} />
          <Route path="/dashboard/patient/doctors" element={<DoctorDirectory />} />
          <Route path="/dashboard/patient/book" element={<BookConsultation />} />
          <Route path="/dashboard/patient/visits" element={<MyVisits />} />
          <Route path="/dashboard/patient/messages" element={<Messaging />} />
          <Route path="/dashboard/patient/prescriptions" element={<Prescriptions />} />
          <Route path="/dashboard/worker" element={<HealthWorkerDashboard />} />
          <Route path="/dashboard/worker/register-patient" element={<PatientRegistration />} />
          <Route path="/dashboard/worker/submit-case" element={<VitalsUpload />} />
          <Route path="/dashboard/worker/my-cases" element={<MyCases />} />
          <Route path="/dashboard/worker/messages" element={<WorkerMessaging />} />
          <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
          <Route path="/dashboard/doctor/profile" element={<DoctorProfile />} />
          <Route path="/dashboard/doctor/appointments" element={<Appointments />} />
          <Route path="/dashboard/doctor/case/:id" element={<CaseDetail />} />
          <Route path="/dashboard/doctor/consult/:id" element={<Teleconsultation />} />
          <Route path="/dashboard/doctor/messages" element={<DoctorMessaging />} />
          <Route path="/dashboard/doctor/prescription/:patientId" element={<PrescriptionCreator />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/users" element={<UserManagement />} />
          <Route path="/dashboard/admin/analytics" element={<Analytics />} />
          <Route path="/dashboard/admin/verification" element={<DoctorVerification />} />
          <Route path="/dashboard/admin/appointments" element={<AppointmentOversight />} />
          <Route path="/dashboard/admin/messaging" element={<MessagingMonitor />} />
          <Route path="/dashboard/admin/settings" element={<PlatformSettings />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;