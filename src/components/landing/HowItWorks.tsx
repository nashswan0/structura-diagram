import React from 'react';
import { Edit3, MessageSquare, Grid, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const HowItWorks = () => {
  const { t } = useLanguage();
  
  const steps = [
    {
      icon: Edit3,
      title: t.howItWorks.describe.title,
      description: t.howItWorks.describe.description
    },
    {
      icon: MessageSquare,
      title: t.howItWorks.aiInterprets.title,
      description: t.howItWorks.aiInterprets.description
    },
    {
      icon: Grid,
      title: t.howItWorks.rendering.title,
      description: t.howItWorks.rendering.description
    },
    {
      icon: RefreshCw,
      title: t.howItWorks.edit.title,
      description: t.howItWorks.edit.description
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-display font-bold mb-4">
            {t.howItWorks.title}
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              {t.howItWorks.titleHighlight}
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t.howItWorks.subtitle}
          </p>
        </div>
        
        <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-8 animate-scale-in">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative text-center animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-primary blur-xl opacity-50"></div>
                  <div className="relative w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-xl">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-primary font-bold border-2 border-primary">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-display font-semibold mb-3 text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>
              </div>
              
              {/* Desktop connecting line - positioned at icon center */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-4 w-[calc(100%+2rem)] h-0.5 bg-gradient-to-r from-primary/50 to-primary/30 z-0" 
                     style={{ left: 'calc(50% + 40px)' }}></div>
              )}
              
              {/* Mobile connecting line - vertical */}
              {index < steps.length - 1 && (
                <div className="lg:hidden absolute left-1/2 -translate-x-1/2 top-[90px] w-0.5 h-[calc(100%+2rem)] bg-gradient-to-b from-primary/50 to-primary/30"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
