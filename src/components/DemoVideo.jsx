import React from 'react';
import './DemoVideo.css';

const DemoVideo = () => {
    return (
        <section className="demo-section">
            <div className="container">
                <div className="demo-header">
                    <h2 className="section-title">See HealConnect in Action</h2>
                    <p className="section-subtitle">Watch how a consultation typically takes less than 5 minutes.</p>
                </div>
                <div className="video-wrapper">
                    <iframe 
                        width="100%" 
                        height="500" 
                        src="https://www.youtube.com/embed/psgTf_T03Tc" 
                        title="HealConnect Demo Video" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        style={{ borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                    ></iframe>
                </div>
            </div>
        </section>
    );
};

export default DemoVideo;