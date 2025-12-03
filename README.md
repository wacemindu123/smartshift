# ShiftSmart - Restaurant Scheduling App

Modern scheduling and team management for restaurants.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Setup](#setup)
5. [Restaurant Features](#restaurant-features)
6. [API Reference](#api-reference)
7. [Deployment](#deployment)

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Seed restaurant roles
npx tsx scripts/seed-restaurant-roles.ts

# Add demo data (optional - for testing/demos)
npm run seed:demo

# Start backend
npm run dev:backend

# Start frontend (new terminal)
npm run dev
```

Visit: http://localhost:3000

### 🎬 Demo Mode
```bash
# Add realistic demo data (8 employees, 74 shifts, time-off, swaps)
npm run seed:demo

# Remove all demo data when done
npm run remove:demo
```

See [DEMO_GUIDE.md](./DEMO_GUIDE.md) for full demo walkthrough.

---

## ✨ Features

### Core Features
- ✅ Team management (operators & employees)
- ✅ Shift scheduling with weekly calendar
- ✅ Employee availability preferences
- ✅ Work role assignment (Barista, Cook, etc.)
- ✅ Capacity management (prevent overcrowding)
- ✅ Clock in/out tracking
- ✅ Callout management
- ✅ Notifications system

### Restaurant-Specific
- ✅ 8 predefined roles (Front/Back of House, Expediter)
- ✅ Capacity limits (max 7 staff by default)
- ✅ Station-based scheduling
- ✅ Editable business settings
- ✅ Real-time overcrowding alerts

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Query
- Clerk Auth

**Backend:**
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Clerk Express SDK

---

## 📦 Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- Clerk account (free)

### Environment Variables

Create `.env`:

```bash
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/shiftsmartlite

# Backend
NEXT_PUBLIC_API_URL=http://localhost:4000
PORT=4000

# Environment
NODE_ENV=development
```

### Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Seed restaurant roles
npx tsx scripts/seed-restaurant-roles.ts

# View database
npx prisma studio
```

### Create First User

```bash
npx tsx scripts/create-user.ts <clerkId> <email> <name> OPERATOR
```

---

## 🍽️ Restaurant Features

### Work Roles (8 Predefined)

**Front of House:**
- Barista
- Register
- Front Manager

**Back of House:**
- Hot Food Station
- Cold Station
- Prep Work
- Dishes

**Critical:**
- Expediter

### Capacity Management

**Default Settings:**
- Max Capacity: 7 staff
- Optimal Range: 5-7 staff
- Customizable in Settings page

**Features:**
- Real-time staffing alerts
- Overcrowding prevention
- Station breakdown (Front/Back/Expediter)
- Extended hours recommendations

### Business Settings

Customize in `/settings`:
- Max staff capacity
- Optimal staff range
- Area-specific limits
- Operating hours
- Labor costs

---

## 📡 API Reference

### Authentication
All endpoints require Clerk authentication.

### Endpoints

**Users**
```
GET    /api/users              # List all users
GET    /api/users/me           # Current user
GET    /api/users/:id          # Get user
PATCH  /api/users/:id          # Update user
```

**Shifts**
```
GET    /api/shifts             # List shifts
POST   /api/shifts             # Create shift
PATCH  /api/shifts/:id         # Update shift
DELETE /api/shifts/:id         # Delete shift
POST   /api/shifts/publish     # Publish shifts
```

**Work Roles**
```
GET    /api/roles              # List roles
POST   /api/roles              # Create role
DELETE /api/roles/:id          # Delete role
```

**Settings**
```
GET    /api/settings/business  # Get settings
POST   /api/settings/business  # Update settings
```

**Attendance**
```
POST   /api/attendance/clock-in
POST   /api/attendance/clock-out
GET    /api/attendance/status/:userId
```

---

## 🎯 Key Pages

**Manager Pages:**
- `/dashboard` - Overview & stats
- `/schedule` - Weekly shift calendar
- `/team` - Team management
- `/capacity` - Staffing analysis
- `/settings` - Business configuration

**Employee Pages:**
- `/dashboard` - Personal stats
- `/my-shifts` - Assigned shifts
- `/availability` - Set work preferences

---

## 🚀 Deployment

### Database
1. Create PostgreSQL database
2. Update `DATABASE_URL` in production
3. Run: `npx prisma migrate deploy`

### Backend
```bash
npm run build:backend
node backend/dist/backend/server.js
```

### Frontend
```bash
npm run build
npm start
```

### Environment
Set all `.env` variables in production.

---

## 📊 Business Opportunities

### Gaps to Fill
1. **Labor Cost Tracking** - Budget management
2. **Shift Swapping** - Employee self-service
3. **Time-Off Requests** - PTO management
4. **Auto-Scheduling** - AI-powered scheduling
5. **Mobile App** - PWA or native
6. **Multi-Location** - Chain support
7. **Payroll Integration** - QuickBooks/Gusto
8. **Advanced Reporting** - Analytics dashboard

### Pricing Strategy
- **Free**: 10 employees, basic features
- **Pro** ($29/mo): Unlimited employees, advanced features
- **Enterprise** ($99/mo): Multi-location, integrations

---

## 🔧 Development

### Run Dev Servers
```bash
# Backend
npm run dev:backend

# Frontend
npm run dev
```

### Database Commands
```bash
# Create migration
npx prisma migrate dev --name <name>

# Reset database
npx prisma migrate reset

# Generate client
npx prisma generate
```

### Scripts
```bash
# Seed restaurant roles
npx tsx scripts/seed-restaurant-roles.ts

# Create user
npx tsx scripts/create-user.ts <clerkId> <email> <name> <role>
```

---

## 📝 Notes

### Capacity System
- Prevents overcrowding (default max: 7)
- Alerts when approaching limits
- Suggests optimal staffing
- Editable thresholds

### Authentication
- Clerk handles auth
- Roles: OPERATOR (manager) or EMPLOYEE
- Set role in Clerk metadata: `{ "role": "OPERATOR" }`

### Database Schema
- Users, Shifts, WorkRoles, Callouts, Notifications
- SMS logs for future notifications
- Business settings table

---

## 🎉 Current Status

**Working:**
- Complete team management
- Shift scheduling
- Capacity management
- Work role system
- Employee availability
- Business settings
- Authentication

**Ready to Add:**
- SMS notifications (Twilio)
- Shift swapping
- Time-off requests
- Labor cost tracking

---

## 📞 Support

For issues or questions, check:
- Database: `npx prisma studio`
- Logs: Backend terminal output
- Auth: Clerk dashboard

---

**Built for restaurants. Designed for simplicity. Ready to scale.** 🍽️
