import React from 'react';
import { Puzzle, Brain, Palette, Zap, Globe, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Features = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Puzzle,
      title: t.features.multiDiagram.title,
      description: t.features.multiDiagram.description
    },
    {
      icon: Brain,
      title: t.features.aiEngine.title,
      description: t.features.aiEngine.description
    },
    {
      icon: Palette,
      title: t.features.creativeInterface.title,
      description: t.features.creativeInterface.description
    },
    {
      icon: Zap,
      title: t.features.fastRendering.title,
      description: t.features.fastRendering.description
    },
    {
      icon: Globe,
      title: t.features.webBased.title,
      description: t.features.webBased.description
    },
    {
      icon: Download,
      title: t.features.export.title,
      description: t.features.export.description
    }
  ];

  return (
    <section id="features" className="py-24 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-display font-bold mb-4">
            {t.features.title}
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              {t.features.titleHighlight}
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-scale-in">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-8 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3 text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
