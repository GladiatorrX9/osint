# 🌱 Seeded Database - GladiatorRX

This document contains all the dummy data that has been seeded into the database.

## 🔑 Admin Account

**Access the admin dashboard and all features:**

- **Email:** `admin@gladiatorrx.com`
- **Password:** `GladiatorRX@2024!`
- **Role:** ADMIN

---

## 🏢 Organizations & Users

### 1. TechCorp Solutions

- **Slug:** `techcorp-solutions`
- **Subscription:** ENTERPRISE (Yearly)
- **Users:**
  1. **John Doe** (OWNER)
     - Email: `john.doe@techcorp.com`
     - Password: `Password123!`
  2. **Jane Smith** (ADMIN)
     - Email: `jane.smith@techcorp.com`
     - Password: `Password123!`
  3. **Mike Johnson** (MEMBER)
     - Email: `mike.johnson@techcorp.com`
     - Password: `Password123!`

### 2. StartupHub Inc

- **Slug:** `startuphub-inc`
- **Subscription:** PROFESSIONAL (Monthly)
- **Users:**
  1. **Sarah Wilson** (OWNER)
     - Email: `sarah.wilson@startuphub.com`
     - Password: `Password123!`
  2. **David Brown** (MEMBER)
     - Email: `david.brown@startuphub.com`
     - Password: `Password123!`

### 3. Global Enterprises

- **Slug:** `global-enterprises`
- **Subscription:** STARTER (Monthly)
- **Users:**
  1. **Alex Rodriguez** (OWNER)
     - Email: `alex.rodriguez@global.com`
     - Password: `Password123!`
  2. **Emily Davis** (ADMIN)
     - Email: `emily.davis@global.com`
     - Password: `Password123!`
  3. **Robert Martinez** (MEMBER)
     - Email: `robert.martinez@global.com`
     - Password: `Password123!`
  4. **Lisa Anderson** (VIEWER)
     - Email: `lisa.anderson@global.com`
     - Password: `Password123!`

### 4. Digital Innovations

- **Slug:** `digital-innovations`
- **Subscription:** PROFESSIONAL (Yearly)
- **Users:**
  1. **Chris Taylor** (OWNER)
     - Email: `chris.taylor@digitalinno.com`
     - Password: `Password123!`
  2. **Amanda White** (MEMBER)
     - Email: `amanda.white@digitalinno.com`
     - Password: `Password123!`

### 5. CloudTech Systems

- **Slug:** `cloudtech-systems`
- **Subscription:** ENTERPRISE (Monthly)
- **Users:**
  1. **Kevin Lee** (OWNER)
     - Email: `kevin.lee@cloudtech.com`
     - Password: `Password123!`
  2. **Michelle Garcia** (ADMIN)
     - Email: `michelle.garcia@cloudtech.com`
     - Password: `Password123!`
  3. **Daniel Thomas** (MEMBER)
     - Email: `daniel.thomas@cloudtech.com`
     - Password: `Password123!`
  4. **Jessica Moore** (MEMBER)
     - Email: `jessica.moore@cloudtech.com`
     - Password: `Password123!`
  5. **Brian Jackson** (VIEWER)
     - Email: `brian.jackson@cloudtech.com`
     - Password: `Password123!`

---

## 👤 Unassigned Users (No Organization)

1. **Tom Freelancer**

   - Email: `freelancer1@example.com`
   - Password: `Password123!`

2. **Anna Independent**

   - Email: `freelancer2@example.com`
   - Password: `Password123!`

3. **Sam Consultant**
   - Email: `consultant@example.com`
   - Password: `Password123!`

---

## 📋 Waitlist Entries

1. **Peter Waiting** - PENDING

   - Email: `waitlist1@example.com`
   - Company: Startup ABC
   - Message: "Looking forward to using GladiatorRX!"

2. **Maria Pending** - PENDING

   - Email: `waitlist2@example.com`
   - Company: Tech Ventures
   - Message: "Interested in enterprise features"

3. **Jack Approved** - APPROVED

   - Email: `approved@example.com`
   - Company: Big Corp
   - Message: "Need OSINT tools ASAP"

4. **Bob Rejected** - REJECTED
   - Email: `rejected@example.com`
   - Company: N/A
   - Message: "Just checking it out"

---

## 📧 Pending Invitations

Both invitations are from **TechCorp Solutions**:

1. **newhire@example.com** (MEMBER role)

   - Status: PENDING
   - Expires: 7 days from creation

2. **contractor@example.com** (VIEWER role)
   - Status: PENDING
   - Expires: 7 days from creation

---

## 🗄️ Leaked Databases

15 leaked database records have been seeded with realistic data breaches including:

- LinkedIn Data Breach 2021 (700M records)
- Facebook Data Scraping 2021 (533M records)
- Twitter API Exploitation 2023 (235M records)
- Adobe Systems Breach 2013 (38M records)
- Marriott International Breach 2018 (500M records)
- Equifax Data Breach 2017 (147M records)
- Yahoo Data Breach 2013-2014 (3B records)
- T-Mobile Data Breach 2021 (54M records)
- Microsoft Exchange Server Breach 2021 (250K records)
- Capital One Data Breach 2019 (100M records)
- Uber Data Breach 2016 (57M records)
- Sony PlayStation Network 2011 (77M records)
- eBay Cyberattack 2014 (145M records)
- Dropbox Breach 2012 (68M records)
- GitHub Security Incident 2023 (5K records)

---

## 📊 Summary Statistics

- **Total Organizations:** 5
- **Total Users:** 20 (including 1 admin)
- **Total Subscriptions:** 5 (2 Enterprise, 2 Professional, 1 Starter)
- **Total Waitlist Entries:** 4
- **Total Pending Invitations:** 2
- **Total Leaked Databases:** 15

---

## 🔄 Re-running the Seed Script

To re-seed the database:

```bash
npx tsx prisma/seed.ts
```

The script uses **upsert** logic, so it won't create duplicate entries if run multiple times.

---

## 🧪 Testing Different Scenarios

### Test Admin Features

Login as `admin@gladiatorrx.com` to:

- View all organizations and users
- Manage waitlist applications
- Send custom emails
- View analytics dashboard
- Access admin-only pages

### Test Organization Owner

Login as any OWNER user (e.g., `john.doe@techcorp.com`) to:

- Manage their organization
- Invite team members
- View organization dashboard
- Manage subscriptions

### Test Team Members

Login as ADMIN/MEMBER/VIEWER users to test different permission levels:

- **ADMIN:** Full organization access
- **MEMBER:** Standard access
- **VIEWER:** Read-only access

### Test Unassigned Users

Login as freelancers to see the experience of users without an organization.

---

## 🎯 Quick Access Links

After starting the dev server (`npm run dev`):

- **Login:** http://localhost:3000/login
- **Admin Dashboard:** http://localhost:3000/dashboard (as admin)
- **Admin Waitlist:** http://localhost:3000/admin/waitlist
- **Admin Users:** http://localhost:3000/admin/users
- **Admin Emails:** http://localhost:3000/admin/emails
- **Analytics:** http://localhost:3000/dashboard/admin/analytics
- **Register/Waitlist:** http://localhost:3000/register

---

**Last Updated:** November 9, 2025
