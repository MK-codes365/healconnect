import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      features: "Features",
      contact: "Contact",
      login: "Login",
      dashboard: "Dashboard"
    },
    hero: {
      title: "Bridging Healthcare Gaps",
      subtitle: "AI-Powered Telemedicine for everyone, everywhere.",
      cta: "Get Started"
    },
    dashboard: {
      welcome: "Welcome back",
      ai_assistant: "AI Health Assistant",
      book_consult: "Book Consultation",
      my_records: "My Health Records",
      appointments: "Appointments"
    }
  },
  hi: {
    nav: {
      home: "होम",
      about: "हमारे बारे में",
      features: "विशेषताएं",
      contact: "संपर्क करें",
      login: "लॉगिन",
      dashboard: "डैशबोर्ड"
    },
    hero: {
      title: "स्वास्थ्य सेवा की दूरियों को मिटाना",
      subtitle: "हर किसी के लिए, हर जगह AI-संचालित टेलीमेडिसिन।",
      cta: "शुरू करें"
    },
    dashboard: {
      welcome: "वापस स्वागत है",
      ai_assistant: "AI स्वास्थ्य सहायक",
      book_consult: "परामर्श बुक करें",
      my_records: "मेरे स्वास्थ्य रिकॉर्ड",
      appointments: "नियुक्ति"
    }
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (path) => {
    const keys = path.split('.');
    let result = translations[language];
    for (const key of keys) {
      if (result[key]) {
        result = result[key];
      } else {
        return path;
      }
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
