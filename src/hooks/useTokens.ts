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
      const { data: adminData } = await supabase.rpc('is_admin', {
        _user_id: userId,
      });
      
      setIsAdmin(adminData || false);
      
      // Fetch tokens
      const { data, error } = await supabase
        .from('user_tokens')
        .select('tokens_remaining, last_reset')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setTokens(data.tokens_remaining);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const consumeToken = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('consume_token', {
        user_uuid: user.id,
      });

      if (error) throw error;

      if (data) {
        // Refresh token count
        await fetchTokens(user.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error consuming token:', error);
      return false;
    }
  };

  const getTimeUntilReset = () => {
    const now = new Date();
    const wibOffset = 7 * 60; // WIB is UTC+7
    const nowWIB = new Date(now.getTime() + (wibOffset + now.getTimezoneOffset()) * 60000);
    
    const resetTime = new Date(nowWIB);
    resetTime.setHours(23, 59, 0, 0);
    
    // If we're past 23:59, set reset time to tomorrow
    if (nowWIB.getTime() > resetTime.getTime()) {
      resetTime.setDate(resetTime.getDate() + 1);
    }
    
    const diff = resetTime.getTime() - nowWIB.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
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
    getTimeUntilReset,
    isAdmin,
  };
};
