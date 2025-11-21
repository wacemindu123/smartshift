# 🎬 Demo Guide

This guide helps you demo ShiftSmart to potential clients with realistic data.

---

## 🚀 Quick Start

### Add Demo Data
```bash
npm run seed:demo
```

This creates:
- **8 demo employees** (Sarah, Mike, Emma, James, Olivia, Noah, Ava, Liam)
- **74 shifts** over 2 weeks (morning & evening shifts)
- **2 time-off requests** (1 pending, 1 approved)
- **1 shift swap request** (pending)
- **3 notifications**

### Remove Demo Data
```bash
npm run remove:demo
```

Completely removes all demo data from the database.

---

## 📊 What's Included

### Demo Employees (8 total)
All assigned to various restaurant roles:
- Barista
- Register
- Manager
- Expediter
- Hot Food Station
- Cold Station
- Prep Work
- Dishes

Each has:
- ✅ Phone number (for SMS testing)
- ✅ Assigned work role
- ✅ SMS enabled

### Demo Shifts (74 total)
**Schedule Pattern:**
- **Monday-Friday**: 6 shifts/day
  - Morning: 7am-3pm (3 staff)
  - Evening: 3pm-11pm (3 staff)
- **Saturday**: 7 shifts/day (busier)
  - Morning: 7am-3pm (4 staff)
  - Evening: 3pm-11pm (3 staff)
- **Sunday**: Closed

**Status:**
- First week: **PUBLISHED** (visible to employees)
- Second week: **DRAFT** (manager planning)

### Demo Time-Off Requests
1. **Pending Request** - Sarah Johnson
   - 3 days off (starting 20 days from now)
   - Reason: "Family vacation"
   - Status: Awaiting manager approval

2. **Approved Request** - Mike Chen
   - 2 days off (starting 15 days from now)
   - Reason: "Doctor appointment"
   - Status: Already approved

### Demo Shift Swap
- **1 pending swap** for a future shift
- Available for other employees to claim
- Requires manager approval after claiming

---

## 🎯 Demo Walkthrough

### For Managers (OPERATOR role)

1. **Dashboard** (`/dashboard`)
   - View weekly calendar with color-coded coverage
   - See today's attendance
   - Check notifications

2. **Schedule** (`/schedule`)
   - See all 74 shifts across 2 weeks
   - Edit or create new shifts
   - Publish draft shifts

3. **Team** (`/team`)
   - View all 8 demo employees
   - See assigned roles
   - Manage team members

4. **Capacity** (`/capacity`)
   - View staffing levels
   - See coverage by role (Front/Back/Expediter)
   - Check for understaffing

5. **Time Off** (`/time-off`)
   - See 2 pending/approved requests
   - **Approve** Sarah's vacation request
   - **Deny** with reason (optional)

6. **Shift Swaps** (`/shift-swaps`)
   - See pending swap request
   - **Approve** after someone claims it
   - **Deny** with reason

### For Employees (EMPLOYEE role)

1. **My Shifts** (`/my-shifts`)
   - View assigned shifts
   - Clock in/out (for today's shifts)
   - **Request swap** on any shift

2. **Availability** (`/availability`)
   - Set work preferences
   - Block out unavailable times

3. **Shift Swaps** (`/shift-swaps`)
   - See available swaps
   - **Claim** a swap
   - Track your swap requests

4. **Time Off** (`/time-off`)
   - **Request** time off
   - View pending/approved requests
   - Cancel pending requests

---

## 💡 Demo Tips

### Show Key Features

**1. Weekly Calendar (Managers)**
- Color-coded coverage (red = no coverage, green = optimal)
- Click any day to manage that date
- Shows staff count per day

**2. Shift Swapping**
- Employee requests swap → Another claims it → Manager approves
- 3-step process ensures manager control

**3. Time-Off Management**
- Simple request/approve workflow
- Denial with reason tracking
- Future-dated requests

**4. Real-time Updates**
- Notifications for schedule changes
- SMS ready (when Twilio A2P approved)

### Talking Points

**For Restaurant Owners:**
- "See how Sarah requested vacation 3 weeks out? You can approve/deny instantly."
- "The calendar shows you're understaffed on Saturday - add more shifts easily."
- "When Mike swaps his shift, you still approve it - you're always in control."

**For Employees:**
- "Clock in/out right from your phone"
- "Request time off without calling your manager"
- "Swap shifts with coworkers (manager approves)"

---

## 🧹 Clean Up

After the demo:
```bash
npm run remove:demo
```

This removes:
- ✅ All 8 demo employees
- ✅ All 74 demo shifts
- ✅ All time-off requests
- ✅ All shift swaps
- ✅ All notifications
- ✅ All attendance records

**Your real data stays intact!** Only demo users (with `demo_` prefix) are removed.

---

## 🔄 Re-run Demo

You can run the demo seed multiple times:
```bash
npm run remove:demo  # Clean up
npm run seed:demo    # Add fresh data
```

---

## 📝 Customization

To modify demo data, edit:
- `/scripts/seed-demo-data.ts` - Add more employees, change shift patterns
- `/scripts/remove-demo-data.ts` - Adjust cleanup logic

---

**Ready to demo!** 🎉
