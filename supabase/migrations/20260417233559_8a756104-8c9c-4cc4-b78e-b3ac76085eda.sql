-- Status enum
CREATE TYPE public.application_status AS ENUM ('new', 'reviewed', 'archived');

-- Table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_slug TEXT NOT NULL,
  role_title TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  github_url TEXT,
  resume_url TEXT,
  note TEXT,
  source TEXT,
  status public.application_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_job_applications_created_at ON public.job_applications (created_at DESC);
CREATE INDEX idx_job_applications_role_slug ON public.job_applications (role_slug);

-- RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can submit
CREATE POLICY "Anyone can submit a job application"
ON public.job_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- No SELECT/UPDATE/DELETE policies — only service role (backend) can read/manage

-- updated_at trigger
CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();