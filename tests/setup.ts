import { vi } from 'vitest';

// api.ts (and the Firestore singleton it pulls in) touches the Firebase
// singletons at module load; stub them so unit tests exercise pure client
// logic without initializing a Firebase app.
vi.mock('../src/lib/firebase', () => ({
  auth: { currentUser: null },
  getFirebaseApp: () => ({}),
  getDb: async () => ({}),
  getStorageClient: async () => ({}),
  getFunctionsClient: async () => ({}),
  initAppCheck: async () => {},
  default: {},
}));

// Firestore is initialised by ./firestore on first use; keep that synchronous
// path inert in tests (it would otherwise try to reach a real project).
vi.mock('../src/lib/firestore', () => ({
  firestore: () => ({}),
}));
