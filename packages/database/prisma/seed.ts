import { PrismaClient, UserRole, ProductStatus, Prisma } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
}

async function cleanDatabase(): Promise<void> {
  console.log('Cleaning database...');
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.token.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shopSettings.deleteMany();
}

async function seedCategories(): Promise<Record<string, string>> {
  console.log('Seeding categories...');

  const categories = [
    { name: 'Mobile', slug: 'mobile', icon: 'Smartphone' },
    { name: 'Laptop', slug: 'laptop', icon: 'Laptop' },
    { name: 'Tablet', slug: 'tablet', icon: 'Tablet' },
    { name: 'Smartwatch', slug: 'smartwatch', icon: 'Watch' },
    { name: 'Headphones', slug: 'headphones', icon: 'Headphones' },
    { name: 'Accessories', slug: 'accessories', icon: 'Cable' },
  ] as const;

  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const created = await prisma.productCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
    console.log(`  ${cat.icon.padEnd(12)} ${cat.name}`);
  }

  return categoryMap;
}

async function seedBrands(): Promise<Record<string, string>> {
  console.log('Seeding brands...');

  const brands = [
    { name: 'Samsung', slug: 'samsung' },
    { name: 'Apple', slug: 'apple' },
    { name: 'Xiaomi', slug: 'xiaomi' },
    { name: 'OnePlus', slug: 'oneplus' },
    { name: 'Google', slug: 'google' },
    { name: 'Vivo', slug: 'vivo' },
    { name: 'Oppo', slug: 'oppo' },
    { name: 'Realme', slug: 'realme' },
    { name: 'Nokia', slug: 'nokia' },
    { name: 'Dell', slug: 'dell' },
    { name: 'HP', slug: 'hp' },
    { name: 'Lenovo', slug: 'lenovo' },
    { name: 'ASUS', slug: 'asus' },
    { name: 'Acer', slug: 'acer' },
    { name: 'MSI', slug: 'msi' },
    { name: 'Sony', slug: 'sony' },
    { name: 'Anker', slug: 'anker' },
  ] as const;

  const brandMap: Record<string, string> = {};

  for (const b of brands) {
    const created = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
    brandMap[b.slug] = created.id;
    console.log(`  ${created.name}`);
  }

  return brandMap;
}

async function seedUsers(): Promise<void> {
  console.log('Seeding users...');

  const users = [
    { email: 'admin@example.com', name: 'Billal Ahmed', role: UserRole.SUPER_ADMIN, phone: '+8801700000001' },
    { email: 'manager@example.com', name: 'Rahim Khan', role: UserRole.ADMIN, phone: '+8801700000002' },
    { email: 'staff@example.com', name: 'Karim Hossain', role: UserRole.ADMIN, phone: '+8801700000003' },
    { email: 'user@example.com', name: 'Fatima Begum', role: UserRole.USER, phone: '+8801700000004' },
    { email: 'customer@example.com', name: 'Jamal Uddin', role: UserRole.USER, phone: '+8801700000005' },
  ] as const;

  const password = hashPassword('Admin@123456');

  for (const u of users) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        passwordHash: password,
        role: u.role,
        emailVerified: true,
        phone: u.phone,
      },
    });
    console.log(`  ${u.role.padEnd(12)} ${created.email}`);
  }
}

async function seedShopSettings(): Promise<void> {
  console.log('Seeding shop settings...');
  await prisma.shopSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      shopName: 'TechHub BD',
      currency: 'BDT',
      currencySymbol: '৳',
      lowStockThreshold: 3,
    },
  });
  console.log('  Shop: TechHub BD | Currency: BDT (৳) | Low stock: ≤3');
}

async function seedCoupons(): Promise<void> {
  console.log('\nSeeding coupons...');

  const coupons = [
    { code: 'WELCOME10', description: '10% off for new customers', discountType: 'PERCENTAGE' as const, discountValue: 10, maxDiscount: 2000, minOrderAmount: 5000, usageLimit: 100 },
    { code: 'FLAT500', description: '৳500 off on orders above ৳10,000', discountType: 'FIXED' as const, discountValue: 500, minOrderAmount: 10000, usageLimit: 50 },
    { code: 'MEGA20', description: '20% off (max ৳5,000 discount)', discountType: 'PERCENTAGE' as const, discountValue: 20, maxDiscount: 5000, minOrderAmount: 15000, usageLimit: 30 },
    { code: 'FLAT1000', description: '৳1,000 off on orders above ৳25,000', discountType: 'FIXED' as const, discountValue: 1000, minOrderAmount: 25000, usageLimit: 20 },
    { code: 'TECH5', description: '5% off everything', discountType: 'PERCENTAGE' as const, discountValue: 5, maxDiscount: 1000, usageLimit: 200 },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        description: c.description,
        discountType: c.discountType,
        discountValue: new Prisma.Decimal(c.discountValue),
        maxDiscount: c.maxDiscount ? new Prisma.Decimal(c.maxDiscount) : null,
        minOrderAmount: c.minOrderAmount ? new Prisma.Decimal(c.minOrderAmount) : null,
        usageLimit: c.usageLimit,
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });
    const type = c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `৳${c.discountValue}`;
    console.log(`  ${c.code.padEnd(12)} ${type.padEnd(8)} ${c.description}`);
  }
}

async function seedProducts(
  categoryMap: Record<string, string>,
  brandMap: Record<string, string>,
): Promise<void> {
  console.log('\nSeeding products...');

  const mobile = categoryMap['mobile'] ?? '';
  const laptop = categoryMap['laptop'] ?? '';
  const smartwatch = categoryMap['smartwatch'] ?? '';
  const headphones = categoryMap['headphones'] ?? '';
  const accessories = categoryMap['accessories'] ?? '';

  const b = (slug: string) => brandMap[slug] ?? '';

  const products = [
    // ── Mobiles ──
    { name: 'Samsung Galaxy A55', slug: 'samsung-galaxy-a55', catId: mobile, catName: 'Mobile', brandId: b('samsung'), brandName: 'Samsung', model: 'Galaxy A55 5G', desc: '6.6" Super AMOLED, 128GB, 8GB RAM', buy: 25000, sell: 30000, compare: 33000, stock: 15, sku: 'SAM-A55-128' },
    { name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', catId: mobile, catName: 'Mobile', brandId: b('samsung'), brandName: 'Samsung', model: 'Galaxy S24 Ultra', desc: '6.8" Dynamic AMOLED, S Pen, 256GB', buy: 95000, sell: 115000, compare: 130000, stock: 5, sku: 'SAM-S24U-256' },
    { name: 'Samsung Galaxy M35', slug: 'samsung-galaxy-m35', catId: mobile, catName: 'Mobile', brandId: b('samsung'), brandName: 'Samsung', model: 'Galaxy M35 5G', desc: '6.6" Super AMOLED, 6000mAh battery', buy: 18000, sell: 22500, compare: null, stock: 20, sku: 'SAM-M35-128' },
    { name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', catId: mobile, catName: 'Mobile', brandId: b('apple'), brandName: 'Apple', model: '15 Pro Max 256GB', desc: 'A17 Pro chip, titanium, 48MP camera', buy: 120000, sell: 145000, compare: 165000, stock: 8, sku: 'APL-IP15PM-256' },
    { name: 'iPhone 15', slug: 'iphone-15', catId: mobile, catName: 'Mobile', brandId: b('apple'), brandName: 'Apple', model: '15 128GB', desc: 'A16 Bionic, 48MP main camera, USB-C', buy: 75000, sell: 92000, compare: 99000, stock: 12, sku: 'APL-IP15-128' },
    { name: 'iPhone 14', slug: 'iphone-14', catId: mobile, catName: 'Mobile', brandId: b('apple'), brandName: 'Apple', model: '14 128GB', desc: 'A15 Bionic, dual camera, 6.1" display', buy: 58000, sell: 72000, compare: 79000, stock: 18, sku: 'APL-IP14-128' },
    { name: 'Xiaomi 14 Ultra', slug: 'xiaomi-14-ultra', catId: mobile, catName: 'Mobile', brandId: b('xiaomi'), brandName: 'Xiaomi', model: '14 Ultra', desc: 'Leica cameras, Snapdragon 8 Gen 3', buy: 55000, sell: 68000, compare: null, stock: 10, sku: 'XMI-14U-256' },
    { name: 'Xiaomi Redmi Note 13 Pro', slug: 'xiaomi-redmi-note-13-pro', catId: mobile, catName: 'Mobile', brandId: b('xiaomi'), brandName: 'Xiaomi', model: 'Redmi Note 13 Pro', desc: '200MP camera, 120Hz AMOLED', buy: 18000, sell: 23000, compare: 26000, stock: 25, sku: 'XMI-RN13P-128' },
    { name: 'OnePlus 12', slug: 'oneplus-12', catId: mobile, catName: 'Mobile', brandId: b('oneplus'), brandName: 'OnePlus', model: '12', desc: 'Snapdragon 8 Gen 3, 100W charging', buy: 50000, sell: 62000, compare: null, stock: 7, sku: 'OP-12-256' },
    { name: 'Google Pixel 8 Pro', slug: 'google-pixel-8-pro', catId: mobile, catName: 'Mobile', brandId: b('google'), brandName: 'Google', model: 'Pixel 8 Pro', desc: 'Tensor G3, 7 years of updates', buy: 65000, sell: 80000, compare: 89000, stock: 3, sku: 'GGL-PX8P-128' },
    { name: 'Realme GT 5 Pro', slug: 'realme-gt5-pro', catId: mobile, catName: 'Mobile', brandId: b('realme'), brandName: 'Realme', model: 'GT 5 Pro', desc: 'Snapdragon 8 Gen 3, 144Hz display', buy: 35000, sell: 44000, compare: 49000, stock: 14, sku: 'RME-GT5P-256' },
    { name: 'Nokia G42 5G', slug: 'nokia-g42-5g', catId: mobile, catName: 'Mobile', brandId: b('nokia'), brandName: 'Nokia', model: 'G42 5G', desc: 'QuickFix design, 3 years updates', buy: 12000, sell: 15500, compare: null, stock: 30, sku: 'NOK-G42-128' },

    // ── Laptops ──
    { name: 'MacBook Air M3', slug: 'macbook-air-m3', catId: laptop, catName: 'Laptop', brandId: b('apple'), brandName: 'Apple', model: 'Air M3 15" 256GB', desc: 'M3 chip, 18hr battery, Liquid Retina', buy: 110000, sell: 135000, compare: 149000, stock: 6, sku: 'APL-MBA-M3-15' },
    { name: 'MacBook Pro 16" M3 Pro', slug: 'macbook-pro-16-m3-pro', catId: laptop, catName: 'Laptop', brandId: b('apple'), brandName: 'Apple', model: 'Pro 16" M3 Pro 512GB', desc: 'M3 Pro, 22hr battery, XDR display', buy: 200000, sell: 245000, compare: null, stock: 3, sku: 'APL-MBP16-M3P' },
    { name: 'Dell XPS 15', slug: 'dell-xps-15', catId: laptop, catName: 'Laptop', brandId: b('dell'), brandName: 'Dell', model: 'XPS 15 9530 i7', desc: 'Intel i7-13700H, RTX 4050, 16GB', buy: 95000, sell: 120000, compare: 135000, stock: 4, sku: 'DEL-XPS15-I7' },
    { name: 'Dell Inspiron 15', slug: 'dell-inspiron-15', catId: laptop, catName: 'Laptop', brandId: b('dell'), brandName: 'Dell', model: 'Inspiron 15 3530', desc: 'Intel i5-1335U, 8GB RAM, 512GB SSD', buy: 42000, sell: 55000, compare: null, stock: 22, sku: 'DEL-INS15-I5' },
    { name: 'HP Pavilion 15', slug: 'hp-pavilion-15', catId: laptop, catName: 'Laptop', brandId: b('hp'), brandName: 'HP', model: 'Pavilion 15-eg3000', desc: 'Intel i5, 16GB, 512GB SSD, FHD IPS', buy: 45000, sell: 58000, compare: 65000, stock: 18, sku: 'HP-PAV15-I5' },
    { name: 'HP Spectre x360', slug: 'hp-spectre-x360', catId: laptop, catName: 'Laptop', brandId: b('hp'), brandName: 'HP', model: 'Spectre x360 14" OLED', desc: '2-in-1, Intel i7, 16GB, 1TB', buy: 120000, sell: 148000, compare: null, stock: 2, sku: 'HP-SPX360-I7' },
    { name: 'Lenovo ThinkPad X1 Carbon', slug: 'lenovo-thinkpad-x1-carbon', catId: laptop, catName: 'Laptop', brandId: b('lenovo'), brandName: 'Lenovo', model: 'X1 Carbon Gen 11', desc: 'Intel i7, 16GB, 512GB, 2.8K OLED', buy: 130000, sell: 160000, compare: null, stock: 2, sku: 'LEN-X1C-G11' },
    { name: 'Lenovo IdeaPad Slim 5', slug: 'lenovo-ideapad-slim-5', catId: laptop, catName: 'Laptop', brandId: b('lenovo'), brandName: 'Lenovo', model: 'IdeaPad Slim 5 14"', desc: 'Ryzen 7, 16GB, 512GB, 2.2K IPS', buy: 48000, sell: 62000, compare: 69000, stock: 15, sku: 'LEN-IPS5-R7' },
    { name: 'ASUS ROG Strix G16', slug: 'asus-rog-strix-g16', catId: laptop, catName: 'Laptop', brandId: b('asus'), brandName: 'ASUS', model: 'ROG Strix G16 2024', desc: 'Intel i9, RTX 4070, 16GB, 240Hz', buy: 85000, sell: 105000, compare: 119000, stock: 5, sku: 'ASS-ROG-G16' },
    { name: 'ASUS VivoBook 15', slug: 'asus-vivobook-15', catId: laptop, catName: 'Laptop', brandId: b('asus'), brandName: 'ASUS', model: 'VivoBook 15 X1504', desc: 'Intel i5, 8GB, 512GB, FHD IPS', buy: 38000, sell: 48000, compare: null, stock: 25, sku: 'ASS-VB15-I5' },
    { name: 'MSI Modern 14', slug: 'msi-modern-14', catId: laptop, catName: 'Laptop', brandId: b('msi'), brandName: 'MSI', model: 'Modern 14 C13M', desc: 'Intel i5, 16GB, 512GB, ultra-thin', buy: 48000, sell: 60000, compare: null, stock: 9, sku: 'MSI-MOD14-I5' },

    // ── Smartwatches ──
    { name: 'Apple Watch Series 9', slug: 'apple-watch-series-9', catId: smartwatch, catName: 'Smartwatch', brandId: b('apple'), brandName: 'Apple', model: 'Series 9 45mm', desc: 'S9 chip, double tap gesture, always-on', buy: 32000, sell: 42000, compare: 47000, stock: 10, sku: 'APL-AW9-45' },
    { name: 'Samsung Galaxy Watch 6', slug: 'samsung-galaxy-watch-6', catId: smartwatch, catName: 'Smartwatch', brandId: b('samsung'), brandName: 'Samsung', model: 'Galaxy Watch 6 Classic', desc: 'Rotating bezel, BioActive sensor', buy: 22000, sell: 28000, compare: 32000, stock: 8, sku: 'SAM-GW6C-44' },

    // ── Headphones ──
    { name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', catId: headphones, catName: 'Headphones', brandId: b('sony'), brandName: 'Sony', model: 'WH-1000XM5', desc: 'Industry-leading ANC, 30hr battery', buy: 22000, sell: 29000, compare: 34000, stock: 12, sku: 'SNY-WH1000XM5' },
    { name: 'AirPods Pro 2', slug: 'airpods-pro-2', catId: headphones, catName: 'Headphones', brandId: b('apple'), brandName: 'Apple', model: 'AirPods Pro 2nd Gen', desc: 'H2 chip, Adaptive Transparency, USB-C', buy: 18000, sell: 24000, compare: 27000, stock: 20, sku: 'APL-APP2-USBC' },

    // ── Accessories ──
    { name: 'Anker 65W GaN Charger', slug: 'anker-65w-gan-charger', catId: accessories, catName: 'Accessories', brandId: b('anker'), brandName: 'Anker', model: '735 GaN Prime', desc: '65W 3-port, foldable plug, GaN II', buy: 3500, sell: 5200, compare: 6500, stock: 40, sku: 'ANK-735-65W' },
    { name: 'Samsung 25W Fast Charger', slug: 'samsung-25w-fast-charger', catId: accessories, catName: 'Accessories', brandId: b('samsung'), brandName: 'Samsung', model: 'EP-TA800', desc: '25W Super Fast Charging, USB-C', buy: 1500, sell: 2500, compare: null, stock: 50, sku: 'SAM-TA800-25W' },
  ] as const;

  const categoryCounts: Record<string, number> = {};

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        compareAtPrice: p.compare ? new Prisma.Decimal(p.compare) : null,
      },
      create: {
        name: p.name,
        slug: p.slug,
        categoryId: p.catId,
        brandId: p.brandId,
        model: p.model,
        description: p.desc,
        purchasePrice: new Prisma.Decimal(p.buy),
        sellingPrice: new Prisma.Decimal(p.sell),
        compareAtPrice: p.compare ? new Prisma.Decimal(p.compare) : null,
        stockQuantity: p.stock,
        sku: p.sku,
        status: p.stock > 0 ? ProductStatus.AVAILABLE : ProductStatus.OUT_OF_STOCK,
      },
    });

    if (p.stock > 0) {
      const existing = await prisma.stockMovement.findFirst({
        where: { product: { slug: p.slug }, reason: 'Initial stock' },
      });
      if (!existing) {
        const prod = await prisma.product.findUnique({ where: { slug: p.slug } });
        if (prod) {
          await prisma.stockMovement.create({
            data: { productId: prod.id, type: 'IN', quantity: p.stock, reason: 'Initial stock', performedBy: 'System (seed)' },
          });
        }
      }
    }

    categoryCounts[p.catName] = (categoryCounts[p.catName] ?? 0) + 1;

    const discount = p.compare ? ` (was ${formatBDT(p.compare)})` : '';
    const tag = p.stock === 0 ? ' [OUT]' : p.stock <= 3 ? ' [LOW]' : '';
    const profit = p.sell - p.buy;
    console.log(`  ${p.catName.padEnd(12)} ${p.brandName.padEnd(8)} ${p.name.padEnd(30)} ${formatBDT(p.sell).padStart(10)}${discount}  profit: ${formatBDT(profit).padStart(8)}  stock: ${String(p.stock).padStart(3)}${tag}`);
  }

  const summary = Object.entries(categoryCounts).map(([k, v]) => `${String(v)} ${k.toLowerCase()}s`).join(', ');
  console.log(`\n  Total: ${summary}`);
}

async function seedSales(): Promise<void> {
  console.log('\nSeeding sales...');

  const products = await prisma.product.findMany({
    where: { stockQuantity: { gt: 0 } },
    orderBy: { sellingPrice: 'desc' },
  });

  const salesData = [
    { customer: 'Rahim Ahmed', phone: '+8801712345678', items: [{ idx: 0, qty: 1 }], daysAgo: 0 },
    { customer: 'Karim Hossain', phone: '+8801798765432', items: [{ idx: 1, qty: 1 }], daysAgo: 0 },
    { customer: 'Fatima Begum', phone: '+8801655667788', items: [{ idx: 3, qty: 1 }, { idx: 8, qty: 1 }], daysAgo: 0 },
    { customer: 'Jamal Uddin', phone: '+8801611223344', items: [{ idx: 5, qty: 2 }], daysAgo: 1 },
    { customer: 'Nasreen Akter', phone: null, items: [{ idx: 2, qty: 1 }], daysAgo: 1 },
    { customer: 'Abul Kalam', phone: '+8801933445566', items: [{ idx: 7, qty: 1 }, { idx: 10, qty: 1 }], daysAgo: 2 },
    { customer: null, phone: null, items: [{ idx: 4, qty: 1 }], daysAgo: 2 },
    { customer: 'Sumon Mia', phone: '+8801866778899', items: [{ idx: 6, qty: 1 }], daysAgo: 3 },
    { customer: 'Rima Sultana', phone: '+8801744556677', items: [{ idx: 9, qty: 1 }], daysAgo: 5 },
    { customer: 'Hassan Ali', phone: '+8801522334455', items: [{ idx: 11, qty: 1 }, { idx: 12, qty: 2 }], daysAgo: 7 },
  ];

  const now = new Date();

  for (let i = 0; i < salesData.length; i++) {
    const sale = salesData[i];
    if (!sale) continue;

    let totalAmount = new Prisma.Decimal(0);
    let totalProfit = new Prisma.Decimal(0);

    const itemsToCreate: {
      productId: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      purchasePrice: Prisma.Decimal;
      profit: Prisma.Decimal;
    }[] = [];

    for (const item of sale.items) {
      const product = products[item.idx];
      if (!product) continue;

      const profit = product.sellingPrice.sub(product.purchasePrice).mul(item.qty);
      itemsToCreate.push({
        productId: product.id,
        quantity: item.qty,
        unitPrice: product.sellingPrice,
        purchasePrice: product.purchasePrice,
        profit,
      });
      totalAmount = totalAmount.add(product.sellingPrice.mul(item.qty));
      totalProfit = totalProfit.add(profit);
    }

    const saleDate = new Date(now);
    saleDate.setDate(saleDate.getDate() - sale.daysAgo);
    const dateStr = `${String(saleDate.getFullYear())}${String(saleDate.getMonth() + 1).padStart(2, '0')}${String(saleDate.getDate()).padStart(2, '0')}`;
    const invoiceNumber = `INV-${dateStr}-${String(i + 1).padStart(3, '0')}`;

    const existingSale = await prisma.sale.findUnique({ where: { invoiceNumber } });
    if (existingSale) {
      console.log(`  ${invoiceNumber}  (already exists, skipping)`);
      continue;
    }

    const created = await prisma.sale.create({
      data: {
        invoiceNumber,
        customerName: sale.customer,
        customerPhone: sale.phone,
        totalAmount,
        totalProfit,
        saleDate,
        items: { create: itemsToCreate },
      },
    });

    for (const item of itemsToCreate) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'OUT',
          quantity: item.quantity,
          reason: `Sale ${invoiceNumber}`,
          performedBy: 'System (seed)',
        },
      });
    }

    await prisma.product.updateMany({
      where: { stockQuantity: { lte: 0 } },
      data: { status: ProductStatus.OUT_OF_STOCK },
    });

    const customerDisplay = sale.customer ?? 'Walk-in customer';
    console.log(`  ${created.invoiceNumber}  ${formatBDT(Number(totalAmount)).padStart(12)}  ${customerDisplay}  (${String(sale.daysAgo)}d ago)`);
  }
}

async function main(): Promise<void> {
  const shouldClean = process.argv.includes('--clean');

  console.log('╔══════════════════════════════════════╗');
  console.log('║     TechHub BD — Database Seeder     ║');
  console.log('╚══════════════════════════════════════╝\n');

  if (shouldClean) {
    await cleanDatabase();
    console.log('');
  }

  await seedUsers();
  console.log('');
  await seedShopSettings();
  console.log('');
  const categoryMap = await seedCategories();
  console.log('');
  const brandMap = await seedBrands();
  await seedProducts(categoryMap, brandMap);
  await seedCoupons();
  await seedSales();

  const [users, categories, brands, products, coupons, sales, movements, orders, payments, lowStock, outOfStock] = await Promise.all([
    prisma.user.count(),
    prisma.productCategory.count(),
    prisma.brand.count(),
    prisma.product.count(),
    prisma.coupon.count(),
    prisma.sale.count(),
    prisma.stockMovement.count(),
    prisma.order.count(),
    prisma.payment.count(),
    prisma.product.count({ where: { stockQuantity: { gt: 0, lte: 3 } } }),
    prisma.product.count({ where: { stockQuantity: { lte: 0 } } }),
  ]);

  const totalRevenue = await prisma.sale.aggregate({ _sum: { totalAmount: true } });
  const totalProfit = await prisma.sale.aggregate({ _sum: { totalProfit: true } });
  const discountedProducts = await prisma.product.count({ where: { compareAtPrice: { not: null } } });

  console.log('\n╔══════════════════════════════════════╗');
  console.log('║           Seed Summary               ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  Users:           ${String(users).padStart(16)} ║`);
  console.log(`║  Categories:      ${String(categories).padStart(16)} ║`);
  console.log(`║  Brands:          ${String(brands).padStart(16)} ║`);
  console.log(`║  Products:        ${String(products).padStart(16)} ║`);
  console.log(`║  With Offers:     ${String(discountedProducts).padStart(16)} ║`);
  console.log(`║  Coupons:         ${String(coupons).padStart(16)} ║`);
  console.log(`║  Sales:           ${String(sales).padStart(16)} ║`);
  console.log(`║  Orders:          ${String(orders).padStart(16)} ║`);
  console.log(`║  Payments:        ${String(payments).padStart(16)} ║`);
  console.log(`║  Stock Movements: ${String(movements).padStart(16)} ║`);
  console.log(`║  Low Stock:       ${String(lowStock).padStart(16)} ║`);
  console.log(`║  Out of Stock:    ${String(outOfStock).padStart(16)} ║`);
  console.log(`║  Total Revenue:   ${formatBDT(Number(totalRevenue._sum.totalAmount ?? 0)).padStart(16)} ║`);
  console.log(`║  Total Profit:    ${formatBDT(Number(totalProfit._sum.totalProfit ?? 0)).padStart(16)} ║`);
  console.log('╠══════════════════════════════════════╣');
  console.log('║  Credentials:                        ║');
  console.log('║  admin@example.com   / Admin@123456  ║');
  console.log('║  manager@example.com / Admin@123456  ║');
  console.log('║  staff@example.com   / Admin@123456  ║');
  console.log('║  user@example.com    / Admin@123456  ║');
  console.log('╠══════════════════════════════════════╣');
  console.log('║  Coupons: WELCOME10, FLAT500, MEGA20 ║');
  console.log('║           FLAT1000, TECH5            ║');
  console.log('╚══════════════════════════════════════╝');
}

main()
  .catch((error: unknown) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
