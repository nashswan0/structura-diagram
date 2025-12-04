import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface TokenData {
  tokens_remaining: number;
  last_reset: string;
}

export const useTokens = () => {
  const [tokens, setTokens] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const fetchTokens = async (userId: string) => {
    try {
      // Check if user is admin
      // @ts-ignore - Database types are auto-generated
      const { data: adminData } = await supabase.rpc('is_admin', {
        _user_id: userId,
      });
      
      setIsAdmin(adminData || false);
      
      // Fetch tokens
      const result: any = await (supabase as any)
        .from('user_tokens')
        .select('tokens_remaining')
        .eq('user_id', userId)
        .single();
      
      const { data, error } = result;

      if (error) throw error;

      if (data) {
        setTokens((data as any).tokens_remaining);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const consumeToken = async (): Promise<boolean> => {
    if (!user) return false;

    // Store current tokens for potential rollback
    const previousTokens = tokens;

    try {
      // Optimistic update: immediately decrement tokens in UI
      setTokens(prev => Math.max(0, prev - 1));

      // @ts-ignore - Database types are auto-generated
      const { data, error } = await supabase.rpc('consume_token', {
        user_uuid: user.id,
      });

      if (error) {
        // Rollback optimistic update on error
        setTokens(previousTokens);
        throw error;
      }

      if (data) {
        // Refresh token count from server to ensure sync
        await fetchTokens(user.id);
        return true;
      }

      // If data is false (no tokens), rollback optimistic update
      setTokens(previousTokens);
      return false;
    } catch (error) {
      console.error('Error consuming token:', error);
      // Rollback optimistic update on error
      setTokens(previousTokens);
      return false;
    }
  };


  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTokens(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTokens(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Listen for token updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user_tokens_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_tokens',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newData = payload.new as TokenData;
          setTokens(newData.tokens_remaining);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    tokens,
    loading,
    consumeToken,
    refreshTokens: user ? () => fetchTokens(user.id) : () => {},
    isAdmin,
  };
};
