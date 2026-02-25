import React from 'react';
import { FaHeartbeat, FaGlobeAsia, FaUsers, FaLightbulb } from 'react-icons/fa';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            <section className="about-hero">
                <div className="container">
                    <h1 className="about-title">About <span className="highlight">HealConnect</span></h1>
                    <p className="about-subtitle">Bridging the healthcare gap between rural villages and urban specialists.</p>
                </div>
            </section>

            <section className="about-section mission-section">
                <div className="container about-grid">
                    <div className="about-content">
                        <h2>Our Mission</h2>
                        <p>
                            India faces a critical disparity in healthcare access. While urban centers boast world-class medical facilities, 
                            <strong>70% of India's population</strong> lives in rural areas with limited access to doctors.
                        </p>
                        <p>
                            <strong>HealConnect</strong> was born to solve this. We use simple, accessible technology to connect valid symptoms from a remote village 
                            directly to a specialist's screen in the city—saving time, money, and most importantly, lives.
                        </p>
                    </div>
                    <div className="about-image-card">
                        <FaHeartbeat className="about-icon pulse" />
                        <h3>Healthcare for All</h3>
                    </div>
                </div>
            </section>

            <section className="about-section values-section">
                <div className="container">
                    <h2 className="section-title text-center">Our Core Values</h2>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon-wrapper blue">
                                <FaGlobeAsia />
                            </div>
                            <h3>Accessibility</h3>
                            <p>No one should travel 100km just for a diagnosis. We bring the hospital to the home.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon-wrapper green">
                                <FaLightbulb />
                            </div>
                            <h3>Innovation</h3>
                            <p>Using AI not to replace doctors, but to empower them to treat more patients faster.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon-wrapper purple">
                                <FaUsers />
                            </div>
                            <h3>Empathy</h3>
                            <p>Built with a deep understanding of the challenges faced by rural communities and health workers.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-section team-section">
                <div className="container">
                    <div className="team-header">
                        <span className="section-pre-title">Meet the Team</span>
                        <h2 className="section-title">CodeX5</h2>
                        <p className="team-college">UIET Kanpur (CSJM University) • B-Tech IT</p>
                        <p className="team-tagline">"Combining code and compassion to heal rural India."</p>
                    </div>
                    <div className="team-grid">
                        <div className="team-card">
                            <div className="member-image">
                                <img src="/shreya.jpeg" alt="Shreya Jain" />
                                <div className="member-overlay"></div>
                            </div>
                            <div className="member-info">
                                <h3>Shreya Jain</h3>
                                <span className="member-role highlight">Backend Developer</span>
                                <p>Architecting robust APIs and secure data infrastructure.</p>
                            </div>
                        </div>

                        <div className="team-card">
                            <div className="member-image">
                                <img src="/mukut.jpeg" alt="Mukut Kumar" />
                                <div className="member-overlay"></div>
                            </div>
                            <div className="member-info">
                                <h3>Mukut Kumar</h3>
                                <span className="member-role highlight">Frontend Developer</span>
                                <p>Crafting intuitive and accessible user experiences.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;