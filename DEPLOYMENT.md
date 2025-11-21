# ShiftSmart Deployment Guide

This guide will help you deploy ShiftSmart to production using Vercel (frontend) and Railway (backend + database).

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Railway account (free tier available)
- Clerk.dev production account

---

## Step 1: Prepare Your Code

### 1.1 Create GitHub Repository

```bash
cd /Users/ryanwidgeon/Desktop/smartshift
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smartshift.git
git push -u origin main
```

### 1.2 Update .gitignore

Ensure these are in `.gitignore`:
```
.env
.env.local
.env.production
node_modules/
.next/
dist/
```

---

## Step 2: Deploy Database to Railway

### 2.1 Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Provision PostgreSQL"
4. Copy the `DATABASE_URL` connection string

### 2.2 Run Migrations

```bash
# Set the production database URL temporarily
export DATABASE_URL="postgresql://user:password@host:port/database"

# Run migrations
npx prisma migrate deploy

# Seed work roles
npx tsx scripts/setup-work-roles.ts
```

---

## Step 3: Deploy Backend to Railway

### 3.1 Create New Railway Service

1. In your Railway project, click "New Service"
2. Select "GitHub Repo"
3. Connect your smartshift repository
4. Railway will auto-detect the Node.js app

### 3.2 Configure Backend Service

1. Go to service Settings
2. Set **Root Directory**: Leave empty (or `.`)
3. Set **Build Command**: `npm run build:backend`
4. Set **Start Command**: `npm run start:backend`

### 3.3 Add Environment Variables

In Railway service settings, add these variables:

```
DATABASE_URL=<from-railway-postgres>
CLERK_SECRET_KEY=<your-clerk-secret>
PORT=4000
NODE_ENV=production
FRONTEND_URL=<will-add-after-vercel-deploy>
```

### 3.4 Get Backend URL

After deployment, Railway will give you a URL like:
`https://smartshift-backend-production.up.railway.app`

Copy this URL for the next step.

---

## Step 4: Configure Clerk for Production

### 4.1 Create Production Instance

1. Go to [clerk.com](https://clerk.com)
2. Create a new application or switch to production
3. Get your production keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 4.2 Configure Allowed Origins

In Clerk Dashboard:
1. Go to "Settings" → "Domains"
2. Add your Vercel domain (will get in next step)
3. Add your Railway backend domain

---

## Step 5: Deploy Frontend to Vercel

### 5.1 Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 5.2 Configure Build Settings

**Framework Preset**: Next.js  
**Build Command**: `npm run build:frontend`  
**Output Directory**: `.next`  
**Install Command**: `npm install`

### 5.3 Add Environment Variables

In Vercel project settings → Environment Variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
DATABASE_URL=<your-railway-postgres-url>
NODE_ENV=production
```

### 5.4 Deploy

Click "Deploy" and wait for build to complete.

Your frontend will be available at: `https://smartshift.vercel.app`

---

## Step 6: Update Backend CORS

### 6.1 Add Frontend URL to Railway

In Railway backend service, add environment variable:
```
FRONTEND_URL=https://smartshift.vercel.app
```

### 6.2 Update CORS in backend/server.ts

The CORS configuration should use the environment variable:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

Redeploy the backend.

---

## Step 7: Create Production Admin User

### 7.1 Sign Up

1. Go to your production URL
2. Sign up with your email
3. Complete onboarding

### 7.2 Promote to Operator

Using Railway's PostgreSQL console or connection string:

```sql
UPDATE users 
SET role = 'OPERATOR' 
WHERE email = 'your-email@example.com';
```

Or use the script:
```bash
DATABASE_URL=<production-url> npx tsx scripts/make-operator.ts your-email@example.com
```

---

## Step 8: Verify Deployment

### 8.1 Test Checklist

- [ ] Frontend loads at Vercel URL
- [ ] Can sign up / sign in with Clerk
- [ ] Dashboard loads correctly
- [ ] Can create time-off requests (employee)
- [ ] Can view team page (operator)
- [ ] Backend API responds at Railway URL
- [ ] Database connections work

### 8.2 Monitor Logs

**Vercel**: Project → Settings → Logs  
**Railway**: Service → Deployments → Logs

---

## Troubleshooting

### CORS Errors

- Verify `FRONTEND_URL` is set in Railway
- Check Clerk allowed origins include both domains
- Ensure cookies/credentials are enabled

### Database Connection Issues

- Verify `DATABASE_URL` format is correct
- Check Railway PostgreSQL is running
- Run `npx prisma generate` after deployment

### Build Failures

**Frontend**:
- Check all environment variables are set in Vercel
- Verify Clerk keys are production keys

**Backend**:
- Ensure TypeScript compiles: `npm run build:backend`
- Check Railway build logs for errors

---

## Environment Variables Reference

### Frontend (Vercel)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_API_URL
DATABASE_URL
NODE_ENV=production
```

### Backend (Railway)
```
DATABASE_URL
CLERK_SECRET_KEY
PORT=4000
NODE_ENV=production
FRONTEND_URL
```

---

## Cost Estimates

**Free Tier Limits:**
- **Vercel**: 100GB bandwidth, unlimited sites
- **Railway**: $5 free credit/month (~500 hours)
- **Clerk**: 10,000 MAU (Monthly Active Users)

**Estimated Monthly Cost**: $0-10 for small teams

---

## Next Steps

1. Set up custom domain (optional)
2. Enable monitoring/analytics
3. Set up automated backups for database
4. Configure CI/CD for automated deployments
5. Set up error tracking (Sentry)

---

## Support

If you encounter issues:
1. Check Railway and Vercel logs
2. Verify all environment variables
3. Test locally first with production env vars
4. Check Clerk dashboard for auth issues

**Deployment Complete! 🎉**
