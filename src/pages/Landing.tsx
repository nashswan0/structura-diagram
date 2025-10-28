import React from 'react';
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