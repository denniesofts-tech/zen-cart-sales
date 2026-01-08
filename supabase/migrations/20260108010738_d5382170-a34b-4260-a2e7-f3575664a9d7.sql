-- Create business_settings table for storing business info
CREATE TABLE public.business_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT 'Café POS',
  logo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Only one row allowed (singleton pattern)
CREATE UNIQUE INDEX business_settings_singleton ON public.business_settings ((true));

-- Staff can view business settings
CREATE POLICY "Staff can view business settings"
ON public.business_settings
FOR SELECT
USING (is_staff(auth.uid()));

-- Only admins can update business settings
CREATE POLICY "Admins can update business settings"
ON public.business_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert business settings
CREATE POLICY "Admins can insert business settings"
ON public.business_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_business_settings_updated_at
BEFORE UPDATE ON public.business_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default row
INSERT INTO public.business_settings (name) VALUES ('Café POS');

-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Storage policies for logo uploads
CREATE POLICY "Anyone can view logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'logos');

CREATE POLICY "Admins can upload logos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'logos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update logos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'logos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete logos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'logos' AND has_role(auth.uid(), 'admin'::app_role));