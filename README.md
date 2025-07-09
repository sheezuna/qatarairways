# Qatar Airways Location Tracker - Next.js

A Next.js application that collects user location data and form submissions for Qatar Airways promotional campaigns.

## 🚀 Features

- **3 Simple Pages**: Main consent page, blocked page, and success form page
- **Location Permission Handling** - Requests and manages user location access
- **Responsive Design** - Beautiful, mobile-friendly interface with Tailwind CSS
- **Supabase Integration** - Real-time data collection and storage
- **User Action Tracking** - Comprehensive analytics and user journey tracking
- **TypeScript Support** - Full type safety and better development experience

## 📱 Page Structure

### 1. Main Page (`/`)
- Location consent request
- Qatar Airways branding
- Redirects to `/success` if location granted
- Redirects to `/blocked` if location denied

### 2. Blocked Page (`/blocked`)
- Shown when location permission is denied
- Instructions on how to enable location
- "Try Again" and "Refresh" buttons that redirect back to main page

### 3. Success Page (`/success`)
- Form to collect user details
- Shows location confirmation
- Submits data to Supabase
- Success confirmation after submission

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## 📊 Data Collection

The app collects:
- User form submissions (name, phone, partner details)
- Location coordinates (latitude/longitude)
- User interactions and page visits
- Location permission status
- Session tracking for analytics

## 🗄️ Supabase Database Setup

Create these tables in your Supabase project:

```sql
-- Form submissions table
CREATE TABLE form_submissions (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    partner_name VARCHAR(100),
    phone_number VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(100),
    agree_to_terms BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User actions table
CREATE TABLE user_actions (
    id BIGSERIAL PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    action_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    url TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Location permissions table
CREATE TABLE location_permissions (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100),
    permission_status VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    accuracy DECIMAL(10, 2),
    error_code INTEGER,
    error_message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON form_submissions
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON user_actions
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON location_permissions
    FOR INSERT TO anon WITH CHECK (true);
```

## 🔄 User Flow

1. **User visits main page** → Location permission requested
2. **If location granted** → Redirect to `/success` (form page)
3. **If location denied** → Redirect to `/blocked` (blocked page)
4. **From blocked page** → "Try Again" or "Refresh" → Back to main page
5. **On success page** → Fill form → Submit → Success message

## 🌍 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Netlify
```bash
npm run build
# Deploy out/ folder to Netlify
```

### Environment Variables for Production
Add these to your deployment platform:
```env
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-supabase-anon-key
```

## 🔧 Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Database and real-time data
- **React Hooks** - State management

## 📱 Mobile Responsive

The app is fully responsive and works on:
- iPhone Safari
- Android Chrome
- iPad
- Desktop browsers

## 🔒 Security

- Environment variables for sensitive data
- Supabase Row Level Security enabled
- Client-side form validation
- HTTPS required for location access

## 🚀 Ready to Deploy!

Your Next.js Qatar Airways location tracker is ready for production deployment with:

✅ **3 Clean Pages** - Simple user flow  
✅ **Location Tracking** - GPS coordinates collection  
✅ **Form Submission** - User data collection  
✅ **Supabase Integration** - Real-time database  
✅ **Mobile Responsive** - Works on all devices  
✅ **TypeScript** - Type-safe development
