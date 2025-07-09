# Database Setup Instructions

This application requires a Supabase database with specific tables to track user interactions and form submissions.

## Quick Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase-schema.sql` and paste it into the SQL Editor
4. Click "Run" to execute the schema

### Option 2: Using the Setup Script

1. Make sure you have your environment variables set up in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Run the setup script:
   ```bash
   node setup-database.js
   ```

## Database Schema

The application creates the following tables:

### 1. `page_visits`
Tracks when users visit different pages of the application.

### 2. `user_actions`
Tracks all user interactions (clicks, form interactions, etc.).

### 3. `location_permissions`
Specifically tracks location permission requests and responses.

### 4. `form_interactions`
Tracks detailed form field interactions (focus, blur, changes).

### 5. `form_submissions`
Stores the final form submissions with user details.

## Security

- All tables have Row Level Security (RLS) enabled
- Anonymous users can only INSERT data (for tracking)
- Authenticated users can read all data (for analytics)
- No UPDATE or DELETE permissions for anonymous users

## Troubleshooting

If you see errors like "table does not exist" in the browser console:

1. Check that your Supabase URL and keys are correct in `.env.local`
2. Verify that the database schema has been applied
3. Check the Supabase dashboard for any error messages
4. Ensure your Supabase project is active and not paused

## Environment Variables Required

```bash
# Public variables (safe to expose to client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Private variables (server-side only, needed for setup script)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Testing the Setup

After running the schema, you can test the setup by:

1. Starting the Next.js application: `npm run dev`
2. Opening the browser console
3. Navigating through the application
4. Checking for any database-related errors in the console

If everything is set up correctly, you should see tracking data being inserted into your Supabase tables.