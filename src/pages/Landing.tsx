import React, { useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Stats from '@/components/landing/Stats';
import Features from '@/components/landing/Features';
import UseCases from '@/components/landing/UseCases';
import ExampleGallery from '@/components/landing/ExampleGallery';
import SupportedDiagrams from '@/components/landing/SupportedDiagrams';
import HowItWorks from '@/components/landing/HowItWorks';
import FAQ from '@/components/landing/FAQ';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';

const Landing = () => {
  useEffect(() => {
    // Handle hash navigation when component mounts
    const hash = window.location.hash;
    if (hash) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <UseCases />
      <ExampleGallery />
      <SupportedDiagrams />
      <HowItWorks />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
};

export default Landing;