import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserInjured, FaUserMd, FaUserShield, FaUserNurse, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Login = () => {
    const [role, setRole] = useState('patient');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const roleParam = params.get('role');
        if (roleParam) {
            setRole(roleParam);
        }
    }, [location]);

    const handleSubmit = (e) => {
        e.preventDefault();
        login(role, email);
        if (role === 'patient') navigate('/dashboard/patient');
        if (role === 'worker') navigate('/dashboard/worker');
        if (role === 'doctor') navigate('/dashboard/doctor');
        if (role === 'admin') navigate('/dashboard/admin');
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Login to SRTA</h2>
                
                <div className="role-tabs">
                    <button 
                        className={`tab-btn ${role === 'patient' ? 'active' : ''}`} 
                        onClick={() => setRole('patient')}
                    >
                        <FaUserInjured /> Patient
                    </button>
                    <button 
                        className={`tab-btn ${role === 'worker' ? 'active' : ''}`} 
                        onClick={() => setRole('worker')}
                    >
                        <FaUserNurse /> Worker
                    </button>
                    <button 
                        className={`tab-btn ${role === 'doctor' ? 'active' : ''}`} 
                        onClick={() => setRole('doctor')}
                    >
                        <FaUserMd /> Doctor
                    </button>
                    <button 
                        className={`tab-btn ${role === 'admin' ? 'active' : ''}`} 
                        onClick={() => setRole('admin')}
                    >
                        <FaUserShield /> Admin
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>{role === 'doctor' ? 'Medical License ID / Email' : 'Email Address'}</label>
                        <input 
                            type="text" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={role === 'doctor' ? 'dr.name@hospital.com' : 'user@example.com'}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-input-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required 
                            />
                            <button 
                                type="button" 
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="login-submit-btn">
                        Login as {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;