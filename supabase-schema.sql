-- Create the database tables for the Qatar Airways location tracker

-- Table for tracking page visits
CREATE TABLE IF NOT EXISTS page_visits (
    id BIGSERIAL PRIMARY KEY,
    page_name VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for tracking user actions
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

-- Table for tracking location permissions
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

-- Table for tracking form interactions
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

-- Table for storing form submissions
CREATE TABLE IF NOT EXISTS form_submissions (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    partner_name VARCHAR(100),
    phone_number VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(255),
    agree_to_terms BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_visits_timestamp ON page_visits(timestamp);
CREATE INDEX IF NOT EXISTS idx_page_visits_session ON page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_timestamp ON user_actions(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_actions_session ON user_actions(session_id);
CREATE INDEX IF NOT EXISTS idx_location_permissions_timestamp ON location_permissions(timestamp);
CREATE INDEX IF NOT EXISTS idx_location_permissions_session ON location_permissions(session_id);
CREATE INDEX IF NOT EXISTS idx_form_interactions_timestamp ON form_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_form_interactions_session ON form_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_timestamp ON form_submissions(timestamp);
CREATE INDEX IF NOT EXISTS idx_form_submissions_session ON form_submissions(session_id);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anonymous inserts (for public access)
CREATE POLICY "Allow anonymous inserts" ON page_visits
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON user_actions
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON location_permissions
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON form_interactions
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON form_submissions
    FOR INSERT TO anon
    WITH CHECK (true);

-- Create policies to allow authenticated users to read all data
CREATE POLICY "Allow authenticated reads" ON page_visits
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated reads" ON user_actions
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated reads" ON location_permissions
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated reads" ON form_interactions
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated reads" ON form_submissions
    FOR SELECT TO authenticated
    USING (true);