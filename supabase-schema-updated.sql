-- Updated Qatar Airways Database Schema
-- This schema is designed to work seamlessly with the current application code

-- 1. Table for tracking page visits
CREATE TABLE IF NOT EXISTS page_visits (
    id BIGSERIAL PRIMARY KEY,
    page_name VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table for tracking user actions (PRIMARY tracking table)
CREATE TABLE IF NOT EXISTS user_actions (
    id BIGSERIAL PRIMARY KEY,
    action_type VARCHAR(100) NOT NULL,
    action_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    url TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table for tracking location permissions
CREATE TABLE IF NOT EXISTS location_permissions (
    id BIGSERIAL PRIMARY KEY,
    permission_status VARCHAR(50) NOT NULL, -- 'requested', 'granted', 'denied'
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    accuracy DECIMAL(10, 2),
    error_code INTEGER,
    error_message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table for tracking form interactions
CREATE TABLE IF NOT EXISTS form_interactions (
    id BIGSERIAL PRIMARY KEY,
    interaction_type VARCHAR(50) NOT NULL, -- 'focus', 'blur', 'change', 'submit_attempt', 'submit_success', 'submit_error'
    field_name VARCHAR(100),
    field_value TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Main form submissions table (UPDATED TO MATCH APPLICATION)
CREATE TABLE IF NOT EXISTS form_submissions (
    id BIGSERIAL PRIMARY KEY,
    
    -- Required form fields
    first_name VARCHAR(100),  -- Made optional to handle cases where only last name provided
    last_name VARCHAR(100),   -- Made optional to handle cases where only first name provided
    postcode VARCHAR(20) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100),        -- Optional field
    destination VARCHAR(100) NOT NULL,
    
    -- Location data (when available)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_accuracy DECIMAL(10, 2),
    location_method VARCHAR(50),    -- 'gps_high_accuracy', 'gps_standard', 'denied', etc.
    location_timestamp TIMESTAMPTZ,
    
    -- Core tracking fields
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(255) NOT NULL,
    
    -- Browser fingerprint data (all optional)
    browser_language VARCHAR(20),
    browser_timezone VARCHAR(100),
    browser_screen VARCHAR(30),
    browser_platform VARCHAR(100),
    browser_cookies BOOLEAN,
    
    -- Additional tracking fields (all optional)
    submit_attempt_number INTEGER DEFAULT 1,
    referrer TEXT,
    page_url TEXT,
    device_memory INTEGER,
    connection_type VARCHAR(30),
    time_zone_offset INTEGER,
    local_storage_available BOOLEAN,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_visits_timestamp ON page_visits(timestamp);
CREATE INDEX IF NOT EXISTS idx_page_visits_session ON page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_timestamp ON user_actions(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_actions_session ON user_actions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_action_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_location_permissions_timestamp ON location_permissions(timestamp);
CREATE INDEX IF NOT EXISTS idx_location_permissions_session ON location_permissions(session_id);
CREATE INDEX IF NOT EXISTS idx_form_interactions_timestamp ON form_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_form_interactions_session ON form_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_timestamp ON form_submissions(timestamp);
CREATE INDEX IF NOT EXISTS idx_form_submissions_session ON form_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_postcode ON form_submissions(postcode);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anonymous inserts (for public access)
-- This allows your app to insert data without authentication

CREATE POLICY "Allow anonymous inserts on page_visits" ON page_visits
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on user_actions" ON user_actions
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on location_permissions" ON location_permissions
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on form_interactions" ON form_interactions
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on form_submissions" ON form_submissions
    FOR INSERT TO anon
    WITH CHECK (true);

-- Create policies to allow authenticated users to read all data
-- This allows you to view data in Supabase dashboard

CREATE POLICY "Allow authenticated reads on page_visits" ON page_visits
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated reads on user_actions" ON user_actions
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated reads on location_permissions" ON location_permissions
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated reads on form_interactions" ON form_interactions
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated reads on form_submissions" ON form_submissions
    FOR SELECT TO authenticated
    USING (true);

-- Create policies to allow service role to do anything (for admin operations)
CREATE POLICY "Allow service role all operations on page_visits" ON page_visits
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service role all operations on user_actions" ON user_actions
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service role all operations on location_permissions" ON location_permissions
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service role all operations on form_interactions" ON form_interactions
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service role all operations on form_submissions" ON form_submissions
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
