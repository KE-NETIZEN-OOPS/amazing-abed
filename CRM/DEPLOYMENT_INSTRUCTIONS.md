# Threadsense Deployment Instructions

## All Features Implemented ✅

1. **Keywords Management** - Added to account details page
   - View, add, and delete keywords per account
   - Keywords are used to filter scraped content

2. **Scraping Cycle Updated** - Changed from 5min/2min to 30min/5min
   - Scrapes for 30 minutes
   - Takes a 5-minute break
   - Then continues automatically

3. **Smooth Polling** - Feed and Drafts refresh every 5 seconds
   - No glitches or layout shifts
   - Smooth transitions

4. **Progress Bar** - Added to account details
   - Shows scraping activity
   - Displays posts found
   - Shows time remaining (minutes/seconds)
   - Indicates if on break or scraping

5. **Title Changed** - "Amazing Abed" → "Threadsense"
   - Updated in layout and metadata

6. **Live Diagnostics** - Refreshes every 5 seconds
   - Real-time system stats
   - Active scrapes, posts found, drafts generated

7. **Smooth Pages** - Added CSS transitions
   - Smooth color transitions
   - Smooth scrolling
   - No layout shifts

## Deploy to Vercel

### Option 1: Using Vercel CLI

```bash
cd apps/web
npx vercel login
npx vercel --prod
```

### Option 2: Using Vercel Dashboard

1. Go to https://vercel.com
2. Import project from GitHub: `KE-NETIZEN-OOPS/amazing-abed`
3. Set root directory to: `apps/web`
4. Set build command: `cd ../.. && npm install && cd apps/web && npm run build`
5. Set output directory: `.next`
6. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = Your API URL (e.g., `http://your-api-url:3001`)

### Environment Variables Required

- `NEXT_PUBLIC_API_URL` - Your backend API URL

## Repository

https://github.com/KE-NETIZEN-OOPS/amazing-abed

## Changes Made

- Added keywords API endpoints
- Updated scraping service (30min/5min cycle)
- Created account details page with keywords and progress bar
- Updated feed and drafts polling (5 seconds)
- Changed title to Threadsense
- Made diagnostics live
- Added smooth CSS transitions
