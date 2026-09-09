import { vi } from 'vitest';

// api.ts imports the Firebase singletons at module load; stub them so unit
// tests exercise pure client logic without initializing a Firebase app.
vi.mock('../src/lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
  storage: {},
  default: {},
}));
