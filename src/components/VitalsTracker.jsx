import React, { useState, useEffect } from 'react';
import { FaHeartbeat, FaThermometerHalf, FaLungs, FaMicrochip } from 'react-icons/fa';
import './VitalsTracker.css';

const VitalsTracker = () => {
    const [vitals, setVitals] = useState({
        heartRate: 72,
        temp: 98.6,
        spO2: 98
    });

    // Simulate "Live" wearable data streaming for research prototype
    useEffect(() => {
        const interval = setInterval(() => {
            setVitals(prev => ({
                heartRate: Math.floor(prev.heartRate + (Math.random() * 4 - 2)),
                temp: parseFloat((prev.temp + (Math.random() * 0.2 - 0.1)).toFixed(1)),
                spO2: Math.min(100, Math.max(94, Math.floor(prev.spO2 + (Math.random() * 2 - 1))))
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="vitals-tracker-container glass-card">
            <div className="vitals-header">
                <h3><FaMicrochip /> Live Bio-Sensing Node (Simulated)</h3>
                <span className="live-indicator">● LIVE SYNC</span>
            </div>
            <div className="vitals-grid">
                <div className="vital-item">
                    <div className="vital-icon heart"><FaHeartbeat /></div>
                    <div className="vital-data">
                        <span className="vital-value">{vitals.heartRate}</span>
                        <span className="vital-unit">BPM</span>
                    </div>
                    <label>Heart Rate</label>
                </div>
                <div className="vital-item">
                    <div className="vital-icon temp"><FaThermometerHalf /></div>
                    <div className="vital-data">
                        <span className="vital-value">{vitals.temp}</span>
                        <span className="vital-unit">°F</span>
                    </div>
                    <label>Temperature</label>
                </div>
                <div className="vital-item">
                    <div className="vital-icon lung"><FaLungs /></div>
                    <div className="vital-data">
                        <span className="vital-value">{vitals.spO2}</span>
                        <span className="vital-unit">%</span>
                    </div>
                    <label>SpO2</label>
                </div>
            </div>
        </div>
    );
};

export default VitalsTracker;
