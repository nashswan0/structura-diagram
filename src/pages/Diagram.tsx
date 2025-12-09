import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
import AIPrompt from '@/components/AIPrompt';
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { saveAs } from 'file-saver';
import { useTokens } from '@/hooks/useTokens';

const DEFAULT_DIAGRAM = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[Alternative Action]
    C --> E[Result]
    D --> E`;

const Diagram = () => {
  const [code, setCode] = useState<string>(DEFAULT_DIAGRAM);
  const [prompt, setPrompt] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Read from localStorage, default to dark mode
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? false : true;
  });
  const { tokens, isAdmin } = useTokens();

  useEffect(() => {
    // Apply theme from localStorage or default to dark
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
    
    const currentCode = code;
    setCode('');
    setTimeout(() => setCode(currentCode), 10);
  };

  const handleExport = async () => {
    try {
      // Get SVG element - it's inside the diagram-svg-container
      const svgElement = document.querySelector('.diagram-svg-container svg');
      if (!svgElement) {
        toast({
          title: "Export failed",
          description: "No diagram to export",
          variant: "destructive",
        });
        return;
      }

      // Get actual SVG dimensions from viewBox or computed size
      let svgWidth = svgElement.getAttribute('width');
      let svgHeight = svgElement.getAttribute('height');
      const viewBox = svgElement.getAttribute('viewBox');
      
      if (viewBox) {
        const [, , vbWidth, vbHeight] = viewBox.split(/\s+/).map(Number);
        svgWidth = vbWidth.toString();
        svgHeight = vbHeight.toString();
      } else if (!svgWidth || !svgHeight) {
        const bbox = (svgElement as SVGSVGElement).getBBox();
        svgWidth = bbox.width.toString();
        svgHeight = bbox.height.toString();
      }

      const originalWidth = parseFloat(svgWidth);
      const originalHeight = parseFloat(svgHeight);
      
      // High resolution scale
      const scale = 3;
      const exportWidth = originalWidth * scale;
      const exportHeight = originalHeight * scale;

      // Clone and prepare SVG
      const svgClone = svgElement.cloneNode(true) as SVGElement;
      
      // Set dimensions for export
      svgClone.setAttribute('width', exportWidth.toString());
      svgClone.setAttribute('height', exportHeight.toString());
      svgClone.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
      
      // Remove any transform attributes
      svgClone.removeAttribute('transform');
      svgClone.style.transform = 'none';

      // Inline all computed styles
      const inlineStyles = (source: Element, target: Element) => {
        const sourceElements = source.querySelectorAll('*');
        const targetElements = target.querySelectorAll('*');
        
        targetElements.forEach((element, index) => {
          if (sourceElements[index]) {
            const computedStyle = window.getComputedStyle(sourceElements[index]);
            const importantProps = [
              'fill', 'stroke', 'stroke-width', 'stroke-dasharray',
              'font-family', 'font-size', 'font-weight', 'font-style',
              'text-anchor', 'dominant-baseline', 'opacity', 'color',
              'background-color', 'line-height', 'letter-spacing'
            ];
            
            let styleString = '';
            importantProps.forEach(prop => {
              const value = computedStyle.getPropertyValue(prop);
              if (value && value !== 'none' && value !== 'normal') {
                styleString += `${prop}:${value};`;
              }
            });
            
            if (styleString) {
              element.setAttribute('style', styleString);
            }
          }
        });
      };

      inlineStyles(svgElement, svgClone);

      // Create data URL from SVG
      const svgString = new XMLSerializer().serializeToString(svgClone);
      const encodedSvg = encodeURIComponent(svgString);
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      const ctx = canvas.getContext('2d', { alpha: false });
      
      if (!ctx) {
        toast({
          title: "Export failed",
          description: "Failed to create canvas context",
          variant: "destructive",
        });
        return;
      }

      // Fill background
      ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff';
      ctx.fillRect(0, 0, exportWidth, exportHeight);

      // Load and draw image
      const img = new Image();
      
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
          
          // Try multiple export methods
          const tryExport = () => {
            // Method 1: toBlob (preferred)
            canvas.toBlob((blob) => {
              if (blob) {
                completeExport(blob);
              } else {
                // Method 2: toDataURL fallback
                try {
                  canvas.toDataURL('image/png');
                  const dataUrl = canvas.toDataURL('image/png', 1.0);
                  fetch(dataUrl)
                    .then(res => res.blob())
                    .then(blob => completeExport(blob))
                    .catch(() => {
                      showError("Failed to generate PNG");
                    });
                } catch (e) {
                  showError("Canvas export error");
                }
              }
            }, 'image/png', 1.0);
          };

          const completeExport = (blob: Blob) => {
            let filename = 'structura-diagram.png';
            const firstLine = code.split('\n')[0];
            if (firstLine) {
              const cleanName = firstLine
                .replace(/[^\w\s]/gi, '')
                .trim()
                .replace(/\s+/g, '-')
                .toLowerCase();
              if (cleanName && cleanName.length > 0) {
                filename = `${cleanName}.png`;
              }
            }

            saveAs(blob, filename);
            toast({
              title: "Export successful",
              description: `Saved as ${filename} (${Math.round(exportWidth)}x${Math.round(exportHeight)}px)`,
            });
          };

          const showError = (message: string) => {
            toast({
              title: "Export failed",
              description: message,
              variant: "destructive",
            });
          };

          tryExport();
        } catch (error) {
          console.error('Canvas drawing error:', error);
          toast({
            title: "Export failed",
            description: "Failed to draw diagram on canvas",
            variant: "destructive",
          });
        }
      };

      img.onerror = (error) => {
        console.error('Image load error:', error);
        toast({
          title: "Export failed",
          description: "Failed to load diagram for export",
          variant: "destructive",
        });
      };

      img.src = dataUrl;
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export diagram",
        variant: "destructive",
      });
    }
  };

  const handleDiagramGenerated = (generatedCode: string) => {
    setCode(generatedCode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 animate-fade-in">
      <Header 
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        tokens={tokens}
        isAdmin={isAdmin}
      />
      
      <main className="flex-1 container py-3 md:py-6 px-2 md:px-4 flex flex-col gap-3 md:gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 flex-1">
          <div className="glass-panel p-2 md:p-4 flex flex-col animate-slide-in">
            <Editor 
              value={code} 
              onChange={setCode} 
              className="flex-1"
              promptValue={prompt}
              onPromptChange={setPrompt}
            />
            <Separator className="my-3 md:my-4" />
            <AIPrompt 
              prompt={prompt} 
              onDiagramGenerated={handleDiagramGenerated}
              onExport={handleExport}
            />
          </div>
          
          <div className="glass-panel p-2 md:p-4 flex flex-col animate-slide-in" style={{ animationDelay: '100ms' }}>
            <Preview code={code} className="flex-1" onCodeFixed={setCode} />
          </div>
        </div>
        
        <div className="glass-panel p-4 md:p-6 animate-slide-in" style={{ animationDelay: '200ms' }}>
          <h3 className="text-base md:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3 md:mb-4 text-center">
            💡 Petunjuk Penggunaan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm">
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 md:p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-2">
                <span className="text-lg">✨</span>
                <div className="text-left">
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Detail Prompt</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Semakin detail prompt Anda, semakin akurat dan lengkap diagram yang dihasilkan
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 md:p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-2">
                <span className="text-lg">⚡</span>
                <div className="text-left">
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Waktu Proses</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Diagram kompleks membutuhkan waktu lebih lama. Harap tunggu hingga proses selesai
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 md:p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-2">
                <span className="text-lg">🎨</span>
                <div className="text-left">
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Edit & Export</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Anda dapat mengedit kode diagram secara manual dan mengekspor hasil dalam format PNG
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 md:p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-2">
                <span className="text-lg">📝</span>
                <div className="text-left">
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Dukungan Syntax</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Mendukung Mermaid dan PlantUML syntax untuk berbagai jenis diagram
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 md:p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-2">
                <span className="text-lg">🔧</span>
                <div className="text-left">
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Perbaikan AI</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Gunakan tombol "Fix with AI" jika diagram mengalami error untuk perbaikan otomatis
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 md:p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-2">
                <span className="text-lg">🌙</span>
                <div className="text-left">
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Mode Tema</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Gunakan toggle tema di header untuk beralih antara mode terang dan gelap
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 md:p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-2">
                <span className="text-lg">🚀</span>
                <div className="text-left">
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Template Diagram</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Gunakan template diagram untuk mempermudah pembuatan diagram dan mempelajari syntax diagram
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Diagram;
