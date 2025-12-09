
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { fixMermaidDiagram } from '@/utils/fixDiagramApi';
import { toast } from '@/hooks/use-toast';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import pako from 'pako';

interface PreviewProps {
  code: string;
  className?: string;
  onCodeFixed?: (newCode: string) => void;
}

const Preview: React.FC<PreviewProps> = ({ code, className, onCodeFixed }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fixing, setFixing] = useState<boolean>(false);
  const [isPlantUML, setIsPlantUML] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const detectDiagramType = (code: string): boolean => {
    const trimmedCode = code.trim();
    return trimmedCode.startsWith('@startuml') || trimmedCode.includes('@startuml');
  };

  const encodePlantUML = (code: string): string => {
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    // Use raw deflate without zlib wrapper
    const compressed = pako.deflateRaw(data, { level: 9 });
    
    // PlantUML custom base64 encoding
    const plantumlEncoding = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
    let encoded = '';
    
    for (let i = 0; i < compressed.length; i += 3) {
      const b1 = compressed[i];
      const b2 = i + 1 < compressed.length ? compressed[i + 1] : 0;
      const b3 = i + 2 < compressed.length ? compressed[i + 2] : 0;
      
      encoded += plantumlEncoding[b1 >> 2];
      encoded += plantumlEncoding[((b1 & 0x3) << 4) | (b2 >> 4)];
      encoded += plantumlEncoding[((b2 & 0xF) << 2) | (b3 >> 6)];
      encoded += plantumlEncoding[b3 & 0x3F];
    }
    
    return encoded;
  };

  const handleFixError = async () => {
    if (!error || !code) return;

    try {
      setFixing(true);
      const fixedCode = await fixMermaidDiagram(code, error);
      
      if (onCodeFixed) {
        onCodeFixed(fixedCode);
      }
      
      toast({
        title: "Diagram fixed",
        description: "AI has corrected the errors in your diagram",
      });
    } catch (err) {
      console.error('Error fixing diagram:', err);
      toast({
        title: "Fix failed",
        description: err instanceof Error ? err.message : "Failed to fix diagram",
        variant: "destructive",
      });
    } finally {
      setFixing(false);
    }
  };
  
  useEffect(() => {
    // Initialize mermaid with custom config
    const initMermaid = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter, sans-serif',
        });
      } catch (error) {
        console.error('Mermaid initialization error:', error);
      }
    };
    initMermaid();
  }, []);
  
  useEffect(() => {
    const renderDiagram = async () => {
      if (!code.trim()) {
        setSvg('');
        setError(null);
        setIsPlantUML(false);
        return;
      }

      const isPlant = detectDiagramType(code);
      setIsPlantUML(isPlant);

      try {
        setLoading(true);
        setError(null);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (isPlant) {
          // Render PlantUML using public server
          const encoded = encodePlantUML(code);
          
          // Step 1: Check syntax using PlantUML text endpoint
          try {
            const syntaxCheckUrl = `https://www.plantuml.com/plantuml/txt/${encoded}`;
            const syntaxResponse = await fetch(syntaxCheckUrl);
            
            if (syntaxResponse.ok) {
              const syntaxText = await syntaxResponse.text();
              
              // Check if syntax check returned an error
              if (syntaxText.includes('ERROR') || 
                  syntaxText.includes('Syntax error') ||
                  syntaxText.includes('Error line')) {
                // Extract and clean error message
                const errorLines = syntaxText.split('\n').filter(line => 
                  line.includes('ERROR') || 
                  line.includes('Error') || 
                  line.includes('line')
                );
                const errorMessage = errorLines.length > 0 
                  ? errorLines.join('\n').trim()
                  : syntaxText.trim();
                
                throw new Error(`PlantUML Syntax Error:\n${errorMessage}`);
              }
            }
          } catch (syntaxError) {
            // If it's our thrown error, re-throw it
            if (syntaxError instanceof Error && syntaxError.message.includes('PlantUML Syntax Error')) {
              throw syntaxError;
            }
            // Otherwise, continue to SVG render (syntax check might have failed for other reasons)
            console.warn('PlantUML syntax check failed, proceeding with SVG render:', syntaxError);
          }
          
          // Step 2: Render SVG (or get error image)
          const plantUMLUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`;
          const response = await fetch(plantUMLUrl);
          
          // PlantUML returns 400 for syntax errors but still provides error image in response
          // So we need to get the text regardless of status code
          let svgText = '';
          try {
            svgText = await response.text();
          } catch (fetchError) {
            console.error('Failed to fetch PlantUML response:', fetchError);
            throw new Error('Failed to connect to PlantUML server. Please try again.');
          }
          
          // If we got no content at all, throw error
          if (!svgText || svgText.trim().length === 0) {
            throw new Error(`PlantUML server returned empty response (status: ${response.status})`);
          }
          
          // Step 3: Check if SVG contains error indicators
          // PlantUML error images usually contain specific text patterns
          const svgLower = svgText.toLowerCase();
          const hasErrorIndicator = svgLower.includes('syntax error') || 
                                    svgLower.includes('error line') ||
                                    svgLower.includes('error at line') ||
                                    (svgLower.includes('error') && svgText.length < 3000);
          
          if (hasErrorIndicator) {
            console.log('PlantUML error detected, extracting error message...');
            
            // Try to extract error text from SVG
            const textMatches = svgText.match(/>([^<]*(?:error|Error|line \d+)[^<]*)</gi);
            if (textMatches && textMatches.length > 0) {
              const errorTexts = textMatches
                .map(match => match.replace(/<[^>]*>/g, '').replace(/>/g, '').trim())
                .filter(text => text.length > 3 && (
                  text.toLowerCase().includes('error') || 
                  text.toLowerCase().includes('line')
                ))
                .slice(0, 5); // Limit to first 5 error lines
              
              if (errorTexts.length > 0) {
                const errorMessage = errorTexts.join('\n');
                console.log('Extracted error message:', errorMessage);
                throw new Error(`PlantUML Syntax Error:\n${errorMessage}`);
              }
            }
            
            // If we can't extract specific error, show generic message
            throw new Error('PlantUML syntax error detected. Please check your diagram code for errors.');
          }
          
          setSvg(svgText);
        } else {
          // Render Mermaid
          try {
            // Clear any previous mermaid diagrams
            const existingDiagram = document.getElementById('mermaid-diagram');
            if (existingDiagram) {
              existingDiagram.remove();
            }
            
            const { svg } = await mermaid.render('mermaid-diagram', code);
            setSvg(svg);
          } catch (mermaidError) {
            console.error('Mermaid render error:', mermaidError);
            throw mermaidError;
          }
        }
      } catch (err) {
        console.error('Diagram rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
        setSvg('');
      } finally {
        setLoading(false);
      }
    };

    renderDiagram();
  }, [code]);

  return (
    <div className={cn("h-full w-full overflow-hidden", className)}>
      <div ref={containerRef} className="diagram-container min-h-full h-full flex items-center justify-center relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm animate-fade-in z-10">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        )}
        
        {error && !loading && (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg animate-fade-in max-w-2xl">
            <h3 className="text-red-600 dark:text-red-400 font-medium mb-2">Error</h3>
            <pre className="text-red-500 dark:text-red-300 text-sm whitespace-pre-wrap font-mono mb-4">{error}</pre>
            <Button
              onClick={handleFixError}
              disabled={fixing}
              className="w-full"
            >
              {fixing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fixing with AI...
                </>
              ) : (
                'Fix Error with AI'
              )}
            </Button>
          </div>
        )}
        
        {!loading && !error && svg ? (
          <TransformWrapper
            initialScale={1}
            minScale={0.1}
            maxScale={5}
            centerOnInit
            limitToBounds={false}
            panning={{ disabled: false }}
            wheel={{ step: 0.1 }}
            doubleClick={{ disabled: false, step: 0.7 }}
          >
            <TransformComponent
              wrapperClass="!w-full !h-full !overflow-visible"
              contentClass="!w-full !h-full flex items-center justify-center"
              wrapperStyle={{ width: '100%', height: '100%' }}
            >
              <div 
                className="animate-scale-in diagram-svg-container"
                dangerouslySetInnerHTML={{ __html: svg }} 
              />
            </TransformComponent>
          </TransformWrapper>
        ) : (
          !loading && !error && (
            <div className="text-center text-slate-400 dark:text-slate-500 animate-fade-in">
              <p>Your diagram will appear here</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Preview;
