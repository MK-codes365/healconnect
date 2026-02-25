import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-links">
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/terms">Terms</Link>
                </div>
                <div className="footer-credits">
                    <p>&copy; {new Date().getFullYear()} HealConnect. All rights reserved.</p>
                    <p className="team-credit">Built with ❤️ by <span>CodeX5</span></p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;