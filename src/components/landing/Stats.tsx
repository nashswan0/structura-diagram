import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Zap, Bot, Coins, Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StatsProps {
  compact?: boolean;
}

const Stats = ({ compact = false }: StatsProps) => {
  const { t } = useLanguage();

  const stats = [
    {
      icon: Zap,
      value: t.stats.generation.value,
      label: t.stats.generation.label,
      tooltip: t.stats.generation.tooltip,
    },
    {
      icon: Bot,
      value: t.stats.types.value,
      label: t.stats.types.label,
      tooltip: t.stats.types.tooltip,
    },
    {
      icon: Coins,
      value: t.stats.tokens.value,
      label: t.stats.tokens.label,
      tooltip: t.stats.tokens.tooltip,
    },
    {
      icon: Sparkles,
      value: t.stats.aiHandling.value,
      label: t.stats.aiHandling.label,
      tooltip: t.stats.aiHandling.tooltip,
    },
  ];

  return (
    <section className={compact ? "py-0" : "py-12 px-4 sm:px-6 lg:px-8 border-b border-border/50"}>
      <div className={compact ? "" : "container mx-auto"}>
        <div className={`grid grid-cols-2 md:grid-cols-4 ${compact ? 'gap-2 md:gap-4' : 'gap-4 md:gap-8'}`}>
          <TooltipProvider>
            {stats.map((stat, index) => (
              <Tooltip key={index} delayDuration={200}>
                <TooltipTrigger asChild>
                  <div 
                    className={`flex flex-col items-center text-center rounded-lg transition-all duration-300 hover:bg-accent/5 hover:shadow-lg hover:scale-105 group cursor-pointer animate-fade-in ${
                      compact ? 'p-3' : 'p-6'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <stat.icon className={`${compact ? 'w-5 h-5 mb-2' : 'w-8 h-8 mb-3'} text-primary transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_hsl(var(--primary))]`} />
                    <div className={`${compact ? 'text-xl md:text-2xl mb-1' : 'text-3xl md:text-4xl mb-2'} font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent transition-all duration-300 group-hover:from-primary group-hover:via-accent group-hover:to-primary`}>
                      {stat.value}
                    </div>
                    <div className={`${compact ? 'text-xs md:text-sm' : 'text-sm md:text-base'} text-muted-foreground group-hover:text-foreground transition-colors duration-300`}>
                      {stat.label}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  side="bottom" 
                  className="max-w-xs text-center bg-popover/95 backdrop-blur-sm"
                >
                  <p>{stat.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
    </section>
  );
};

export default Stats;
