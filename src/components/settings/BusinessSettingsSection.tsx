import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Upload, Loader2, X } from 'lucide-react';

interface BusinessSettings {
  id: string;
  name: string;
  logo_url: string | null;
}

export function BusinessSettingsSection() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching business settings:', error);
    } else if (data) {
      setSettings(data);
      setBusinessName(data.name);
    }
    setLoading(false);
  };

  const handleSaveName = async () => {
    if (!businessName.trim()) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('business_settings')
      .update({ name: businessName.trim() })
      .eq('id', settings?.id);

    if (error) {
      toast({
        title: 'Error saving',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Business name updated' });
      fetchSettings();
    }
    setSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Logo must be under 2MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const fileName = `logo-${Date.now()}.${file.name.split('.').pop()}`;
    
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError.message,
        variant: 'destructive',
      });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('business_settings')
      .update({ logo_url: urlData.publicUrl })
      .eq('id', settings?.id);

    if (updateError) {
      toast({
        title: 'Error saving logo',
        description: updateError.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Logo updated' });
      fetchSettings();
    }
    setUploading(false);
  };

  const handleRemoveLogo = async () => {
    if (!settings?.logo_url) return;

    setSaving(true);
    const { error } = await supabase
      .from('business_settings')
      .update({ logo_url: null })
      .eq('id', settings?.id);

    if (error) {
      toast({
        title: 'Error removing logo',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Logo removed' });
      fetchSettings();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <section className="bg-card rounded-xl border border-border p-4 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Business Settings
      </h3>
      <p className="text-sm text-muted-foreground">
        Update your business name and logo.
      </p>

      {/* Business Name */}
      <div className="space-y-2">
        <Label htmlFor="business-name">Business Name</Label>
        <div className="flex gap-2">
          <Input
            id="business-name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Enter business name"
            className="flex-1"
          />
          <Button 
            onClick={handleSaveName} 
            disabled={saving || !businessName.trim() || businessName === settings?.name}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </div>

      {/* Logo Upload */}
      <div className="space-y-2">
        <Label>Business Logo</Label>
        <div className="flex items-center gap-4">
          {settings?.logo_url ? (
            <div className="relative">
              <img 
                src={settings.logo_url} 
                alt="Business logo" 
                className="h-16 w-16 object-contain rounded-lg border border-border bg-background"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={handleRemoveLogo}
                disabled={saving}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="h-16 w-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {uploading ? 'Uploading...' : 'Upload Logo'}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">Max 2MB, PNG or JPG</p>
          </div>
        </div>
      </div>
    </section>
  );
}
