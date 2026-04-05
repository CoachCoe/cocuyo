#!/usr/bin/env tsx
/**
 * Development Seed Script
 *
 * Populates the mock data store with test data for development.
 * Run with: pnpm seed:dev
 *
 * Note: This script runs in a separate process from Next.js.
 * For automatic seeding in dev, set NEXT_PUBLIC_SEED_DATA=true in .env.local
 */

import { seedAll } from '../src/lib/services/seed-data';
import { isSeeded } from '../src/lib/services/seed-store';

console.log('Seeding development data...');
seedAll();

if (isSeeded()) {
  console.log('\nDevelopment data seeded successfully!');
  console.log('\nNote: This script runs in a separate process from Next.js.');
  console.log('For automatic seeding, add to your .env.local:');
  console.log('  NEXT_PUBLIC_SEED_DATA=true');
} else {
  console.log('\nFailed to seed data.');
}
