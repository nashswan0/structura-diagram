
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SimpleCodeEditor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
import TemplateSelector from './TemplateSelector';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  promptValue: string;
  onPromptChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  className,
  promptValue,
  onPromptChange
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.height = 'auto';
      editorRef.current.style.height = `${editorRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const highlight = (code: string) => {
    // Detect diagram type for appropriate highlighting
    const isMermaid = !code.trim().startsWith('@startuml');
    
    if (isMermaid) {
      // Mermaid syntax highlighting
      return code
        .split('\n')
        .map(line => {
          // Keywords
          line = line.replace(/(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|mindmap|timeline|quadrantChart|requirementDiagram|journey)\s+(TD|TB|BT|RL|LR)?/g, 
            '<span class="token keyword">$1</span> <span class="token operator">$2</span>');
          
          // Arrows and operators
          line = line.replace(/(-->|---|-\.-|==>|==|-\.-\>|--\>|--|-\||\|-|o--o|<--\>|x--x|\|)/g, 
            '<span class="token operator">$1</span>');
          
          // Node IDs and labels
          line = line.replace(/([A-Za-z0-9_]+)(\[|\(|\{|>|\[\[)/g, 
            '<span class="token variable">$1</span><span class="token punctuation">$2</span>');
          
          // Strings in quotes or brackets
          line = line.replace(/(\[|\(|\{|>)([^\]\)\}>]+)(\]|\)|\}|>)/g, 
            '$1<span class="token string">$2</span>$3');
          
          // Special characters
          line = line.replace(/(\||:)/g, '<span class="token punctuation">$1</span>');
          
          return line;
        })
        .join('\n');
    } else {
      // PlantUML syntax highlighting
      return code
        .split('\n')
        .map(line => {
          // Keywords
          line = line.replace(/(@startuml|@enduml|participant|actor|boundary|control|entity|database|collections|class|interface|abstract|enum|package|namespace|note|activate|deactivate|alt|else|opt|loop|par|break|critical|group)/g, 
            '<span class="token keyword">$1</span>');
          
          // Arrows
          line = line.replace(/(->|-->|<-|<--|<->|<-->|\*->|\*-->|o->|o-->)/g, 
            '<span class="token operator">$1</span>');
          
          // Strings
          line = line.replace(/"([^"]+)"/g, '<span class="token string">"$1"</span>');
          
          // Comments
          line = line.replace(/'([^']+)/g, '<span class="token comment">\'$1</span>');
          
          return line;
        })
        .join('\n');
    }
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <Tabs defaultValue="code" className="h-full flex flex-col">
        <TabsList className="w-full justify-start bg-transparent border-b border-slate-200/80 dark:border-slate-800/80 rounded-none px-0">
          <TabsTrigger 
            value="code" 
            className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Code Input
          </TabsTrigger>
          <TabsTrigger 
            value="prompt" 
            className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            AI Prompt
          </TabsTrigger>
          <TabsTrigger 
            value="template" 
            className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Template
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="code" className="flex-1 mt-0 min-h-0 overflow-hidden">
          <div className="h-full overflow-hidden rounded-lg">
            <SimpleCodeEditor
              value={value}
              onValueChange={onChange}
              highlight={highlight}
              padding={16}
              style={{ minHeight: '300px', height: '100%' }}
              className="code-editor-container h-full"
              textareaClassName="code-editor-textarea"
              preClassName="code-editor-pre"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="prompt" className="flex-1 mt-0 min-h-0 overflow-hidden">
          <div className="h-full">
            <textarea
              value={promptValue}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Describe the diagram you want to create..."
              style={{ minHeight: '300px' }}
              className="editor-container h-full resize-none animate-fade-in"
              spellCheck="false"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="template" className="flex-1 mt-0 min-h-0 overflow-hidden">
          <div className="h-full p-4">
            <TemplateSelector onSelectTemplate={onChange} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Editor;
