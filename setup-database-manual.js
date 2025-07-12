const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Setting up Supabase database...');

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    // Read the schema file
    const schema = fs.readFileSync('./supabase-schema.sql', 'utf8');
    
    console.log('Executing schema...');
    
    // Execute the SQL schema
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('Schema execution error:', error);
      
      // If RPC doesn't work, try direct SQL execution
      console.log('Trying alternative method...');
      
      // Split the schema into individual statements
      const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        const trimmedStatement = statement.trim();
        if (trimmedStatement) {
          console.log(`Executing: ${trimmedStatement.substring(0, 50)}...`);
          
          try {
            const { error: execError } = await supabase.from('_sql').select('*').limit(1);
            console.log('Note: Using Supabase client - manual SQL execution needed');
            break;
          } catch (e) {
            console.log('Direct SQL execution not available in client mode');
            break;
          }
        }
      }
    } else {
      console.log('✅ Database schema setup completed successfully');
    }
    
    // Test the tables
    console.log('\nTesting table access...');
    
    const tables = ['page_visits', 'user_actions', 'location_permissions', 'form_interactions', 'form_submissions'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: accessible`);
        }
      } catch (e) {
        console.log(`❌ ${table}: ${e.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

setupDatabase();
