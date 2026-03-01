import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import cors from 'cors';
import os from 'os';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// Get your keys from https://www.billplz.com/enterprise/settings
// Use sandbox first: https://billplz-staging.herokuapp.com
// ─────────────────────────────────────────────────────────────────────────────
const IS_SANDBOX         = process.env.BILLPLZ_SANDBOX !== 'false'; // true by default — safe
const BILLPLZ_API_KEY    = process.env.BILLPLZ_API_KEY    || 'your-billplz-api-key';
const BILLPLZ_COLLECTION = process.env.BILLPLZ_COLLECTION || 'your-collection-id';
const BILLPLZ_X_SIG      = process.env.BILLPLZ_X_SIG      || 'your-x-signature-key';
const BILLPLZ_URL        = IS_SANDBOX
  ? 'https://billplz-staging.herokuapp.com/api/v3'
  : 'https://www.billplz.com/api/v3';

const APP_URL            = process.env.APP_URL || 'http://localhost:3000';
const COMMISSION         = 0.10;   // 10% platform cut
const DELIVERY_FEE       = 8.00;   // RM8 per vendor if threshold not met

// ─────────────────────────────────────────────────────────────────────────────
// AUTO-DETECT LOCAL IP
// ─────────────────────────────────────────────────────────────────────────────
function getLocalIP(): string {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const i of ifaces || []) {
      if (i.family === 'IPv4' && !i.internal) return i.address;
    }
  }
  return 'localhost';
}

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE
// ─────────────────────────────────────────────────────────────────────────────
const db = new Database('sapotlokal.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS vendors (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    name                    TEXT NOT NULL,
    category                TEXT,
    halal_status            INTEGER DEFAULT 0,
    latitude                REAL,
    longitude               REAL,
    address                 TEXT,
    image_url               TEXT,
    free_delivery_threshold REAL,
    shared_pool             INTEGER DEFAULT 0,
    notif_radius_km         INTEGER DEFAULT 10,
    subscribed              INTEGER DEFAULT 0,
    subscription_ends       TEXT,
    -- Payout bank details (vendor fills in during onboarding)
    bank_account_name       TEXT,
    bank_account_no         TEXT,
    bank_code               TEXT,
    created_at              TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS listings (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id       INTEGER NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    original_price  REAL,
    deal_price      REAL NOT NULL,
    student_price   REAL,
    end_time        TEXT,
    qty             INTEGER,
    claimed         INTEGER DEFAULT 0,
    type            TEXT DEFAULT 'surplus',
    halal_status    INTEGER DEFAULT 0,
    reheat_method   TEXT DEFAULT 'none',
    image_url       TEXT,
    category        TEXT DEFAULT 'Other',
    is_active       INTEGER DEFAULT 1,
    created_at      TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(vendor_id) REFERENCES vendors(id)
  );

  -- One order = one vendor's items from one checkout
  CREATE TABLE IF NOT EXISTS orders (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id         INTEGER NOT NULL,
    buyer_name        TEXT,
    buyer_email       TEXT NOT NULL,
    buyer_phone       TEXT,
    amount_paid       REAL NOT NULL,   -- total buyer paid (RM)
    commission_rm     REAL NOT NULL,   -- 10% kept by Sapot Lokal
    vendor_payout_rm  REAL NOT NULL,   -- 90% sent to vendor
    delivery_fee      REAL DEFAULT 0,
    delivery_mode     TEXT DEFAULT 'pickup',
    status            TEXT DEFAULT 'pending',
    -- Billplz bill (buyer pays this)
    billplz_bill_id   TEXT,
    billplz_bill_url  TEXT,
    paid_at           TEXT,
    -- Billplz Payment Order (vendor receives this)
    payout_id         TEXT,
    payout_status     TEXT DEFAULT 'pending',
    payout_sent_at    TEXT,
    -- Pickup
    pickup_code       TEXT,
    pickup_confirmed  INTEGER DEFAULT 0,
    created_at        TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(vendor_id) REFERENCES vendors(id)
  );

  -- Links orders to individual listing items
  CREATE TABLE IF NOT EXISTS order_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    INTEGER NOT NULL,
    listing_id  INTEGER NOT NULL,
    price       REAL NOT NULL,
    FOREIGN KEY(order_id)  REFERENCES orders(id),
    FOREIGN KEY(listing_id) REFERENCES listings(id)
  );

  -- Stores the Billplz payout collection ID (created once)
  CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed demo data if empty
const vc = db.prepare('SELECT count(*) as c FROM vendors').get() as {c:number};
if (vc.c === 0) {
  const iv = db.prepare(`INSERT INTO vendors (name,category,halal_status,latitude,longitude,address,free_delivery_threshold,subscribed) VALUES (?,?,?,?,?,?,?,1)`);
  iv.run('Warung Mak Teh','Hawker',1,3.0696,101.5989,'Puchong SS14',20);
  iv.run('Bakeri Fariz','Bakery',1,3.0712,101.6003,'Puchong IOI',30);
  iv.run('Gerai Pak Din','Hawker',1,3.0720,101.6010,'Puchong Perdana',25);
}

// ─────────────────────────────────────────────────────────────────────────────
// BILLPLZ HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const b64Key = Buffer.from(`${BILLPLZ_API_KEY}:`).toString('base64');
const bpHeaders = {
  'Authorization': `Basic ${b64Key}`,
  'Content-Type':  'application/x-www-form-urlencoded',
};

// Create a bill — buyer gets redirected to this URL to pay via TNG/FPX/card
async function createBill(p: {
  amount: number; name: string; email: string; phone?: string;
  desc: string; orderId: number;
}): Promise<{id: string; url: string}> {
  const body = new URLSearchParams({
    collection_id:    BILLPLZ_COLLECTION,
    email:            p.email,
    mobile:           p.phone || '',
    name:             p.name,
    amount:           String(Math.round(p.amount * 100)), // cents
    description:      p.desc.slice(0, 200),
    callback_url:     `${APP_URL}/api/payment/callback`,
    redirect_url:     `${APP_URL}/payment/done?order=${p.orderId}`,
    reference_1_label:'Order',
    reference_1:      String(p.orderId),
  });

  const res  = await fetch(`${BILLPLZ_URL}/bills`, {method:'POST', headers:bpHeaders, body:body.toString()});
  const json = await res.json() as any;
  if (!res.ok) throw new Error(`Billplz bill error: ${JSON.stringify(json)}`);
  return {id: json.id, url: json.url};
}

// Send money to vendor bank — via Billplz Payment Order (DuitNow)
async function sendPayout(p: {
  orderId: number; vendorName: string;
  bankAccountNo: string; bankCode: string;
  amount: number; collectionId: string;
}): Promise<string> {
  const body = new URLSearchParams({
    collection_id:   p.collectionId,
    bank_code:       p.bankCode,
    bank_account_no: p.bankAccountNo,
    name:            p.vendorName,
    description:     `Sapot Lokal payout — Order #${p.orderId}`,
    total:           String(Math.round(p.amount * 100)), // cents
    email:           '',
    mobile:          '',
    reference_id:    `sapot-order-${p.orderId}`,
  });

  const res  = await fetch(`${BILLPLZ_URL}/payment_orders`, {method:'POST', headers:bpHeaders, body:body.toString()});
  const json = await res.json() as any;
  if (!res.ok) throw new Error(`Billplz payout error: ${JSON.stringify(json)}`);
  return json.id;
}

// Get or create the payout collection (done once, stored in DB)
async function getPayoutCollection(): Promise<string> {
  const row = db.prepare("SELECT value FROM meta WHERE key='payout_collection_id'").get() as any;
  if (row?.value) return row.value;

  const body = new URLSearchParams({title: 'Sapot Lokal Vendor Payouts'});
  const res  = await fetch(`${BILLPLZ_URL}/payment_orders/collection`, {method:'POST', headers:bpHeaders, body:body.toString()});
  const json = await res.json() as any;
  if (!res.ok) throw new Error(`Billplz payout collection error: ${JSON.stringify(json)}`);

  db.prepare("INSERT OR REPLACE INTO meta(key,value) VALUES('payout_collection_id',?)").run(json.id);
  return json.id;
}

// Verify Billplz X-Signature — prevents fake webhook calls
function verifyXSignature(params: Record<string,string>, signature: string): boolean {
  const source = Object.keys(params)
    .filter(k => k !== 'x_signature')
    .sort()
    .map(k => `${k}${params[k]}`)
    .join('|');
  const expected = crypto.createHmac('sha256', BILLPLZ_X_SIG).update(source).digest('hex');
  return expected === signature;
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE UPLOADS
// ─────────────────────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, {recursive:true});

const upload = multer({
  storage: multer.diskStorage({
    destination: (_,__,cb) => cb(null, uploadDir),
    filename:    (_,file,cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`),
  }),
  limits: {fileSize: 5 * 1024 * 1024},
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPRESS APP
// ─────────────────────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  app.use('/uploads', express.static(uploadDir));

  // ── LISTINGS ────────────────────────────────────────────────────────────────
  app.get('/api/listings', (req, res) => {
    const {lat, lon, halalFilter, type, search} = req.query;
    const uLat = parseFloat(lat as string);
    const uLon = parseFloat(lon as string);

    const rows = db.prepare(`
      SELECT l.*, v.name AS vendor_name, v.free_delivery_threshold, v.shared_pool, v.latitude, v.longitude
      FROM listings l JOIN vendors v ON l.vendor_id = v.id
      WHERE l.is_active=1 AND v.subscribed=1
    `).all() as any[];

    const haversine = (la1:number,lo1:number,la2:number,lo2:number) => {
      const R=6371,dL=(la2-la1)*Math.PI/180,dO=(lo2-lo1)*Math.PI/180;
      const a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;
      return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
    };

    res.json(
      rows
        .map(l => ({...l, distance: (uLat&&uLon) ? haversine(uLat,uLon,l.latitude,l.longitude) : null}))
        .filter(l => {
          if (halalFilter==='halal_cert'   && l.halal_status!==1) return false;
          if (halalFilter==='muslim_owned' && l.halal_status!==2) return false;
          if (halalFilter==='halal_any'    && l.halal_status===0) return false;
          if (type && type!=='all' && l.type!==type) return false;
          if (search) {
            const s=(search as string).toLowerCase();
            if (!l.title?.toLowerCase().includes(s) && !l.vendor_name?.toLowerCase().includes(s)) return false;
          }
          return true;
        })
        .sort((a,b) => (a.distance??999)-(b.distance??999))
    );
  });

  app.post('/api/listings', upload.single('image'), (req:any, res) => {
    const {vendorId,title,description,originalPrice,dealPrice,studentPrice,
           endTime,qty,type,halalStatus,reheatMethod,category} = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
    try {
      const r = db.prepare(`
        INSERT INTO listings (vendor_id,title,description,original_price,deal_price,student_price,
          end_time,qty,type,halal_status,reheat_method,image_url,category)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).run(vendorId,title,description,originalPrice,dealPrice,studentPrice||null,
             endTime,qty||null,type||'surplus',halalStatus||0,reheatMethod||'none',imageUrl,category||'Other');
      res.json({id: r.lastInsertRowid});
    } catch(e) { res.status(500).json({error:'Failed to create listing'}); }
  });

  app.post('/api/upload', upload.single('image'), (req:any, res) => {
    if (!req.file) return res.status(400).json({error:'No file'});
    res.json({url:`/uploads/${req.file.filename}`});
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CHECKOUT  →  creates Billplz bill  →  returns payment URL to frontend
  //
  // POST /api/checkout
  // Body: {
  //   vendorId, items: [{listingId, price}],
  //   buyerName, buyerEmail, buyerPhone,
  //   deliveryMode: 'pickup' | 'delivery',
  //   deliveryFee: number   ← 0 if free
  // }
  // ─────────────────────────────────────────────────────────────────────────
  app.post('/api/checkout', async (req, res) => {
    const {vendorId, items, buyerName, buyerEmail, buyerPhone, deliveryMode, deliveryFee} = req.body;

    if (!items?.length)   return res.status(400).json({error:'No items'});
    if (!buyerEmail)      return res.status(400).json({error:'Email required for receipt'});
    if (!vendorId)        return res.status(400).json({error:'Vendor ID required'});

    try {
      const vendor = db.prepare('SELECT * FROM vendors WHERE id=?').get(vendorId) as any;
      if (!vendor) return res.status(404).json({error:'Vendor not found'});

      // Sum up items
      const itemsTotal   = items.reduce((s:number, i:any) => s + parseFloat(i.price), 0);
      const delivery     = parseFloat(deliveryFee) || 0;
      const amountPaid   = parseFloat((itemsTotal + delivery).toFixed(2));
      const commissionRM = parseFloat((amountPaid * COMMISSION).toFixed(2));
      const vendorPayout = parseFloat((amountPaid - commissionRM - delivery).toFixed(2)); // delivery cost absorbed separately
      const pickupCode   = Math.random().toString(36).slice(2,8).toUpperCase();

      // 1️⃣  Insert order as 'pending'
      const orderRes = db.prepare(`
        INSERT INTO orders
          (vendor_id, buyer_name, buyer_email, buyer_phone,
           amount_paid, commission_rm, vendor_payout_rm,
           delivery_fee, delivery_mode, pickup_code, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,'pending')
      `).run(vendorId, buyerName||'Buyer', buyerEmail, buyerPhone||'',
             amountPaid, commissionRM, vendorPayout,
             delivery, deliveryMode||'pickup', pickupCode);

      const orderId = orderRes.lastInsertRowid as number;

      // 2️⃣  Link items to order
      const insertItem = db.prepare('INSERT INTO order_items(order_id,listing_id,price) VALUES (?,?,?)');
      for (const item of items) {
        insertItem.run(orderId, item.listingId, item.price);
      }

      // 3️⃣  Create Billplz bill — buyer pays here via TNG / FPX / card
      const itemNames  = items.map((i:any) => i.title || 'Item').join(', ');
      const bill = await createBill({
        amount:  amountPaid,
        name:    buyerName || 'Buyer',
        email:   buyerEmail,
        phone:   buyerPhone,
        desc:    `Sapot Lokal: ${itemNames} (${vendor.name})`,
        orderId,
      });

      // 4️⃣  Save bill reference
      db.prepare('UPDATE orders SET billplz_bill_id=?, billplz_bill_url=? WHERE id=?')
        .run(bill.id, bill.url, orderId);

      // Return payment URL — frontend redirects buyer here
      res.json({
        orderId,
        pickupCode,
        amountPaid,
        commissionRM,
        vendorPayout,
        paymentUrl: bill.url,   // ← OPEN THIS IN BROWSER / WEBVIEW
        summary: {
          itemsTotal: itemsTotal.toFixed(2),
          deliveryFee: delivery.toFixed(2),
          commission: `${(COMMISSION*100).toFixed(0)}%`,
          vendorReceives: vendorPayout.toFixed(2),
          sapotKeeps: commissionRM.toFixed(2),
        }
      });

    } catch(e:any) {
      console.error('Checkout error:', e.message);
      res.status(500).json({error: e.message || 'Checkout failed'});
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BILLPLZ PAYMENT CALLBACK  ←  Billplz POSTs here when buyer pays
  //
  // This is the most critical route — it:
  //   1. Verifies the X-Signature (security)
  //   2. Marks order as paid
  //   3. Immediately triggers vendor payout via Payment Order API
  //
  // In production: set this URL in your Billplz collection settings
  // ─────────────────────────────────────────────────────────────────────────
  app.post('/api/payment/callback', async (req, res) => {
    const params = req.body as Record<string,string>;

    // 🔒 Verify X-Signature — reject anything that doesn't come from Billplz
    if (BILLPLZ_X_SIG !== 'your-x-signature-key') {
      if (!verifyXSignature(params, params.x_signature || '')) {
        console.warn('⛔ Invalid Billplz X-Signature — callback rejected');
        return res.status(400).send('Invalid signature');
      }
    }

    const billId = params.id;
    const paid   = params.paid === 'true';
    const paidAt = params.paid_at;

    if (!paid) {
      db.prepare("UPDATE orders SET status='failed' WHERE billplz_bill_id=?").run(billId);
      console.log(`❌ Bill ${billId} — payment failed or cancelled`);
      return res.send('OK');
    }

    // Mark as paid
    db.prepare("UPDATE orders SET status='paid', paid_at=? WHERE billplz_bill_id=?")
      .run(paidAt, billId);

    const order  = db.prepare('SELECT * FROM orders WHERE billplz_bill_id=?').get(billId) as any;
    if (!order) return res.send('OK');

    const vendor = db.prepare('SELECT * FROM vendors WHERE id=?').get(order.vendor_id) as any;

    console.log(`\n✅ PAYMENT RECEIVED — Order #${order.id}`);
    console.log(`   Buyer paid:      RM${order.amount_paid}`);
    console.log(`   Sapot keeps:     RM${order.commission_rm} (${(COMMISSION*100).toFixed(0)}%)`);
    console.log(`   Vendor gets:     RM${order.vendor_payout_rm}`);
    console.log(`   Vendor:          ${vendor?.name}`);

    // 5️⃣  Trigger automatic vendor payout
    if (vendor?.bank_account_no && vendor?.bank_code) {
      try {
        const collectionId = await getPayoutCollection();
        const payoutId     = await sendPayout({
          orderId:       order.id,
          vendorName:    vendor.name,
          bankAccountNo: vendor.bank_account_no,
          bankCode:      vendor.bank_code,
          amount:        order.vendor_payout_rm,
          collectionId,
        });

        db.prepare("UPDATE orders SET payout_id=?, payout_status='processing', payout_sent_at=datetime('now') WHERE id=?")
          .run(payoutId, order.id);

        console.log(`   💸 Payout sent!  RM${order.vendor_payout_rm} → ${vendor.name} (${vendor.bank_code} ${vendor.bank_account_no})`);
        console.log(`   Payout ID:       ${payoutId}\n`);

      } catch(e:any) {
        db.prepare("UPDATE orders SET payout_status='failed' WHERE id=?").run(order.id);
        console.error(`   ⚠️ Payout FAILED: ${e.message} — manual action needed\n`);
      }
    } else {
      // Vendor hasn't added bank details yet — flag for manual payout
      db.prepare("UPDATE orders SET payout_status='no_bank_details' WHERE id=?").run(order.id);
      console.warn(`   ⚠️ ${vendor?.name} has no bank details — payout queued for manual processing\n`);
    }

    res.send('OK'); // Always respond 200 to Billplz
  });

  // Billplz also does a GET redirect after payment (for the buyer's browser)
  app.get('/payment/done', (req, res) => {
    const orderId = req.query.order;
    // In production: serve the React app which reads orderId from URL
    res.redirect(`/?payment_done=1&order=${orderId}`);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ORDER STATUS  —  frontend polls this after redirect
  // ─────────────────────────────────────────────────────────────────────────
  app.get('/api/orders/:id', (req, res) => {
    const order = db.prepare(`
      SELECT o.*,
             v.name AS vendor_name,
             GROUP_CONCAT(l.title, ', ') AS item_titles
      FROM orders o
      JOIN vendors v ON o.vendor_id = v.id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN listings l ON l.id = oi.listing_id
      WHERE o.id=? GROUP BY o.id
    `).get(req.params.id) as any;
    if (!order) return res.status(404).json({error:'Not found'});
    res.json(order);
  });

  // Vendor sees their own orders + payout status
  app.get('/api/vendors/:id/orders', (req, res) => {
    res.json(db.prepare(`
      SELECT o.*, GROUP_CONCAT(l.title,', ') AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id=o.id
      LEFT JOIN listings l ON l.id=oi.listing_id
      WHERE o.vendor_id=? GROUP BY o.id ORDER BY o.created_at DESC
    `).all(req.params.id));
  });

  // ─────────────────────────────────────────────────────────────────────────
  // PICKUP CONFIRMATION  —  vendor taps "Confirm Pickup" in their app
  // ─────────────────────────────────────────────────────────────────────────
  app.post('/api/orders/:id/confirm-pickup', (req, res) => {
    const {pickupCode} = req.body;
    const order = db.prepare('SELECT * FROM orders WHERE id=?').get(req.params.id) as any;
    if (!order)                     return res.status(404).json({error:'Order not found'});
    if (order.pickup_code !== pickupCode) return res.status(400).json({error:'Wrong code'});
    if (order.status !== 'paid')    return res.status(400).json({error:'Not yet paid'});

    db.prepare("UPDATE orders SET pickup_confirmed=1, status='completed' WHERE id=?").run(order.id);
    db.prepare(`
      UPDATE listings SET claimed=claimed+1
      WHERE id IN (SELECT listing_id FROM order_items WHERE order_id=?)
    `).run(order.id);

    console.log(`📦 Pickup confirmed — Order #${order.id}`);
    res.json({success:true});
  });

  // ─────────────────────────────────────────────────────────────────────────
  // VENDOR BANK SETUP  —  vendor enters their bank details for payout
  // ─────────────────────────────────────────────────────────────────────────
  app.put('/api/vendors/:id/bank', (req, res) => {
    const {bankAccountName, bankAccountNo, bankCode} = req.body;
    db.prepare('UPDATE vendors SET bank_account_name=?, bank_account_no=?, bank_code=? WHERE id=?')
      .run(bankAccountName, bankAccountNo, bankCode, req.params.id);
    res.json({success:true, message:'Bank details saved. Payouts will be automatic from next order.'});
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION PAYMENT  —  RM29.90/month via Billplz
  // ─────────────────────────────────────────────────────────────────────────
  app.post('/api/vendors/:id/subscribe', async (req, res) => {
    const {buyerEmail, buyerName, buyerPhone} = req.body;
    const vendorId = req.params.id;
    try {
      const bill = await createBill({
        amount: 29.90,
        name:   buyerName  || 'Vendor',
        email:  buyerEmail,
        phone:  buyerPhone,
        desc:   'Sapot Lokal Vendor Subscription — Monthly Plan',
        orderId: parseInt(vendorId), // reuse orderId field as vendorId reference
      });

      // Override callback/redirect for subscription flow
      // (In production use a separate bill with its own callback)
      res.json({paymentUrl: bill.url, billId: bill.id});
    } catch(e:any) {
      res.status(500).json({error: e.message});
    }
  });

  // Subscription confirmed callback
  app.post('/api/subscription/callback', (req, res) => {
    const {paid, reference_1: vendorId} = req.body;
    if (paid === 'true' && vendorId) {
      const ends = new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0,10);
      db.prepare("UPDATE vendors SET subscribed=1, subscription_ends=? WHERE id=?").run(ends, vendorId);
      console.log(`✅ Vendor #${vendorId} subscribed until ${ends}`);
    }
    res.send('OK');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITY ROUTES
  // ─────────────────────────────────────────────────────────────────────────
  app.get('/api/vendors', (req, res) => {
    res.json(db.prepare('SELECT * FROM vendors').all());
  });

  // List of Malaysian banks supported by Billplz Payment Order
  app.get('/api/banks', (req, res) => {
    res.json([
      {code:'MBBEMYKL', name:'Maybank'},
      {code:'CIMBMYKL', name:'CIMB Bank'},
      {code:'PBBEAMYK', name:'Public Bank'},
      {code:'RHBBMYKL', name:'RHB Bank'},
      {code:'HLBBMYKL', name:'Hong Leong Bank'},
      {code:'AFBQMYKL', name:'Affin Bank'},
      {code:'AGOBMYKL', name:'Agrobank'},
      {code:'AIBBMYKL', name:'Alliance Bank'},
      {code:'ARBKMYKL', name:'AmBank'},
      {code:'BIMBMYKL', name:'Bank Islam'},
      {code:'BKRMMYKL', name:'Bank Rakyat'},
      {code:'BSNAMYK1', name:'BSN'},
      {code:'OCBCMYKL', name:'OCBC Bank'},
      {code:'SCBLMYKX', name:'Standard Chartered'},
      {code:'UOVBMYKL', name:'UOB Bank'},
    ]);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // VITE DEV SERVER / PRODUCTION STATIC
  // ─────────────────────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {middlewareMode: true, hmr: {host: '0.0.0.0'}},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // START
  // ─────────────────────────────────────────────────────────────────────────
  const PORT = parseInt(process.env.PORT || '3000');
  app.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP();
    console.log('\n🛒 Sapot Lokal');
    console.log(`   Local:     http://localhost:${PORT}`);
    console.log(`   Mobile:    http://${ip}:${PORT}`);
    console.log(`   Billplz:   ${BILLPLZ_URL}`);
    console.log(`   Mode:      ${IS_SANDBOX ? '🟡 SANDBOX (safe for testing)' : '🔴 LIVE'}`);
    console.log(`   Callback:  ${APP_URL}/api/payment/callback`);
    console.log('\n   ⚠️  Set BILLPLZ_SANDBOX=false in .env only when going live\n');
  });
}

startServer();