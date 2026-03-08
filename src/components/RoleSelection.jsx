import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserInjured, FaUserMd, FaUserShield, FaUserNurse } from "react-icons/fa";
import Tilt from 'react-parallax-tilt';
import "./RoleSelection.css";

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <section className="role-section">
      <div className="container">
        <h2 className="section-title">Who Are You?</h2>
        <div className="role-grid">
          <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05} transitionSpeed={400} glareEnable={true} glareMaxOpacity={0.2} glareColor="#14b8a6">
            <button className="role-btn patient" onClick={() => navigate("/login?role=patient")}>
              <FaUserInjured className="role-icon" />
              <span>Patient</span>
            </button>
          </Tilt>
          
          <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05} transitionSpeed={400} glareEnable={true} glareMaxOpacity={0.2} glareColor="#0d9488">
            <button className="role-btn worker" onClick={() => navigate("/login?role=worker")}>
              <FaUserNurse className="role-icon" />
              <span>Health Worker</span>
            </button>
          </Tilt>
          
          <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05} transitionSpeed={400} glareEnable={true} glareMaxOpacity={0.2} glareColor="#3b82f6">
            <button className="role-btn doctor" onClick={() => navigate("/login?role=doctor")}>
              <FaUserMd className="role-icon" />
              <span>Remote Specialist</span>
            </button>
          </Tilt>
          
          <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05} transitionSpeed={400} glareEnable={true} glareMaxOpacity={0.2} glareColor="#6366f1">
            <button className="role-btn admin" onClick={() => navigate("/login?role=admin")}>
              <FaUserShield className="role-icon" />
              <span>Admin Panel</span>
            </button>
          </Tilt>
        </div>
      </div>
    </section>
  );
};

export default RoleSelection;