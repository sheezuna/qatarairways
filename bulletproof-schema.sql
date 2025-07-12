-- BULLETPROOF Qatar Airways Database Schema
-- Designed for 100% reliability with multiple fallback mechanisms

-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS form_submissions CASCADE;
DROP TABLE IF EXISTS form_interactions CASCADE;
DROP TABLE IF EXISTS location_permissions CASCADE;
DROP TABLE IF EXISTS user_actions CASCADE;
DROP TABLE IF EXISTS page_visits CASCADE;

-- 1. Primary tracking table - ALWAYS works (fallback for everything)
CREATE TABLE user_actions (
    id BIGSERIAL PRIMARY KEY,
    action_type VARCHAR(200) NOT NULL,
    action_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    url TEXT,
    session_id VARCHAR(500),
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Page visits tracking
CREATE TABLE page_visits (
    id BIGSERIAL PRIMARY KEY,
    page_name VARCHAR(200) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(500),
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Location permissions and GPS data
CREATE TABLE location_permissions (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(500) NOT NULL,
    permission_status VARCHAR(100) NOT NULL,
    latitude DECIMAL(12, 9),
    longitude DECIMAL(12, 9),
    accuracy DECIMAL(12, 3),
    speed DECIMAL(10, 3),
    heading DECIMAL(8, 3),
    altitude DECIMAL(10, 3),
    altitude_accuracy DECIMAL(10, 3),
    location_method VARCHAR(100),
    quality_score VARCHAR(50),
    error_code INTEGER,
    error_message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Form interactions tracking
CREATE TABLE form_interactions (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(500) NOT NULL,
    interaction_type VARCHAR(100) NOT NULL,
    field_name VARCHAR(200),
    field_value TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    page_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MAIN form submissions table - Designed for maximum compatibility
CREATE TABLE form_submissions (
    id BIGSERIAL PRIMARY KEY,
    
    -- Core form data (flexible constraints)
    first_name VARCHAR(500),
    last_name VARCHAR(500),
    postcode VARCHAR(100) NOT NULL,
    street_address VARCHAR(1000) NOT NULL,
    city VARCHAR(500),
    destination VARCHAR(500) NOT NULL,
    
    -- Location data (high precision)
    latitude DECIMAL(12, 9),
    longitude DECIMAL(12, 9),
    location_accuracy DECIMAL(12, 3),
    location_method VARCHAR(100),
    location_timestamp TIMESTAMPTZ,
    location_quality VARCHAR(50),
    
    -- Core tracking data
    session_id VARCHAR(500) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    
    -- Browser fingerprint data
    browser_language VARCHAR(100),
    browser_timezone VARCHAR(200),
    browser_screen VARCHAR(100),
    browser_platform VARCHAR(200),
    browser_cookies BOOLEAN,
    
    -- Submission metadata
    submit_attempt_number INTEGER DEFAULT 1,
    referrer TEXT,
    page_url TEXT,
    device_memory INTEGER,
    connection_type VARCHAR(100),
    time_zone_offset INTEGER,
    local_storage_available BOOLEAN,
    
    -- Extra tracking fields for analytics
    form_completion_time INTEGER, -- milliseconds to complete form
    validation_errors_count INTEGER DEFAULT 0,
    user_journey JSONB, -- complete user journey data
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comprehensive indexes for performance
CREATE INDEX idx_user_actions_session ON user_actions(session_id);
CREATE INDEX idx_user_actions_type ON user_actions(action_type);
CREATE INDEX idx_user_actions_timestamp ON user_actions(timestamp);

CREATE INDEX idx_page_visits_session ON page_visits(session_id);
CREATE INDEX idx_page_visits_timestamp ON page_visits(timestamp);

CREATE INDEX idx_location_permissions_session ON location_permissions(session_id);
CREATE INDEX idx_location_permissions_status ON location_permissions(permission_status);
CREATE INDEX idx_location_permissions_timestamp ON location_permissions(timestamp);

CREATE INDEX idx_form_interactions_session ON form_interactions(session_id);
CREATE INDEX idx_form_interactions_type ON form_interactions(interaction_type);
CREATE INDEX idx_form_interactions_timestamp ON form_interactions(timestamp);

CREATE INDEX idx_form_submissions_session ON form_submissions(session_id);
CREATE INDEX idx_form_submissions_postcode ON form_submissions(postcode);
CREATE INDEX idx_form_submissions_destination ON form_submissions(destination);
CREATE INDEX idx_form_submissions_timestamp ON form_submissions(timestamp);
CREATE INDEX idx_form_submissions_location ON form_submissions(latitude, longitude);

-- Enable Row Level Security
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for anonymous access (required for public form)
CREATE POLICY "anonymous_insert_user_actions" ON user_actions 
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anonymous_select_user_actions" ON user_actions 
    FOR SELECT TO anon USING (true);

CREATE POLICY "anonymous_insert_page_visits" ON page_visits 
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anonymous_select_page_visits" ON page_visits 
    FOR SELECT TO anon USING (true);

CREATE POLICY "anonymous_insert_location_permissions" ON location_permissions 
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anonymous_select_location_permissions" ON location_permissions 
    FOR SELECT TO anon USING (true);

CREATE POLICY "anonymous_insert_form_interactions" ON form_interactions 
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anonymous_select_form_interactions" ON form_interactions 
    FOR SELECT TO anon USING (true);

CREATE POLICY "anonymous_insert_form_submissions" ON form_submissions 
    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anonymous_select_form_submissions" ON form_submissions 
    FOR SELECT TO anon USING (true);

-- Authenticated user policies (for admin dashboard)
CREATE POLICY "authenticated_all_user_actions" ON user_actions 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all_page_visits" ON page_visits 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all_location_permissions" ON location_permissions 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all_form_interactions" ON form_interactions 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all_form_submissions" ON form_submissions 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Service role policies (for admin operations)
CREATE POLICY "service_role_all_user_actions" ON user_actions 
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_page_visits" ON page_visits 
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_location_permissions" ON location_permissions 
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_form_interactions" ON form_interactions 
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_form_submissions" ON form_submissions 
    FOR ALL TO service_role USING (true) WITH CHECK (true);
