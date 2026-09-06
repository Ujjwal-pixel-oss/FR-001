import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let initialized = false;
let dbInstance: Firestore | null = null;
let bucketInstance: any = null;

function ensureFirebaseAdmin() {
  if (initialized && getApps().length > 0) return true;

  if (getApps().length > 0) {
    initialized = true;
    return true;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const privateKey = rawKey?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("⚠️ Firebase Admin credentials not fully configured in environment variables.");
    return false;
  }

  try {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com` 
    });
    initialized = true;
    console.log("🔥 Firebase Admin Initialized Successfully!");
    return true;
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
    return false;
  }
}

export function getAdminDb(): Firestore | null {
  if (dbInstance) return dbInstance;
  if (!ensureFirebaseAdmin()) return null;
  try {
    dbInstance = getFirestore();
    return dbInstance;
  } catch (err) {
    console.error("Failed to get Firestore instance:", err);
    return null;
  }
}

export function getAdminBucket(): any {
  if (bucketInstance) return bucketInstance;
  if (!ensureFirebaseAdmin()) return null;
  try {
    bucketInstance = getStorage().bucket();
    return bucketInstance;
  } catch (err) {
    console.error("Failed to get Storage bucket:", err);
    return null;
  }
}

// Proxies so existing imports `import { db, bucket } from "@/lib/firebaseAdmin"` do not crash on module load!
export const db = new Proxy({} as Firestore, {
  get(target, prop, receiver) {
    const realDb = getAdminDb();
    if (!realDb) {
      console.warn(`Attempted to call db.${String(prop)} but Firebase Admin is not initialized.`);
      // Return a dummy chainable object so it doesn't crash uncaught
      return (...args: any[]) => ({
        doc: () => ({
          get: async () => ({ exists: false, data: () => null }),
          set: async () => {},
          update: async () => {},
          delete: async () => {},
        }),
        collection: () => ({
          doc: () => ({
            get: async () => ({ exists: false, data: () => null }),
            set: async () => {},
            update: async () => {},
            delete: async () => {},
          }),
          add: async () => ({ id: "mock-id" }),
          orderBy: () => ({
            get: async () => ({ docs: [] }),
          }),
          get: async () => ({ docs: [] }),
        }),
      });
    }
    const val = Reflect.get(realDb, prop, receiver);
    return typeof val === "function" ? val.bind(realDb) : val;
  }
});

export const bucket = new Proxy({} as any, {
  get(target, prop, receiver) {
    const realBucket = getAdminBucket();
    if (!realBucket) {
      console.warn(`Attempted to call bucket.${String(prop)} but Firebase Storage is not initialized.`);
      return null;
    }
    const val = Reflect.get(realBucket, prop, receiver);
    return typeof val === "function" ? val.bind(realBucket) : val;
  }
});