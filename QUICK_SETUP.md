# Quick Database Setup

## Step 1: Go to Supabase Dashboard

1. Open your Supabase project dashboard
2. Go to the **SQL Editor** (in the left sidebar)

## Step 2: Run the Schema

Copy and paste this SQL code into the SQL Editor and click **RUN**:

```sql
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
    permission_status VARCHAR(50) NOT NULL,
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
    interaction_type VARCHAR(50) NOT NULL,
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
```

## Step 3: Verify Setup

1. After running the SQL, check the **Table Editor** in Supabase
2. You should see 5 new tables created
3. Test your app - the 404 errors should be gone!

## Step 4: Test the Application

Visit `/test-db` in your application to run database tests and verify everything is working.

That's it! Your database is now ready. 🎉