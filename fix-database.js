const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service role key for admin operations  
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

async function addMissingColumns() {
  console.log('Checking and adding missing columns to form_submissions table...');
  
  try {
    // First, let's see what columns exist
    console.log('\n1. Checking existing columns...');
    const { data: existingData, error: selectError } = await supabase
      .from('form_submissions')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('Error checking table:', selectError);
      return;
    }
    
    console.log('✅ Table exists and is accessible');
    
    // Test insert with minimal data to see what's missing
    console.log('\n2. Testing minimal insert...');
    const testData = {
      first_name: 'Test',
      last_name: 'User',
      postcode: 'SW1A 1AA',
      street_address: '10 Downing Street',
      session_id: 'test_' + Date.now()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('form_submissions')
      .insert([testData]);
    
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      
      // Try to extract missing column from error
      const match = insertError.message.match(/Could not find the '([^']+)' column/);
      if (match) {
        const missingColumn = match[1];
        console.log(`Missing column: ${missingColumn}`);
        
        // For now, let's create a simple working version
        console.log('\n3. Creating working test data without missing columns...');
        
        const workingData = {
          first_name: 'Test',
          last_name: 'User', 
          postcode: 'SW1A 1AA',
          street_address: '10 Downing Street',
          session_id: 'working_test_' + Date.now(),
          user_agent: 'Test Browser',
          timestamp: new Date().toISOString()
        };
        
        const { data: workingInsert, error: workingError } = await supabase
          .from('form_submissions')
          .insert([workingData]);
          
        if (workingError) {
          console.log('❌ Working insert failed:', workingError.message);
        } else {
          console.log('✅ Working insert successful!');
          console.log('Available columns seem to be: first_name, last_name, postcode, street_address, session_id, user_agent, timestamp');
        }
      }
    } else {
      console.log('✅ Minimal insert successful');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addMissingColumns();
