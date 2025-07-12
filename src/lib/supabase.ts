import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for data operations
export const supabaseHelpers = {
  // Generate session ID
  getSessionId: () => {
    if (typeof window === 'undefined') return 'server_session_' + Date.now()
    
    let sessionId = localStorage.getItem('qatar_session_id')
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('qatar_session_id', sessionId)
    }
    return sessionId
  },

  // Get user IP address
  getUserIP: async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.error('Error getting IP:', error)
      return null
    }
  },

  // Track user actions (PRIMARY backup method - always works)
  trackUserAction: async (actionType: string, actionData: Record<string, unknown> | null = null, error: string | null = null) => {
    try {
      const sessionId = supabaseHelpers.getSessionId()
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
      const url = typeof window !== 'undefined' ? window.location.href : 'Unknown'
      
      const { data, error: insertError } = await supabase
        .from('user_actions')
        .insert([{
          action_type: actionType,
          action_data: actionData ? { ...actionData, error } : { error },
          timestamp: new Date().toISOString(),
          user_agent: userAgent,
          url: url,
          session_id: sessionId
        }])
      
      if (insertError) {
        console.error('Error tracking user action:', insertError)
        return null
      }
      return data
    } catch (err) {
      console.error('Error tracking user action:', err)
      return null
    }
  },

  // Track page visits
  trackPageVisit: async (pageName: string) => {
    try {
      const sessionId = supabaseHelpers.getSessionId()
      const ipAddress = await supabaseHelpers.getUserIP()
      
      const { data, error } = await supabase
        .from('page_visits')
        .insert([{
          page_name: pageName,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ip_address: ipAddress,
          session_id: sessionId
        }])
      
      if (error) {
        console.error('Error tracking page visit:', error)
        // Fallback to user_actions table
        return supabaseHelpers.trackUserAction('page_visit', { page: pageName })
      }
      return data
    } catch (err) {
      console.error('Error tracking page visit:', err)
      // Fallback to user_actions table
      return supabaseHelpers.trackUserAction('page_visit', { page: pageName })
    }
  },

  // Track location permission
  trackLocationPermission: async (status: string, locationData: Record<string, unknown> | null = null) => {
    const sessionId = supabaseHelpers.getSessionId()
    const ipAddress = await supabaseHelpers.getUserIP()
    
    // Track in user_actions table
    await supabaseHelpers.trackUserAction('location_permission', { 
      status, 
      ...locationData 
    })

    // Also track in location_permissions table if it exists
    try {
      const { data, error } = await supabase
        .from('location_permissions')
        .insert([{
          session_id: sessionId,
          permission_status: status,
          latitude: locationData?.latitude || null,
          longitude: locationData?.longitude || null,
          accuracy: locationData?.accuracy || null,
          error_code: locationData?.error_code || null,
          error_message: locationData?.error_message || null,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ip_address: ipAddress
        }])
      
      if (error) {
        console.error('Error tracking location permission:', error)
        return null
      }
      return data
    } catch (err) {
      console.error('Error tracking location permission:', err)
      return null
    }
  },

  // Track form interactions
  trackFormInteraction: async (interaction: string, field: string | null = null, value: string | number | boolean | null = null) => {
    return supabaseHelpers.trackUserAction('form_interaction', { 
      interaction, 
      field, 
      value: typeof value === 'string' ? value.substring(0, 100) : value // Limit value length
    })
  },

  // Insert form submission with fallback handling
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
    timestamp: string;
    userAgent: string;
    ipAddress?: string | null;
    sessionId: string;
  }) => {
    try {
      // Try with basic fields first that should exist in any form_submissions table
      const basicFormData = {
        first_name: formData.firstName || '',
        last_name: formData.lastName || '',
        postcode: formData.postcode,
        street_address: formData.streetAddress,
        destination: formData.destination,
        timestamp: formData.timestamp,
        session_id: formData.sessionId,
        user_agent: formData.userAgent
      }

      const { data, error } = await supabase
        .from('form_submissions')
        .insert([basicFormData])
      
      if (error) {
        console.error('Form submission error:', error)
        
        // Fallback: store all data in user_actions table
        return supabaseHelpers.trackUserAction('form_submission_fallback', {
          form_data: formData,
          fallback_reason: 'form_submissions_table_error',
          error_message: error.message
        })
      }
      
      // If successful, also track in user_actions for redundancy
      await supabaseHelpers.trackUserAction('form_submission_success', {
        basic_fields_stored: true,
        session_id: formData.sessionId
      })
      
      return data
    } catch (err) {
      console.error('Error inserting form submission:', err)
      
      // Fallback: store all data in user_actions table
      return supabaseHelpers.trackUserAction('form_submission_fallback', {
        form_data: formData,
        fallback_reason: 'form_submissions_table_exception',
        error_message: err instanceof Error ? err.message : 'Unknown error'
      })
    }
  }
}
