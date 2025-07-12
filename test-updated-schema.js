const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please create .env.local with your Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFormSubmission() {
  console.log('🧪 Testing form submission with updated schema...\n');
  
  try {
    // Test 1: Minimal required fields only
    console.log('1. Testing minimal required fields...');
    const minimalData = {
      postcode: 'SW1A 1AA',
      street_address: '10 Downing Street',
      destination: 'Dubai',
      session_id: 'test_minimal_' + Date.now(),
      timestamp: new Date().toISOString(),
      user_agent: 'Test Browser'
    };
    
    const { data: data1, error: error1 } = await supabase
      .from('form_submissions')
      .insert([minimalData]);
    
    if (error1) {
      console.log('❌ Minimal form submission failed:', error1.message);
    } else {
      console.log('✅ Minimal form submission successful');
    }
    
    // Test 2: Complete form with all fields
    console.log('\n2. Testing complete form submission...');
    const completeData = {
      first_name: 'John',
      last_name: 'Smith',
      postcode: 'SW1A 1AA',
      street_address: '10 Downing Street',
      city: 'London',
      destination: 'Paris',
      latitude: 51.5074,
      longitude: -0.1278,
      location_accuracy: 15.0,
      location_method: 'gps_high_accuracy',
      location_timestamp: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      ip_address: '192.168.1.100',
      session_id: 'test_complete_' + Date.now(),
      browser_language: 'en-GB',
      browser_timezone: 'Europe/London',
      browser_screen: '1920x1080',
      browser_platform: 'MacIntel',
      browser_cookies: true,
      submit_attempt_number: 1,
      referrer: 'https://google.com',
      page_url: 'http://localhost:3000/success',
      device_memory: 8,
      connection_type: '4g',
      time_zone_offset: 0,
      local_storage_available: true
    };
    
    const { data: data2, error: error2 } = await supabase
      .from('form_submissions')
      .insert([completeData]);
    
    if (error2) {
      console.log('❌ Complete form submission failed:', error2.message);
    } else {
      console.log('✅ Complete form submission successful');
    }
    
    // Test 3: Test other tables
    console.log('\n3. Testing other tracking tables...');
    
    // Page visit
    const { error: pageError } = await supabase
      .from('page_visits')
      .insert([{
        page_name: 'test_page',
        session_id: 'test_session',
        user_agent: 'Test Browser'
      }]);
    
    if (pageError) {
      console.log('❌ Page visit tracking failed:', pageError.message);
    } else {
      console.log('✅ Page visit tracking working');
    }
    
    // User action
    const { error: actionError } = await supabase
      .from('user_actions')
      .insert([{
        action_type: 'test_action',
        action_data: { test: true },
        session_id: 'test_session',
        user_agent: 'Test Browser',
        url: 'http://localhost:3000'
      }]);
    
    if (actionError) {
      console.log('❌ User action tracking failed:', actionError.message);
    } else {
      console.log('✅ User action tracking working');
    }
    
    // Location permission
    const { error: locationError } = await supabase
      .from('location_permissions')
      .insert([{
        permission_status: 'granted',
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 10.0,
        session_id: 'test_session',
        user_agent: 'Test Browser'
      }]);
    
    if (locationError) {
      console.log('❌ Location permission tracking failed:', locationError.message);
    } else {
      console.log('✅ Location permission tracking working');
    }
    
    console.log('\n🎉 All tests completed!');
    
    // Show recent submissions
    console.log('\n📊 Recent form submissions:');
    const { data: recent, error: recentError } = await supabase
      .from('form_submissions')
      .select('id, first_name, last_name, postcode, destination, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!recentError && recent) {
      recent.forEach((submission, index) => {
        console.log(`${index + 1}. ${submission.first_name || 'N/A'} ${submission.last_name || 'N/A'} - ${submission.destination} (${submission.postcode})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFormSubmission();
