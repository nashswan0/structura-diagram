import { supabase } from "@/integrations/supabase/client";

export const fixMermaidDiagram = async (code: string, error: string): Promise<string> => {
  try {
    const { data, error: functionError } = await supabase.functions.invoke('fix-diagram', {
      body: { code, error }
    });

    if (functionError) {
      console.error('Error fixing diagram:', functionError);
      throw new Error(functionError.message || 'Failed to fix diagram');
    }

    // Check if the response contains an error field (from edge function)
    if (data?.error) {
      console.error('Edge function returned error:', data.error);
      throw new Error(data.error);
    }

    if (!data || !data.diagram) {
      throw new Error('No fixed diagram returned from API');
    }

    return data.diagram;
  } catch (error) {
    console.error('Error in fixMermaidDiagram:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fix diagram. Please try again.');
  }
};
