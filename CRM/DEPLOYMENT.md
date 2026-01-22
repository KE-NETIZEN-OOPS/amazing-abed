# Deployment to Vercel

## Step 1: Push to GitHub

If you haven't created a GitHub repository yet:

1. Go to https://github.com/new
2. Create a new repository (e.g., "crm-system")
3. Don't initialize with README, .gitignore, or license
4. Copy the repository URL

Then run these commands:

```bash
git remote add origin https://github.com/YOUR_USERNAME/crm-system.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? (Press Enter for default)
   - Directory? (Press Enter for current directory)
   - Override settings? **No**

5. For production deployment:
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com
2. Sign up/Login with your GitHub account
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Vite settings
6. Click "Deploy"

## Configuration

The project includes `vercel.json` with:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite

Vercel will automatically:
- Install dependencies
- Build the project
- Deploy to a production URL

## Environment Variables

Currently, no environment variables are needed as data is stored in localStorage.

## Post-Deployment

After deployment, you'll get a URL like: `https://your-project.vercel.app`

The app will be live and accessible!
