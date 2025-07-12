const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFormSubmission() {
  console.log('Testing simplified form submission...');
  
  try {
    // Test with minimal required fields only
    const { data, error } = await supabase
      .from('form_submissions')
      .insert([{
        first_name: 'Test',
        last_name: 'User', 
        postcode: 'SW1A 1AA',
        street_address: '10 Downing Street',
        destination: 'Dubai',
        timestamp: new Date().toISOString(),
        user_agent: 'Test Browser',
        session_id: 'test_session_' + Date.now()
      }]);
    
    if (error) {
      console.error('❌ Simplified form submission failed:', error);
    } else {
      console.log('✅ Simplified form submission successful');
      
      // Now test with optional fields one by one
      console.log('\n2. Testing with optional fields...');
      
      const { data: data2, error: error2 } = await supabase
        .from('form_submissions')
        .insert([{
          first_name: 'Test2',
          last_name: 'User2', 
          postcode: 'SW1A 1AA',
          street_address: '10 Downing Street',
          city: 'London',
          destination: 'Paris',
          latitude: 51.5074,
          longitude: -0.1278,
          location_accuracy: 100,
          location_method: 'gps_granted',
          location_timestamp: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          user_agent: 'Test Browser',
          ip_address: '192.168.1.1',
          session_id: 'test_session_2_' + Date.now(),
          submit_attempt_number: 1,
          referrer: 'https://test.com',
          page_url: 'http://localhost:3004/success',
          time_zone_offset: 0,
          local_storage_available: true
        }]);
      
      if (error2) {
        console.error('❌ Extended form submission failed:', error2);
      } else {
        console.log('✅ Extended form submission successful');
      }
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testFormSubmission();
