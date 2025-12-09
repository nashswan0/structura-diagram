import { supabase } from "@/integrations/supabase/client";

export const generateMermaidDiagram = async (prompt: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-diagram', {
      body: { prompt }
    });

    if (error) {
      console.error('❌ Supabase function error:', error);
      
      // Handle concurrency/rate limit errors (429)
      if (error.message?.includes('rate limit') || 
          error.message?.includes('429') || 
          error.message?.includes('sedang sibuk') ||
          error.message?.includes('High concurrency')) {
        throw new Error('⏳ Layanan sedang sibuk karena banyak pengguna. Silakan tunggu 5-10 detik dan coba lagi.');
      }
      
      if (error.message?.includes('503') || error.message?.includes('overloaded')) {
        throw new Error('Service temporarily overloaded. Please try again in a few seconds.');
      }
      
      if (error.message?.includes('API key') || error.message?.includes('misconfiguration')) {
        throw new Error('Service configuration error. Please contact support.');
      }
      
      if (error.message?.includes('timeout') || error.message?.includes('network')) {
        throw new Error('Network timeout. Please check your connection and try again.');
      }
      
      if (error.message?.includes('MAX_TOKENS') || error.message?.includes('finishReason')) {
        throw new Error('Your prompt is too complex and exceeded the maximum token limit. Please try with a shorter, more specific prompt.');
      }
      
      // Generic Supabase function error
      throw new Error(`Failed to generate diagram: ${error.message || 'Unknown server error'}`);
    }

    // Check if the response contains an error field (from edge function)
    if (data?.error) {
      console.error('Edge function returned error:', data.error);
      throw new Error(data.error);
    }

    if (!data || !data.diagram) {
      throw new Error('No diagram returned from the AI service. Please try again with a different prompt.');
    }

    return data.diagram;
  } catch (error) {
    console.error('🔥 Error in generateMermaidDiagram:', error);
    
    // Re-throw our custom errors as-is
    if (error instanceof Error && (
      error.message.includes('Rate limit') ||
      error.message.includes('overloaded') ||
      error.message.includes('configuration') ||
      error.message.includes('timeout') ||
      error.message.includes('No diagram returned') ||
      error.message.includes('too complex and exceeded')
    )) {
      throw error;
    }
    
    // Handle network/connection errors
    if (error instanceof Error && (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('connection')
    )) {
      throw new Error('Unable to connect to the diagram service. Please check your internet connection and try again.');
    }
    
    // Generic fallback error
    throw new Error('Failed to generate diagram. Please try again with a different prompt.');
  }
};