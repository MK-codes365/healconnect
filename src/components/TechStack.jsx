import React from 'react';
import './TechStack.css';
import { 
    FaReact, FaNodeJs, FaDatabase, FaServer, FaPython, 
    FaHtml5, FaCss3Alt, FaMobileAlt, FaCloud 
} from 'react-icons/fa';
import { SiMongodb, SiSocketdotio, SiVite, SiExpress, SiTensorflow } from 'react-icons/si';

const TechStack = () => {
    // Array of technologies to display
    const technologies = [
        { icon: <FaReact />, name: 'React.js' },
        { icon: <SiVite />, name: 'Vite' },
        { icon: <FaNodeJs />, name: 'Node.js' },
        { icon: <SiExpress />, name: 'Express' },
        { icon: <SiMongodb />, name: 'MongoDB' },
        { icon: <SiSocketdotio />, name: 'Socket.io' },
        { icon: <FaPython />, name: 'Python' },
        { icon: <SiTensorflow />, name: 'AI Models' },
        { icon: <FaCloud />, name: 'Cloud API' },
        { icon: <FaMobileAlt />, name: 'Responsive' },
    ];

    return (
        <section className="tech-stack-section">
            <div className="tech-header">
                <span className="section-label">Architecture</span>
                <h2 className="tech-title">Powered by Modern Tech</h2>
            </div>

            <div className="tech-slider">
                <div className="tech-track">
                    {/* First set of icons */}
                    {technologies.map((tech, index) => (
                        <div className="tech-item" key={`tech-${index}`}>
                            <div className="tech-icon">{tech.icon}</div>
                            <span className="tech-name">{tech.name}</span>
                        </div>
                    ))}
                    
                    {/* Duplicate set for seamless scrolling */}
                    {technologies.map((tech, index) => (
                        <div className="tech-item" key={`tech-duplicate-${index}`}>
                            <div className="tech-icon">{tech.icon}</div>
                            <span className="tech-name">{tech.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TechStack;