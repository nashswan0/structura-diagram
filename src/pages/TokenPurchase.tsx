import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTokens } from '@/hooks/useTokens';
import { useTransaction } from '@/hooks/useTransaction';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Sparkles, Zap, Crown, Rocket, Star } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import QRISModal from '@/components/QRISModal';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface TokenPackage {
    id: string;
    name: string;
    nameId: string;
    tokens: number;
    price: number;
    description: string;
    descriptionId: string;
    icon: React.ReactNode;
    popular?: boolean;
    bestValue?: boolean;
    gradient: string;
}

const TokenPurchase = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { tokens, loading: tokensLoading, refetch: refetchTokens } = useTokens();
    const { language } = useLanguage();
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [qrisModalOpen, setQrisModalOpen] = useState(false);
    
    const {
        loading: transactionLoading,
        error: transactionError,
        transaction,
        createTransaction,
        startPolling,
        cancelTransaction,
    } = useTransaction();

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);
    }, []);

    const packages: TokenPackage[] = [
        {
            id: 'basic',
            name: 'Basic Pack',
            nameId: 'Paket Basic',
            tokens: 5,
            price: 5000,
            description: 'Perfect for light users or students trying Structura AI for the first time.',
            descriptionId: 'Sempurna untuk pengguna ringan atau pelajar yang mencoba Structura AI.',
            icon: <Sparkles className="w-8 h-8" />,
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'standard',
            name: 'Standard Pack',
            nameId: 'Paket Standard',
            tokens: 10,
            price: 10000,
            description: 'Ideal for learners or small projects with balanced value.',
            descriptionId: 'Ideal untuk pembelajar atau proyek kecil dengan nilai seimbang.',
            icon: <Star className="w-8 h-8" />,
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            id: 'pro',
            name: 'Pro Pack',
            nameId: 'Paket Pro',
            tokens: 20,
            price: 20000,
            description: 'Best for developers, students, and creators who need consistent usage.',
            descriptionId: 'Terbaik untuk developer, pelajar, dan kreator yang butuh penggunaan konsisten.',
            icon: <Zap className="w-8 h-8" />,
            popular: true,
            gradient: 'from-violet-500 to-purple-500'
        },
        {
            id: 'premium',
            name: 'Premium Pack',
            nameId: 'Paket Premium',
            tokens: 30,
            price: 25000,
            description: 'Designed for productivity power users and teams.',
            descriptionId: 'Dirancang untuk power user produktivitas dan tim.',
            icon: <Crown className="w-8 h-8" />,
            gradient: 'from-amber-500 to-orange-500'
        },
        {
            id: 'ultra',
            name: 'Ultra Pack',
            nameId: 'Paket Ultra',
            tokens: 50,
            price: 40000,
            description: 'For professionals and educators with heavy workloads.',
            descriptionId: 'Untuk profesional dan pendidik dengan beban kerja berat.',
            icon: <Rocket className="w-8 h-8" />,
            bestValue: true,
            gradient: 'from-pink-500 to-rose-500'
        }
    ];

    const handlePurchase = async (pkg: TokenPackage) => {
        // Check if user is logged in
        if (!user) {
            toast({
                title: language === 'EN' ? '🔒 Login Required' : '🔒 Login Diperlukan',
                description: language === 'EN'
                    ? 'Please login to purchase tokens'
                    : 'Silakan login untuk membeli token',
                variant: 'destructive',
                duration: 3000,
            });
            navigate('/auth');
            return;
        }

        try {
            // Create transaction
            const result = await createTransaction({ packageId: pkg.id });
            
            if (result) {
                // Open QRIS modal
                setQrisModalOpen(true);
                
                // Start polling for status updates
                startPolling(result.merchant_ref);
                
                toast({
                    title: language === 'EN' ? '✅ Transaction Created' : '✅ Transaksi Dibuat',
                    description: language === 'EN'
                        ? 'Please scan the QR code to complete payment'
                        : 'Silakan scan kode QR untuk menyelesaikan pembayaran',
                    duration: 3000,
                });
            }
        } catch (err) {
            toast({
                title: language === 'EN' ? '❌ Error' : '❌ Kesalahan',
                description: transactionError || (language === 'EN' 
                    ? 'Failed to create transaction. Please try again.'
                    : 'Gagal membuat transaksi. Silakan coba lagi.'),
                variant: 'destructive',
                duration: 5000,
            });
        }
    };

    const handlePaymentSuccess = () => {
        // Refetch tokens to update balance
        refetchTokens();
        
        toast({
            title: language === 'EN' ? '🎉 Payment Successful!' : '🎉 Pembayaran Berhasil!',
            description: language === 'EN'
                ? 'Your tokens have been added to your account!'
                : 'Token Anda telah ditambahkan ke akun Anda!',
            duration: 5000,
        });
        
        // Close modal after a delay
        setTimeout(() => {
            setQrisModalOpen(false);
            cancelTransaction();
        }, 2000);
    };

    const handleCloseModal = () => {
        setQrisModalOpen(false);
        cancelTransaction();
    };

    const scrollToPackages = () => {
        document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
    };

    const tokenPercentage = (tokens / 50) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <ParticleBackground />
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-3 md:px-6">
                <div className="mx-auto max-w-[95%] md:max-w-6xl">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/')}
                        className="mb-8 animate-fade-in"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {language === 'EN' ? 'Back to Home' : 'Kembali ke Beranda'}
                    </Button>

                    <div className="text-center space-y-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
                        {/* Floating Token Animation */}
                        <div className="relative inline-block mb-8">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-pulse" />
                            <div className="relative bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white text-6xl md:text-8xl font-bold rounded-3xl p-8 md:p-12 shadow-2xl animate-scale-in">
                                💎
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-display font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {language === 'EN' ? 'Power Up Your Creativity with Tokens ⚡' : 'Tingkatkan Kreativitasmu dengan Token ⚡'}
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                            {language === 'EN'
                                ? 'Get more tokens to generate beautiful, AI-powered diagrams without limits.'
                                : 'Dapatkan lebih banyak token untuk membuat diagram indah dengan AI tanpa batas.'}
                        </p>

                        {/* {!loading && (
                            <div className="inline-block glass-panel p-6 rounded-2xl animate-scale-in" style={{ animationDelay: '200ms' }}>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    {language === 'EN' ? 'Your Current Balance' : 'Saldo Token Anda'}
                                </p>
                                <div className="flex items-center justify-center space-x-3">
                                    <span className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                        {tokens}
                                    </span>
                                    <span className="text-2xl">💎</span>
                                </div>
                                <Progress value={tokenPercentage} className="mt-4 h-2" />
                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                                    {language === 'EN' ? `${tokens} of 50 tokens used` : `${tokens} dari 50 token digunakan`}
                                </p>
                            </div>
                        )} */}

                        <Button
                            size="lg"
                            className="mt-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in"
                            style={{ animationDelay: '300ms' }}
                            onClick={scrollToPackages}
                        >
                            {language === 'EN' ? '🎁 View Token Packages' : '🎁 Lihat Paket Token'}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Token Packages Section */}
            <section id="packages" className="relative py-20 px-3 md:px-6">
                <div className="mx-auto max-w-[95%] md:max-w-7xl">
                    <div className="text-center mb-16 animate-fade-in">
                        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            {language === 'EN' ? 'Choose Your Perfect Package' : 'Pilih Paket yang Sempurna'}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            {language === 'EN'
                                ? 'Select the token package that fits your needs and start creating amazing diagrams'
                                : 'Pilih paket token yang sesuai kebutuhan dan mulai buat diagram menakjubkan'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {packages.map((pkg, index) => (
                            <Card
                                key={pkg.id}
                                className={`relative glass-panel hover:scale-105 transition-all duration-300 overflow-hidden group animate-scale-in ${pkg.popular || pkg.bestValue ? 'ring-2 ring-violet-500 shadow-2xl' : ''
                                    }`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${pkg.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                                {/* Badges */}
                                {pkg.popular && (
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 shadow-lg">
                                            ⭐ {language === 'EN' ? 'Most Popular' : 'Paling Populer'}
                                        </Badge>
                                    </div>
                                )}
                                {pkg.bestValue && (
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-gradient-to-r from-pink-600 to-rose-600 text-white border-0 shadow-lg">
                                            💥 {language === 'EN' ? 'Best Value' : 'Paling Hemat'}
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader className="text-center pt-8">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${pkg.gradient} text-white mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        {pkg.icon}
                                    </div>
                                    <CardTitle className="text-2xl font-display">
                                        {language === 'EN' ? pkg.name : pkg.nameId}
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        {language === 'EN' ? pkg.description : pkg.descriptionId}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="text-center space-y-4">
                                    <div className="space-y-2">
                                        <div className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                            {pkg.tokens}
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            {language === 'EN' ? 'Tokens' : 'Token'}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="text-3xl font-bold text-foreground">
                                            IDR {pkg.price.toLocaleString('id-ID')}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {language === 'EN' ? 'One-time purchase' : 'Pembelian sekali'}
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        className={`w-full bg-gradient-to-r ${pkg.gradient} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105`}
                                        onClick={() => handlePurchase(pkg)}
                                    >
                                        {language === 'EN' ? `Buy ${pkg.name}` : `Beli ${pkg.nameId}`}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Token Usage Info Section */}
            <section className="relative py-20 px-3 md:px-6">
                <div className="mx-auto max-w-[95%] md:max-w-4xl">
                    <div className="glass-panel p-6 md:p-12 rounded-3xl text-center space-y-6 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-white text-4xl mb-4">
                            💡
                        </div>
                        <h3 className="text-2xl md:text-3xl font-display font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            {language === 'EN' ? 'How Tokens Work' : 'Cara Kerja Token'}
                        </h3>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            {language === 'EN'
                                ? 'Each AI-generated diagram consumes 1 token. Tokens never expire, and you can top up anytime. Track your usage easily from your profile dashboard.'
                                : 'Setiap diagram yang dibuat AI menggunakan 1 token. Token tidak pernah kadaluarsa, dan Anda dapat mengisi ulang kapan saja. Lacak penggunaan Anda dengan mudah dari dashboard profil.'}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="space-y-2">
                                <div className="text-4xl">🎨</div>
                                <div className="font-semibold text-foreground">
                                    {language === 'EN' ? 'Create Freely' : 'Buat Bebas'}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {language === 'EN' ? 'Generate unlimited diagrams' : 'Buat diagram tanpa batas'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-4xl">⏰</div>
                                <div className="font-semibold text-foreground">
                                    {language === 'EN' ? 'Never Expires' : 'Tidak Kadaluarsa'}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {language === 'EN' ? 'Use tokens anytime you want' : 'Gunakan token kapan saja'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-4xl">📊</div>
                                <div className="font-semibold text-foreground">
                                    {language === 'EN' ? 'Easy Tracking' : 'Pelacakan Mudah'}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {language === 'EN' ? 'Monitor usage in real-time' : 'Pantau penggunaan real-time'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* QRIS Payment Modal */}
            <QRISModal
                open={qrisModalOpen}
                onOpenChange={handleCloseModal}
                transaction={transaction}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default TokenPurchase;