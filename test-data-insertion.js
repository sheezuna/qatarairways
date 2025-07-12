const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDataInsertion() {
  console.log('Testing data insertion...')
  
  try {
    // Test user action tracking
    console.log('\n1. Testing user action tracking...')
    const { data: actionData, error: actionError } = await supabase
      .from('user_actions')
      .insert([{
        action_type: 'test_action',
        action_data: { test: true, timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString(),
        user_agent: 'Test User Agent',
        url: 'http://localhost:3004/test',
        session_id: 'test_session_' + Date.now()
      }])
    
    if (actionError) {
      console.error('❌ User action tracking failed:', actionError)
    } else {
      console.log('✅ User action tracking successful')
    }

    // Test page visit tracking
    console.log('\n2. Testing page visit tracking...')
    const { data: pageData, error: pageError } = await supabase
      .from('page_visits')
      .insert([{
        page_name: 'test_page',
        timestamp: new Date().toISOString(),
        user_agent: 'Test User Agent',
        session_id: 'test_session_' + Date.now()
      }])
    
    if (pageError) {
      console.error('❌ Page visit tracking failed:', pageError)
    } else {
      console.log('✅ Page visit tracking successful')
    }

    // Test location permission tracking
    console.log('\n3. Testing location permission tracking...')
    const { data: locationData, error: locationError } = await supabase
      .from('location_permissions')
      .insert([{
        permission_status: 'granted',
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 10.5,
        timestamp: new Date().toISOString(),
        user_agent: 'Test User Agent',
        session_id: 'test_session_' + Date.now()
      }])
    
    if (locationError) {
      console.error('❌ Location permission tracking failed:', locationError)
    } else {
      console.log('✅ Location permission tracking successful')
    }

    // Test form submission
    console.log('\n4. Testing form submission...')
    const { data: formData, error: formError } = await supabase
      .from('form_submissions')
      .insert([{
        first_name: 'Test',
        last_name: 'User',
        postcode: 'SW1A 1AA',
        street_address: '123 Test Street',
        city: 'London',
        destination: 'Dubai',
        latitude: 51.5074,
        longitude: -0.1278,
        location_accuracy: 10.5,
        location_method: 'gps_granted',
        location_timestamp: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        user_agent: 'Test User Agent',
        session_id: 'test_session_' + Date.now(),
        browser_language: 'en-GB',
        browser_timezone: 'Europe/London',
        browser_screen: '1920x1080',
        browser_platform: 'MacIntel',
        browser_cookies: true,
        submit_attempt_number: 1,
        referrer: 'https://test.com',
        page_url: 'http://localhost:3004/success',
        time_zone_offset: 0,
        local_storage_available: true
      }])
    
    if (formError) {
      console.error('❌ Form submission failed:', formError)
    } else {
      console.log('✅ Form submission successful')
    }

    console.log('\n✅ All tests completed!')
    
  } catch (err) {
    console.error('❌ Test failed:', err.message)
  }
}

async function checkRecentData() {
  console.log('\n📊 Checking recent data in all tables...')
  
  const tables = ['user_actions', 'page_visits', 'location_permissions', 'form_submissions']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)
      
      if (error) {
        console.log(`❌ Error reading ${table}:`, error.message)
      } else {
        console.log(`📋 ${table}: ${data.length} recent records`)
        if (data.length > 0) {
          console.log(`   Latest: ${data[0].created_at || data[0].timestamp}`)
        }
      }
    } catch (err) {
      console.log(`❌ ${table} error:`, err.message)
    }
  }
}

async function main() {
  await testDataInsertion()
  await checkRecentData()
}

main()
