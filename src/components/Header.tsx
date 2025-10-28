import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Home, Moon, Sun } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  onExport: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onExport,
  toggleTheme,
  isDarkMode
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <header className="w-full py-3 md:py-4 px-3 md:px-6 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm bg-white/50 dark:bg-black/30 animate-fade-in">
      <div className="container max-w-full flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 md:space-x-3 min-w-0">
          <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm md:text-base">S</span>
          </div>
          <h1 className="text-sm md:text-xl font-display font-semibold bg-gradient-primary bg-clip-text text-transparent truncate">
            Structura Diagram
          </h1>
          {!isMobile && (
            <div className="flex items-center gap-2">
              <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium whitespace-nowrap">
                AI Powered
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1.5 md:space-x-3 flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-button" 
            onClick={() => navigate('/')}
          >
            <Home size={14} className={isMobile ? "" : "mr-2"} />
            {!isMobile && "Home"}
          </Button>
          <Button variant="outline" size="sm" className="glass-button" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-button" 
            onClick={onExport}
          >
            <Download size={14} className={isMobile ? "" : "mr-2"} />
            {!isMobile && "Export"}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;