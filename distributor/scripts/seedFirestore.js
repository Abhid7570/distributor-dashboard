// Seed script for Firestore using firebase-admin
// Usage:
// 1. Create a Firebase service account key JSON in the Firebase Console
// 2. Set environment variable: $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
// 3. Run: node ./scripts/seedFirestore.js

import admin from 'firebase-admin';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Please set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

async function seed() {
  console.log('Seeding Firestore...');

  const categories = [
    { name: 'PVC Conduit', description: 'Durable PVC conduit', image_url: '' , created_at: new Date().toISOString()},
    { name: 'Metal Conduit', description: 'Galvanized metal conduit', image_url: '', created_at: new Date().toISOString() },
  ];

  const products = [
    { category_name: 'PVC Conduit', name: 'PVC 20mm', sku: 'PVC-20', description: '20mm PVC conduit', specifications: { diameter: '20mm' }, price: 2.5, unit: 'per meter', stock_quantity: 100, image_url: '', is_featured: true, min_order_quantity: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { category_name: 'Metal Conduit', name: 'Metal 25mm', sku: 'MET-25', description: '25mm metal conduit', specifications: { diameter: '25mm' }, price: 3.75, unit: 'per meter', stock_quantity: 50, image_url: '', is_featured: false, min_order_quantity: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];

  // Write categories and map names to ids
  const catRefs = {};
  for (const c of categories) {
    const docRef = await db.collection('categories').add(c);
    catRefs[c.name] = docRef.id;
    console.log('Created category', c.name, docRef.id);
  }

  // Write products and attach category_id
  for (const p of products) {
    const payload = { ...p, category_id: catRefs[p.category_name] || null };
    delete payload.category_name;
    const docRef = await db.collection('products').add(payload);
    console.log('Created product', p.name, docRef.id);
  }

  // Optional: seed a sample quote request
  const quote = {
    request_number: 'QR-1001',
    customer_name: 'Acme Corp',
    customer_email: 'buyer@acme.example',
    customer_phone: '1234567890',
    company_name: 'Acme Corp',
    items: [{ product_sku: 'PVC-20', product_name: 'PVC 20mm', quantity: 200 }],
    message: 'Need bulk pricing for delivery in 2 weeks',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const qRef = await db.collection('quote_requests').add(quote);
  console.log('Created quote_request', qRef.id);

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed', err);
  process.exit(1);
});
