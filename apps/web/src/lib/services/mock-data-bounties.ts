/**
 * Mock bounty data for development.
 */

import type { Bounty, BountyPreview } from '@cocuyo/types';
import { createBountyId, createDIMCredential, createSignalId } from '@cocuyo/types';
import { hoursAgo, daysAgo, daysFromNow } from '@/lib/utils/time';

/**
 * Mock bounties demonstrating community-funded information requests.
 */
export const mockBounties: Bounty[] = [
  {
    id: createBountyId('bounty-001'),
    title: 'Document conditions at the Merrimack River industrial discharge point',
    description:
      'We need photographic and video evidence of current conditions at the industrial discharge point near the old mill. Specifically looking for: water color/clarity, any visible discharge, smell observations, and timestamps. Multiple visits at different times of day would be valuable.',
    topics: ['environmental', 'water-quality', 'documentation'],
    location: 'Concord, NH',
    status: 'open',
    fundingAmount: BigInt(500_000_000), // 500 USDC (6 decimals)
    funderCredential: createDIMCredential('dim-funder-001'),
    contributingSignals: [createSignalId('sig-003')],
    createdAt: daysAgo(5),
    expiresAt: daysFromNow(25),
  },
  {
    id: createBountyId('bounty-002'),
    title: 'Actual wait times at the DMV on Elm Street',
    description:
      'The posted wait times online never match reality. Looking for fireflies to document their actual wait times at the Elm Street DMV location. Include: day of week, time of arrival, service needed, and total wait time. Photos of the waiting area welcome.',
    topics: ['local-government', 'public-services'],
    location: 'Manchester, NH',
    status: 'open',
    fundingAmount: BigInt(150_000_000), // 150 USDC
    funderCredential: createDIMCredential('dim-funder-002'),
    contributingSignals: [],
    createdAt: daysAgo(3),
    expiresAt: daysFromNow(27),
  },
  {
    id: createBountyId('bounty-003'),
    title: 'School lunch quality documentation — Nashua District',
    description:
      'Parents concerned about school lunch quality in Nashua schools. Looking for photos and descriptions of actual meals served. Please include: school name, date, what was served vs. what was on the menu, and any observations about portion sizes or food quality.',
    topics: ['education', 'public-health', 'local-government'],
    location: 'Nashua, NH',
    status: 'open',
    fundingAmount: BigInt(300_000_000), // 300 USDC
    funderCredential: createDIMCredential('dim-funder-003'),
    contributingSignals: [createSignalId('sig-010'), createSignalId('sig-011')],
    createdAt: daysAgo(7),
    expiresAt: daysFromNow(23),
  },
  {
    id: createBountyId('bounty-004'),
    title: 'Traffic study for proposed Main Street development',
    description:
      'The city claims a traffic study was done for the new development on Main Street but won\'t release it. Looking for: anyone who attended planning meetings where it was discussed, copies of any public documents referencing the study, or observations of current traffic patterns at the site.',
    topics: ['local-government', 'development', 'public-records'],
    location: 'Manchester, NH',
    status: 'open',
    fundingAmount: BigInt(750_000_000), // 750 USDC
    funderCredential: createDIMCredential('dim-funder-004'),
    contributingSignals: [createSignalId('sig-007')],
    createdAt: daysAgo(10),
    expiresAt: daysFromNow(20),
  },
  {
    id: createBountyId('bounty-005'),
    title: 'Verify claims about new homeless shelter capacity',
    description:
      'City announced the new shelter can accommodate 200 people, but staff have said otherwise. Looking for: actual bed counts, occupancy observations, staff statements, or any documentation about true capacity.',
    topics: ['housing', 'local-government', 'public-services'],
    location: 'Concord, NH',
    status: 'open',
    fundingAmount: BigInt(400_000_000), // 400 USDC
    funderCredential: createDIMCredential('dim-funder-005'),
    contributingSignals: [],
    createdAt: daysAgo(2),
    expiresAt: daysFromNow(28),
  },
  {
    id: createBountyId('bounty-006'),
    title: 'Construction site safety violations — Downtown project',
    description:
      'Multiple residents have reported unsafe conditions at the downtown construction site. Looking for documentation of: missing safety barriers, after-hours work without permits, debris in public areas, or worker safety concerns.',
    topics: ['safety', 'development', 'labor'],
    location: 'Manchester, NH',
    status: 'open',
    fundingAmount: BigInt(250_000_000), // 250 USDC
    funderCredential: createDIMCredential('dim-funder-006'),
    contributingSignals: [],
    createdAt: hoursAgo(18),
    expiresAt: daysFromNow(30),
  },
  {
    id: createBountyId('bounty-007'),
    title: 'Police response times in the North End',
    description:
      'Residents of the North End neighborhood report slow police response times compared to other areas. Looking for: documented response times to calls, dispatch recordings (if legally obtained), or corroborating observations from multiple incidents.',
    topics: ['public-safety', 'local-government', 'equity'],
    location: 'Manchester, NH',
    status: 'fulfilled',
    fundingAmount: BigInt(600_000_000), // 600 USDC
    funderCredential: createDIMCredential('dim-funder-007'),
    contributingSignals: [
      createSignalId('sig-020'),
      createSignalId('sig-021'),
      createSignalId('sig-022'),
      createSignalId('sig-023'),
    ],
    createdAt: daysAgo(30),
    expiresAt: daysAgo(2),
  },
];

/**
 * Get bounty previews for listing.
 */
export function getBountyPreviews(): BountyPreview[] {
  return mockBounties.map((bounty) => ({
    id: bounty.id,
    title: bounty.title,
    topics: bounty.topics,
    ...(bounty.location != null && { location: bounty.location }),
    status: bounty.status,
    fundingAmount: bounty.fundingAmount,
    contributionCount: bounty.contributingSignals.length,
    expiresAt: bounty.expiresAt,
  }));
}

/**
 * Get open bounties only.
 */
export function getOpenBounties(): BountyPreview[] {
  return getBountyPreviews().filter((b) => b.status === 'open');
}

/**
 * Get a bounty by ID.
 */
export function getBountyById(id: string): Bounty | undefined {
  return mockBounties.find((b) => b.id === id);
}
