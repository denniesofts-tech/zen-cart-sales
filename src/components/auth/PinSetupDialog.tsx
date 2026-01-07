import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Key, Check, X } from 'lucide-react';
import { z } from 'zod';

const pinSchema = z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits');

export function PinSetupDialog() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const hasExistingPin = !!profile?.pin;

  const handleSave = async () => {
    setError('');

    // Validate PIN format
    const pinResult = pinSchema.safeParse(pin);
    if (!pinResult.success) {
      setError(pinResult.error.errors[0]?.message || 'Invalid PIN');
      return;
    }

    // Check confirmation matches
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ pin })
      .eq('id', profile?.id);

    if (updateError) {
      toast({
        title: 'Error saving PIN',
        description: updateError.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'PIN saved',
        description: 'Your lock screen PIN has been set.',
      });
      setOpen(false);
      setPin('');
      setConfirmPin('');
      // Force a page reload to update the profile
      window.location.reload();
    }

    setSaving(false);
  };

  const handleRemovePin = async () => {
    setSaving(true);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ pin: null })
      .eq('id', profile?.id);

    if (updateError) {
      toast({
        title: 'Error removing PIN',
        description: updateError.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'PIN removed',
        description: 'Lock screen PIN has been disabled.',
      });
      setOpen(false);
      window.location.reload();
    }

    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-3">
          <Key className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1 text-left">
            <div className="font-medium">Lock Screen PIN</div>
            <div className="text-sm text-muted-foreground">
              {hasExistingPin ? 'PIN is set' : 'Not configured'}
            </div>
          </div>
          {hasExistingPin && <Check className="h-4 w-4 text-primary" />}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {hasExistingPin ? 'Update PIN' : 'Set Up PIN'}
          </DialogTitle>
          <DialogDescription>
            Create a 4-digit PIN to quickly unlock the app. The app will lock after inactivity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pin">New PIN</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="text-center text-2xl tracking-[0.5em]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Confirm PIN</Label>
            <Input
              id="confirm-pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="text-center text-2xl tracking-[0.5em]"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <X className="h-4 w-4" />
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            {hasExistingPin && (
              <Button
                variant="outline"
                onClick={handleRemovePin}
                disabled={saving}
                className="flex-1"
              >
                Remove PIN
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving || pin.length !== 4 || confirmPin.length !== 4}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save PIN'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
