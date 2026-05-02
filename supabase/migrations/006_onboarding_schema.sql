-- Migration to add onboarding_completado to users

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completado boolean DEFAULT false;
