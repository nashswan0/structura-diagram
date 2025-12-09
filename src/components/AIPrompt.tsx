
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Coins, Download } from "lucide-react";
import { cn } from '@/lib/utils';
import { generateMermaidDiagram } from '@/utils/diagramApi';
import { toast } from "@/hooks/use-toast";
import { useTokens } from '@/hooks/useTokens';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AIPromptProps {
  prompt: string;
  onDiagramGenerated: (diagram: string) => void;
  onExport: () => void;
  className?: string;
}

const AIPrompt: React.FC<AIPromptProps> = ({ prompt, onDiagramGenerated, onExport, className }) => {
  const [loading, setLoading] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const { tokens, consumeToken, isAdmin } = useTokens();
  const { t } = useLanguage();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a description of the diagram you want to create",
        variant: "destructive",
      });
      return;
    }

    // Check if user has tokens (skip for admin)
    if (!isAdmin && tokens <= 0) {
      setShowTokenDialog(true);
      return;
    }

    try {
      setLoading(true);

      // Generate diagram first
      const diagram = await generateMermaidDiagram(prompt);

      // Only consume token after successful generation (skip for admin)
      if (!isAdmin) {
        const tokenConsumed = await consumeToken();

        if (!tokenConsumed) {
          toast({
            title: t.auth.outOfTokens,
            description: t.auth.noTokensMessage,
            variant: "destructive",
          });
          return;
        }
      }

      onDiagramGenerated(diagram);

      toast({
        title: "Diagram generated",
        description: isAdmin
          ? "Your diagram has been generated successfully."
          : "Your diagram has been generated successfully. Check your token counter for remaining tokens.",
      });
    } catch (error) {
      console.error('Error generating diagram:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate diagram",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={cn("flex flex-col md:flex-row items-stretch gap-2 md:gap-3 w-full", className)}>
        <Button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim() || (!isAdmin && tokens <= 0)}
          className="flex-1 bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </>
          )}
        </Button>

        <Button
          onClick={onExport}
          variant="outline"
          className="flex-1 glass-button"
        >
          <Download className="mr-2 h-4 w-4" />
          Export as PNG
        </Button>
      </div>

      {/* Out of Tokens Dialog */}
      <AlertDialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Coins className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl">{t.auth.outOfTokens}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3 text-base">
              <p>{t.auth.noTokensMessage}</p>
              <p className="text-sm text-muted-foreground mt-2">{t.auth.waitForReset}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowTokenDialog(false)} className="w-full">
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AIPrompt;
