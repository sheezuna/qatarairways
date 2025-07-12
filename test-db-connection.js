const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('user_actions')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Connection error:', error)
      return false
    }
    
    console.log('✅ Successfully connected to Supabase!')
    console.log('Tables accessible:', 'user_actions')
    return true
  } catch (err) {
    console.error('❌ Connection failed:', err.message)
    return false
  }
}

async function checkTables() {
  console.log('\nChecking required tables...')
  
  const tables = ['user_actions', 'form_submissions', 'location_permissions', 'form_interactions', 'page_visits']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`❌ Table "${table}" does not exist`)
        } else {
          console.log(`⚠️  Table "${table}" error:`, error.message)
        }
      } else {
        console.log(`✅ Table "${table}" exists`)
      }
    } catch (err) {
      console.log(`❌ Table "${table}" error:`, err.message)
    }
  }
}

async function main() {
  const connected = await testConnection()
  if (connected) {
    await checkTables()
  }
}

main()
