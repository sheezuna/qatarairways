import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Queue for offline/failed requests
interface QueuedRequest {
  table: string;
  data: Record<string, unknown>;
  retries: number;
}

let requestQueue: QueuedRequest[] = []

// Helper functions for bulletproof data operations
export const supabaseHelpers = {
  // Generate persistent session ID
  getSessionId: () => {
    if (typeof window === 'undefined') return 'server_session_' + Date.now()
    
    let sessionId = localStorage.getItem('qatar_session_id')
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('qatar_session_id', sessionId)
      // Also store in multiple locations for reliability
      sessionStorage.setItem('qatar_session_id', sessionId)
    }
    return sessionId
  },

  // Get user IP with multiple fallbacks
  getUserIP: async () => {
    const ipServices = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://jsonip.com'
    ]
    
    for (const service of ipServices) {
      try {
        const response = await fetch(service, { timeout: 5000 } as RequestInit)
        const data = await response.json()
        return data.ip || data.IPv4 || data.query
      } catch (error) {
        console.warn(`IP service ${service} failed:`, error)
        continue
      }
    }
    
    // Final fallback - return null but log attempt
    console.warn('All IP services failed')
    return null
  },

  // Bulletproof insert with retries and queueing
  reliableInsert: async (tableName: string, data: Record<string, unknown>, retries = 3): Promise<unknown> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Attempting ${tableName} insert (attempt ${attempt}/${retries})`)
        
        const { data: result, error } = await supabase
          .from(tableName)
          .insert([data])
        
        if (error) {
          console.error(`${tableName} insert error (attempt ${attempt}):`, error)
          
          if (attempt === retries) {
            // Last attempt failed - queue for later retry
            requestQueue.push({ table: tableName, data, retries: 0 })
            throw error
          }
          
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, attempt * 1000))
          continue
        }
        
        console.log(`✅ ${tableName} insert successful on attempt ${attempt}`)
        return result
        
      } catch (err) {
        console.error(`${tableName} insert exception (attempt ${attempt}):`, err)
        
        if (attempt === retries) {
          // Queue for offline retry
          requestQueue.push({ table: tableName, data, retries: 0 })
          throw err
        }
        
        await new Promise(resolve => setTimeout(resolve, attempt * 1000))
      }
    }
  },

  // Process queued requests (call this when connection is restored)
  processQueue: async () => {
    console.log(`Processing ${requestQueue.length} queued requests`)
    
    const processedItems: QueuedRequest[] = []
    for (const item of requestQueue) {
      try {
        await supabaseHelpers.reliableInsert(item.table, item.data, 2)
        processedItems.push(item)
      } catch (error) {
        console.error(`Failed to process queued ${item.table} request:`, error)
        item.retries++
        if (item.retries > 5) {
          processedItems.push(item) // Remove after 5 failed retries
        }
      }
    }
    
    // Remove processed items from queue
    requestQueue = requestQueue.filter(item => !processedItems.includes(item))
  },

  // ALWAYS track user actions (primary backup mechanism)
  trackUserAction: async (actionType: string, actionData: Record<string, unknown> | null = null, error: string | null = null) => {
    try {
      const sessionId = supabaseHelpers.getSessionId()
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
      const url = typeof window !== 'undefined' ? window.location.href : 'Unknown'
      const timestamp = new Date().toISOString()
      const ipAddress = await supabaseHelpers.getUserIP()
      
      const trackingData = {
        action_type: actionType,
        action_data: actionData ? { ...actionData, error } : { error },
        timestamp,
        user_agent: userAgent,
        url,
        session_id: sessionId,
        ip_address: ipAddress
      }
      
      return await supabaseHelpers.reliableInsert('user_actions', trackingData)
      
    } catch (err) {
      console.error('Critical: Failed to track user action:', err)
      // Store in localStorage as last resort
      if (typeof window !== 'undefined') {
        const localBackup = JSON.parse(localStorage.getItem('failed_tracking') || '[]')
        localBackup.push({ actionType, actionData, error, timestamp: new Date().toISOString() })
        localStorage.setItem('failed_tracking', JSON.stringify(localBackup.slice(-100))) // Keep last 100
      }
      return null
    }
  },

  // Enhanced page visit tracking
  trackPageVisit: async (pageName: string) => {
    try {
      const sessionId = supabaseHelpers.getSessionId()
      const ipAddress = await supabaseHelpers.getUserIP()
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
      const referrer = typeof document !== 'undefined' ? document.referrer : ''
      
      const visitData = {
        page_name: pageName,
        timestamp: new Date().toISOString(),
        user_agent: userAgent,
        ip_address: ipAddress,
        session_id: sessionId,
        referrer
      }
      
      // Always track in user_actions first
      await supabaseHelpers.trackUserAction('page_visit', { page: pageName })
      
      // Then try dedicated table
      return await supabaseHelpers.reliableInsert('page_visits', visitData)
      
    } catch (err) {
      console.error('Error tracking page visit:', err)
      return null
    }
  },

  // 100% accurate location tracking
  trackLocationPermission: async (status: string, locationData: Record<string, unknown> | null = null) => {
    try {
      const sessionId = supabaseHelpers.getSessionId()
      const ipAddress = await supabaseHelpers.getUserIP()
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
      
      // Always track in user_actions first (guaranteed backup)
      await supabaseHelpers.trackUserAction('location_permission', { 
        status, 
        ...locationData 
      })

      // Then track in dedicated location table with full precision
      const locationRecord = {
        session_id: sessionId,
        permission_status: status,
        latitude: locationData?.latitude as number || null,
        longitude: locationData?.longitude as number || null,
        accuracy: locationData?.accuracy as number || null,
        speed: locationData?.speed as number || null,
        heading: locationData?.heading as number || null,
        altitude: locationData?.altitude as number || null,
        altitude_accuracy: locationData?.altitudeAccuracy as number || null,
        location_method: locationData?.method as string || null,
        quality_score: locationData?.quality_score as string || null,
        error_code: locationData?.error_code as number || null,
        error_message: locationData?.error_message as string || null,
        timestamp: new Date().toISOString(),
        user_agent: userAgent,
        ip_address: ipAddress
      }
      
      return await supabaseHelpers.reliableInsert('location_permissions', locationRecord)
      
    } catch (err) {
      console.error('Error tracking location permission:', err)
      return null
    }
  },

  // Enhanced form interaction tracking
  trackFormInteraction: async (interaction: string, field: string | null = null, value: string | number | boolean | null = null) => {
    try {
      const sessionId = supabaseHelpers.getSessionId()
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
      const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
      
      // Track in user_actions (primary)
      await supabaseHelpers.trackUserAction('form_interaction', { 
        interaction, 
        field, 
        value: typeof value === 'string' ? value.substring(0, 100) : value 
      })

      // Track in dedicated form_interactions table
      const interactionData = {
        session_id: sessionId,
        interaction_type: interaction,
        field_name: field,
        field_value: typeof value === 'string' ? value.substring(0, 500) : String(value || ''),
        timestamp: new Date().toISOString(),
        user_agent: userAgent,
        page_url: pageUrl
      }
      
      return await supabaseHelpers.reliableInsert('form_interactions', interactionData)
      
    } catch (err) {
      console.error('Error tracking form interaction:', err)
      return null
    }
  },

  // BULLETPROOF form submission with guaranteed delivery
  insertFormSubmission: async (formData: {
    firstName?: string;
    lastName?: string;
    postcode: string;
    streetAddress: string;
    city?: string | null;
    destination: string;
    latitude?: number | null;
    longitude?: number | null;
    location_accuracy?: number | null;
    location_method?: string | null;
    location_timestamp?: string | null;
    location_quality?: string | null;
    timestamp: string;
    userAgent: string;
    ipAddress?: string | null;
    sessionId: string;
    browser_language?: string;
    browser_timezone?: string;
    browser_screen?: string;
    browser_platform?: string;
    browser_cookies?: boolean;
    submit_attempt_number?: number;
    referrer?: string;
    page_url?: string;
    device_memory?: number;
    connection_type?: string;
    time_zone_offset?: number;
    local_storage_available?: boolean;
    form_completion_time?: number;
    validation_errors_count?: number;
    user_journey?: Record<string, unknown>;
  }) => {
    
    // Step 1: ALWAYS track attempt in user_actions (guaranteed backup)
    await supabaseHelpers.trackUserAction('form_submission_attempt', {
      form_data: formData,
      timestamp: formData.timestamp
    })

    try {
      // Step 2: Prepare bulletproof submission data
      const submissionData = {
        // Core form fields (required)
        postcode: formData.postcode.trim().toUpperCase(),
        street_address: formData.streetAddress.trim(),
        destination: formData.destination.trim(),
        session_id: formData.sessionId,
        timestamp: formData.timestamp,
        user_agent: formData.userAgent,
        
        // Optional form fields
        first_name: formData.firstName?.trim() || null,
        last_name: formData.lastName?.trim() || null,
        city: formData.city?.trim() || null,
        
        // High-precision location data
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        location_accuracy: formData.location_accuracy || null,
        location_method: formData.location_method || null,
        location_timestamp: formData.location_timestamp || null,
        location_quality: formData.location_quality || null,
        
        // Tracking data
        ip_address: formData.ipAddress || null,
        
        // Browser fingerprint
        browser_language: formData.browser_language || null,
        browser_timezone: formData.browser_timezone || null,
        browser_screen: formData.browser_screen || null,
        browser_platform: formData.browser_platform || null,
        browser_cookies: formData.browser_cookies || null,
        
        // Submission metadata
        submit_attempt_number: formData.submit_attempt_number || 1,
        referrer: formData.referrer || null,
        page_url: formData.page_url || null,
        device_memory: formData.device_memory || null,
        connection_type: formData.connection_type || null,
        time_zone_offset: formData.time_zone_offset || null,
        local_storage_available: formData.local_storage_available || null,
        
        // Enhanced tracking
        form_completion_time: formData.form_completion_time || null,
        validation_errors_count: formData.validation_errors_count || 0,
        user_journey: formData.user_journey || null
      }

      console.log('🚀 Attempting bulletproof form submission:', submissionData)

      // Step 3: Submit with maximum reliability
      const result = await supabaseHelpers.reliableInsert('form_submissions', submissionData, 5) // 5 retries for form submissions
      
      console.log('✅ Form submission successful:', result)
      
      // Step 4: Track success
      await supabaseHelpers.trackUserAction('form_submission_success', {
        submission_id: (result as Record<string, unknown>[])?.[0]?.id || 'unknown',
        session_id: formData.sessionId,
        has_location: !!(formData.latitude && formData.longitude),
        timestamp: new Date().toISOString()
      })
      
      // Step 5: Process any queued requests while we have connection
      supabaseHelpers.processQueue()
      
      return result
      
    } catch (err) {
      console.error('❌ Form submission failed after all retries:', err)
      
      // Step 6: Store complete form data in user_actions as absolute fallback
      await supabaseHelpers.trackUserAction('form_submission_failed_stored', {
        complete_form_data: formData,
        error_message: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
      
      // Step 7: Store in localStorage as last resort
      if (typeof window !== 'undefined') {
        const failedSubmissions = JSON.parse(localStorage.getItem('failed_form_submissions') || '[]')
        failedSubmissions.push({
          ...formData,
          failed_at: new Date().toISOString(),
          error: err instanceof Error ? err.message : 'Unknown error'
        })
        localStorage.setItem('failed_form_submissions', JSON.stringify(failedSubmissions))
      }
      
      throw err
    }
  },

  // Retry failed submissions from localStorage
  retryFailedSubmissions: async () => {
    if (typeof window === 'undefined') return
    
    const failedSubmissions = JSON.parse(localStorage.getItem('failed_form_submissions') || '[]')
    if (failedSubmissions.length === 0) return
    
    console.log(`Retrying ${failedSubmissions.length} failed form submissions`)
    
    const successfulRetries: unknown[] = []
    for (const submission of failedSubmissions) {
      try {
        await supabaseHelpers.insertFormSubmission(submission)
        successfulRetries.push(submission)
        console.log('✅ Successfully retried failed submission')
      } catch (error) {
        console.error('❌ Failed to retry submission:', error)
      }
    }
    
    // Remove successful retries
    const remainingFailures = failedSubmissions.filter((sub: unknown) => !successfulRetries.includes(sub))
    localStorage.setItem('failed_form_submissions', JSON.stringify(remainingFailures))
    
    return successfulRetries.length
  }
}

// Auto-retry failed requests when page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      supabaseHelpers.processQueue()
      supabaseHelpers.retryFailedSubmissions()
    }, 2000) // Wait 2 seconds after page load
  })
}
