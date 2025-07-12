const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  console.log('🧪 Testing Qatar Airways Database Connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing database connection...');
    const { data, error } = await supabase.from('user_actions').select('count').limit(1);
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      return false;
    }
    console.log('✅ Database connection successful');

    // Test 2: Simple form submission
    console.log('\n2. Testing form submission...');
    const testSubmission = {
      first_name: 'Test',
      last_name: 'User',
      postcode: 'SW1A 1AA',
      street_address: '10 Downing Street',
      city: 'London',
      destination: 'Dubai',
      timestamp: new Date().toISOString(),
      user_agent: 'Test Browser',
      session_id: 'test_session_' + Date.now()
    };

    const { data: formData, error: formError } = await supabase
      .from('form_submissions')
      .insert([testSubmission]);

    if (formError) {
      console.log('❌ Form submission failed:', formError.message);
      console.log('Error details:', formError);
      return false;
    }
    console.log('✅ Form submission successful');

    // Test 3: Check all tables
    console.log('\n3. Testing all tables...');
    const tables = ['page_visits', 'user_actions', 'location_permissions', 'form_interactions', 'form_submissions'];
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.log(`❌ Table "${table}" failed:`, error.message);
      } else {
        console.log(`✅ Table "${table}" working`);
      }
    }

    // Test 4: Show recent submissions
    console.log('\n4. Recent form submissions:');
    const { data: recent, error: recentError } = await supabase
      .from('form_submissions')
      .select('id, first_name, last_name, postcode, destination, timestamp')
      .order('timestamp', { ascending: false })
      .limit(5);

    if (!recentError && recent) {
      if (recent.length === 0) {
        console.log('   No submissions found');
      } else {
        recent.forEach((submission, index) => {
          console.log(`   ${index + 1}. ${submission.first_name || 'N/A'} ${submission.last_name || 'N/A'} - ${submission.destination} (${submission.postcode}) - ${new Date(submission.timestamp).toLocaleString()}`);
        });
      }
    }

    console.log('\n🎉 All tests passed! Database is working correctly.');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testDatabase();
