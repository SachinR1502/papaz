# Database & Upload Management Scripts

This document explains how to use the database seeding and cleanup scripts.

## 📋 Available Scripts

### 1. **Seed Users Only** (Recommended for Production)
```bash
npm run seed:users
```
**What it does:**
- ✅ Clears ALL data from the database
- ✅ Creates essential users only:
  - 1 Admin
  - 2 Customers
  - 2 Technicians
  - 1 Supplier
- ✅ No vehicles, jobs, or test data
- ✅ Clean slate for production

**Use this when:**
- Setting up a fresh production environment
- You want to start with only user accounts
- You need to clear all test data

---

### 2. **Full Seed** (Development/Testing)
```bash
npm run seed
```
**What it does:**
- ✅ Clears ALL data from the database
- ✅ Creates users (admin, customers, technicians, suppliers)
- ✅ Creates test vehicles
- ✅ Creates sample service requests (jobs)
- ✅ Creates products and orders
- ✅ Creates transactions
- ✅ Full demo data for testing

**Use this when:**
- Developing and testing features
- You need sample data to work with
- Demonstrating the application

---

### 3. **Clear Uploads Folder**
```bash
npm run clear:uploads
```
**What it does:**
- ✅ Deletes all files in the `uploads/` folder
- ✅ Removes all subdirectories
- ✅ Frees up disk space
- ✅ Shows detailed deletion log

**Use this when:**
- Cleaning up old uploaded files
- Freeing disk space on server
- Resetting file storage

---

### 4. **Complete Reset** (Clear + Seed Users)
```bash
npm run reset
```
**What it does:**
- ✅ Clears uploads folder
- ✅ Clears database
- ✅ Seeds only users
- ✅ Complete fresh start

**Use this when:**
- You want a complete clean slate
- Preparing for production deployment
- Resetting everything to initial state

---

## 🔐 Created User Credentials

After running `npm run seed:users` or `npm run reset`, you'll have these accounts:

| Role | Phone Number | Name | Details |
|------|-------------|------|---------|
| **Admin** | `1234567890` | Admin | Full system access |
| **Customer** | `9876543210` | Rahul Sharma | Wallet: ₹5,000 |
| **Customer** | `9876543211` | Priya Patel | Wallet: ₹3,000 |
| **Technician** | `9999999999` | Alex Mechanic | Rapid Auto Fix, Rating: 4.8 |
| **Technician** | `8888888888` | Suresh Kumar | City Garage, Rating: 4.5 |
| **Supplier** | `9900880077` | Sunil Kumar | FastTrack Spares, Rating: 4.7 |

---

## 🚀 Quick Start Guide

### For Production Deployment:
```bash
# 1. Clear everything and create fresh users
npm run reset

# 2. Start the server
npm start
```

### For Development:
```bash
# 1. Create full test data
npm run seed

# 2. Start development server
npm run dev
```

### To Clean Up Files Only:
```bash
# Just clear uploaded files
npm run clear:uploads
```

---

## ⚠️ Important Notes

1. **Data Loss Warning**: All seed scripts clear the database completely. Make sure you have backups if needed.

2. **Uploads Folder**: The `clear:uploads` script permanently deletes all files. This cannot be undone.

3. **Production Use**: For production, use `npm run seed:users` to avoid creating test data.

4. **Render Deployment**: If deploying to Render, the uploads folder will be cleared on each deployment automatically (ephemeral filesystem).

---

## 📁 File Structure

```
backend/
├── seed.js              # Full seed with test data
├── seedUsers.js         # Users only (production)
├── clearUploads.js      # Clear uploads folder
└── package.json         # npm scripts
```

---

## 🔧 Manual Database Cleanup

If you need to manually clear specific collections:

```javascript
// In MongoDB shell or Compass
db.users.deleteMany({})
db.customers.deleteMany({})
db.technicians.deleteMany({})
db.servicerequests.deleteMany({})
db.vehicles.deleteMany({})
// ... etc
```

---

## 💡 Tips

- **Before deploying to production**: Run `npm run reset`
- **For testing new features**: Run `npm run seed`
- **To free up space**: Run `npm run clear:uploads`
- **Fresh start**: Run `npm run reset`

---

## 🐛 Troubleshooting

**Script fails to connect to MongoDB:**
- Check your `MONGO_URI` in `.env` file
- Ensure MongoDB is running
- Verify network connectivity

**Permission errors on uploads folder:**
- Ensure the uploads folder exists
- Check file permissions
- Run with appropriate user privileges

**Seed creates duplicate data:**
- The scripts automatically clear data first
- If you see duplicates, manually clear the database
