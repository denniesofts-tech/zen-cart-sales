import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BusinessSettings {
  id: string;
  name: string;
  logo_url: string | null;
}

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .maybeSingle();

      if (!error && data) {
        setSettings(data);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  return { settings, loading };
}
