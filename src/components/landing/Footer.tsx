import React from 'react';
import { Github, Linkedin, Instagram, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-slate-900 dark:bg-black text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-display font-bold">Structura Diagram</span>
            </div>
            <p className="text-slate-400">
              {t.footer.tagline}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="text-slate-400 hover:text-white transition-colors">{t.navbar.home}</a></li>
              <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">{t.navbar.features}</a></li>
              <li><a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">{t.navbar.howItWorks}</a></li>
              <li>
                <a 
                  href="#example-gallery" 
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('example-gallery')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {t.footer.exampleGallery}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t.footer.connect}</h4>
            <div className="flex flex-wrap gap-3">
              <a 
                href="https://www.instagram.com/nashzwan_/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-gradient-primary flex items-center justify-center transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/nashwan-zaki-permana-a08681297/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-gradient-primary flex items-center justify-center transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/nashswan0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-gradient-primary flex items-center justify-center transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://wa.me/6285839956564" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-gradient-primary flex items-center justify-center transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
          <p>{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
