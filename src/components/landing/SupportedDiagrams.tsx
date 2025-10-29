import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Workflow, 
  ListOrdered, 
  Box, 
  CircuitBoard, 
  Database, 
  Route, 
  Calendar, 
  PieChart, 
  Grid3x3, 
  FileCheck, 
  GitBranch, 
  Layers, 
  Brain, 
  Clock, 
  Network, 
  Kanban,
  Building
} from 'lucide-react';

const SupportedDiagrams = () => {
  const { t } = useLanguage();

  const diagrams = [
    // UML Diagrams
    { icon: ListOrdered, name: 'Sequence', color: 'text-purple-500 dark:text-purple-400' },
    { icon: Box, name: 'Use Case', color: 'text-blue-500 dark:text-blue-400' },
    { icon: Workflow, name: 'Activity', color: 'text-cyan-500 dark:text-cyan-400' },
    { icon: Box, name: 'Class', color: 'text-green-500 dark:text-green-400' },
    { icon: Layers, name: 'Component', color: 'text-teal-500 dark:text-teal-400' },
    { icon: Box, name: 'Object', color: 'text-emerald-500 dark:text-emerald-400' },
    { icon: Building, name: 'Deployment', color: 'text-indigo-500 dark:text-indigo-400' },
    { icon: CircuitBoard, name: 'State', color: 'text-orange-500 dark:text-orange-400' },
    { icon: Clock, name: 'Timing', color: 'text-amber-500 dark:text-amber-400' },
    
    // Process Flow
    { icon: Workflow, name: 'Flowchart', color: 'text-blue-500 dark:text-blue-400' },
    { icon: Route, name: 'User Journey', color: 'text-cyan-500 dark:text-cyan-400' },
    
    // Data & Database
    { icon: Database, name: 'Entity Relationship', color: 'text-pink-500 dark:text-pink-400' },
    
    // Architecture
    { icon: Building, name: 'Architecture', color: 'text-sky-500 dark:text-sky-400' },
    { icon: Layers, name: 'C4', color: 'text-emerald-500 dark:text-emerald-400' },
    { icon: Building, name: 'Archimate', color: 'text-violet-500 dark:text-violet-400' },
    
    // Project Management
    { icon: Calendar, name: 'Gantt', color: 'text-indigo-500 dark:text-indigo-400' },
    { icon: Kanban, name: 'Kanban', color: 'text-lime-500 dark:text-lime-400' },
    { icon: Clock, name: 'Timeline', color: 'text-amber-500 dark:text-amber-400' },
    
    // Data Visualization
    { icon: PieChart, name: 'Pie Chart', color: 'text-yellow-500 dark:text-yellow-400' },
    { icon: Grid3x3, name: 'Quadrant Chart', color: 'text-red-500 dark:text-red-400' },
    { icon: Network, name: 'Sankey', color: 'text-rose-500 dark:text-rose-400' },
    
    // Other
    { icon: GitBranch, name: 'GitGraph', color: 'text-violet-500 dark:text-violet-400' },
    { icon: Brain, name: 'Mindmaps', color: 'text-fuchsia-500 dark:text-fuchsia-400' },
    { icon: FileCheck, name: 'Requirement', color: 'text-teal-500 dark:text-teal-400' },
    { icon: Network, name: 'Network', color: 'text-slate-500 dark:text-slate-400' },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/50">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">{t.supportedDiagrams.title} </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">{t.supportedDiagrams.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.supportedDiagrams.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {diagrams.map((diagram, index) => (
            <div
              key={diagram.name}
              className="group relative p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50 cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`${diagram.color} transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_currentColor]`}>
                  <diagram.icon className="w-10 h-10" />
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  {diagram.name}
                </h3>
              </div>
              
              {/* Gradient border effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/20 group-hover:via-accent/20 group-hover:to-primary/20 transition-all duration-300 -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SupportedDiagrams;
