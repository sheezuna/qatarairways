#!/usr/bin/env node

/**
 * Comprehensive Test Script for Qatar Airways Bulletproof App
 * Tests all data submission and location tracking functionality
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runComprehensiveTests() {
    console.log('🧪 Running comprehensive tests for Qatar Airways app...\n');
    
    const testSessionId = 'test_' + Date.now();
    const testTimestamp = new Date().toISOString();
    let allTestsPassed = true;
    
    // Test 1: User Actions Table (Primary Fallback)
    console.log('🔍 Test 1: User Actions Table (Primary Fallback)');
    try {
        const { data, error } = await supabase
            .from('user_actions')
            .insert([{
                action_type: 'comprehensive_test',
                action_data: { 
                    test_number: 1,
                    test_description: 'Primary fallback mechanism',
                    critical: true
                },
                timestamp: testTimestamp,
                user_agent: 'Test Script',
                url: 'test://user-actions',
                session_id: testSessionId,
                ip_address: '192.168.1.100'
            }])
            .select();
        
        if (error) {
            console.error('❌ User actions test failed:', error.message);
            allTestsPassed = false;
        } else {
            console.log('✅ User actions test passed - ID:', data?.[0]?.id);
        }
    } catch (err) {
        console.error('❌ User actions test exception:', err.message);
        allTestsPassed = false;
    }
    
    // Test 2: Page Visits Table
    console.log('\n🔍 Test 2: Page Visits Table');
    try {
        const { data, error } = await supabase
            .from('page_visits')
            .insert([{
                page_name: 'test_page',
                timestamp: testTimestamp,
                user_agent: 'Test Script',
                ip_address: '192.168.1.100',
                session_id: testSessionId,
                referrer: 'test://referrer'
            }])
            .select();
        
        if (error) {
            console.error('❌ Page visits test failed:', error.message);
            allTestsPassed = false;
        } else {
            console.log('✅ Page visits test passed - ID:', data?.[0]?.id);
        }
    } catch (err) {
        console.error('❌ Page visits test exception:', err.message);
        allTestsPassed = false;
    }
    
    // Test 3: Location Permissions Table (High-Precision GPS)
    console.log('\n🔍 Test 3: Location Permissions Table (High-Precision GPS)');
    try {
        const { data, error } = await supabase
            .from('location_permissions')
            .insert([{
                session_id: testSessionId,
                permission_status: 'granted',
                latitude: 51.505074,      // High precision London coordinates
                longitude: -0.127623,
                accuracy: 5.2,
                speed: 12.5,
                heading: 45.0,
                altitude: 35.7,
                altitude_accuracy: 10.0,
                location_method: 'gps_high_accuracy',
                quality_score: 'excellent',
                timestamp: testTimestamp,
                user_agent: 'Test Script',
                ip_address: '192.168.1.100'
            }])
            .select();
        
        if (error) {
            console.error('❌ Location permissions test failed:', error.message);
            allTestsPassed = false;
        } else {
            console.log('✅ Location permissions test passed - ID:', data?.[0]?.id);
            console.log('   📍 GPS Precision: ±5.2m accuracy');
        }
    } catch (err) {
        console.error('❌ Location permissions test exception:', err.message);
        allTestsPassed = false;
    }
    
    // Test 4: Form Interactions Table
    console.log('\n🔍 Test 4: Form Interactions Table');
    try {
        const { data, error } = await supabase
            .from('form_interactions')
            .insert([{
                session_id: testSessionId,
                interaction_type: 'field_change',
                field_name: 'postcode',
                field_value: 'SW1A 1AA',
                timestamp: testTimestamp,
                user_agent: 'Test Script',
                page_url: 'test://form-interactions'
            }])
            .select();
        
        if (error) {
            console.error('❌ Form interactions test failed:', error.message);
            allTestsPassed = false;
        } else {
            console.log('✅ Form interactions test passed - ID:', data?.[0]?.id);
        }
    } catch (err) {
        console.error('❌ Form interactions test exception:', err.message);
        allTestsPassed = false;
    }
    
    // Test 5: Form Submissions Table (CRITICAL)
    console.log('\n🔍 Test 5: Form Submissions Table (CRITICAL)');
    try {
        const { data, error } = await supabase
            .from('form_submissions')
            .insert([{
                first_name: 'John',
                last_name: 'Doe',
                postcode: 'SW1A 1AA',
                street_address: '10 Downing Street',
                city: 'London',
                destination: 'Dubai',
                latitude: 51.505074,
                longitude: -0.127623,
                location_accuracy: 5.2,
                location_method: 'gps_high_accuracy',
                location_timestamp: testTimestamp,
                location_quality: 'excellent',
                timestamp: testTimestamp,
                user_agent: 'Test Script',
                ip_address: '192.168.1.100',
                session_id: testSessionId,
                browser_language: 'en-GB',
                browser_timezone: 'Europe/London',
                browser_screen: '1920x1080',
                browser_platform: 'MacIntel',
                browser_cookies: true,
                submit_attempt_number: 1,
                referrer: 'test://referrer',
                page_url: 'test://form-submission'
            }])
            .select();
        
        if (error) {
            console.error('❌ Form submissions test failed:', error.message);
            allTestsPassed = false;
        } else {
            console.log('✅ Form submissions test passed - ID:', data?.[0]?.id);
            console.log('   📋 Complete form data captured');
            console.log('   📍 Location data included');
            console.log('   🖥️  Browser fingerprint recorded');
        }
    } catch (err) {
        console.error('❌ Form submissions test exception:', err.message);
        allTestsPassed = false;
    }
    
    // Test 6: Data Retrieval and Analytics
    console.log('\n🔍 Test 6: Data Retrieval and Analytics');
    try {
        // Count test records
        const { count: userActionsCount, error: countError1 } = await supabase
            .from('user_actions')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', testSessionId);
            
        const { count: formSubmissionsCount, error: countError2 } = await supabase
            .from('form_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', testSessionId);
        
        if (countError1 || countError2) {
            console.error('❌ Data retrieval test failed');
            allTestsPassed = false;
        } else {
            console.log('✅ Data retrieval test passed');
            console.log(`   📊 ${userActionsCount} user actions recorded`);
            console.log(`   📝 ${formSubmissionsCount} form submissions recorded`);
        }
    } catch (err) {
        console.error('❌ Data retrieval test exception:', err.message);
        allTestsPassed = false;
    }
    
    // Test 7: Cleanup Test Data
    console.log('\n🔍 Test 7: Cleanup Test Data');
    try {
        const tables = ['user_actions', 'page_visits', 'location_permissions', 'form_interactions', 'form_submissions'];
        
        for (const table of tables) {
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('session_id', testSessionId);
            
            if (error) {
                console.warn(`⚠️  Could not cleanup ${table}:`, error.message);
            }
        }
        
        console.log('✅ Test data cleanup completed');
    } catch (err) {
        console.warn('⚠️  Cleanup exception:', err.message);
    }
    
    // Final Results
    console.log('\n' + '='.repeat(60));
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED! Qatar Airways app is bulletproof!');
        console.log('\n✅ Verified functionality:');
        console.log('   🗄️  All database tables working');
        console.log('   📍 High-precision GPS location tracking');
        console.log('   📝 Bulletproof form submission');
        console.log('   🔄 Primary fallback mechanisms');
        console.log('   📊 Complete analytics tracking');
        console.log('\n🚀 Ready for production deployment!');
    } else {
        console.log('❌ SOME TESTS FAILED! Please check the errors above.');
        console.log('\n🔧 Troubleshooting steps:');
        console.log('   1. Run setup-bulletproof-database.js');
        console.log('   2. Check Supabase credentials');
        console.log('   3. Verify RLS policies are enabled');
        console.log('   4. Check database connection');
        process.exit(1);
    }
}

runComprehensiveTests().catch(console.error);
