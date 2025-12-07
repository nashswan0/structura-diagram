import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TransactionData {
  reference: string;
  merchant_ref: string;
  qr_url: string | null;
  qr_string: string | null;
  checkout_url: string;
  amount: number;
  tokens: number;
  expired_at: number;
  status: string;
}

interface CreateTransactionParams {
  packageId: string;
}

export function useTransaction() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create new transaction
  const createTransaction = useCallback(async (params: CreateTransactionParams) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tripay/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: params.packageId,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create transaction');
      }

      if (data.success) {
        setTransaction(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to create transaction');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Poll transaction status
  const pollTransactionStatus = useCallback(async (merchantRef: string) => {
    if (!user) return;

    try {
      const response = await fetch(
        `/api/tripay/transaction-status?merchantRef=${merchantRef}&userId=${user.id}`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setTransaction(prev => ({
          ...prev!,
          status: data.data.status,
          paid_at: data.data.paid_at,
        }));

        // Stop polling if transaction is completed
        if (['PAID', 'EXPIRED', 'FAILED'].includes(data.data.status)) {
          stopPolling();
        }

        return data.data;
      }
    } catch (err) {
      console.error('Error polling transaction status:', err);
    }
  }, [user]);

  // Start polling
  const startPolling = useCallback((merchantRef: string) => {
    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      pollTransactionStatus(merchantRef);
    }, 3000);

    // Initial poll
    pollTransactionStatus(merchantRef);
  }, [pollTransactionStatus]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Cancel transaction
  const cancelTransaction = useCallback(() => {
    stopPolling();
    setTransaction(null);
    setError(null);
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    loading,
    error,
    transaction,
    createTransaction,
    startPolling,
    stopPolling,
    cancelTransaction,
  };
}
