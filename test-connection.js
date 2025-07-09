const { createClient } = require('@supabase/supabase-js')

// Hardcoded environment variables for testing
const supabaseUrl = 'https://kevmuziwabpiitfjsqxa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtldm11eml3YWJwaWl0ZmpzcXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODI1NzIsImV4cCI6MjA2NzY1ODU3Mn0.jog56wKSQHalOz9vfNieGFNU1aMbPUQAnDa-R3_ZlJg'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.error('\nPlease check your .env.local file')
  process.exit(1)
}

console.log('🔗 Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n📡 Testing basic connection...')
    const { data, error } = await supabase.from('user_actions').select('count').limit(1)
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('⚠️  Tables do not exist yet - this is expected before setup')
        console.log('✅ Connection to Supabase is working!')
        console.log('\n📋 Next steps:')
        console.log('1. Go to your Supabase dashboard')
        console.log('2. Open the SQL Editor')
        console.log('3. Run the SQL from QUICK_SETUP.md')
        console.log('4. Run this test again')
      } else {
        console.error('❌ Connection error:', error)
      }
    } else {
      console.log('✅ Connection successful!')
      console.log('✅ Tables exist and are accessible!')
      console.log('📊 Ready to track data!')
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check your .env.local file')
    console.log('2. Verify your Supabase project is active')
    console.log('3. Check your internet connection')
  }
}

testConnection()