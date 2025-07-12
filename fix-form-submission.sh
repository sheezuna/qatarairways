#!/bin/bash

echo "🚀 Qatar Airways Database Setup & Repair Script"
echo "==============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local file not found${NC}"
    echo ""
    echo "Please create a .env.local file with your Supabase credentials:"
    echo ""
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key"
    echo ""
    echo -e "${YELLOW}You can find these in your Supabase project dashboard:${NC}"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings > API"
    echo "4. Copy the URL and anon key"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Environment file found${NC}"

# Test database connection
echo ""
echo -e "${BLUE}🔍 Testing database connection...${NC}"
node test-final-database.js

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 SUCCESS! Your form submission should now work.${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Start your development server: npm run dev"
    echo "2. Visit http://localhost:3000"
    echo "3. Test the complete form submission flow"
    echo ""
    echo -e "${BLUE}If you still have issues:${NC}"
    echo "1. Check the browser console for errors"
    echo "2. Check your Supabase dashboard for new data"
    echo "3. Run: node test-final-database.js"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Database connection failed${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting steps:${NC}"
    echo "1. Verify your .env.local file has correct Supabase credentials"
    echo "2. Go to your Supabase dashboard > SQL Editor"
    echo "3. Copy and paste the contents of supabase-schema-final.sql"
    echo "4. Run the SQL script to create/update tables"
    echo "5. Try running this script again"
    echo ""
fi
