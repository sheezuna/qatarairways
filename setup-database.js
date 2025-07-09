const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('Setting up database schema...')
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'supabase-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    console.log(`Executing ${statements.length} SQL statements...`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`Executing statement ${i + 1}/${statements.length}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error)
        // Continue with other statements
      }
    }
    
    console.log('Database setup completed!')
    
    // Test the tables by inserting a test record
    console.log('Testing database connection...')
    
    const { data, error } = await supabase
      .from('page_visits')
      .insert({
        page_name: 'test',
        session_id: 'setup-test',
        user_agent: 'Setup Script'
      })
      .select()
    
    if (error) {
      console.error('Error testing database:', error)
    } else {
      console.log('Database test successful!')
      
      // Clean up test record
      await supabase
        .from('page_visits')
        .delete()
        .eq('session_id', 'setup-test')
    }
    
  } catch (error) {
    console.error('Setup failed:', error)
    process.exit(1)
  }
}

// Alternative method using direct SQL execution
async function setupDatabaseDirect() {
  try {
    console.log('Setting up database schema using direct SQL execution...')
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'supabase-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute the entire schema at once
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema })
    
    if (error) {
      console.error('Error executing schema:', error)
      
      // Try alternative approach - execute statements one by one
      console.log('Trying alternative approach...')
      await setupDatabase()
    } else {
      console.log('Database setup completed successfully!')
    }
    
  } catch (error) {
    console.error('Setup failed:', error)
    console.log('Please run the SQL schema manually in your Supabase dashboard.')
    console.log('You can find the schema in: supabase-schema.sql')
  }
}

// Run the setup
setupDatabaseDirect()