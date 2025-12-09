
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplateSelector from './TemplateSelector';
import '../styles/code-editor.css';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  promptValue: string;
  onPromptChange: (value: string) => void;
}

// Mermaid syntax highlighting
const highlightMermaid = (code: string): string => {
  // Keywords
  const keywords = /\b(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph|mindmap|timeline|TD|TB|BT|RL|LR|subgraph|end|participant|actor|loop|alt|else|opt|par|and|critical|break|note|over|of|left|right|activate|deactivate|title|section|dateFormat|axisFormat|class|style|linkStyle)\b/g;
  
  // Arrows and connections
  const arrows = /(-->|---|\|>|<\||--o|o--|--x|x--|==|==>|-.->|-.-|<-->)/g;
  
  // Node IDs and labels in brackets
  const nodeLabels = /(\[.*?\]|\(.*?\)|\{.*?\}|\[\[.*?\]\]|\(\(.*?\)\)|\{\{.*?\}\})/g;
  
  // Strings in quotes
  const strings = /("[^"]*"|'[^']*')/g;
  
  // Comments
  const comments = /(%%.*$)/gm;
  
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  highlighted = highlighted
    .replace(comments, '<span class="token-comment">$1</span>')
    .replace(strings, '<span class="token-string">$1</span>')
    .replace(keywords, '<span class="token-keyword">$1</span>')
    .replace(arrows, '<span class="token-arrow">$1</span>')
    .replace(nodeLabels, '<span class="token-node">$1</span>');
  
  return highlighted;
};

const CodeEditorWithLineNumbers: React.FC<{
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
}> = ({ value, onChange, minHeight = '300px' }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const lines = useMemo(() => value.split('\n'), [value]);
  const lineCount = lines.length;

  // Sync scroll between textarea and pre
  const handleScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Handle tab key
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  }, [value, onChange]);

  // Auto-resize and sync
  useEffect(() => {
    if (textareaRef.current && preRef.current) {
      // Calculate the height needed for all content
      const lineHeight = 22.4; // matches CSS line-height * font-size (1.6 * 14px)
      const padding = 32; // 16px top + 16px bottom
      const contentHeight = (lineCount * lineHeight) + padding;
      const minHeight = 300; // minimum height from CSS
      
      // Set height to fit all content, with minimum
      const height = Math.max(contentHeight, minHeight);
      
      // Apply height to pre and textarea
      preRef.current.style.height = `${height}px`;
      textareaRef.current.style.height = `${height}px`;
      
      // Sync scroll position
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, [value, lineCount]);

  const highlightedCode = useMemo(() => highlightMermaid(value), [value]);

  return (
    <div 
      className="code-editor-wrapper"
      style={{ minHeight }}
    >
      {/* Code Area */}
      <div className="code-editor-area">
        {/* Highlighted code (visible) */}
        <pre
          ref={preRef}
          className="code-highlight"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: highlightedCode + '\n' }}
        />
        
        {/* Textarea (invisible but interactive) */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="code-textarea"
          spellCheck="false"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          data-gramm="false"
        />
      </div>
    </div>
  );
};

const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  className,
  promptValue,
  onPromptChange
}) => {
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
            <CodeEditorWithLineNumbers
              value={value}
              onChange={onChange}
              minHeight="300px"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="prompt" className="flex-1 mt-0 min-h-0 overflow-hidden">
          <div className="h-full">
            <textarea
              value={promptValue}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Deskripsikan diagram yang ingin kamu buat..."
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
