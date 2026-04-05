import React from 'react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Seed mock data before tests run
import { seedAll } from '@/lib/services/seed-data';
seedAll();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => {
    return React.createElement('img', { src, alt, ...props });
  },
}));
