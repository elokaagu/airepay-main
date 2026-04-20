DROP POLICY IF EXISTS "Anyone can submit a job application" ON public.job_applications;

CREATE POLICY "Anyone can submit a valid job application"
ON public.job_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 1 AND 120
  AND length(email) BETWEEN 3 AND 254
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(role_slug) BETWEEN 1 AND 80
  AND length(role_title) BETWEEN 1 AND 160
  AND (note IS NULL OR length(note) <= 4000)
  AND (location IS NULL OR length(location) <= 120)
  AND (linkedin_url IS NULL OR length(linkedin_url) <= 500)
  AND (portfolio_url IS NULL OR length(portfolio_url) <= 500)
  AND (github_url IS NULL OR length(github_url) <= 500)
  AND (resume_url IS NULL OR length(resume_url) <= 500)
);