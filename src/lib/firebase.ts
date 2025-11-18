import { initializeApp, FirebaseOptions, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  query as firestoreQuery,
  where,
  orderBy as firestoreOrderBy,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  limit as firestoreLimit,
} from 'firebase/firestore';

import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize once
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const db = getFirestore();
export const auth = getAuth();

/* -----------------------------------------------------
   MAGIC LINK AUTH (you already had this)
----------------------------------------------------- */
export async function sendSigninLink(email: string, actionUrl?: string) {
  const actionCodeSettings = {
    url: actionUrl || window.location.origin,
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem('firebaseEmailForSignIn', email);
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function completeSigninIfLink() {
  const url = window.location.href;
  if (!isSignInWithEmailLink(auth, url)) return null;

  let email = localStorage.getItem('firebaseEmailForSignIn');
  if (!email) email = window.prompt('Please enter your email to confirm') || '';
  if (!email) return null;

  try {
    const result = await signInWithEmailLink(auth, email, url);
    localStorage.removeItem('firebaseEmailForSignIn');
    return result;
  } catch {
    return null;
  }
}

export function onAuthChange(cb: (user: any) => void) {
  return onAuthStateChanged(auth, (u) => cb(u));
}

/* -----------------------------------------------------
   EMAIL + PASSWORD AUTH + ROLE SYSTEM
----------------------------------------------------- */

// ⭐ SIGNUP with role (client | distributor)
export async function signupWithPasswordAndRole(
  email: string,
  password: string,
  role: "client" | "distributor"
) {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);

    // Create Firestore doc
    await setDoc(doc(db, "users", res.user.uid), {
      email,
      role,
      created_at: new Date().toISOString(),
    });

    return { user: res.user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message };
  }
}

// ⭐ LOGIN with email + password
export async function loginWithPassword(email: string, password: string) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return { user: res.user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message };
  }
}

// ⭐ Ensure Firestore user doc exists (used for login flow)
export async function ensureUserDoc(user: any, fallbackRole?: "client" | "distributor") {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists() && fallbackRole) {
    await setDoc(ref, {
      email: user.email,
      role: fallbackRole,
      created_at: new Date().toISOString(),
    });
    return { created: true };
  }

  return { exists: snap.exists(), data: snap.data() };
}

export function logout() {
  return signOut(auth);
}

/* -----------------------------------------------------
   FIRESTORE HELPERS (your existing functions)
----------------------------------------------------- */
export async function runFirestoreQuery(
  table: string,
  filters: Array<any>,
  order: any | null,
  limitN?: number
) {
  const colRef = collection(db, table);
  const clauses: any[] = [];

  for (const [op, field, value] of filters) {
    clauses.push(where(field, op, value));
  }
  if (order) clauses.push(firestoreOrderBy(order.field, order.ascending ? 'asc' : 'desc'));
  if (limitN) clauses.push(firestoreLimit(limitN));

  const q = clauses.length ? firestoreQuery(colRef, ...clauses) : firestoreQuery(colRef);
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getDocById(table: string, id: string) {
  const d = doc(db, table, id);
  const snap = await getDoc(d);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function insertDoc(table: string, payload: any) {
  const res = await addDoc(collection(db, table), payload);
  return { id: res.id };
}

export async function updateDocById(table: string, id: string, payload: any) {
  await updateDoc(doc(db, table, id), payload);
  return { id };
}

export async function deleteDocById(table: string, id: string) {
  await deleteDoc(doc(db, table, id));
  return { id };
}
export async function signOutUser() {
  try {
    await signOut(auth);
    console.log("User signed out");
    return { success: true };
  } catch (error) {
    console.error("Sign-out error:", error);
    return { success: false, error };
  }
}

export default {
  db,
  auth,
  sendSigninLink,
  completeSigninIfLink,
  onAuthChange,
  signupWithPasswordAndRole,
  loginWithPassword,
  ensureUserDoc,
  logout,
  runFirestoreQuery,
  getDocById,
  insertDoc,
  updateDocById,
  deleteDocById,
};
