import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ParticleBackground from '@/components/ParticleBackground';
import Stats from '@/components/landing/Stats';
import { supabase } from '@/integrations/supabase/client';

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLaunchClick = () => {
    if (isAuthenticated) {
      navigate('/diagram');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Floating shapes - adjusted for unified background */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto animate-blur-in">
          <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-4 md:mb-6 shadow-lg animate-scale-in">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">
              {t.hero.badge}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 md:mb-6 leading-tight animate-fade-in">
            {t.hero.title}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>
            {t.hero.titleRest}
          </h1>
          
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-6 md:mb-8 max-w-2xl mx-auto animate-slide-in">
            {t.hero.description}
          </p>
          
          {/* Stats Component - Smaller, Transparent */}
          <div className="mb-8 animate-fade-in">
            <Stats compact />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 animate-scale-in">
            <Button 
              onClick={handleLaunchClick}
              size="lg"
              className="w-full sm:w-auto bg-gradient-primary hover:opacity-90 transition-opacity shadow-xl text-base md:text-lg px-6 md:px-8 py-5 md:py-6 group"
            >
              {t.hero.launchButton}
              <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                const gallery = document.querySelector('[id="example-gallery"]');
                gallery?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 border-2"
            >
              {t.hero.viewExamples}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;