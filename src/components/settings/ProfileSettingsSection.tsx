import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Key, Loader2, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

interface ProfileSettingsSectionProps {
  profile: { id: string; name: string } | null;
  email: string | undefined;
  onProfileUpdate: () => void;
}

const nameSchema = z.string().trim().min(2, 'Name must be at least 2 characters').max(100);
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export function ProfileSettingsSection({ profile, email, onProfileUpdate }: ProfileSettingsSectionProps) {
  const { toast } = useToast();
  const [name, setName] = useState(profile?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; password?: string; confirm?: string }>({});

  const handleUpdateName = async () => {
    const result = nameSchema.safeParse(name);
    if (!result.success) {
      setErrors({ name: result.error.errors[0]?.message });
      return;
    }

    setSavingName(true);
    setErrors({});

    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim() })
      .eq('id', profile?.id);

    if (error) {
      toast({
        title: 'Error updating name',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Name updated successfully' });
      onProfileUpdate();
    }
    setSavingName(false);
  };

  const handleChangePassword = async () => {
    const newErrors: typeof errors = {};
    
    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0]?.message;
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirm = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSavingPassword(true);
    setErrors({});

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast({
        title: 'Error changing password',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Password changed successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setSavingPassword(false);
  };

  return (
    <section className="bg-card rounded-xl border border-border p-4 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <User className="h-4 w-4" />
        Profile Settings
      </h3>

      {/* Update Name */}
      <div className="space-y-2">
        <Label htmlFor="profile-name">Display Name</Label>
        <div className="flex gap-2">
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="flex-1"
          />
          <Button 
            onClick={handleUpdateName} 
            disabled={savingName || !name.trim() || name === profile?.name}
          >
            {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={email || ''} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>

      <Separator />

      {/* Change Password */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <Label className="font-medium">Change Password</Label>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPasswords(!showPasswords)}
          >
            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type={showPasswords ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type={showPasswords ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
          {errors.confirm && <p className="text-sm text-destructive">{errors.confirm}</p>}
        </div>

        <Button 
          onClick={handleChangePassword} 
          disabled={savingPassword || !newPassword || !confirmPassword}
          className="w-full"
        >
          {savingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Change Password
        </Button>
      </div>
    </section>
  );
}
