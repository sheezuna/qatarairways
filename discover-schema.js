const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function discoverColumns() {
  console.log('Discovering actual table structure...');
  
  // Try different minimal field combinations to discover what works
  const testCombinations = [
    { id: 1, data: { name: 'Test' } },
    { id: 2, data: { email: 'test@test.com' } },
    { id: 3, data: { postcode: 'SW1A 1AA' } },
    { id: 4, data: { address: '10 Downing Street' } },
    { id: 5, data: { session: 'test_session' } },
    { id: 6, data: { user_id: 'test_user' } },
    { id: 7, data: { timestamp: new Date().toISOString() } },
    { id: 8, data: { created_at: new Date().toISOString() } }
  ];
  
  for (const test of testCombinations) {
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .insert([test.data]);
      
      if (!error) {
        console.log(`✅ Success with:`, Object.keys(test.data));
        
        // Now try to get all data to see structure
        const { data: allData, error: selectError } = await supabase
          .from('form_submissions')
          .select('*')
          .limit(5);
          
        if (!selectError && allData && allData.length > 0) {
          console.log('✅ Sample data structure:', Object.keys(allData[0]));
        }
        break;
      } else {
        console.log(`❌ Failed with ${Object.keys(test.data)}: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ Error with ${Object.keys(test.data)}: ${err.message}`);
    }
  }
}

discoverColumns();
