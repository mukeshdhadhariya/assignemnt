# BillFlow — Modern Invoicing SaaS for Freelancers & Studios

<div align="center">
  <img src="public/icon.png" alt="BillFlow App Icon" width="120" height="120" style="border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);" />
  <h3>Production-Ready Invoicing Platform for Freelancers & Small Studios</h3>
  <p>Built with Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, and Neon PostgreSQL.</p>
</div>

---

## 🏛️ System Architecture Diagram

```mermaid
flowchart TB
    subgraph ClientLayer ["Client & Frontend Layer (Next.js 14 App Router)"]
        direction TB
        LandingPage["Marketing Landing Page\n(/)"]
        AuthPages["Auth System\n(/login, /signup)"]
        Dashboard["Dashboard & Analytics\n(/dashboard)"]
        InvoiceStudio["Live Split Invoice Studio\n(/invoices, /invoices/new)"]
        ClientHub["Client CRM Directory\n(/clients)"]
        SettingsPage["Studio Branding & Settings\n(/settings)"]
        PublicPortal["Public Client Portal\n(/i/[token])"]
    end

    subgraph SecurityLayer ["Security & Routing Layer"]
        Middleware["Next.js Edge Middleware\n(Session Verification & Tenant Guard)"]
        JWT["Stateless JWT Session\n(jose / HTTP-Only Cookie)"]
    end

    subgraph APILayer ["Backend API Route Handlers (/api/*)"]
        AuthAPI["/api/auth/*\n(login, signup, demo-login, me)"]
        InvoiceAPI["/api/invoices/*\n(CRUD, status, send, duplicate, remind)"]
        ClientAPI["/api/clients/*\n(CRUD & Financial Aggregates)"]
        StatsAPI["/api/dashboard/stats\n(Real-Time KPIs & Monthly Trends)"]
        PublicAPI["/api/public/invoices/*\n(Public Access & Payment Checkout)"]
        AiAPI["/api/ai/generate-invoice\n(NLP Prompt Parser)"]
        SettingsAPI["/api/settings\n(Branding & Defaults)"]
    end

    subgraph DataLayer ["Database & Persistence (Prisma ORM)"]
        PrismaClient["Prisma Client Singleton"]
        NeonDB[("Neon Serverless PostgreSQL\n(AWS us-east-2)")]
    end

    subgraph CoreEntities ["Domain Models & Relations"]
        User["User (Studio Profile)"]
        Client["Client (Contact & Company)"]
        Invoice["Invoice (Items, Status, Dates, Totals)"]
        InvoiceItem["InvoiceItem (Qty, Rate, Line Amount)"]
        InvoiceActivity["InvoiceActivity (Audit Trail Logs)"]
    end

    %% Connections
    ClientLayer --> SecurityLayer
    SecurityLayer --> APILayer
    APILayer --> PrismaClient
    PrismaClient --> NeonDB
    NeonDB --> CoreEntities

    %% Relations
    User -->|1:N| Client
    User -->|1:N| Invoice
    Client -->|1:N| Invoice
    Invoice -->|1:N| InvoiceItem
    Invoice -->|1:N| InvoiceActivity
```

---

## 🔄 Invoice Lifecycle & Payment Flow

```mermaid
sequenceDiagram
    autonumber
    actor Freelancer
    participant Studio as BillFlow Studio (App)
    participant API as Next.js API Routes
    participant DB as Neon PostgreSQL
    actor Client
    participant Portal as Public Portal (/i/[token])

    Freelancer->>Studio: 1. Creates invoice via Live Split Studio or AI Prompt
    Studio->>API: 2. POST /api/invoices (Calculates subtotal, tax %, discount)
    API->>DB: 3. Saves Invoice & Line Items, increments sequence
    Freelancer->>Studio: 4. Clicks "Send by Email" or "Copy Share Link"
    Studio->>API: 5. POST /api/invoices/[id]/send (Marks status as 'SENT')
    Freelancer->>Client: 6. Delivers public link (https://billflow.dev/i/token)
    Client->>Portal: 7. Opens public invoice link without logging in
    Portal->>API: 8. GET /api/public/invoices/[token] (Auto-records 'viewedAt' timestamp)
    Client->>Portal: 9. Enters Test Card / Wire Transfer & clicks "Pay Invoice"
    Portal->>API: 10. POST /api/public/invoices/[token] (Executes checkout simulation)
    API->>DB: 11. Transitions status to 'PAID', logs receipt & transaction reference
    Portal-->>Client: 12. Displays Confetti Celebration & Downloadable Receipt
    API-->>Studio: 13. Dashboard instantly updates Total Earned & Collection Rate!
```

---

## 🐘 Neon PostgreSQL Database Configuration

BillFlow is configured directly with **Neon Serverless PostgreSQL**:

```env
DATABASE_URL="postgresql://neondb_owner:npg_mBb4XYJQuRy0@ep-solitary-glade-aevlul63-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Database Migration & Seed Guide
- **Prisma Schema**: [`prisma/schema.prisma`](prisma/schema.prisma) (`provider = "postgresql"`)
- **SQL Migration DDL**: [`prisma/migrations/0_init/migration.sql`](prisma/migrations/0_init/migration.sql)
- **Comprehensive Seed Script**: [`prisma/seed.js`](prisma/seed.js)

To sync or re-seed your Neon database at any time:
```bash
# Push schema changes to Neon PostgreSQL
npx prisma db push

# Populate realistic demo clients, invoices, and activity logs
node prisma/seed.js
```

---

## 🌟 Key Features Breakdown

### 1. 💼 Dashboard Command Center & Financial Velocity
- **Real-Time Financial KPIs**: Total Collected / Earned, Outstanding (Pending), Overdue Amount, and Collection Rate percentage.
- **Interactive Revenue Chart**: Monthly Billed vs. Collected visual analytics over the last 6 months using Recharts.
- **Studio Cash Velocity Widget**: Capital collection progress bar, financial health indicator (*"Excellent"*, *"Good"*, *"Requires Attention"*), and 1-click batch overdue reminders.
- **Recent Activity Feed**: Real-time audit log of invoice creation, emails sent, client views, and received payments.

### 2. ⚡ Global Command Palette (`Cmd+K` / `Ctrl+K`)
- Interactive keyboard-driven command palette to search records, create invoices, add clients, switch dark/light themes, or navigate anywhere instantly.

### 3. 🖥️ Live Split-Screen Invoice Studio
- **Dual-Pane Live Sync**: Edit line items, quantities, hourly rates, client selections, taxes, discounts, and payment terms on the left pane while the **actual client invoice document dynamically re-renders on the right pane in real time**.
- **AI Prompt-to-Invoice Assistant**: Describe work in natural language (e.g. *"40 hours of frontend development at $95/hr and $250 server setup fee"*), and AI parses deliverables, rates, and due dates automatically.
- **Real-Time Overdue Engine**: Invoices past due date automatically evaluate as `overdue` without manual bookkeeping.

### 4. 💳 Public Client Portal & 3D Visual Checkout (`/i/[token]`)
- **No-Login Access**: Clients open secure shareable links directly without needing to sign up or log in.
- **Interactive 3D Credit Card Simulation**: Visual card with EMV chip, hologram, brand logo, and live masked card numbers.
- **Instant Receipt & Confetti Celebration**: Processing animation, instant status update to `PAID` in database, transaction reference generation, and print-ready receipts.

### 5. 👥 Client CRM Directory (`/clients`)
- Full CRUD for clients with aggregate financial statistics (*Total Billed, Total Paid, Outstanding*) and 1-click invoice creation.

### 6. ⚙️ Business Profile & Branding Settings (`/settings`)
- Business Name, Billing Email, Phone, Address, Tax ID, and **Logo Upload with live preview**.
- Invoicing defaults: Multi-currency selector (USD, EUR, GBP, CAD, AUD, INR, etc.), custom invoice prefix, default terms, and bank wire details.

---

## 🚀 Quick Start & Run Instructions

```bash
# 1. Install dependencies
npm install

# 2. Sync schema with Neon PostgreSQL
npx prisma db push

# 3. Seed demo data
node prisma/seed.js

# 4. Start production server
npm run build
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Account Credentials

| Field | Value |
|---|---|
| **Demo Email** | `demo@billflow.dev` |
| **Demo Password** | `password123` |
| **1-Click Demo** | Click the **"1-Click Demo"** button on the Landing Page or Login screen to log in immediately! |

### Sample Public Invoice Links
- **Sent (Pending Payment)**: `/i/demo-inv-0103-nexus`
- **Paid with Receipt**: `/i/demo-inv-0101-acme`
- **Overdue Invoice**: `/i/demo-inv-0104-quantum`
