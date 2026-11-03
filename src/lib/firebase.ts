/**
 * Firebase bootstrap.
 *
 * Boot budget matters more than import tidiness here: a marketing visitor only
 * needs `app` + `auth` to render the navbar (signed-in vs signed-out). The
 * heavier SDKs are loaded on demand so they never sit in the first JS payload:
 *
 *   firebase/app        eager  (~10KB gz)  — initialise the project
 *   firebase/auth       eager  (~26KB gz)  — session restore for the navbar
 *   firebase/firestore  lazy   (~173KB gz) — only for data screens / signed-in users
 *   firebase/storage    lazy   (~11KB gz)  — only when uploading a file
 *   firebase/functions  lazy   (~4KB gz)   — only when calling a Cloud Function
 *   firebase/app-check  lazy               — only when a reCAPTCHA site key is set
 *
 * Consumers must await `getDb()` / `getStorageClient()` / `getFunctionsClient()`
 * instead of importing a ready-made instance.
 */
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import type { Functions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/** Auth is needed on every route (session + role), so it stays in the first chunk. */
export const auth = getAuth(app);

export function getFirebaseApp() {
  return app;
}

let dbPromise: Promise<Firestore> | null = null;

/**
 * Firestore, loaded on demand. Delegates to ./firestore (which owns the SDK
 * import) so the shell never pulls the Firestore chunk into the first payload.
 */
export function getDb(): Promise<Firestore> {
  dbPromise ??= import('./firestore').then((m) => m.firestore());
  return dbPromise;
}

let storagePromise: Promise<FirebaseStorage> | null = null;

export function getStorageClient(): Promise<FirebaseStorage> {
  storagePromise ??= (async () => {
    const { getStorage } = await import("firebase/storage");
    return getStorage(app);
  })();
  return storagePromise;
}

let functionsPromise: Promise<Functions> | null = null;

export function getFunctionsClient(): Promise<Functions> {
  functionsPromise ??= (async () => {
    const { getFunctions } = await import("firebase/functions");
    return getFunctions(app);
  })();
  return functionsPromise;
}

/**
 * App Check (reCAPTCHA v3). Only touched when a site key is configured — with
 * no key this resolves to a no-op and the app-check SDK is never downloaded.
 * Rules and Cloud Functions enforce trust server-side regardless.
 */
const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

export async function initAppCheck(): Promise<void> {
  if (!siteKey) return;
  try {
    const { initializeAppCheck, ReCaptchaV3Provider } = await import("firebase/app-check");
    if (import.meta.env.DEV) {
      const debugToken = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN as string | undefined;
      (self as unknown as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken || true;
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch {
    // Best-effort on the client; never block the app on it.
  }
}

if (siteKey) {
  // Fire and forget: some SDK calls (auth token refresh) prefer a token early.
  void initAppCheck();
}

export default app;
