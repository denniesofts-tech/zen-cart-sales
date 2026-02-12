import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { InstallButton } from '@/components/pwa/InstallButton';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';
import { Store, LogIn, UserPlus, Eye, EyeOff, Ticket } from 'lucide-react';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';

const emailSchema = z.string().trim().email({ message: 'Invalid email address' }).max(255);
const passwordSchema = z.string().min(6, { message: 'Password must be at least 6 characters' });
const nameSchema = z.string().trim().min(2, { message: 'Name must be at least 2 characters' }).max(100);

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(!!searchParams.get('invite'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState(searchParams.get('invite') || '');
  const [inviteRole, setInviteRole] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  // Validate invite code when it changes
  useEffect(() => {
    if (!inviteCode) {
      setInviteRole(null);
      setInviteError(null);
      return;
    }
    const validate = async () => {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('code', inviteCode.toUpperCase())
        .maybeSingle();

      if (error || !data) {
        setInviteRole(null);
        setInviteError('Invalid invite code');
        return;
      }
      if (data.use_count >= data.max_uses) {
        setInviteRole(null);
        setInviteError('This invite has already been used');
        return;
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setInviteRole(null);
        setInviteError('This invite has expired');
        return;
      }
      setInviteRole(data.role);
      setInviteError(null);
    };
    const timer = setTimeout(validate, 500);
    return () => clearTimeout(timer);
  }, [inviteCode]);

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0]?.message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0]?.message;
    }
    
    if (isSignUp) {
      const nameResult = nameSchema.safeParse(name);
      if (!nameResult.success) {
        newErrors.name = nameResult.error.errors[0]?.message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    if (isSignUp) {
      // If invite code provided, validate it
      if (inviteCode && !inviteRole) {
        setIsSubmitting(false);
        return;
      }

      const role = (inviteRole as any) || 'cashier';
      const { error } = await signUp(email, password, name, role);
      if (!error) {
        // Increment invite use_count
        if (inviteCode && inviteRole) {
          await supabase
            .from('invites')
            .update({ use_count: (await supabase.from('invites').select('use_count').eq('code', inviteCode.toUpperCase()).single()).data?.use_count! + 1 })
            .eq('code', inviteCode.toUpperCase());
        }
        setIsSignUp(false);
        setPassword('');
      }
    } else {
      const { error } = await signIn(email, password);
      if (!error) {
        navigate('/');
      }
    }
    
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Café POS</h1>
          <p className="text-muted-foreground">
            {isSignUp ? 'Create your staff account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border border-border">
          {isSignUp && (
            <>
              {/* Invite Code */}
              <div className="space-y-2">
                <Label htmlFor="invite">Invite Code</Label>
                <div className="relative">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invite"
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="Enter invite code (optional)"
                    className="h-12 pl-10 font-mono uppercase"
                    disabled={isSubmitting}
                  />
                </div>
                {inviteError && (
                  <p className="text-sm text-destructive">{inviteError}</p>
                )}
                {inviteRole && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">You'll join as:</span>
                    <Badge variant="outline" className="capitalize">{inviteRole}</Badge>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="h-12"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@cafe.com"
              className="h-12"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 pr-12"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
            {!isSignUp && (
              <div className="text-right">
                <ForgotPasswordDialog />
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="pos-primary"
            className="w-full"
            size="xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="animate-pulse">
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </span>
            ) : (
              <>
                {isSignUp ? <UserPlus className="h-5 w-5 mr-2" /> : <LogIn className="h-5 w-5 mr-2" />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </>
            )}
          </Button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <Button
            variant="link"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrors({});
            }}
            disabled={isSubmitting}
          >
            {isSignUp ? 'Sign in instead' : 'Create an account'}
          </Button>
        </div>

        {/* Install Button */}
        <InstallButton />
      </div>
    </div>
  );
}
