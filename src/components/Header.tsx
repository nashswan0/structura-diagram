import React from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import structuraLogo from '@/assets/structura-logo.png';
import structuraToken from '@/assets/structura-token.png';

interface HeaderProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
  tokens: number;
  isAdmin: boolean;
}

const Header: React.FC<HeaderProps> = ({
  toggleTheme,
  isDarkMode,
  tokens,
  isAdmin
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <header className="w-full py-3 md:py-4 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm bg-white/50 dark:bg-black/30 animate-fade-in">
      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between gap-2">
          {/* Clickable Logo & Name as Home Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-1.5 md:space-x-3 min-w-0 hover:opacity-80 transition-opacity"
          >
            <img
              src={structuraLogo}
              alt="Structura Logo"
              className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0 object-contain"
            />
            <h1 className="text-sm md:text-xl font-display font-semibold bg-gradient-primary bg-clip-text text-transparent truncate">
              Structura Diagram
            </h1>
          </button>

          {/* Token Counter & Theme Toggle */}
          <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
            {/* Token Counter with Coin Logo */}
            <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg bg-accent/10 border border-border/50">
              <img
                src={structuraToken}
                alt="Token"
                className="h-4 w-4 md:h-5 md:w-5 object-contain"
              />
              <span className="text-xs md:text-sm font-medium">
                <span className="text-primary font-bold">{isAdmin ? '∞' : tokens}</span>
              </span>
            </div>

            {/* Theme Toggle */}
            <Button variant="outline" size="sm" className="glass-button" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;