-- JanVoice AI - Supabase Database Schema
-- Run this in your Supabase SQL editor

-- Citizens table
CREATE TABLE IF NOT EXISTS citizens (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  citizen_id TEXT NOT NULL,
  citizen_phone TEXT DEFAULT 'Unknown',
  type TEXT NOT NULL CHECK (type IN ('problem', 'suggestion', 'invite', 'help')),
  description TEXT NOT NULL,
  image_url TEXT,
  location TEXT,
  ai_title TEXT,
  ai_category TEXT,
  ai_summary TEXT,
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  ai_sentiment TEXT CHECK (ai_sentiment IN ('positive', 'neutral', 'negative')),
  department TEXT,
  recommended_action TEXT,
  estimated_impact TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'taken_charge', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community cases table
CREATE TABLE IF NOT EXISTS community_cases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  location TEXT,
  report_count INTEGER DEFAULT 1,
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  summary TEXT,
  recommended_action TEXT,
  submission_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_citizen_id ON submissions(citizen_id);
CREATE INDEX IF NOT EXISTS idx_submissions_category ON submissions(ai_category);
CREATE INDEX IF NOT EXISTS idx_submissions_priority ON submissions(priority);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_cases_location ON community_cases(location);

-- Allow anon access for prototype
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_cases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "anon_all_citizens" ON citizens;
DROP POLICY IF EXISTS "anon_all_submissions" ON submissions;
DROP POLICY IF EXISTS "anon_all_community_cases" ON community_cases;

-- Permissive policies for prototype (replace with real auth later)
CREATE POLICY "anon_all_citizens" ON citizens
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "anon_all_submissions" ON submissions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "anon_all_community_cases" ON community_cases
  FOR ALL USING (true) WITH CHECK (true);
