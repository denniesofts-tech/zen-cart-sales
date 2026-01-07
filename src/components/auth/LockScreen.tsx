import { useState, useRef, useEffect } from 'react';
import { useLock } from '@/contexts/LockContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Store, Lock, LogOut, Delete } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LockScreen() {
  const { isLocked, unlock, hasPin } = useLock();
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLocked && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLocked]);

  useEffect(() => {
    if (pin.length === 4) {
      verifyPin();
    }
  }, [pin]);

  const verifyPin = () => {
    if (pin === profile?.pin) {
      setPin('');
      setError(false);
      setAttempts(0);
      unlock();
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
      setPin('');
      
      if (attempts >= 4) {
        toast({
          title: "Too many attempts",
          description: "You have been signed out for security.",
          variant: "destructive",
        });
        signOut();
      } else {
        toast({
          title: "Incorrect PIN",
          description: `${4 - attempts} attempts remaining`,
          variant: "destructive",
        });
      }
    }
  };

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  if (!isLocked || !hasPin) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <Store className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">ZenCart POS</h1>
        <p className="text-muted-foreground mt-1">Locked</p>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 mb-6 px-4 py-2 rounded-lg bg-card border border-border">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{profile?.name}</span>
      </div>

      {/* PIN dots */}
      <div className="flex gap-3 mb-8">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full border-2 transition-all ${
              pin.length > i
                ? error
                  ? 'bg-destructive border-destructive'
                  : 'bg-primary border-primary'
                : 'border-muted-foreground/30'
            } ${error ? 'animate-shake' : ''}`}
          />
        ))}
      </div>

      {/* Hidden input for keyboard support */}
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={pin}
        onChange={e => {
          const val = e.target.value.replace(/\D/g, '');
          setPin(val);
          setError(false);
        }}
        className="sr-only"
        autoComplete="off"
      />

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key, i) => {
          if (key === '') return <div key={i} />;
          if (key === 'del') {
            return (
              <Button
                key={i}
                variant="outline"
                size="lg"
                className="h-16 w-16 text-lg"
                onClick={handleBackspace}
                disabled={pin.length === 0}
              >
                <Delete className="h-5 w-5" />
              </Button>
            );
          }
          return (
            <Button
              key={i}
              variant="outline"
              size="lg"
              className="h-16 w-16 text-xl font-semibold"
              onClick={() => handleNumberPress(key)}
            >
              {key}
            </Button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="ghost" size="sm" onClick={handleClear} disabled={pin.length === 0}>
          Clear
        </Button>
        <Button variant="ghost" size="sm" onClick={signOut} className="text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
