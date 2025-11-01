import React, { useState } from 'react';
import { diagramTemplates, templateCategories, DiagramTemplate } from '@/data/diagramTemplates';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, FileCode2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  onSelectTemplate: (code: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = diagramTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'Semua' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cari template diagram..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Filter */}
      <div className="relative -mx-4 px-4">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
          <div className="flex gap-2 pb-2 pr-4">
            {templateCategories.map(category => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={cn(
                  "cursor-pointer whitespace-nowrap transition-all hover:scale-105 shrink-0",
                  selectedCategory === category && "shadow-sm"
                )}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-4">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template.code)}
              className={cn(
                "group relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                "hover:border-primary hover:shadow-md hover:scale-[1.02]",
                "bg-card hover:bg-accent/50",
                "animate-fade-in"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-md transition-colors",
                  "bg-primary/10 group-hover:bg-primary/20"
                )}>
                  <FileCode2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.type === 'mermaid' ? 'Mermaid' : 'PlantUML'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <FileCode2 className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Tidak ada template yang ditemukan
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default TemplateSelector;
