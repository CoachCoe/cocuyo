/**
 * Mock bounty data for development.
 */

import type { Bounty, BountyPreview, ChainId } from '@cocuyo/types';
import {
  createBountyId,
  createChainId,
  createDIMCredential,
  createSignalId,
  createEscrowId,
  createTransactionHash,
  createPUSDAmount,
} from '@cocuyo/types';
import { hoursAgo, daysAgo, daysFromNow } from '@/lib/utils/time';

export type Locale = 'en' | 'es';

interface LocalizedBountyContent {
  en: { title: string; description: string };
  es: { title: string; description: string };
}

interface LocalizedBountyData {
  id: string;
  content: LocalizedBountyContent;
  topics: readonly string[];
  location?: string;
  status: Bounty['status'];
  fundingAmount: Bounty['fundingAmount'];
  funderCredential: Bounty['funderCredential'];
  escrowId: Bounty['escrowId'];
  fundingTxHash: Bounty['fundingTxHash'];
  payoutMode: Bounty['payoutMode'];
  contributingSignals: readonly string[];
  relatedChainId?: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Mock bounties demonstrating community-funded information requests.
 *
 * Some bounties are linked to story chains (relatedChainId), representing
 * funded investigations. Others are "orphan" bounties - open questions
 * waiting for their first signals.
 */
const localizedBounties: LocalizedBountyData[] = [
  // === Venezuelan bounties linked to story chains ===
  {
    id: 'bounty-ve-001',
    content: {
      en: {
        title: 'Document current food basket prices across Caracas',
        description:
          'We need weekly documentation of basic food basket prices (canasta básica) from supermarkets and markets across different neighborhoods in Caracas. Include: store name/location, date, itemized prices for staples (rice, beans, flour, cooking oil, eggs), photos of price tags, and any observations about availability or shortages.',
      },
      es: {
        title: 'Documentar precios actuales de la canasta básica en Caracas',
        description:
          'Necesitamos documentación semanal de los precios de la canasta básica en supermercados y mercados de diferentes barrios de Caracas. Incluir: nombre/ubicación de la tienda, fecha, precios detallados de productos básicos (arroz, frijoles, harina, aceite, huevos), fotos de etiquetas de precios, y observaciones sobre disponibilidad o escasez.',
      },
    },
    topics: ['economy', 'food-security', 'inflation', 'documentation'],
    location: 'Caracas, Venezuela',
    status: 'open',
    fundingAmount: createPUSDAmount(450_000_000n), // $450 pUSD
    funderCredential: createDIMCredential('dim-funder-ve-001'),
    escrowId: createEscrowId('escrow-ve-001'),
    fundingTxHash: createTransactionHash('0xve001...abc'),
    payoutMode: 'private',
    contributingSignals: ['sig-001', 'sig-002'],
    relatedChainId: 'chain-001',
    createdAt: daysAgo(5),
    expiresAt: daysFromNow(25),
  },
  {
    id: 'bounty-ve-002',
    content: {
      en: {
        title: 'Verify recent ministry appointments and dismissals',
        description:
          'Track and verify official appointments and dismissals in Venezuelan government ministries. Looking for: official gazette publications, press conference recordings, social media announcements from official accounts, and any documentation showing appointment dates, credentials, and previous positions of new officials.',
      },
      es: {
        title: 'Verificar nombramientos y destituciones recientes en ministerios',
        description:
          'Rastrear y verificar nombramientos y destituciones oficiales en los ministerios del gobierno venezolano. Buscamos: publicaciones de la Gaceta Oficial, grabaciones de ruedas de prensa, anuncios en redes sociales de cuentas oficiales, y documentación que muestre fechas de nombramiento, credenciales y cargos anteriores de los nuevos funcionarios.',
      },
    },
    topics: ['politics', 'transparency', 'governance', 'public-records'],
    location: 'Venezuela',
    status: 'open',
    fundingAmount: createPUSDAmount(600_000_000n), // $600 pUSD
    funderCredential: createDIMCredential('dim-funder-ve-002'),
    escrowId: createEscrowId('escrow-ve-002'),
    fundingTxHash: createTransactionHash('0xve002...def'),
    payoutMode: 'private',
    contributingSignals: ['sig-004', 'sig-005'],
    relatedChainId: 'chain-002',
    createdAt: daysAgo(4),
    expiresAt: daysFromNow(26),
  },
  // === Venezuelan orphan bounties (open questions without stories yet) ===
  {
    id: 'bounty-ve-003',
    content: {
      en: {
        title: 'Document hospital conditions and medication availability in Maracaibo',
        description:
          'We need firsthand documentation of conditions at public hospitals in Maracaibo. Looking for: photos of waiting areas, pharmacy stock levels, staff testimonies about equipment/supply shortages, and patient wait times for emergency care.',
      },
      es: {
        title: 'Documentar condiciones hospitalarias y disponibilidad de medicamentos en Maracaibo',
        description:
          'Necesitamos documentación de primera mano sobre las condiciones en hospitales públicos de Maracaibo. Buscamos: fotos de salas de espera, niveles de stock de farmacia, testimonios del personal sobre escasez de equipos/suministros, y tiempos de espera para atención de emergencias.',
      },
    },
    topics: ['health', 'infrastructure', 'crisis', 'documentation'],
    location: 'Maracaibo, Venezuela',
    status: 'open',
    fundingAmount: createPUSDAmount(350_000_000n), // $350 pUSD
    funderCredential: createDIMCredential('dim-funder-ve-003'),
    escrowId: createEscrowId('escrow-ve-003'),
    fundingTxHash: createTransactionHash('0xve003...ghi'),
    payoutMode: 'private',
    contributingSignals: [],
    // No chain yet - orphan bounty
    createdAt: daysAgo(3),
    expiresAt: daysFromNow(27),
  },
  {
    id: 'bounty-ve-004',
    content: {
      en: {
        title: 'Track electricity outages and water service interruptions',
        description:
          'Document the frequency and duration of power outages and water service cuts across Venezuelan states. Include: date/time of outage, duration, affected neighborhood, any official explanations given, and photos if safe to capture.',
      },
      es: {
        title: 'Rastrear apagones eléctricos e interrupciones del servicio de agua',
        description:
          'Documentar la frecuencia y duración de apagones y cortes de agua en los estados venezolanos. Incluir: fecha/hora del apagón, duración, barrio afectado, explicaciones oficiales dadas, y fotos si es seguro capturarlas.',
      },
    },
    topics: ['infrastructure', 'public-services', 'crisis'],
    location: 'Venezuela',
    status: 'open',
    fundingAmount: createPUSDAmount(275_000_000n), // $275 pUSD
    funderCredential: createDIMCredential('dim-funder-ve-004'),
    escrowId: createEscrowId('escrow-ve-004'),
    fundingTxHash: createTransactionHash('0xve004...jkl'),
    payoutMode: 'private',
    contributingSignals: [],
    // No chain yet - orphan bounty
    createdAt: daysAgo(2),
    expiresAt: daysFromNow(28),
  },
  {
    id: 'bounty-ve-005',
    content: {
      en: {
        title: 'Verify reports of detained journalists and activists',
        description:
          'Help verify and document cases of detained journalists, activists, and political figures. Looking for: detention location confirmations, family statements, lawyer access status, and any official charges filed.',
      },
      es: {
        title: 'Verificar informes de periodistas y activistas detenidos',
        description:
          'Ayudar a verificar y documentar casos de periodistas, activistas y figuras políticas detenidas. Buscamos: confirmaciones de lugares de detención, declaraciones de familiares, estado de acceso a abogados, y cargos oficiales presentados.',
      },
    },
    topics: ['human-rights', 'politics', 'press-freedom', 'detention'],
    location: 'Venezuela',
    status: 'open',
    fundingAmount: createPUSDAmount(500_000_000n), // $500 pUSD
    funderCredential: createDIMCredential('dim-funder-ve-005'),
    escrowId: createEscrowId('escrow-ve-005'),
    fundingTxHash: createTransactionHash('0xve005...mno'),
    payoutMode: 'private',
    contributingSignals: [],
    // No chain yet - orphan bounty
    createdAt: hoursAgo(18),
    expiresAt: daysFromNow(30),
  },
];

/**
 * Convert localized bounty data to a Bounty object.
 */
function toBounty(data: LocalizedBountyData, locale: Locale): Bounty {
  return {
    id: createBountyId(data.id),
    title: data.content[locale].title,
    description: data.content[locale].description,
    topics: data.topics,
    ...(data.location != null && { location: data.location }),
    status: data.status,
    fundingAmount: data.fundingAmount,
    funderCredential: data.funderCredential,
    escrowId: data.escrowId,
    fundingTxHash: data.fundingTxHash,
    payoutMode: data.payoutMode,
    contributingSignals: data.contributingSignals.map(createSignalId),
    ...(data.relatedChainId != null && { relatedChainId: createChainId(data.relatedChainId) }),
    createdAt: data.createdAt,
    expiresAt: data.expiresAt,
  };
}

/**
 * Convert localized bounty data to a BountyPreview object.
 */
function toBountyPreview(data: LocalizedBountyData, locale: Locale): BountyPreview {
  return {
    id: createBountyId(data.id),
    title: data.content[locale].title,
    topics: data.topics,
    ...(data.location != null && { location: data.location }),
    status: data.status,
    fundingAmount: data.fundingAmount,
    contributionCount: data.contributingSignals.length,
    payoutMode: data.payoutMode,
    expiresAt: data.expiresAt,
  };
}

/**
 * Get all bounties for a locale.
 */
export function getBounties(locale: Locale = 'en'): Bounty[] {
  return localizedBounties.map((b) => toBounty(b, locale));
}

/**
 * Get bounty previews for listing.
 */
export function getBountyPreviews(locale: Locale = 'en'): BountyPreview[] {
  return localizedBounties.map((b) => toBountyPreview(b, locale));
}

/**
 * Get open bounties only.
 */
export function getOpenBounties(locale: Locale = 'en'): BountyPreview[] {
  return getBountyPreviews(locale).filter((b) => b.status === 'open');
}

/**
 * Get a bounty by ID.
 */
export function getBountyById(id: string, locale: Locale = 'en'): Bounty | undefined {
  const data = localizedBounties.find((b) => b.id === id);
  return data != null ? toBounty(data, locale) : undefined;
}

/**
 * Get bounties that a signal contributes to.
 * Returns BountyPreview[] for any bounty where the signal ID appears in contributingSignals.
 */
export function getBountiesForSignal(signalId: string, locale: Locale = 'en'): BountyPreview[] {
  return localizedBounties
    .filter((b) => b.contributingSignals.some((s) => s === signalId))
    .map((b) => toBountyPreview(b, locale));
}

/**
 * Get a mapping of bounty IDs to their contributing signal IDs.
 * This allows filtering signals by bounty on the client side.
 */
export function getBountySignalsMap(): Record<string, readonly string[]> {
  return Object.fromEntries(
    localizedBounties.map((bounty) => [bounty.id, bounty.contributingSignals])
  );
}

/**
 * Get the bounty linked to a story chain (if any).
 * Returns the full Bounty object for chains that have associated funding.
 */
export function getBountyForChain(chainId: ChainId, locale: Locale = 'en'): Bounty | undefined {
  const data = localizedBounties.find(
    (b) => b.relatedChainId === chainId && b.status === 'open'
  );
  return data != null ? toBounty(data, locale) : undefined;
}

/**
 * Get orphan bounties - open bounties that don't have a story chain yet.
 * These are "open questions" waiting for their first signals to form a story.
 */
export function getOrphanBounties(locale: Locale = 'en'): Bounty[] {
  return localizedBounties
    .filter((b) => b.status === 'open' && b.relatedChainId === undefined)
    .map((b) => toBounty(b, locale));
}

/**
 * Get a mapping of chain IDs to their associated bounty (if any).
 */
export function getChainBountyMap(locale: Locale = 'en'): Record<string, Bounty> {
  const map: Record<string, Bounty> = {};
  for (const data of localizedBounties) {
    if (data.relatedChainId !== undefined && data.status === 'open') {
      map[data.relatedChainId] = toBounty(data, locale);
    }
  }
  return map;
}
