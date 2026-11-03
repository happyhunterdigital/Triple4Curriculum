/**
 * Firestore singleton, created on first use.
 *
 * This module statically imports `firebase/firestore`, so it is only ever
 * pulled in by code-split modules (api.ts, certificates.ts) — importing it from
 * the app shell would put the Firestore SDK back on the critical path. The
 * shell's own uses go through `getDb()` in ./firebase, which dynamic-imports
 * this module.
 */
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { getFirebaseApp } from './firebase';

let instance: Firestore | null = null;

/** Firestore with multi-tab persistent cache (offline-first reads). */
export function firestore(): Firestore {
  if (instance) return instance;
  const app = getFirebaseApp();
  try {
    instance = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    // Already initialised elsewhere, or the cache is unavailable in this browser.
    instance = getFirestore(app);
  }
  return instance;
}
