# BillFlow — Invoicing SaaS

<div align="center">
  <img src="public/icon.png" alt="BillFlow App Icon" width="100" height="100" style="border-radius: 20px;" />
  <p><strong>Modern Invoicing & Billing Platform for Freelancers and Small Studios</strong></p>
</div>

---

## 🏛️ System Architecture Diagram

![System Architecture Diagram](public/architecture_diagram.png)

---

## 🔄 Invoice Lifecycle & Payment Flow

![Invoice Lifecycle and Payment Flow](public/payment_flow_diagram.png)

---

## 🚀 Quick Setup & Run

### 1. Configure Environment Variables
Create `.env`:
```env
DATABASE_URL="postgresql://neondb_owner:npg_mBb4XYJQuRy0@ep-solitary-glade-aevlul63-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="billflow-super-secret-production-jwt-key-2025"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Install & Database Sync
```bash
# Install dependencies
npm install

# Push schema to Neon PostgreSQL
npx prisma db push

# Seed initial data
node prisma/seed.js
```

### 3. Run Application
```bash
# Build and start production server
npm run build
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Account

- **Email**: `demo@billflow.dev`
- **Password**: `password123`
