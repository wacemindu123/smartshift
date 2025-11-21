# Quick Deployment Checklist

## Pre-Deployment

- [ ] All code committed to GitHub
- [ ] `.env` files not committed (check `.gitignore`)
- [ ] Production Clerk account created
- [ ] Work roles configured in database

---

## Railway (Backend + Database)

### Database Setup
- [ ] PostgreSQL provisioned on Railway
- [ ] `DATABASE_URL` copied
- [ ] Migrations run: `npx prisma migrate deploy`
- [ ] Work roles seeded: `npx tsx scripts/setup-work-roles.ts`

### Backend Service
- [ ] New service created from GitHub repo
- [ ] Build command: `npm run build:backend`
- [ ] Start command: `npm run start:backend`
- [ ] Environment variables added:
  - [ ] `DATABASE_URL`
  - [ ] `CLERK_SECRET_KEY`
  - [ ] `PORT=4000`
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL` (add after Vercel)
- [ ] Backend URL copied (e.g., `https://xxx.railway.app`)

---

## Vercel (Frontend)

### Project Setup
- [ ] Repository imported to Vercel
- [ ] Framework detected as Next.js
- [ ] Build command: `npm run build:frontend`
- [ ] Output directory: `.next`

### Environment Variables
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_API_URL` (Railway backend URL + `/api`)
- [ ] `DATABASE_URL`
- [ ] `NODE_ENV=production`

### Deploy
- [ ] Deployment successful
- [ ] Frontend URL copied (e.g., `https://smartshift.vercel.app`)

---

## Clerk Configuration

- [ ] Production application created
- [ ] Allowed origins added:
  - [ ] Vercel frontend URL
  - [ ] Railway backend URL
- [ ] Production keys obtained
- [ ] Test sign up/sign in works

---

## Final Configuration

- [ ] Add `FRONTEND_URL` to Railway backend
- [ ] Verify CORS working between frontend/backend
- [ ] Create first admin user
- [ ] Promote user to OPERATOR role:
  ```bash
  DATABASE_URL=<prod-url> npx tsx scripts/make-operator.ts your@email.com
  ```

---

## Testing

- [ ] Frontend loads without errors
- [ ] User can sign up
- [ ] User can sign in
- [ ] Dashboard displays correctly
- [ ] Employee can request time off
- [ ] Operator can view team page
- [ ] API calls work (check Network tab)
- [ ] Database queries succeed

---

## Monitoring

- [ ] Check Vercel deployment logs
- [ ] Check Railway service logs
- [ ] Verify no CORS errors in browser console
- [ ] Test on mobile device
- [ ] Test with different browsers

---

## Optional Enhancements

- [ ] Set up custom domain
- [ ] Configure error tracking (Sentry)
- [ ] Set up database backups
- [ ] Add monitoring/analytics
- [ ] Configure CI/CD pipeline
- [ ] Set up staging environment

---

## Troubleshooting

**Can't connect to backend:**
- Check `NEXT_PUBLIC_API_URL` in Vercel
- Verify Railway backend is running
- Check CORS configuration

**Authentication not working:**
- Verify Clerk production keys
- Check allowed origins in Clerk
- Test sign up with new email

**Database errors:**
- Run migrations: `npx prisma migrate deploy`
- Regenerate client: `npx prisma generate`
- Check connection string format

---

## Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **Clerk Dashboard**: https://dashboard.clerk.com
- **GitHub Repo**: https://github.com/YOUR_USERNAME/smartshift

---

**Estimated Time**: 30-45 minutes for first deployment

**Cost**: $0-10/month on free tiers
