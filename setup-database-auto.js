const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Hardcoded environment variables
const supabaseUrl = 'https://kevmuziwabpiitfjsqxa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtldm11eml3YWJwaWl0ZmpzcXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODI1NzIsImV4cCI6MjA2NzY1ODU3Mn0.jog56wKSQHalOz9vfNieGFNU1aMbPUQAnDa-R3_ZlJg'

console.log('🚀 Setting up database automatically...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupDatabase() {
  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'supabase-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📄 Reading schema file...')
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.warn(`⚠️  Warning on statement ${i + 1}:`, error.message)
        }
      } catch (err) {
        console.warn(`⚠️  Warning on statement ${i + 1}:`, err.message)
      }
    }
    
    // Test the setup by trying to insert a test record
    console.log('🧪 Testing database setup...')
    
    const { data, error } = await supabase
      .from('user_actions')
      .insert([{
        action_type: 'database_setup_test',
        action_data: { test: true },
        timestamp: new Date().toISOString(),
        user_agent: 'setup-script',
        url: 'setup',
        session_id: 'setup_' + Date.now()
      }])
      .select()
    
    if (error) {
      console.error('❌ Database setup failed:', error)
      return false
    }
    
    console.log('✅ Database setup completed successfully!')
    console.log('✅ Test record inserted:', data)
    
    // Clean up test record
    if (data && data[0]) {
      await supabase
        .from('user_actions')
        .delete()
        .eq('id', data[0].id)
      console.log('🧹 Test record cleaned up')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    return false
  }
}

// Alternative method using direct SQL execution
async function setupDatabaseDirect() {
  console.log('🔄 Trying direct SQL execution method...')
  
  const sqlStatements = [
    `CREATE TABLE IF NOT EXISTS user_actions (
      id BIGSERIAL PRIMARY KEY,
      action_type VARCHAR(100) NOT NULL,
      action_data JSONB,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      user_agent TEXT,
      url TEXT,
      session_id VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    
    `CREATE TABLE IF NOT EXISTS form_submissions (
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
    )`,
    
    `CREATE TABLE IF NOT EXISTS location_permissions (
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
    )`,
    
    `CREATE TABLE IF NOT EXISTS page_visits (
      id BIGSERIAL PRIMARY KEY,
      page_name VARCHAR(100) NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      user_agent TEXT,
      ip_address INET,
      session_id VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    
    `CREATE TABLE IF NOT EXISTS form_interactions (
      id BIGSERIAL PRIMARY KEY,
      interaction_type VARCHAR(50) NOT NULL,
      field_name VARCHAR(100),
      field_value TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      user_agent TEXT,
      session_id VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`
  ]
  
  for (let i = 0; i < sqlStatements.length; i++) {
    try {
      console.log(`📝 Creating table ${i + 1}/${sqlStatements.length}...`)
      const { error } = await supabase.rpc('exec_sql', { sql: sqlStatements[i] })
      if (error) {
        console.log(`⚠️  Note: ${error.message}`)
      } else {
        console.log(`✅ Table ${i + 1} created successfully`)
      }
    } catch (err) {
      console.log(`⚠️  Note: ${err.message}`)
    }
  }
  
  // Test the setup
  console.log('🧪 Testing setup...')
  const { data, error } = await supabase
    .from('user_actions')
    .select('count')
    .limit(1)
  
  if (error) {
    console.error('❌ Tables still not accessible:', error.message)
    return false
  }
  
  console.log('✅ Database is ready!')
  return true
}

async function main() {
  console.log('🔗 Connecting to Supabase...')
  console.log('URL:', supabaseUrl)
  
  // Try the direct method first
  const success = await setupDatabaseDirect()
  
  if (success) {
    console.log('\n🎉 Database setup completed!')
    console.log('🚀 Your application is now ready to use!')
  } else {
    console.log('\n❌ Automatic setup failed.')
    console.log('📋 Please run the SQL manually in Supabase dashboard:')
    console.log('1. Go to your Supabase project dashboard')
    console.log('2. Open SQL Editor')
    console.log('3. Copy and paste the SQL from supabase-schema.sql')
    console.log('4. Click RUN')
  }
}

main()