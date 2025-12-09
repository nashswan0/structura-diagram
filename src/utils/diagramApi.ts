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
        throw new Error('⏳ Layanan sedang sibuk karena banyak pengguna. Silakan tunggu 10-30 detik dan coba lagi.');
      }
      
      if (error.message?.includes('503') || error.message?.includes('overloaded')) {
        throw new Error('⚠️ Layanan sedang overload. Silakan tunggu beberapa detik dan coba lagi.');
      }
      
      if (error.message?.includes('API key') || error.message?.includes('misconfiguration')) {
        throw new Error('⚙️ Terjadi kesalahan konfigurasi. Silakan hubungi administrator.');
      }
      
      if (error.message?.includes('timeout') || error.message?.includes('network')) {
        throw new Error('🌐 Koneksi timeout. Silakan periksa koneksi internet Anda dan coba lagi.');
      }
      
      if (error.message?.includes('MAX_TOKENS') || error.message?.includes('finishReason')) {
        throw new Error('📝 Prompt terlalu kompleks dan melebihi batas token. Silakan gunakan prompt yang lebih pendek dan spesifik.');
      }
      
      // Generic Supabase function error with actual message
      throw new Error(`❌ Gagal membuat diagram: ${error.message || 'Server error'}`);
    }

    // Check if the response contains an error field (from edge function)
    if (data?.error) {
      console.error('Edge function returned error:', data.error);
      
      // Check for specific error types from edge function
      const errorMsg = data.error.toLowerCase();
      
      if (errorMsg.includes('sedang sibuk') || errorMsg.includes('concurrency') || errorMsg.includes('tunggu')) {
        throw new Error(`⏳ ${data.error}`);
      }
      
      if (errorMsg.includes('quota') || errorMsg.includes('kuota')) {
        throw new Error(`💳 ${data.error}`);
      }
      
      if (errorMsg.includes('invalid') || errorMsg.includes('tidak valid')) {
        throw new Error(`⚠️ ${data.error}`);
      }
      
      // Return error as-is if it already has good formatting
      throw new Error(data.error);
    }

    if (!data || !data.diagram) {
      throw new Error('❌ Tidak ada diagram yang dikembalikan dari layanan AI. Silakan coba lagi dengan prompt yang berbeda.');
    }

    return data.diagram;
  } catch (error) {
    console.error('🔥 Error in generateMermaidDiagram:', error);
    
    // Re-throw our custom errors as-is (these already have good messages with emojis)
    if (error instanceof Error && (
      error.message.includes('⏳') ||  // Concurrency/busy errors
      error.message.includes('⚠️') ||  // Warning errors
      error.message.includes('⚙️') ||  // Configuration errors
      error.message.includes('🌐') ||  // Network errors
      error.message.includes('📝') ||  // Token limit errors
      error.message.includes('💳') ||  // Quota errors
      error.message.includes('❌') ||  // General errors with specific messages
      error.message.includes('Rate limit') ||
      error.message.includes('sedang sibuk') ||
      error.message.includes('overloaded') ||
      error.message.includes('configuration') ||
      error.message.includes('timeout') ||
      error.message.includes('No diagram returned') ||
      error.message.includes('too complex and exceeded') ||
      error.message.includes('API key') ||
      error.message.includes('Service') ||
      error.message.includes('Gagal membuat diagram:') ||
      error.message.includes('Tidak ada diagram')
    )) {
      throw error;
    }
    
    // Handle network/connection errors
    if (error instanceof Error && (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('connection')
    )) {
      throw new Error('🌐 Tidak dapat terhubung ke layanan diagram. Silakan periksa koneksi internet Anda dan coba lagi.');
    }
    
    // If error has a meaningful message, include it
    if (error instanceof Error && error.message && error.message.length > 10) {
      const cleanMessage = error.message
        .replace(/^Error:\s*/i, '')
        .replace(/GLM_CONCURRENCY_ERROR:\s*/i, '')
        .trim();
      
      if (cleanMessage.length < 200) {
        throw new Error(`❌ Gagal membuat diagram: ${cleanMessage}`);
      }
    }
    
    // Generic fallback error - only if we really don't know what happened
    throw new Error('❌ Gagal membuat diagram. Silakan tunggu beberapa saat dan coba lagi.');
  }
};