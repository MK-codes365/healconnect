import React from 'react';
import Hero from '../components/Hero';
import WhyUs from '../components/WhyUs';
import ProblemSection from '../components/ProblemSection';
import SolutionSection from '../components/SolutionSection';
import KeyFeatures from '../components/KeyFeatures';
import HowItWorks from '../components/HowItWorks';
import TechStack from '../components/TechStack';
import DemoVideo from '../components/DemoVideo';
import RoleSelection from '../components/RoleSelection';
import ImpactMetrics from '../components/ImpactMetrics';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';
import SecuritySection from '../components/SecuritySection';
import AVHBBusinessImpact from '../components/landing/AVHBBusinessImpact';

const LandingPage = () => {
    return (
        <>
            <Hero />
            <WhyUs />
            <ProblemSection />
            <SolutionSection />
            <KeyFeatures />
            <AVHBBusinessImpact />
            <HowItWorks />
            <TechStack />
            <DemoVideo />
            <RoleSelection />
            <ImpactMetrics />
            <Testimonials />
            <FAQ />
            <CTA />
            <SecuritySection />
        </>
    );
};

export default LandingPage;