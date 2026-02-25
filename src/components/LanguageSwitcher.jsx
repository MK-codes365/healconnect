import React, { useEffect } from 'react';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
    useEffect(() => {
        // Define the initialization function globally
        window.googleTranslateElementInit = () => {
            if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        layout: window.google.translate.TranslateElement.InlineLayout.VERTICAL,
                        autoDisplay: false,
                    },
                    'google_translate_element'
                );
            }
        };

        // Inject the Google Translate script if it doesn't exist
        if (!document.querySelector('script[src*="translate.google.com"]')) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        } else if (window.google && window.google.translate) {
            // If script is already loaded, manually trigger init
            window.googleTranslateElementInit();
        }

        // Forcefully remove the "top" offset added by Google Translate
        const observer = new MutationObserver(() => {
            if (document.body.style.top) {
                document.body.style.setProperty('top', '0px', 'important');
            }
            if (document.body.style.position) {
                document.body.style.setProperty('position', 'static', 'important');
            }
            // Hide the specific iframe if it appears
            const bannerFrame = document.querySelector('.goog-te-banner-frame');
            if (bannerFrame) {
                bannerFrame.style.display = 'none';
            }
        });

        observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
        observer.observe(document.documentElement, { childList: true, subtree: true }); // Watch for iframe injection

        return () => observer.disconnect();
    }, []);

    return (
        <div className="language-switcher-container">
            <div id="google_translate_element"></div>
        </div>
    );
};

export default LanguageSwitcher;
