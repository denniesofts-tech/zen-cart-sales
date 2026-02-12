
-- Add new roles to the enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'cook';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'waiter';

-- Create invites table
CREATE TABLE public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'cashier',
  created_by uuid NOT NULL,
  expires_at timestamp with time zone,
  used_at timestamp with time zone,
  used_by uuid,
  max_uses integer NOT NULL DEFAULT 1,
  use_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Managers and admins can manage invites
CREATE POLICY "Managers can view invites"
ON public.invites FOR SELECT
USING (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can create invites"
ON public.invites FOR INSERT
WITH CHECK (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can update invites"
ON public.invites FOR UPDATE
USING (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can delete invites"
ON public.invites FOR DELETE
USING (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'admin'));

-- Anyone can read an invite by code (for signup validation) - using anon access
CREATE POLICY "Anyone can read invite by code"
ON public.invites FOR SELECT
USING (true);
