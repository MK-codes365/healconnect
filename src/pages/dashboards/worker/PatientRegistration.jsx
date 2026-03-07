import { api } from '../../../api';

const PatientRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'male',
        village: '',
        phone: '',
        medicalHistory: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.registerPatient(formData);
            alert(`Patient ${formData.name} registered successfully in the Cloud!`);
            navigate('/dashboard/worker');
        } catch (error) {
            console.error(error);
            alert('Failed to register patient. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="patient-registration-container">
            <div className="registration-header">
                <button onClick={() => navigate('/dashboard/worker')} className="back-btn">
                    <FaArrowLeft /> Back
                </button>
                <h2><FaUserPlus /> Register New Patient</h2>
            </div>

            <form className="registration-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Patient Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Enter patient name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Age *</label>
                            <input
                                type="number"
                                required
                                value={formData.age}
                                onChange={(e) => handleChange('age', e.target.value)}
                                placeholder="Enter age"
                            />
                        </div>
                        <div className="form-group">
                            <label>Gender *</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => handleChange('gender', e.target.value)}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Village/Location *</label>
                            <input
                                type="text"
                                required
                                value={formData.village}
                                onChange={(e) => handleChange('village', e.target.value)}
                                placeholder="Enter village name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Medical History</h3>
                    <div className="form-group">
                        <label>Previous Conditions / Allergies</label>
                        <textarea
                            rows="4"
                            value={formData.medicalHistory}
                            onChange={(e) => handleChange('medicalHistory', e.target.value)}
                            placeholder="Enter any known medical conditions, allergies, or previous treatments..."
                        />
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    <FaUserPlus /> {loading ? 'Registering...' : 'Register Patient'}
                </button>
            </form>
        </div>
    );
};

export default PatientRegistration;