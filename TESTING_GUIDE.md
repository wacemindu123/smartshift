# 🧪 Testing Guide

Complete guide to test ShiftSmart locally before your demo.

---

## 🚀 Quick Start Testing

### 1. Setup (First Time Only)

```bash
# Make sure you're in the project directory
cd /Users/ryanwidgeon/Desktop/smartshift

# Install dependencies (if not done)
npm install

# Setup database
npx prisma migrate dev

# Seed restaurant roles
npx tsx scripts/seed-restaurant-roles.ts

# Add demo data
npm run seed:demo
```

### 2. Start the Application

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```
Wait for: `✅ Server running on port 4000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Wait for: `✓ Ready in X ms`

### 3. Open Browser
Visit: **http://localhost:3000**

---

## 👥 Test Accounts

You need to create test accounts in Clerk for testing.

### Create Manager Account
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create account with:
   - Email: `manager@test.com`
   - Name: `Test Manager`
4. After signup, go to your database and update the user:

```bash
# Open Prisma Studio
npx prisma studio
```

In Prisma Studio:
- Find your user (manager@test.com)
- Change `role` from `EMPLOYEE` to `OPERATOR`
- Save

### Create Employee Account
1. Sign out
2. Sign up again with:
   - Email: `employee@test.com`
   - Name: `Test Employee`
3. This account stays as `EMPLOYEE` role

---

## ✅ Testing Checklist

### Test as Manager (OPERATOR)

#### 1. Dashboard (`/dashboard`)
- [ ] See weekly calendar
- [ ] Calendar shows demo shifts
- [ ] See "Today's Shifts" count
- [ ] See "On Shift Now" count
- [ ] Click a day on calendar (should navigate to schedule)

#### 2. Weekly Calendar (Dashboard)
- [ ] See weekly calendar on dashboard
- [ ] Click on any day to manage shifts for that date
- [ ] See color-coded coverage (red/yellow/green)
- [ ] Navigate between weeks

#### 3. Schedule Management (Click a day on calendar)
- [ ] See all shifts for selected date
- [ ] Create new shift:
  - Click "Create Shift"
  - Select employee
  - Select role
  - Set start/end time
  - Click "Create"
- [ ] Edit existing shift:
  - Click on a shift
  - Change time
  - Save
- [ ] Delete a shift:
  - Click on a shift
  - Click "Delete"
  - Confirm

#### 3. Team (`/team`)
- [ ] See 8 demo employees
- [ ] See assigned roles
- [ ] Click on employee to view details
- [ ] See contact information

#### 4. Capacity (`/capacity`)
- [ ] See staffing levels by day
- [ ] See Front/Back/Expediter breakdown
- [ ] See warnings for understaffed days
- [ ] Change max capacity setting

#### 5. Time Off (`/time-off`)
- [ ] See 2 demo requests (1 pending, 1 approved)
- [ ] Approve pending request:
  - Click green checkmark
  - Verify status changes to "APPROVED"
- [ ] Create new request:
  - Click "Request Time Off"
  - Select dates
  - Add reason
  - Submit
- [ ] Deny a request:
  - Click red X
  - Enter reason
  - Verify status changes to "DENIED"

#### 6. Shift Swaps (`/shift-swaps`)
- [ ] See pending swap request
- [ ] See "Pending Approval" section
- [ ] Approve a swap:
  - Click green checkmark
  - Verify shift ownership changes
- [ ] Deny a swap:
  - Click red X
  - Enter reason
  - Verify status changes to "DENIED"

#### 7. Settings (`/settings`)
- [ ] See business settings
- [ ] Change max capacity
- [ ] Update business hours
- [ ] Save changes

---

### Test as Employee (EMPLOYEE)

Log out and log in as `employee@test.com`

#### 1. Dashboard (`/dashboard`)
- [ ] See "Your Next Shift" section
- [ ] See shift details
- [ ] See clock in/out buttons (if shift is today)

#### 2. My Shifts (`/my-shifts`)
- [ ] See upcoming shifts
- [ ] See past shifts
- [ ] Clock in to a shift (if today):
  - Click "Clock In"
  - Verify attendance recorded
- [ ] Clock out:
  - Click "Clock Out"
  - Verify time recorded
- [ ] Request shift swap:
  - Click "Request Swap" on a shift
  - Verify swap created

#### 3. Availability (`/availability`)
- [ ] See availability form
- [ ] Set preferred days
- [ ] Set preferred times
- [ ] Save preferences

#### 4. Shift Swaps (`/shift-swaps`)
- [ ] See "Available Swaps" section
- [ ] See "My Requests" section
- [ ] Claim an available swap:
  - Click "Claim Shift"
  - Verify status changes to "CLAIMED"
- [ ] Cancel your swap request:
  - Click "Cancel"
  - Verify removed from list

#### 5. Time Off (`/time-off`)
- [ ] See your requests only
- [ ] Request time off:
  - Click "Request Time Off"
  - Select dates
  - Add reason
  - Submit
- [ ] Cancel pending request:
  - Click "Cancel"
  - Verify removed

---

## 🔍 Detailed Feature Tests

### Test: Create and Publish Schedule

**As Manager:**
1. Go to `/schedule`
2. Click "Create Shift"
3. Fill in:
   - Employee: Select from dropdown
   - Role: Select role
   - Date: Tomorrow
   - Start: 9:00 AM
   - End: 5:00 PM
4. Click "Create"
5. Verify shift appears in calendar
6. Change status to "PUBLISHED"
7. **Expected:** Employee should see it in "My Shifts"

### Test: Time-Off Approval Flow

**As Employee:**
1. Go to `/time-off`
2. Click "Request Time Off"
3. Select dates: Next week Monday-Wednesday
4. Reason: "Vacation"
5. Submit

**As Manager:**
1. Go to `/time-off`
2. See new request
3. Click green checkmark to approve
4. **Expected:** Status changes to "APPROVED"

**As Employee:**
1. Refresh `/time-off`
2. **Expected:** See approved status

### Test: Shift Swap Flow

**As Employee 1:**
1. Go to `/my-shifts`
2. Find a future shift
3. Click "Request Swap"
4. **Expected:** Swap appears in "My Requests"

**As Employee 2:**
1. Go to `/shift-swaps`
2. See swap in "Available Swaps"
3. Click "Claim Shift"
4. **Expected:** Status changes to "CLAIMED"

**As Manager:**
1. Go to `/shift-swaps`
2. See swap in "Pending Approval"
3. Click green checkmark to approve
4. **Expected:** Shift ownership transfers to Employee 2

**Verify:**
1. Check `/schedule` - shift should show Employee 2
2. Employee 2's "My Shifts" should show the shift
3. Employee 1's "My Shifts" should NOT show the shift

### Test: Clock In/Out

**Setup:** Create a shift for today

**As Employee:**
1. Go to `/my-shifts`
2. Find today's shift
3. Click "Clock In"
4. **Expected:** 
   - Button changes to "Clock Out"
   - Attendance recorded with clock-in time

5. Wait a minute
6. Click "Clock Out"
7. **Expected:**
   - Attendance updated with clock-out time
   - Duration calculated

**As Manager:**
1. Go to `/dashboard`
2. **Expected:** See employee in "Today's Attendance"
3. See attendance status

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot connect to database"
**Fix:**
```bash
# Check if PostgreSQL is running
# Restart backend
npm run dev:backend
```

### Issue: "No shifts showing"
**Fix:**
```bash
# Re-seed demo data
npm run remove:demo
npm run seed:demo
```

### Issue: "Can't see manager features"
**Fix:**
1. Open Prisma Studio: `npx prisma studio`
2. Find your user
3. Change `role` to `OPERATOR`
4. Refresh browser

### Issue: "Clerk authentication error"
**Fix:**
1. Check `.env` file has correct Clerk keys
2. Restart both frontend and backend
3. Clear browser cache

### Issue: "Port already in use"
**Fix:**
```bash
# Kill process on port 4000 (backend)
lsof -ti:4000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

---

## 📊 Database Inspection

### View Data in Prisma Studio
```bash
npx prisma studio
```

Opens: http://localhost:5555

**Check:**
- Users table (see all accounts)
- Shifts table (see all shifts)
- TimeOffRequest table (see requests)
- ShiftSwap table (see swaps)
- Attendance table (see clock in/out records)

### SQL Queries (Advanced)

```bash
# Connect to database
psql -d smartshift

# View all users
SELECT id, name, email, role FROM users;

# View today's shifts
SELECT s.id, u.name, r.name as role, s.start_time, s.end_time 
FROM shifts s 
JOIN users u ON s.user_id = u.id 
JOIN work_roles r ON s.role_id = r.id 
WHERE DATE(s.start_time) = CURRENT_DATE;

# View pending time-off requests
SELECT t.id, u.name, t.start_date, t.end_date, t.status 
FROM time_off_requests t 
JOIN users u ON t.user_id = u.id 
WHERE t.status = 'PENDING';
```

---

## 🧹 Clean Up After Testing

### Remove Demo Data
```bash
npm run remove:demo
```

### Reset Database (Nuclear Option)
```bash
# WARNING: Deletes ALL data
npx prisma migrate reset

# Re-seed roles
npx tsx scripts/seed-restaurant-roles.ts

# Re-add demo data
npm run seed:demo
```

---

## 📱 Mobile Testing

### Test on Phone (Same Network)

1. Find your computer's IP:
```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Example output: 192.168.1.100
```

2. Update `.env`:
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:4000/api
```

3. Restart frontend:
```bash
npm run dev
```

4. On phone, visit: `http://192.168.1.100:3000`

### Test Responsive Design

In browser:
1. Open DevTools (F12)
2. Click device toolbar icon
3. Select device (iPhone, iPad, etc.)
4. Test all pages

---

## ✅ Pre-Demo Checklist

**Day Before:**
- [ ] Run `npm run seed:demo`
- [ ] Test manager login
- [ ] Test employee login
- [ ] Verify all pages load
- [ ] Check calendar shows data
- [ ] Verify time-off requests visible
- [ ] Verify shift swaps visible

**1 Hour Before:**
- [ ] Restart backend: `npm run dev:backend`
- [ ] Restart frontend: `npm run dev`
- [ ] Open browser to dashboard
- [ ] Test one feature (e.g., approve time-off)
- [ ] Close unnecessary browser tabs
- [ ] Charge laptop
- [ ] Connect to stable internet

**During Demo:**
- [ ] Have Prisma Studio open (backup)
- [ ] Have terminal visible (shows it's working)
- [ ] Have demo checklist handy

**After Demo:**
- [ ] Run `npm run remove:demo`
- [ ] Ask for feedback
- [ ] Note any bugs/requests

---

## 🎯 Success Criteria

Your app is ready to demo when:
- ✅ Both servers start without errors
- ✅ Manager can see weekly calendar
- ✅ Manager can approve time-off
- ✅ Manager can approve shift swaps
- ✅ Employee can see their shifts
- ✅ Employee can request time-off
- ✅ Employee can request shift swap
- ✅ Clock in/out works
- ✅ All 8 demo employees visible
- ✅ All 74 demo shifts visible

---

**You're ready to test!** 🚀

Start with the Quick Start section, then work through the Testing Checklist.
