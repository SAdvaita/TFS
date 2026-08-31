import prisma from './client.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding TFS database...');

  // 1. Create Default Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@truefiresolution.com' },
    create: {
      email: 'admin@truefiresolution.com',
      passwordHash,
      name: 'TFS Admin',
      role: 'ADMIN',
    },
    update: {
      passwordHash,
    },
  });

  // 2. Default Company Settings
  await prisma.companySettings.upsert({
    where: { id: 'default_settings' },
    create: {
      id: 'default_settings',
      companyName: 'TRUE FIRE SOLUTION',
      tagline: 'FIRE & SAFETY',
      street: 'No.6/166, GANESH AVENUE 8TH STREET',
      area: 'SAKTHI NAGAR, PORUR',
      city: 'CHENNAI',
      pincode: '600116',
      state: 'TAMILNADU',
      country: 'INDIA',
      mobile: '+91 94448 99628',
      email: 'truefiresolution2025@gmail.com',
      signatureName: 'SURESH S',

      bankName: 'State Bank Of India',
      branch: 'Alapakkam Branch, Valasaravakkam, Chennai – 600087',
      accountName: 'True Fire Solution',
      accountNumber: '43797963102',
      ifsc: 'SBIN0016332',

      invoiceStartSeq: 1,
      invoicePrefix: '',
      dateFormat: 'DD.MM.YYYY',
      termsConditions: '1. Payments 100% in Advance\n2. Delivery against your confirmation\n3. Cheque in favor of "TRUE FIRE SOLUTION"\n4. Warranty as per norms*',
      taxEnabled: false,
      taxRate: 18.0,
    },
    update: {},
  });

  // Initialize Invoice Sequence (Starts at 0 or 553 if desired)
  await prisma.invoiceSequence.upsert({
    where: { id: 'invoice_sequence' },
    create: { id: 'invoice_sequence', lastNumber: 0 },
    update: {},
  });

  // 3. Product Library (Reusable standard products)
  const products = [
    {
      name: 'ABC – 5Kg',
      capacity: '5Kg',
      description: 'STORE PRESURE DRY CHEMICAL POWDER, IT CONSISTS OF MONO AMONIUM PHOSPHET, ALONG WITH NITROGEN GAS, WORKS ON ALL CLASSES OF FIRE ~ REFILL',
      defaultRefillingPrice: 900,
      defaultNewPrice: 2200,
    },
    {
      name: 'ABC – 2Kg',
      capacity: '2Kg',
      description: 'STORE PRESURE DRY CHEMICAL POWDER, IT CONSISTS OF MONO AMONIUM PHOSPHET, ALONG WITH NITROGEN GAS, WORKS ON ALL CLASSES OF FIRE ~ REFILL',
      defaultRefillingPrice: 500,
      defaultNewPrice: 1400,
    },
    {
      name: 'ABC – 4Kg',
      capacity: '4Kg',
      description: 'STORE PRESURE DRY CHEMICAL POWDER, IT CONSISTS OF MONO AMONIUM PHOSPHET, ALONG WITH NITROGEN GAS, WORKS ON ALL CLASSES OF FIRE ~ REFILL',
      defaultRefillingPrice: 750,
      defaultNewPrice: 1850,
    },
    {
      name: 'ABC – 6Kg',
      capacity: '6Kg',
      description: 'STORE PRESURE DRY CHEMICAL POWDER, IT CONSISTS OF MONO AMONIUM PHOSPHET, ALONG WITH NITROGEN GAS, WORKS ON ALL CLASSES OF FIRE ~ REFILL',
      defaultRefillingPrice: 1100,
      defaultNewPrice: 2600,
    },
    {
      name: 'ABC – 9Kg',
      capacity: '9Kg',
      description: 'STORE PRESURE DRY CHEMICAL POWDER, IT CONSISTS OF MONO AMONIUM PHOSPHET, ALONG WITH NITROGEN GAS, WORKS ON ALL CLASSES OF FIRE ~ REFILL',
      defaultRefillingPrice: 1500,
      defaultNewPrice: 3400,
    },
    {
      name: 'CO2 – 2Kg',
      capacity: '2Kg',
      description: 'CARBON DIOXIDE GAS TYPE FIRE EXTINGUISHER, SUITABLE FOR CLASS B & C ELECTRICAL FIRES ~ REFILL',
      defaultRefillingPrice: 850,
      defaultNewPrice: 3200,
    },
    {
      name: 'CO2 – 4.5Kg',
      capacity: '4.5Kg',
      description: 'CARBON DIOXIDE GAS TYPE FIRE EXTINGUISHER, SUITABLE FOR CLASS B & C ELECTRICAL FIRES ~ REFILL',
      defaultRefillingPrice: 1400,
      defaultNewPrice: 4800,
    },
    {
      name: 'Water CO2 – 9Ltr',
      capacity: '9Ltr',
      description: 'WATER CO2 GAS CARTRIDGE TYPE FIRE EXTINGUISHER SUITABLE FOR CLASS A FIRES ~ REFILL',
      defaultRefillingPrice: 700,
      defaultNewPrice: 2200,
    },
    {
      name: 'Mechanical Foam – 9Ltr',
      capacity: '9Ltr',
      description: 'AFFF MECHANICAL FOAM TYPE FIRE EXTINGUISHER FOR CLASS A & B FLAMMABLE LIQUID FIRES ~ REFILL',
      defaultRefillingPrice: 850,
      defaultNewPrice: 2500,
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }

  // 4. Sample Customer: DEVAN SWEETS (from Reference Invoice)
  let devanCustomer = await prisma.customer.findFirst({ where: { name: 'DEVAN SWEETS' } });
  if (!devanCustomer) {
    devanCustomer = await prisma.customer.create({
      data: {
        name: 'DEVAN SWEETS',
        area: 'VANAGARAM',
        city: 'CHENNAI',
        phone: '+91 98400 12345',
        contactPerson: 'Manager',
        email: 'devansweets@gmail.com',
      },
    });
  }

  // 5. Sample License for Devan Sweets
  const existingLicense = await prisma.license.findFirst({ where: { customerId: devanCustomer.id } });
  if (!existingLicense) {
    await prisma.license.create({
      data: {
        customerId: devanCustomer.id,
        licenseType: 'Fire Safety NOC / License',
        licenseNumber: 'FS/CHN/2025/1104',
        issueDate: '15.01.2025',
        expiryDate: '14.01.2026',
        rawExpiryDate: new Date('2026-01-14'),
        status: 'ACTIVE',
        notes: 'Annual fire safety renewal certificate',
      },
    });
  }

  console.log('TFS Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
