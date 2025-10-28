import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { LogOut, Info } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTokens } from '@/hooks/useTokens';

interface AuthButtonProps {
  onLoginClick: () => void;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

const AuthButton: React.FC<AuthButtonProps> = ({ onLoginClick, variant = 'default', size = 'sm' }) => {
  const [user, setUser] = useState<User | null>(null);
  const { t } = useLanguage();
  const { tokens, isAdmin } = useTokens();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    }
  };

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url;
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl} alt={fullName} />
              <AvatarFallback className="bg-gradient-primary text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background">
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Tokens: {isAdmin ? '∞' : `${tokens}/10`}
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                    <Info className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 bg-background">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Token System</h4>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin 
                        ? 'You have unlimited tokens as an admin user.'
                        : 'You have 10 free one-time tokens. Each AI diagram generation uses 1 token.'}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t.navbar.logout}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      onClick={onLoginClick}
      variant={variant}
      size={size}
      className={variant === 'default' ? 'bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg' : 'glass-button'}
    >
      {t.navbar.login}
    </Button>
  );
};

export default AuthButton;
