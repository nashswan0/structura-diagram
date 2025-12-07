import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import structuraLogo from '@/assets/structura-logo.png';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from '@/hooks/use-mobile';
import AuthButton from '@/components/auth/AuthButton';
import { useTokens } from '@/hooks/useTokens';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

const Navbar = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Read from localStorage, default to dark mode
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? false : true;
  });
  const { language, setLanguage, t } = useLanguage();
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { tokens, loading: tokensLoading } = useTokens();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === 'light' ? false : true;
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setIsDarkMode(shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Save to localStorage
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'ID' : 'EN');
  };

  const handleNavClick = (sectionId: string) => {
    // Check if we're on the landing page
    if (window.location.pathname === '/') {
      // Already on landing page, just scroll to section
      const element = document.querySelector(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // On different page, navigate to landing with hash
      navigate(`/${sectionId}`);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 animate-fade-in">
      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6 py-3 md:py-4">

        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-1.5 md:space-x-2">
            <img 
              src={structuraLogo} 
              alt="Structura Logo" 
              className="h-8 w-8 md:h-10 md:w-10 object-contain"
            />
            <span className="text-base md:text-2xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
              Structura Diagram
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNavClick('#home')} 
              className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
            >
              {t.navbar.home}
            </button>
            <button 
              onClick={() => handleNavClick('#features')} 
              className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
            >
              {t.navbar.features}
            </button>
            <button 
              onClick={() => handleNavClick('#how-it-works')} 
              className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
            >
              {t.navbar.howItWorks}
            </button>
            <button 
              onClick={() => handleNavClick('#faq')} 
              className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
            >
              FAQ
            </button>
            <button 
              onClick={() => handleNavClick('#contact')} 
              className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
            >
              Contact
            </button>
            <button 
              onClick={() => navigate('/tokens')} 
              className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
            >
              {language === 'EN' ? 'Buy Tokens' : 'Beli Token'}
            </button>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Desktop Controls */}
            {!isMobile && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="glass-button min-w-[50px] text-xs" 
                  onClick={toggleLanguage}
                >
                  {language}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="glass-button" 
                  onClick={toggleTheme}
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </Button>
              </>
            )}
            
            {/* Auth Button - Always visible */}
            <AuthButton 
              onLoginClick={() => navigate('/auth')}
              variant="default"
              size="sm"
            />
            
            {/* Mobile Drawer Menu Button */}
            {isMobile && (
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="glass-button"
                >
                  <Menu size={18} />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="animate-slide-in">
                <DrawerHeader>
                  <DrawerTitle className="text-xl font-display bg-gradient-primary bg-clip-text text-transparent">
                    Menu
                  </DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-3">
                  {/* Navigation Links */}
                  <DrawerClose asChild>
                    <button 
                      onClick={() => {
                        setIsDrawerOpen(false);
                        handleNavClick('#home');
                      }}
                      className="block w-full text-left py-3 px-4 text-base rounded-lg hover:bg-accent transition-colors"
                    >
                      {t.navbar.home}
                    </button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <button 
                      onClick={() => {
                        setIsDrawerOpen(false);
                        handleNavClick('#features');
                      }}
                      className="block w-full text-left py-3 px-4 text-base rounded-lg hover:bg-accent transition-colors"
                    >
                      {t.navbar.features}
                    </button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <button 
                      onClick={() => {
                        setIsDrawerOpen(false);
                        handleNavClick('#how-it-works');
                      }}
                      className="block w-full text-left py-3 px-4 text-base rounded-lg hover:bg-accent transition-colors"
                    >
                      {t.navbar.howItWorks}
                    </button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <button 
                      onClick={() => {
                        setIsDrawerOpen(false);
                        handleNavClick('#faq');
                      }}
                      className="block w-full text-left py-3 px-4 text-base rounded-lg hover:bg-accent transition-colors"
                    >
                      FAQ
                    </button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <button 
                      onClick={() => {
                        setIsDrawerOpen(false);
                        handleNavClick('#contact');
                      }}
                      className="block w-full text-left py-3 px-4 text-base rounded-lg hover:bg-accent transition-colors"
                    >
                      Contact
                    </button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <button 
                      onClick={() => {
                        setIsDrawerOpen(false);
                        navigate('/tokens');
                      }}
                      className="block w-full text-left py-3 px-4 text-base rounded-lg hover:bg-accent transition-colors font-semibold"
                    >
                      {language === 'EN' ? 'Buy Tokens' : 'Beli Token'}
                    </button>
                  </DrawerClose>
                  
                  {/* Mobile Controls */}
                  {isMobile && (
                    <>
                      <div className="border-t pt-3 mt-3 space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full glass-button" 
                          onClick={toggleLanguage}
                        >
                          {t.navbar.language}: {language}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full glass-button" 
                          onClick={toggleTheme}
                        >
                          {isDarkMode ? (
                            <><Sun size={18} className="mr-2" /> {t.navbar.lightMode}</>
                          ) : (
                            <><Moon size={18} className="mr-2" /> {t.navbar.darkMode}</>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

