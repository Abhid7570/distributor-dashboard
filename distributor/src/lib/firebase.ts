import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// -----------------------------------------------------
// SEPARATE APP INSTANCE FOR DISTRIBUTOR
// -----------------------------------------------------
const distributorApp =
  getApps().find((app) => app.name === "distributorApp") ||
  initializeApp(firebaseConfig, "distributorApp");

// -----------------------------------------------------
// AUTH + DB EXPORTS
// -----------------------------------------------------
export const auth = getAuth(distributorApp);
export const db = getFirestore(distributorApp);

// Keep distributor session independent
setPersistence(auth, browserLocalPersistence).catch(console.error);

// -----------------------------------------------------
// LOGIN
// -----------------------------------------------------
export async function loginDistributor(email: string, password: string) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return { user: res.user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message };
  }
}

// -----------------------------------------------------
// LOGOUT
// -----------------------------------------------------
export async function logoutDistributor() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}

// -----------------------------------------------------
// SIMPLE FIRESTORE HELPERS
// -----------------------------------------------------

// 🔍 Run dynamic queries
export async function runFirestoreQuery(
  table: string,
  filters: Array<[any, string, any]>,
  order: { field: string; ascending: boolean } | null,
  limitN?: number
) {
  const colRef = collection(db, table);

  const conditions: any[] = [];

  // Add filters
  for (const [op, field, value] of filters) {
    conditions.push(where(field, op, value));
  }

  // Add orderBy
  if (order) {
    conditions.push(orderBy(order.field, order.ascending ? "asc" : "desc"));
  }

  // Add limit
  if (limitN) {
    conditions.push(limit(limitN));
  }

  const q =
    conditions.length > 0 ? query(colRef, ...conditions) : query(colRef);

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// 📄 Get doc by ID
export async function getDocById(table: string, id: string) {
  const ref = doc(db, table, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ➕ Add doc
export async function insertDoc(table: string, payload: any) {
  const res = await addDoc(collection(db, table), payload);
  return { id: res.id };
}

// ✏️ Update doc
export async function updateDocById(table: string, id: string, payload: any) {
  await updateDoc(doc(db, table, id), payload);
  return { id };
}

// ❌ Delete doc
export async function deleteDocById(table: string, id: string) {
  await deleteDoc(doc(db, table, id));
  return { id };
}

// Default export for convenience
export default {
  auth,
  db,
  loginDistributor,
  logoutDistributor,
  runFirestoreQuery,
  getDocById,
  insertDoc,
  updateDocById,
  deleteDocById,
};
