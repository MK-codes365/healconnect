import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaUserPlus, FaEdit, FaBan, FaCheck, FaTrash } from 'react-icons/fa';
import { api } from '../../../api';
import './UserManagement.css';

const UserManagement = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('doctors');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [users, setUsers] = useState({
        doctors: [],
        patients: [],
        workers: []
    });
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [confirmUser, setConfirmUser] = useState(null);
    const [deleteUser, setDeleteUser] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const allUsers = await api.getAdminUsersAll();
            setUsers({
                doctors: allUsers.filter(u => u.role === 'doctor'),
                patients: allUsers.filter(u => u.pk === 'PATIENT'),
                workers: allUsers.filter(u => u.role === 'worker')
            });
        } catch (error) {
            console.error("Error fetching all users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (userData) => {
        setProcessing(true);
        try {
            if (editingUser) {
                await api.updateUser({ ...userData, userId: editingUser.sk });
            } else {
                await api.createUser(userData);
            }
            await fetchAllUsers();
            setIsModalOpen(false);
            setEditingUser(null);
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleToggleStatus = async (user) => {
        setConfirmUser(user);
    };

    const confirmToggleStatus = async () => {
        const user = confirmUser;
        setConfirmUser(null);
        // Optimistic UI update
        const newStatus = (user.status || 'active') === 'active' ? 'inactive' : 'active';
        setUsers(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].map(u =>
                u.sk === user.sk ? { ...u, status: newStatus } : u
            )
        }));
        try {
            await api.toggleUserStatus(user.sk, user.status || 'active');
        } catch (error) {
            // Revert on failure
            await fetchAllUsers();
            alert(`Error toggling status: ${error.message}`);
        }
    };

    const confirmDelete = async () => {
        const user = deleteUser;
        setIsDeleting(true);
        setDeleteUser(null);
        // Optimistic removal
        setUsers(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].filter(u => u.sk !== user.sk)
        }));
        try {
            await api.deleteUser(user.sk);
        } catch (error) {
            await fetchAllUsers();
            alert(`Error deleting user: ${error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const currentUsers = users[activeTab].filter(user =>
        (user.name || user.patientName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="user-management-container">
            <div className="management-header">
                <button onClick={() => navigate('/dashboard/admin')} className="back-btn">
                    <FaArrowLeft /> Back
                </button>
                <h2>User Management</h2>
            </div>

            <div className="management-controls">
                <div className="tab-buttons">
                    <button
                        className={activeTab === 'doctors' ? 'active' : ''}
                        onClick={() => setActiveTab('doctors')}
                    >
                        Doctors ({users.doctors.length})
                    </button>
                    <button
                        className={activeTab === 'patients' ? 'active' : ''}
                        onClick={() => setActiveTab('patients')}
                    >
                        Patients ({users.patients.length})
                    </button>
                    <button
                        className={activeTab === 'workers' ? 'active' : ''}
                        onClick={() => setActiveTab('workers')}
                    >
                        Health Workers ({users.workers.length})
                    </button>
                </div>
                <div className="search-add">
                    <div className="search-box">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="add-btn" onClick={openCreateModal}>
                        <FaUserPlus /> Add New
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Syncing Global Registry...</div>
            ) : (
                <div className="users-table">
                    {currentUsers.length === 0 ? (
                        <div className="empty-state">No users found in this category.</div>
                    ) : (
                        currentUsers.map(user => (
                            <div key={user.sk} className="user-row">
                                <div className="user-info">
                                    <h3>{user.name || user.patientName}</h3>
                                    <p className="user-id">{user.sk}</p>
                                </div>
                                <div className="user-details">
                                    {activeTab === 'doctors' && (
                                        <>
                                            <span>Specialty: {user.specialty || 'General'}</span>
                                            <span>Status: {user.status || 'active'}</span>
                                        </>
                                    )}
                                    {activeTab === 'patients' && (
                                        <>
                                            <span>Age: {user.age}</span>
                                            <span>Village: {user.village || 'N/A'}</span>
                                        </>
                                    )}
                                    {activeTab === 'workers' && (
                                        <>
                                            <span>Email: {user.email}</span>
                                            <span>Cases: {user.casesHandled || 0}</span>
                                        </>
                                    )}
                                </div>
                                <div className="user-status">
                                    <span className={`status-badge ${user.status || 'active'}`}>
                                        {(user.status || 'active').toUpperCase()}
                                    </span>
                                </div>
                                <div className="user-actions">
                                    {activeTab !== 'patients' && (
                                        <>
                                            <button className="edit-btn" onClick={() => openEditModal(user)}>
                                                <FaEdit />
                                            </button>
                                            <button 
                                                className={`deactivate-btn ${user.status === 'inactive' ? 'activate' : ''}`}
                                                onClick={() => handleToggleStatus(user)}
                                            >
                                                {user.status === 'inactive' ? <FaCheck /> : <FaBan />}
                                            </button>
                                            <button className="delete-btn" onClick={() => setDeleteUser(user)}>
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {isModalOpen && (
                <UserActionModal 
                    onClose={() => setIsModalOpen(false)} 
                    onSubmit={handleCreateOrUpdate}
                    loading={processing}
                    editData={editingUser}
                />
            )}

            {deleteUser && (
                <div className="modal-overlay">
                    <div className="creation-modal" style={{textAlign:'center',padding:'2rem'}}>
                        <h3 style={{color:'#ef4444'}}>🗑️ Delete User Permanently?</h3>
                        <p style={{color:'#94a3b8',marginBottom:'0.5rem'}}>
                            <strong style={{color:'white'}}>{deleteUser.name}</strong>
                        </p>
                        <p style={{color:'#94a3b8',marginBottom:'2rem',fontSize:'0.9rem'}}>
                            This action is <strong style={{color:'#ef4444'}}>irreversible</strong>. The user will be removed from the cloud registry permanently.
                        </p>
                        <div className="modal-actions" style={{justifyContent:'center'}}>
                            <button className="cancel-btn" onClick={() => setDeleteUser(null)}>Cancel</button>
                            <button 
                                className="submit-btn" 
                                style={{background:'#ef4444'}}
                                onClick={confirmDelete}
                            >
                                Yes, Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmUser && (
                <div className="modal-overlay">
                    <div className="creation-modal" style={{textAlign:'center',padding:'2rem'}}>
                        <h3 style={{color: confirmUser.status === 'active' ? '#ef4444' : '#10b981'}}>
                            {confirmUser.status === 'active' ? '⚠️ Deactivate User?' : '✅ Activate User?'}
                        </h3>
                        <p style={{color:'#94a3b8',marginBottom:'2rem'}}>
                            {confirmUser.name || 'This user'} will be {confirmUser.status === 'active' ? 'deactivated and blocked from the system' : 're-activated and restored to full access'}.
                        </p>
                        <div className="modal-actions" style={{justifyContent:'center'}}>
                            <button className="cancel-btn" onClick={() => setConfirmUser(null)}>Cancel</button>
                            <button 
                                className="submit-btn" 
                                style={{background: confirmUser.status === 'active' ? '#ef4444' : '#10b981'}}
                                onClick={confirmToggleStatus}
                            >
                                {confirmUser.status === 'active' ? 'Yes, Deactivate' : 'Yes, Activate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const UserActionModal = ({ onClose, onSubmit, loading, editData }) => {
    const [formData, setFormData] = useState({
        name: editData?.name || '',
        email: editData?.email || '',
        role: editData?.role || 'doctor',
        specialty: editData?.specialty || 'General Medicine'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="creation-modal glass-card">
                <h3>{editData ? 'Update User Profile' : 'Add New System User'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            required 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            required 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    {!editData && (
                        <div className="form-group">
                            <label>System Role</label>
                            <select 
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="doctor">Specialist Doctor</option>
                                <option value="worker">Health Worker</option>
                            </select>
                        </div>
                    )}
                    {formData.role === 'doctor' && (
                        <div className="form-group">
                            <label>Specialty</label>
                            <input 
                                type="text" 
                                required 
                                value={formData.specialty}
                                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                                placeholder="e.g. Cardiology"
                            />
                        </div>
                    )}
                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Processing...' : (editData ? 'Update Profile' : 'Create User')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserManagement;
