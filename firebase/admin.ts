import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK lazily
function initFirebaseAdmin(): App {
  const apps = getApps();

  if (apps.length > 0) {
    return apps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      `Missing Firebase credentials. Check your .env.local file. ` +
      `projectId: ${!!projectId}, clientEmail: ${!!clientEmail}, privateKey: ${!!privateKey}`
    );
  }

  return initializeApp({
    credential: cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey,
    }),
  });
}

// Lazy getters for auth and db
export const getAdminAuth = (): Auth => {
  initFirebaseAdmin();
  return getAuth();
};

export const getAdminDB = (): Firestore => {
  initFirebaseAdmin();
  return getFirestore();
};

// For backward compatibility, export auth and db as getters
export const auth = new Proxy({} as Auth, {
  get: (target, prop) => {
    return getAdminAuth()[prop as keyof Auth];
  }
});

export const db = new Proxy({} as Firestore, {
  get: (target, prop) => {
    return getAdminDB()[prop as keyof Firestore];
  }
});
