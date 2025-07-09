'use client'

import { useState } from 'react'
import { supabaseHelpers } from '@/lib/supabase'

export default function TestDatabase() {
  const [results, setResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testDatabase = async () => {
    setIsLoading(true)
    setResults([])
    
    addResult('Starting database tests...')

    // Test 1: Track page visit
    try {
      await supabaseHelpers.trackPageVisit('test_page')
      addResult('✅ Page visit tracking - SUCCESS')
    } catch (error) {
      addResult(`❌ Page visit tracking - FAILED: ${error}`)
    }

    // Test 2: Track user action
    try {
      await supabaseHelpers.trackUserAction('test_action', { test: true })
      addResult('✅ User action tracking - SUCCESS')
    } catch (error) {
      addResult(`❌ User action tracking - FAILED: ${error}`)
    }

    // Test 3: Track location permission
    try {
      await supabaseHelpers.trackLocationPermission('test', { latitude: 51.5074, longitude: -0.1278 })
      addResult('✅ Location permission tracking - SUCCESS')
    } catch (error) {
      addResult(`❌ Location permission tracking - FAILED: ${error}`)
    }

    // Test 4: Track form interaction
    try {
      await supabaseHelpers.trackFormInteraction('test_interaction', 'test_field', 'test_value')
      addResult('✅ Form interaction tracking - SUCCESS')
    } catch (error) {
      addResult(`❌ Form interaction tracking - FAILED: ${error}`)
    }

    // Test 5: Test form submission (this should fail if tables don't exist)
    try {
      await supabaseHelpers.insertFormSubmission({
        firstName: 'Test',
        surname: 'User',
        partnerName: null,
        phoneNumber: '+44123456789',
        latitude: 51.5074,
        longitude: -0.1278,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ipAddress: '127.0.0.1',
        sessionId: 'test_session',
        agreeToTerms: true
      })
      addResult('✅ Form submission - SUCCESS')
    } catch (error) {
      addResult(`❌ Form submission - FAILED: ${error}`)
    }

    addResult('Database tests completed!')
    setIsLoading(false)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Database Connection Test</h1>
      <p>This page tests the database connection and table setup.</p>
      
      <button 
        onClick={testDatabase}
        disabled={isLoading}
        style={{
          padding: '1rem 2rem',
          backgroundColor: isLoading ? '#ccc' : '#5c0f3c',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          marginBottom: '2rem'
        }}
      >
        {isLoading ? 'Testing...' : 'Run Database Tests'}
      </button>

      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '1rem',
        borderRadius: '8px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <h3>Test Results:</h3>
        {results.length === 0 ? (
          <p>Click "Run Database Tests" to start testing...</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {results.map((result, index) => (
              <li key={index} style={{ 
                marginBottom: '0.5rem',
                color: result.includes('❌') ? 'red' : result.includes('✅') ? 'green' : 'black'
              }}>
                {result}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h3>Setup Instructions:</h3>
        <p>If you see failures above, you need to set up the database tables:</p>
        <ol>
          <li>Go to your Supabase project dashboard</li>
          <li>Navigate to the SQL Editor</li>
          <li>Copy the contents of <code>supabase-schema.sql</code> and paste it</li>
          <li>Click "Run" to execute the schema</li>
          <li>Come back and run the tests again</li>
        </ol>
        <p>For detailed instructions, see <code>DATABASE_SETUP.md</code></p>
      </div>
    </div>
  )
}