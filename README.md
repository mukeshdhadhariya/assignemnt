# BillFlow — Invoicing SaaS

<div align="center">
  <img src="public/icon.png" alt="BillFlow App Icon" width="100" height="100" style="border-radius: 20px;" />
  <p><strong>Modern Invoicing & Billing Platform for Freelancers and Small Studios</strong></p>
</div>

---

## 🏛️ System Architecture Diagram

```mermaid
flowchart TD
    User["User / Freelancer"] --> App["Next.js 14 App Router UI"]
    Client["Client Contact"] --> Portal["Public Invoice Portal (/i/token)"]

    App --> Middleware["Edge Middleware (JWT Session Guard)"]
    Middleware --> API["Next.js Route Handlers (/api/*)"]
    Portal --> API

    API --> Prisma["Prisma ORM Client"]
    Prisma --> NeonDB[("Neon PostgreSQL Database")]

    subgraph DatabaseSchema ["Database Schema (Relational Entities)"]
        UserTable["User (Studio Profile)"]
        ClientTable["Client (Contact Info)"]
        InvoiceTable["Invoice (Status, Totals, Dates)"]
        ItemTable["InvoiceItem (Qty, Rate, Total)"]
        ActivityTable["InvoiceActivity (Audit Trail)"]

        UserTable --> ClientTable
        UserTable --> InvoiceTable
        ClientTable --> InvoiceTable
        InvoiceTable --> ItemTable
        InvoiceTable --> ActivityTable
    end

    NeonDB --- DatabaseSchema
```

---

## 🔄 Invoice Lifecycle & Payment Flow

```mermaid
sequenceDiagram
    autonumber
    actor Freelancer
    participant Studio as BillFlow Studio
    participant API as API Routes
    participant DB as Neon PostgreSQL
    actor Client
    participant Portal as Client Portal

    Freelancer->>Studio: 1. Creates & configures invoice line items
    Studio->>API: 2. POST /api/invoices
    API->>DB: 3. Saves invoice and increments number
    Freelancer->>Client: 4. Shares public link (/i/token)
    Client->>Portal: 5. Opens link without login
    Portal->>API: 6. GET /api/public/invoices/token (records view)
    Client->>Portal: 7. Submits card or bank payment
    Portal->>API: 8. POST /api/public/invoices/token (process payment)
    API->>DB: 9. Updates status to PAID and logs receipt
    Portal-->>Client: 10. Displays payment receipt
    API-->>Studio: 11. Dashboard updates collected revenue
```

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
