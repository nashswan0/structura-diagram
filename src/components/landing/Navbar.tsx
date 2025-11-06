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

const Navbar = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const { language, setLanguage, t } = useLanguage();
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'ID' : 'EN');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 animate-fade-in">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
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
            <a href="#home" className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
              {t.navbar.home}
            </a>
            <a href="#features" className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
              {t.navbar.features}
            </a>
            <a href="#how-it-works" className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
              {t.navbar.howItWorks}
            </a>
            <a href="#faq" className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
              FAQ
            </a>
            <a href="#contact" className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
              Contact
            </a>
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
                      <a
                        href="#home"
                        className="block py-3 px-4 text-base rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        {t.navbar.home}
                      </a>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <a
                        href="#features"
                        className="block py-3 px-4 text-base rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        {t.navbar.features}
                      </a>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <a
                        href="#how-it-works"
                        className="block py-3 px-4 text-base rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        {t.navbar.howItWorks}
                      </a>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <a
                        href="#faq"
                        className="block py-3 px-4 text-base rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        FAQ
                      </a>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <a
                        href="#contact"
                        className="block py-3 px-4 text-base rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        Contact
                      </a>
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