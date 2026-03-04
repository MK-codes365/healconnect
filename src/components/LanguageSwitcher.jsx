import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaGlobe } from 'react-icons/fa';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="language-switcher">
            <button 
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
            >
                EN
            </button>
            <div className="divider"></div>
            <button 
                className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
                onClick={() => setLanguage('hi')}
            >
                हिं
            </button>
            <FaGlobe className="globe-icon" />
        </div>
    );
};

export default LanguageSwitcher;
