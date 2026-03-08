import React from 'react';
import { FaCar, FaRupeeSign, FaHourglassHalf } from 'react-icons/fa';
import Tilt from 'react-parallax-tilt';
import './ProblemSection.css';

const ProblemSection = () => {
    return (
        <section className="problem-section">
            <div className="container">
                <h2 className="section-title">The Challenge</h2>
                <p className="problem-statement">
                    “Rural patients must travel long distances to access specialist care, often causing delays, higher costs, and poor health outcomes.”
                </p>
                <div className="problem-cards">
                    <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05} transitionSpeed={400} gyroscope={true} className="problem-tilt-wrap">
                        <div className="problem-card">
                            <FaCar className="problem-icon" />
                            <h3>Long Travel Distances</h3>
                            <p>Patients travel hours for basic consultations.</p>
                        </div>
                    </Tilt>
                    <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05} transitionSpeed={400} gyroscope={true} className="problem-tilt-wrap">
                        <div className="problem-card">
                            <FaRupeeSign className="problem-icon" />
                            <h3>High Costs</h3>
                            <p>Expensive travel & consultation fees burden families.</p>
                        </div>
                    </Tilt>
                    <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05} transitionSpeed={400} gyroscope={true} className="problem-tilt-wrap">
                        <div className="problem-card">
                            <FaHourglassHalf className="problem-icon" />
                            <h3>Critical Delays</h3>
                            <p>Late diagnosis often leads to worse outcomes.</p>
                        </div>
                    </Tilt>
                </div>
            </div>
        </section>
    );
};

export default ProblemSection;