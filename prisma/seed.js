const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for BillFlow...');

  // Clean existing demo data
  await prisma.invoiceActivity.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Create Demo User
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@billflow.dev',
      passwordHash: passwordHash,
      name: 'Alex Morgan',
      businessName: 'Studio Apex Design & Tech',
      businessEmail: 'billing@studioapex.design',
      businessPhone: '+1 (415) 555-0188',
      businessAddress: '742 Evergreen Terrace, Suite 400\nSan Francisco, CA 94107\nUnited States',
      taxId: 'US-EIN 94-8765432',
      currency: 'USD',
      currencySymbol: '$',
      invoicePrefix: 'INV-',
      nextInvoiceNumber: 108,
      defaultPaymentTerms: 'Payment is due within 14 calendar days of invoice date. Late payments may incur a 1.5% monthly fee.',
      defaultNotes: 'Thank you for partnering with Studio Apex! Please reach out to billing@studioapex.design if you have any questions.',
      defaultBankDetails: 'Bank: Silicon Valley Bank\nRouting / ABA: 121000358\nAccount: 9876543210\nSWIFT: SVBUS6S',
    },
  });

  console.log(`✅ Demo user created: ${demoUser.email} / password123`);

  // 2. Create Clients
  const clientAcme = await prisma.client.create({
    data: {
      userId: demoUser.id,
      name: 'Sarah Jenkins',
      email: 's.jenkins@acmeinnovations.com',
      company: 'Acme Innovations Inc.',
      address: '100 Montgomery St, Suite 1800\nSan Francisco, CA 94104',
      phone: '+1 (415) 555-0199',
      notes: 'Enterprise client. Net-14 payment terms. Primary contact for design sprints.',
    },
  });

  const clientHyper = await prisma.client.create({
    data: {
      userId: demoUser.id,
      name: 'Marcus Vance',
      email: 'marcus@hyperscale.io',
      company: 'HyperScale SaaS Ltd.',
      address: '500 Congress Ave, Floor 12\nAustin, TX 78701',
      phone: '+1 (512) 555-0143',
      notes: 'Series B cloud startup. Fast payer via credit card.',
    },
  });

  const clientNexus = await prisma.client.create({
    data: {
      userId: demoUser.id,
      name: 'Dr. Elena Rostova',
      email: 'elena@nexushealth.org',
      company: 'Nexus Health Systems',
      address: '75 Cambridge Pkwy\nBoston, MA 02142',
      phone: '+1 (617) 555-0182',
      notes: 'Healthcare provider. Requires itemized breakdown for billing department.',
    },
  });

  const clientQuantum = await prisma.client.create({
    data: {
      userId: demoUser.id,
      name: 'David Kim',
      email: 'david@quantumlabs.co',
      company: 'Quantum Creative Labs',
      address: '450 Lexington Ave, 4th Floor\nNew York, NY 10017',
      phone: '+1 (212) 555-0115',
      notes: 'Creative studio agency partner.',
    },
  });

  const clientVanguard = await prisma.client.create({
    data: {
      userId: demoUser.id,
      name: 'Chloe Bennett',
      email: 'accounts@vanguardlogistics.com',
      company: 'Vanguard Logistics',
      address: '333 W Wacker Dr, Suite 900\nChicago, IL 60606',
      phone: '+1 (312) 555-0177',
      notes: 'Global supply chain enterprise.',
    },
  });

  console.log('✅ 5 Clients created successfully');

  // Dates
  const now = new Date();
  const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const daysAhead = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  // 3. Create Invoices
  // Invoice 1: INV-0101 (Paid)
  const inv1 = await prisma.invoice.create({
    data: {
      userId: demoUser.id,
      clientId: clientAcme.id,
      invoiceNumber: 'INV-0101',
      shareToken: 'demo-inv-0101-acme',
      status: 'paid',
      issueDate: daysAgo(25),
      dueDate: daysAgo(11),
      currency: 'USD',
      currencySymbol: '$',
      subtotal: 4850,
      taxRate: 0,
      taxAmount: 0,
      discountType: 'percentage',
      discountValue: 0,
      discountAmount: 0,
      totalAmount: 4850,
      amountPaid: 4850,
      notes: 'Milestone 1 delivered and accepted. Thank you for your business!',
      paymentTerms: demoUser.defaultPaymentTerms,
      bankDetails: demoUser.defaultBankDetails,
      sentAt: daysAgo(24),
      viewedAt: daysAgo(24),
      paidAt: daysAgo(15),
      paymentMethod: 'card',
      paymentReference: 'ch_3N8kL2s8dF92',
      items: {
        create: [
          { description: 'Design System & Component Library in Figma', quantity: 1, unitRate: 2200, amount: 2200, order: 0 },
          { description: 'Full-stack Next.js Application Architecture Setup', quantity: 20, unitRate: 110, amount: 2200, order: 1 },
          { description: 'Responsive Mobile UI Optimization', quantity: 5, unitRate: 90, amount: 450, order: 2 },
        ],
      },
      activities: {
        create: [
          { type: 'created', description: 'Invoice INV-0101 created for Acme Innovations Inc.', createdAt: daysAgo(25) },
          { type: 'sent', description: 'Invoice sent via email to s.jenkins@acmeinnovations.com', createdAt: daysAgo(24) },
          { type: 'viewed', description: 'Client viewed invoice via public portal', createdAt: daysAgo(24) },
          { type: 'payment_received', description: 'Payment of $4,850.00 received via Credit Card (Ref: ch_3N8kL2s8dF92)', createdAt: daysAgo(15) },
        ],
      },
    },
  });

  // Invoice 2: INV-0102 (Paid)
  const inv2 = await prisma.invoice.create({
    data: {
      userId: demoUser.id,
      clientId: clientHyper.id,
      invoiceNumber: 'INV-0102',
      shareToken: 'demo-inv-0102-hyper',
      status: 'paid',
      issueDate: daysAgo(20),
      dueDate: daysAgo(6),
      currency: 'USD',
      currencySymbol: '$',
      subtotal: 7500,
      taxRate: 0,
      taxAmount: 0,
      discountType: 'percentage',
      discountValue: 4,
      discountAmount: 300,
      totalAmount: 7200,
      amountPaid: 7200,
      notes: 'API Integration & microservices sprint completed.',
      paymentTerms: demoUser.defaultPaymentTerms,
      bankDetails: demoUser.defaultBankDetails,
      sentAt: daysAgo(19),
      viewedAt: daysAgo(19),
      paidAt: daysAgo(8),
      paymentMethod: 'bank_transfer',
      paymentReference: 'WIRE-982104',
      items: {
        create: [
          { description: 'REST & GraphQL API Endpoints Development', quantity: 40, unitRate: 125, amount: 5000, order: 0 },
          { description: 'PostgreSQL Database Schema Optimization & Indexing', quantity: 15, unitRate: 140, amount: 2100, order: 1 },
          { description: 'Integration Test Suite & CI/CD Pipeline', quantity: 1, unitRate: 400, amount: 400, order: 2 },
        ],
      },
      activities: {
        create: [
          { type: 'created', description: 'Invoice INV-0102 created for HyperScale SaaS Ltd.', createdAt: daysAgo(20) },
          { type: 'sent', description: 'Invoice sent to marcus@hyperscale.io', createdAt: daysAgo(19) },
          { type: 'viewed', description: 'Client viewed invoice via public portal', createdAt: daysAgo(19) },
          { type: 'payment_received', description: 'Wire transfer payment of $7,200.00 confirmed (Ref: WIRE-982104)', createdAt: daysAgo(8) },
        ],
      },
    },
  });

  // Invoice 3: INV-0103 (Sent - Pending)
  const inv3 = await prisma.invoice.create({
    data: {
      userId: demoUser.id,
      clientId: clientNexus.id,
      invoiceNumber: 'INV-0103',
      shareToken: 'demo-inv-0103-nexus',
      status: 'sent',
      issueDate: daysAgo(5),
      dueDate: daysAhead(9),
      currency: 'USD',
      currencySymbol: '$',
      subtotal: 3450,
      taxRate: 0,
      taxAmount: 0,
      discountType: 'percentage',
      discountValue: 0,
      discountAmount: 0,
      totalAmount: 3450,
      amountPaid: 0,
      notes: 'HIPAA-compliant Telehealth UI/UX Redesign - Sprint 1.',
      paymentTerms: demoUser.defaultPaymentTerms,
      bankDetails: demoUser.defaultBankDetails,
      sentAt: daysAgo(4),
      viewedAt: daysAgo(2),
      items: {
        create: [
          { description: 'Patient Portal Dashboard UX Research & Wireframes', quantity: 18, unitRate: 125, amount: 2250, order: 0 },
          { description: 'Accessible Form Components & Design Tokens (WCAG AAA)', quantity: 8, unitRate: 150, amount: 1200, order: 1 },
        ],
      },
      activities: {
        create: [
          { type: 'created', description: 'Invoice INV-0103 created for Nexus Health Systems', createdAt: daysAgo(5) },
          { type: 'sent', description: 'Invoice sent to elena@nexushealth.org', createdAt: daysAgo(4) },
          { type: 'viewed', description: 'Client viewed invoice via public portal', createdAt: daysAgo(2) },
        ],
      },
    },
  });

  // Invoice 4: INV-0104 (Overdue - Past Due Date!)
  const inv4 = await prisma.invoice.create({
    data: {
      userId: demoUser.id,
      clientId: clientQuantum.id,
      invoiceNumber: 'INV-0104',
      shareToken: 'demo-inv-0104-quantum',
      status: 'overdue',
      issueDate: daysAgo(28),
      dueDate: daysAgo(10), // Overdue by 10 days!
      currency: 'USD',
      currencySymbol: '$',
      subtotal: 2900,
      taxRate: 0,
      taxAmount: 0,
      discountType: 'percentage',
      discountValue: 0,
      discountAmount: 0,
      totalAmount: 2900,
      amountPaid: 0,
      notes: '3D Interactive Landing Page & WebGL Shader effects.',
      paymentTerms: demoUser.defaultPaymentTerms,
      bankDetails: demoUser.defaultBankDetails,
      sentAt: daysAgo(27),
      viewedAt: daysAgo(20),
      items: {
        create: [
          { description: 'Three.js 3D Interactive Canvas Scene Development', quantity: 20, unitRate: 115, amount: 2300, order: 0 },
          { description: 'Custom GLSL Shaders & Particle System', quantity: 5, unitRate: 120, amount: 600, order: 1 },
        ],
      },
      activities: {
        create: [
          { type: 'created', description: 'Invoice INV-0104 created for Quantum Creative Labs', createdAt: daysAgo(28) },
          { type: 'sent', description: 'Invoice sent to david@quantumlabs.co', createdAt: daysAgo(27) },
          { type: 'viewed', description: 'Client opened invoice', createdAt: daysAgo(20) },
          { type: 'reminder_sent', description: 'Automated payment reminder sent to client', createdAt: daysAgo(3) },
        ],
      },
    },
  });

  // Invoice 5: INV-0105 (Sent)
  const inv5 = await prisma.invoice.create({
    data: {
      userId: demoUser.id,
      clientId: clientVanguard.id,
      invoiceNumber: 'INV-0105',
      shareToken: 'demo-inv-0105-vanguard',
      status: 'sent',
      issueDate: daysAgo(2),
      dueDate: daysAhead(12),
      currency: 'USD',
      currencySymbol: '$',
      subtotal: 5600,
      taxRate: 0,
      taxAmount: 0,
      discountType: 'percentage',
      discountValue: 0,
      discountAmount: 0,
      totalAmount: 5600,
      amountPaid: 0,
      notes: 'Real-time Fleet Tracking & Route Optimization Engine.',
      paymentTerms: demoUser.defaultPaymentTerms,
      bankDetails: demoUser.defaultBankDetails,
      sentAt: daysAgo(1),
      items: {
        create: [
          { description: 'WebSocket Real-time Fleet Telemetry Engine', quantity: 28, unitRate: 130, amount: 3640, order: 0 },
          { description: 'Mapbox Interactive Route Visualization Layers', quantity: 14, unitRate: 140, amount: 1960, order: 1 },
        ],
      },
      activities: {
        create: [
          { type: 'created', description: 'Invoice INV-0105 created for Vanguard Logistics', createdAt: daysAgo(2) },
          { type: 'sent', description: 'Invoice sent to accounts@vanguardlogistics.com', createdAt: daysAgo(1) },
        ],
      },
    },
  });

  // Invoice 6: INV-0106 (Draft)
  const inv6 = await prisma.invoice.create({
    data: {
      userId: demoUser.id,
      clientId: clientAcme.id,
      invoiceNumber: 'INV-0106',
      shareToken: 'demo-inv-0106-acme-draft',
      status: 'draft',
      issueDate: now,
      dueDate: daysAhead(14),
      currency: 'USD',
      currencySymbol: '$',
      subtotal: 1750,
      taxRate: 0,
      taxAmount: 0,
      discountType: 'percentage',
      discountValue: 0,
      discountAmount: 0,
      totalAmount: 1750,
      amountPaid: 0,
      notes: 'Sprint 2 Mobile App Wireframing and clickable prototypes.',
      paymentTerms: demoUser.defaultPaymentTerms,
      bankDetails: demoUser.defaultBankDetails,
      items: {
        create: [
          { description: 'iOS & Android Native Design Guidelines Prototyping', quantity: 14, unitRate: 125, amount: 1750, order: 0 },
        ],
      },
      activities: {
        create: [
          { type: 'created', description: 'Invoice INV-0106 draft created for Acme Innovations Inc.', createdAt: now },
        ],
      },
    },
  });

  // Invoice 7: INV-0107 (Paid)
  const inv7 = await prisma.invoice.create({
    data: {
      userId: demoUser.id,
      clientId: clientHyper.id,
      invoiceNumber: 'INV-0107',
      shareToken: 'demo-inv-0107-hyper-perf',
      status: 'paid',
      issueDate: daysAgo(45),
      dueDate: daysAgo(31),
      currency: 'USD',
      currencySymbol: '$',
      subtotal: 6500,
      taxRate: 0,
      taxAmount: 0,
      discountType: 'percentage',
      discountValue: 0,
      discountAmount: 0,
      totalAmount: 6500,
      amountPaid: 6500,
      notes: 'Initial performance auditing and serverless transition.',
      paymentTerms: demoUser.defaultPaymentTerms,
      bankDetails: demoUser.defaultBankDetails,
      sentAt: daysAgo(44),
      viewedAt: daysAgo(44),
      paidAt: daysAgo(35),
      paymentMethod: 'card',
      paymentReference: 'ch_3N6mP9k39xL',
      items: {
        create: [
          { description: 'Serverless Infrastructure Architecture & Cost Optimization', quantity: 30, unitRate: 150, amount: 4500, order: 0 },
          { description: 'Core Web Vitals Speed Optimization (99+ Lighthouse Score)', quantity: 1, unitRate: 2000, amount: 2000, order: 1 },
        ],
      },
      activities: {
        create: [
          { type: 'created', description: 'Invoice INV-0107 created for HyperScale SaaS Ltd.', createdAt: daysAgo(45) },
          { type: 'sent', description: 'Invoice sent to marcus@hyperscale.io', createdAt: daysAgo(44) },
          { type: 'viewed', description: 'Client viewed invoice', createdAt: daysAgo(44) },
          { type: 'payment_received', description: 'Payment of $6,500.00 received via Card (Ref: ch_3N6mP9k39xL)', createdAt: daysAgo(35) },
        ],
      },
    },
  });

  console.log('✅ 7 Invoices with line items and activity logs created');
  console.log('🚀 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
