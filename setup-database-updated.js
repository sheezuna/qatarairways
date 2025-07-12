const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Setting up Qatar Airways Database with Updated Schema...');
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Missing required environment variables!');
  console.error('Please create .env.local with:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function dropAllTables() {
  console.log('\n🗑️  Dropping existing tables...');
  
  const tables = ['form_submissions', 'form_interactions', 'location_permissions', 'user_actions', 'page_visits'];
  
  for (const table of tables) {
    try {
      // Drop the table if it exists
      const { error } = await supabase.rpc('sql', {
        query: `DROP TABLE IF EXISTS ${table} CASCADE;`
      });
      
      if (error) {
        console.log(`⚠️  Could not drop ${table} (may not exist): ${error.message}`);
      } else {
        console.log(`✅ Dropped table: ${table}`);
      }
    } catch (e) {
      console.log(`⚠️  Could not drop ${table}: ${e.message}`);
    }
  }
}

async function createTables() {
  console.log('\n📝 Creating tables with updated schema...');
  
  try {
    // Read the updated schema file
    const schema = fs.readFileSync('./supabase-schema-updated.sql', 'utf8');
    
    // Split into individual statements and execute them
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          const { error } = await supabase.rpc('sql', {
            query: statement + ';'
          });
          
          if (error) {
            console.log(`❌ Statement ${i + 1} failed: ${error.message}`);
            console.log(`   Statement: ${statement.substring(0, 100)}...`);
          } else {
            const action = statement.split(' ')[0].toUpperCase();
            if (['CREATE', 'ALTER'].includes(action)) {
              console.log(`✅ Statement ${i + 1}: ${action} executed successfully`);
            }
          }
        } catch (e) {
          console.log(`❌ Statement ${i + 1} exception: ${e.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error reading schema file:', error.message);
    return false;
  }
  
  return true;
}

async function testTables() {
  console.log('\n🧪 Testing table accessibility...');
  
  const tables = ['page_visits', 'user_actions', 'location_permissions', 'form_interactions', 'form_submissions'];
  let allWorking = true;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        allWorking = false;
      } else {
        console.log(`✅ ${table}: accessible`);
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
      allWorking = false;
    }
  }
  
  return allWorking;
}

async function insertTestData() {
  console.log('\n🧪 Inserting test data...');
  
  try {
    // Test form submission with all fields
    const { data, error } = await supabase
      .from('form_submissions')
      .insert([{
        first_name: 'Test',
        last_name: 'User',
        postcode: 'SW1A 1AA',
        street_address: '10 Downing Street',
        city: 'London',
        destination: 'Dubai',
        latitude: 51.5074,
        longitude: -0.1278,
        location_accuracy: 10.5,
        location_method: 'gps_high_accuracy',
        location_timestamp: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        user_agent: 'Test Browser',
        ip_address: '192.168.1.1',
        session_id: 'test_session_' + Date.now(),
        browser_language: 'en-GB',
        browser_timezone: 'Europe/London',
        browser_screen: '1920x1080',
        browser_platform: 'MacIntel',
        browser_cookies: true,
        submit_attempt_number: 1,
        referrer: 'https://test.com',
        page_url: 'http://localhost:3000/success',
        time_zone_offset: 0,
        local_storage_available: true
      }]);
    
    if (error) {
      console.log('❌ Test form submission failed:', error.message);
      return false;
    } else {
      console.log('✅ Test form submission successful');
    }
    
    // Test user action
    const { data: actionData, error: actionError } = await supabase
      .from('user_actions')
      .insert([{
        action_type: 'test_action',
        action_data: { test: true },
        timestamp: new Date().toISOString(),
        user_agent: 'Test Browser',
        url: 'http://localhost:3000',
        session_id: 'test_session_' + Date.now()
      }]);
    
    if (actionError) {
      console.log('❌ Test user action failed:', actionError.message);
      return false;
    } else {
      console.log('✅ Test user action successful');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Test data insertion failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🛠️  QATAR AIRWAYS DATABASE SETUP');
  console.log('='.repeat(60));
  
  // Step 1: Drop existing tables
  await dropAllTables();
  
  // Step 2: Create new tables
  const tablesCreated = await createTables();
  if (!tablesCreated) {
    console.log('\n❌ Database setup failed at table creation step');
    return;
  }
  
  // Step 3: Test table access
  const tablesWorking = await testTables();
  if (!tablesWorking) {
    console.log('\n⚠️  Some tables may not be working correctly');
  }
  
  // Step 4: Insert test data
  const testDataWorking = await insertTestData();
  
  console.log('\n' + '='.repeat(60));
  if (tablesWorking && testDataWorking) {
    console.log('🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!');
    console.log('✅ All tables created and tested');
    console.log('✅ Form submissions working');
    console.log('✅ User tracking working');
    console.log('\n🚀 Your application is now ready to use!');
  } else {
    console.log('⚠️  DATABASE SETUP COMPLETED WITH WARNINGS');
    console.log('Some components may not be working correctly.');
    console.log('Check the logs above for specific issues.');
  }
  console.log('='.repeat(60));
}

main().catch(console.error);
