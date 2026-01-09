-- SQL Schema for Burmese Beacon Legal Platform
-- This file contains the CREATE TABLE statements for the Supabase database.
-- Note: Run these in Supabase SQL Editor or via migrations.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table: Extends user data from auth.users
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to delete inactive accounts (>1 year since last_login)
CREATE OR REPLACE FUNCTION delete_inactive_profiles()
RETURNS VOID AS $$
BEGIN
    DELETE FROM profiles
    WHERE last_login < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Overview Ads table
CREATE TABLE overview_ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text_number INTEGER NOT NULL,
    ad_text TEXT NOT NULL,
    is_displaying BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Overview Content table
CREATE TABLE overview_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    storage_type TEXT CHECK (storage_type IN ('supabase', 'other', 'telegram')) DEFAULT 'supabase',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Home Ads table
CREATE TABLE home_ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Home Card table
CREATE TABLE home_card (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    pdf_url TEXT NOT NULL,
    storage_type TEXT CHECK (storage_type IN ('supabase', 'other')) DEFAULT 'supabase',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sidebar Contents table
CREATE TABLE sidebar_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT CHECK (category IN ('Videos', 'Musics', 'Others')) NOT NULL,
    sub_category TEXT,
    title TEXT NOT NULL,
    description TEXT,
    content_url TEXT NOT NULL,
    storage_type TEXT CHECK (storage_type IN ('supabase', 'other', 'telegram')) DEFAULT 'supabase',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) for sidebar_contents
ALTER TABLE sidebar_contents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (adjust as needed for your auth setup)
CREATE POLICY "Authenticated users can manage sidebar_contents" ON sidebar_contents
    FOR ALL USING (auth.role() = 'authenticated');

-- Saved Content table
CREATE TABLE saved_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL, -- This can reference various content tables; add FKs as needed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

-- Row Level Security (RLS) for saved_content
ALTER TABLE saved_content ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own saved content
CREATE POLICY "Users can manage their own saved_content" ON saved_content
    FOR ALL USING (auth.uid() = user_id);

-- Admin Settings table
CREATE TABLE admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passcode_hash TEXT NOT NULL
);

-- App Settings table for storing configurable settings like HF token and repo
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) for admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can write (insert, update, delete), users can read
-- Assuming 'admin' role or check via auth.jwt() ->> 'role' == 'admin'
-- Adjust based on your auth setup
CREATE POLICY "Admins can manage admin_settings" ON admin_settings
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can read admin_settings" ON admin_settings
    FOR SELECT USING (true);

-- Optional: Indexes for performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_last_login ON profiles(last_login);
CREATE INDEX idx_overview_ads_is_displaying ON overview_ads(is_displaying);
CREATE INDEX idx_sidebar_contents_category ON sidebar_contents(category);
CREATE INDEX idx_saved_content_user_id ON saved_content(user_id);
