import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle2, XCircle, Clock, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QRISModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: {
    reference: string;
    merchant_ref: string;
    qr_url: string | null;
    qr_string: string | null;
    checkout_url: string;
    amount: number;
    tokens: number;
    expired_at: number;
    status: string;
  } | null;
  onSuccess?: () => void;
}

export default function QRISModal({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: QRISModalProps) {
  const { language } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(100);

  // Calculate time remaining
  useEffect(() => {
    if (!transaction || !open) return;

    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = transaction.expired_at - now;
      setTimeRemaining(Math.max(0, remaining));

      // Calculate progress (assuming 1 hour = 3600 seconds)
      const totalTime = 3600;
      const progressValue = (remaining / totalTime) * 100;
      setProgress(Math.max(0, Math.min(100, progressValue)));
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [transaction, open]);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: language === 'EN' ? '✅ Copied!' : '✅ Tersalin!',
      description: language === 'EN' ? 'Payment code copied to clipboard' : 'Kode pembayaran tersalin',
      duration: 2000,
    });
  };

  // Handle success
  useEffect(() => {
    if (transaction?.status === 'PAID' && onSuccess) {
      onSuccess();
    }
  }, [transaction?.status, onSuccess]);

  if (!transaction) return null;

  const isPaid = transaction.status === 'PAID';
  const isExpired = transaction.status === 'EXPIRED' || timeRemaining === 0;
  const isFailed = transaction.status === 'FAILED';
  const isPending = transaction.status === 'UNPAID' && !isExpired;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isPaid && (language === 'EN' ? '🎉 Payment Successful!' : '🎉 Pembayaran Berhasil!')}
            {isPending && (language === 'EN' ? '📱 Scan QR Code' : '📱 Scan Kode QR')}
            {isExpired && (language === 'EN' ? '⏰ Payment Expired' : '⏰ Pembayaran Kadaluarsa')}
            {isFailed && (language === 'EN' ? '❌ Payment Failed' : '❌ Pembayaran Gagal')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isPaid && (language === 'EN' 
              ? `${transaction.tokens} tokens have been added to your account!`
              : `${transaction.tokens} token telah ditambahkan ke akun Anda!`)}
            {isPending && (language === 'EN'
              ? 'Scan the QR code below to complete your payment'
              : 'Scan kode QR di bawah untuk menyelesaikan pembayaran')}
            {isExpired && (language === 'EN'
              ? 'This payment link has expired. Please create a new transaction.'
              : 'Link pembayaran ini telah kadaluarsa. Silakan buat transaksi baru.')}
            {isFailed && (language === 'EN'
              ? 'Payment failed. Please try again.'
              : 'Pembayaran gagal. Silakan coba lagi.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            {isPaid && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {language === 'EN' ? 'PAID' : 'LUNAS'}
              </Badge>
            )}
            {isPending && (
              <Badge className="bg-blue-500 text-white">
                <Clock className="w-4 h-4 mr-1" />
                {language === 'EN' ? 'PENDING' : 'MENUNGGU'}
              </Badge>
            )}
            {isExpired && (
              <Badge className="bg-gray-500 text-white">
                <XCircle className="w-4 h-4 mr-1" />
                {language === 'EN' ? 'EXPIRED' : 'KADALUARSA'}
              </Badge>
            )}
            {isFailed && (
              <Badge className="bg-red-500 text-white">
                <XCircle className="w-4 h-4 mr-1" />
                {language === 'EN' ? 'FAILED' : 'GAGAL'}
              </Badge>
            )}
          </div>

          {/* QR Code */}
          {isPending && transaction.qr_url && (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <img
                  src={transaction.qr_url}
                  alt="QRIS Code"
                  className="w-64 h-64 object-contain"
                />
              </div>

              {/* Timer */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    {language === 'EN' ? 'Time Remaining' : 'Waktu Tersisa'}
                  </span>
                  <span className="font-mono font-bold text-violet-600">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Payment Details */}
              <div className="w-full glass-panel p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {language === 'EN' ? 'Amount' : 'Jumlah'}
                  </span>
                  <span className="font-bold">
                    IDR {transaction.amount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {language === 'EN' ? 'Tokens' : 'Token'}
                  </span>
                  <span className="font-bold text-violet-600">
                    {transaction.tokens} 💎
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {language === 'EN' ? 'Reference' : 'Referensi'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.merchant_ref)}
                  >
                    <span className="text-xs font-mono mr-2">
                      {transaction.merchant_ref.substring(0, 12)}...
                    </span>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Open in TriPay */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(transaction.checkout_url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {language === 'EN' ? 'Open in TriPay' : 'Buka di TriPay'}
              </Button>

              {/* Waiting indicator */}
              <div className="flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {language === 'EN' ? 'Waiting for payment...' : 'Menunggu pembayaran...'}
              </div>
            </div>
          )}

          {/* Success Message */}
          {isPaid && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  {language === 'EN' ? 'Payment Received!' : 'Pembayaran Diterima!'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {language === 'EN'
                    ? `${transaction.tokens} tokens have been added to your balance`
                    : `${transaction.tokens} token telah ditambahkan ke saldo Anda`}
                </p>
              </div>
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
              >
                {language === 'EN' ? 'Continue' : 'Lanjutkan'}
              </Button>
            </div>
          )}

          {/* Expired/Failed Message */}
          {(isExpired || isFailed) && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="w-full"
              >
                {language === 'EN' ? 'Close' : 'Tutup'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
