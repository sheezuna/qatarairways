const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test page visit tracking
    console.log('\n1. Testing page visit tracking...');
    const { data: visitData, error: visitError } = await supabase
      .from('page_visits')
      .insert([{
        page_name: 'test_page',
        user_agent: 'test-agent',
        session_id: 'test-session-' + Date.now()
      }]);
    
    if (visitError) {
      console.error('Page visit error:', visitError);
    } else {
      console.log('✅ Page visit tracking working');
    }

    // Test user action tracking
    console.log('\n2. Testing user action tracking...');
    const { data: actionData, error: actionError } = await supabase
      .from('user_actions')
      .insert([{
        action_type: 'test_action',
        action_data: { test: 'data' },
        session_id: 'test-session-' + Date.now()
      }]);
    
    if (actionError) {
      console.error('User action error:', actionError);
    } else {
      console.log('✅ User action tracking working');
    }

    // Test location permission tracking
    console.log('\n3. Testing location permission tracking...');
    const { data: locationData, error: locationError } = await supabase
      .from('location_permissions')
      .insert([{
        permission_status: 'granted',
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 100,
        session_id: 'test-session-' + Date.now()
      }]);
    
    if (locationError) {
      console.error('Location permission error:', locationError);
    } else {
      console.log('✅ Location permission tracking working');
    }

    // Test form interaction tracking
    console.log('\n4. Testing form interaction tracking...');
    const { data: formData, error: formError } = await supabase
      .from('form_interactions')
      .insert([{
        interaction_type: 'test_interaction',
        field_name: 'test_field',
        field_value: 'test_value',
        session_id: 'test-session-' + Date.now()
      }]);
    
    if (formError) {
      console.error('Form interaction error:', formError);
    } else {
      console.log('✅ Form interaction tracking working');
    }

    // Test form submission
    console.log('\n5. Testing form submission...');
    const { data: submissionData, error: submissionError } = await supabase
      .from('form_submissions')
      .insert([{
        first_name: 'Test',
        last_name: 'User',
        postcode: 'SW1A 1AA',
        street_address: '10 Downing Street',
        city: 'London',
        destination: 'Paris',
        latitude: 51.5074,
        longitude: -0.1278,
        location_accuracy: 100,
        location_method: 'gps_granted',
        user_agent: 'test-agent',
        session_id: 'test-session-' + Date.now(),
        browser_language: 'en-GB',
        browser_timezone: 'Europe/London',
        submit_attempt_number: 1,
        referrer: 'https://test.com',
        page_url: 'https://test.com/form',
        time_zone_offset: 0,
        local_storage_available: true
      }]);
    
    if (submissionError) {
      console.error('Form submission error:', submissionError);
    } else {
      console.log('✅ Form submission tracking working');
    }

    console.log('\n🎉 All Supabase tests completed!');

  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection();
