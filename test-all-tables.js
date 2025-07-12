const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWorkingInsert() {
  console.log('Testing working form submission with all required fields...');
  
  try {
    // Based on the schema, let's try with all required fields
    const testData = {
      first_name: 'John',
      last_name: 'Smith', 
      postcode: 'SW1A 1AA',
      street_address: '10 Downing Street',
      destination: 'Dubai',
      session_id: 'test_' + Date.now(),
      user_agent: 'Test Browser',
      timestamp: new Date().toISOString(),
      submit_attempt_number: 1,
      referrer: 'https://test.com',
      page_url: 'http://localhost:3004/success',
      time_zone_offset: 0,
      local_storage_available: true
    };
    
    console.log('Attempting insert with required fields...');
    const { data, error } = await supabase
      .from('form_submissions')
      .insert([testData]);
    
    if (error) {
      console.error('❌ Insert failed:', error);
    } else {
      console.log('✅ Insert successful!');
      
      // Fetch the inserted data to see the structure
      const { data: inserted, error: fetchError } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('session_id', testData.session_id)
        .single();
        
      if (!fetchError && inserted) {
        console.log('\n✅ Inserted data structure:');
        console.log('Available columns:', Object.keys(inserted));
        console.log('Sample data:', inserted);
      }
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

async function testOtherTables() {
  console.log('\n\nTesting other tables...');
  
  // Test page_visits
  try {
    const { data, error } = await supabase
      .from('page_visits')
      .insert([{
        page_name: 'test_page',
        session_id: 'test_session_' + Date.now(),
        user_agent: 'Test Browser'
      }]);
      
    if (error) {
      console.log('❌ page_visits failed:', error.message);
    } else {
      console.log('✅ page_visits working');
    }
  } catch (err) {
    console.log('❌ page_visits error:', err.message);
  }
  
  // Test user_actions
  try {
    const { data, error } = await supabase
      .from('user_actions')
      .insert([{
        action_type: 'test_action',
        session_id: 'test_session_' + Date.now(),
        action_data: { test: true }
      }]);
      
    if (error) {
      console.log('❌ user_actions failed:', error.message);
    } else {
      console.log('✅ user_actions working');
    }
  } catch (err) {
    console.log('❌ user_actions error:', err.message);
  }
  
  // Test location_permissions  
  try {
    const { data, error } = await supabase
      .from('location_permissions')
      .insert([{
        permission_status: 'granted',
        session_id: 'test_session_' + Date.now(),
        latitude: 51.5074,
        longitude: -0.1278
      }]);
      
    if (error) {
      console.log('❌ location_permissions failed:', error.message);
    } else {
      console.log('✅ location_permissions working');
    }
  } catch (err) {
    console.log('❌ location_permissions error:', err.message);
  }
}

async function main() {
  await testWorkingInsert();
  await testOtherTables();
}

main();
