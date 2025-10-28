
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Coins } from "lucide-react";
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
  className?: string;
}

const AIPrompt: React.FC<AIPromptProps> = ({ prompt, onDiagramGenerated, className }) => {
  const [loading, setLoading] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { tokens, consumeToken, getTimeUntilReset, isAdmin } = useTokens();
  const { t } = useLanguage();

  // Update countdown every second when dialog is open
  React.useEffect(() => {
    if (showTokenDialog) {
      const interval = setInterval(() => {
        setCountdown(getTimeUntilReset());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showTokenDialog, getTimeUntilReset]);

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
      setCountdown(getTimeUntilReset());
      setShowTokenDialog(true);
      return;
    }

    try {
      setLoading(true);
      
      // Consume a token
      const tokenConsumed = await consumeToken();
      
      if (!tokenConsumed) {
        toast({
          title: t.auth.outOfTokens,
          description: t.auth.noTokensMessage,
          variant: "destructive",
        });
        return;
      }

      const diagram = await generateMermaidDiagram(prompt);
      onDiagramGenerated(diagram);
      
      toast({
        title: "Diagram generated",
        description: `Your diagram has been generated successfully. ${tokens - 1} ${t.auth.tokensRemaining}`,
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
      <div className={cn("flex flex-col sm:flex-row items-start sm:items-center gap-3", className)}>
        <Button 
          onClick={handleGenerate} 
          disabled={loading || !prompt.trim() || (!isAdmin && tokens <= 0)} 
          className="min-w-32 bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-lg"
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
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-border/50">
            <Coins className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {t.auth.tokensLabel}: <span className="text-primary font-bold">{isAdmin ? '∞' : `${tokens}/10`}</span>
            </span>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Powered by Gemini 2.5 Flash
          </p>
        </div>
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
              <p>{t.auth.waitForReset}</p>
              <div className="bg-accent/10 rounded-lg p-4 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">{t.auth.resetsIn}:</p>
                <div className="text-2xl font-bold text-primary font-mono">
                  {String(countdown.hours).padStart(2, '0')}:
                  {String(countdown.minutes).padStart(2, '0')}:
                  {String(countdown.seconds).padStart(2, '0')}
                </div>
              </div>
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
