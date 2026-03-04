import React, { createContext, useContext, useState, useEffect } from 'react';
import { FaInfoCircle, FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import './NotificationContext.css';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const notify = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="notification-container">
        {notifications.map(n => (
          <div key={n.id} className={`notification-toast ${n.type} animate-slide-in`}>
            <div className="notification-icon">
              {n.type === 'success' && <FaCheckCircle />}
              {n.type === 'error' && <FaExclamationCircle />}
              {n.type === 'info' && <FaInfoCircle />}
            </div>
            <div className="notification-content">{n.message}</div>
            <button className="notification-close" onClick={() => removeNotification(n.id)}>
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotify = () => useContext(NotificationContext);
