import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for data operations
export const supabaseHelpers = {
  // Generate session ID
  getSessionId: () => {
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

  // Insert form submission
  insertFormSubmission: async (formData: any) => {
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .insert([{
          first_name: formData.firstName,
          surname: formData.surname,
          partner_name: formData.partnerName || null,
          phone_number: formData.phoneNumber,
          latitude: formData.latitude,
          longitude: formData.longitude,
          timestamp: formData.timestamp,
          user_agent: formData.userAgent,
          ip_address: formData.ipAddress,
          session_id: formData.sessionId,
          agree_to_terms: formData.agreeToTerms
        }])
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST116' || (error.message && error.message.includes('does not exist'))) {
          console.warn(`Database table "form_submissions" does not exist. Please run the database setup.`)
          console.warn('You can find the schema in: supabase-schema.sql')
          throw new Error('Database not properly configured. Please contact support.')
        }
        throw error
      }
      return data
    } catch (err) {
      console.error('Error inserting form submission:', err)
      throw err
    }
  },

  // Track user actions
  trackUserAction: async (actionType: string, actionData: any = null, error: string | null = null) => {
    try {
      const sessionId = supabaseHelpers.getSessionId()
      const { data, error: insertError } = await supabase
        .from('user_actions')
        .insert([{
          action_type: actionType,
          action_data: actionData ? { ...actionData, error } : { error },
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href,
          session_id: sessionId
        }])
      
      if (insertError) {
        // Check if it's a table not found error
        if (insertError.code === 'PGRST116' || (insertError.message && insertError.message.includes('does not exist'))) {
          console.warn(`Database table "user_actions" does not exist. Please run the database setup.`)
          console.warn('You can find the schema in: supabase-schema.sql')
          return null
        }
        throw insertError
      }
      return data
    } catch (err) {
      console.error('Error tracking user action:', err)
      return null
    }
  },

  // Track page visits
  trackPageVisit: async (page: string) => {
    return supabaseHelpers.trackUserAction('page_visit', { page })
  },

  // Track location permission
  trackLocationPermission: async (status: string, locationData: any = null) => {
    const sessionId = supabaseHelpers.getSessionId()
    
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
          user_agent: navigator.userAgent
        }])
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST116' || (error.message && error.message.includes('does not exist'))) {
          console.warn(`Database table "location_permissions" does not exist. Please run the database setup.`)
          return null
        }
        throw error
      }
      return data
    } catch (err) {
      console.error('Error tracking location permission:', err)
      return null
    }
  },

  // Track form interactions
  trackFormInteraction: async (interaction: string, field: string | null = null, value: any = null) => {
    return supabaseHelpers.trackUserAction('form_interaction', { 
      interaction, 
      field, 
      value: typeof value === 'string' ? value.substring(0, 100) : value // Limit value length
    })
  }
}