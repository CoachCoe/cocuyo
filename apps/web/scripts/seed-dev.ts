#!/usr/bin/env tsx
/**
 * Development Seed Script
 *
 * Populates the mock data store with test data for development.
 * Run with: pnpm seed:dev
 *
 * This script contains all the localized mock data that was previously
 * hard-coded in the mock data files.
 */

import {
  seedSignals,
  seedChains,
  seedBounties,
  seedCollectives,
  markAsSeeded,
} from '../src/lib/services/seed-store';

import type {
  Signal,
  StoryChain,
  Bounty,
  Collective,
  FireflyAuthor,
  SignalVerification,
} from '@cocuyo/types';

import {
  createSignalId,
  createChainId,
  createBountyId,
  createCollectiveId,
  createDIMCredential,
  createEscrowId,
  createTransactionHash,
  createPUSDAmount,
} from '@cocuyo/types';

// ============================================================
// Time Helpers
// ============================================================

function hoursAgo(hours: number): number {
  return Math.floor((Date.now() - hours * 60 * 60 * 1000) / 1000);
}

function daysAgo(days: number): number {
  return Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);
}

function daysFromNow(days: number): number {
  return Math.floor((Date.now() + days * 24 * 60 * 60 * 1000) / 1000);
}

// ============================================================
// Author Helper
// ============================================================

function createMockAuthor(
  id: string,
  pseudonym: string,
  extra?: { location?: string; reputation?: number }
): FireflyAuthor {
  return {
    id,
    credentialHash: createDIMCredential(`dim-anon-${id}`),
    pseudonym,
    disclosureLevel: 'anonymous',
    ...(extra?.location !== undefined && { location: extra.location }),
    ...(extra?.reputation !== undefined && { reputation: extra.reputation }),
  };
}

const unverified: SignalVerification = { status: 'unverified' };

// ============================================================
// SIGNALS DATA
// ============================================================

interface SignalSeedData {
  id: string;
  en: Signal;
  es: Signal;
}

function createSignalData(): SignalSeedData[] {
  const author001 = createMockAuthor('001', 'EconWatcher', { location: 'Caracas', reputation: 67 });
  const author002 = createMockAuthor('002', 'MarketAnalyst', { location: 'Maracaibo', reputation: 78 });
  const author003 = createMockAuthor('003', 'StreetReporter', { location: 'Valencia', reputation: 45 });
  const author004 = createMockAuthor('004', 'TransparencyWatch', { location: 'Caracas', reputation: 82 });
  const author005 = createMockAuthor('005', 'DocHunter', { reputation: 71 });
  const author006 = createMockAuthor('006', 'DiplomacyTracker', { location: 'Lisbon', reputation: 63 });
  const author007 = createMockAuthor('007', 'FamilyVoice', { location: 'Porto', reputation: 38 });
  const author008 = createMockAuthor('008', 'HospitalWorker', { location: 'Barquisimeto', reputation: 54 });
  const author009 = createMockAuthor('009', 'MedSupplyTracker', { reputation: 66 });

  return [
    {
      id: 'sig-001',
      en: {
        id: createSignalId('sig-001'),
        author: author001,
        content: {
          text: 'The bolívar has lost 36.4% of its value against the dollar in the first quarter alone. At my local market, prices are now posted in dollars — vendors update bolívar prices daily because they change too fast.',
        },
        context: {
          topics: ['economy', 'currency', 'inflation'],
          locationName: 'Caracas, Venezuela',
          location: { latitude: 10.4806, longitude: -66.9036 },
        },
        dimSignature: author001.credentialHash,
        chainLinks: [createChainId('chain-001')],
        corroborations: { witnessCount: 23, evidenceCount: 8, expertiseCount: 3, challengeCount: 0, totalWeight: 34.5 },
        verification: { status: 'verified', verifiedBy: createCollectiveId('econ-collective') },
        createdAt: hoursAgo(48),
      },
      es: {
        id: createSignalId('sig-001'),
        author: author001,
        content: {
          text: 'El bolívar ha perdido 36,4% de su valor frente al dólar solo en el primer trimestre. En mi mercado local, los precios ya se publican en dólares — los vendedores actualizan los precios en bolívares diariamente porque cambian muy rápido.',
        },
        context: {
          topics: ['economy', 'currency', 'inflation'],
          locationName: 'Caracas, Venezuela',
          location: { latitude: 10.4806, longitude: -66.9036 },
        },
        dimSignature: author001.credentialHash,
        chainLinks: [createChainId('chain-001')],
        corroborations: { witnessCount: 23, evidenceCount: 8, expertiseCount: 3, challengeCount: 0, totalWeight: 34.5 },
        verification: { status: 'verified', verifiedBy: createCollectiveId('econ-collective') },
        createdAt: hoursAgo(48),
      },
    },
    {
      id: 'sig-002',
      en: {
        id: createSignalId('sig-002'),
        author: author002,
        content: {
          text: 'The food basket for a family now exceeds $645 per month. The minimum wage covers only 0.05% of this — you would need 1,937 minimum salaries to afford basic food. I have the official CENDAS report.',
          links: ['https://cendas.org.ve/canasta-alimentaria'],
        },
        context: {
          topics: ['economy', 'food-security', 'wages'],
          locationName: 'Maracaibo, Venezuela',
          location: { latitude: 10.6427, longitude: -71.6125 },
        },
        dimSignature: author002.credentialHash,
        chainLinks: [createChainId('chain-001')],
        corroborations: { witnessCount: 15, evidenceCount: 12, expertiseCount: 4, challengeCount: 0, totalWeight: 41.2 },
        verification: { status: 'verified', verifiedBy: createCollectiveId('econ-collective') },
        createdAt: hoursAgo(36),
      },
      es: {
        id: createSignalId('sig-002'),
        author: author002,
        content: {
          text: 'La canasta alimentaria familiar supera los $645 mensuales. El salario mínimo cubre apenas el 0,05% — se necesitarían 1.937 salarios mínimos para cubrir la alimentación básica. Tengo el informe oficial de CENDAS.',
          links: ['https://cendas.org.ve/canasta-alimentaria'],
        },
        context: {
          topics: ['economy', 'food-security', 'wages'],
          locationName: 'Maracaibo, Venezuela',
          location: { latitude: 10.6427, longitude: -71.6125 },
        },
        dimSignature: author002.credentialHash,
        chainLinks: [createChainId('chain-001')],
        corroborations: { witnessCount: 15, evidenceCount: 12, expertiseCount: 4, challengeCount: 0, totalWeight: 41.2 },
        verification: { status: 'verified', verifiedBy: createCollectiveId('econ-collective') },
        createdAt: hoursAgo(36),
      },
    },
    {
      id: 'sig-003',
      en: {
        id: createSignalId('sig-003'),
        author: author003,
        content: {
          text: 'Witnessing long lines at exchange houses again. People waiting 3+ hours to convert bolívares to dollars before their savings lose more value. Elderly citizens particularly affected — some have been here since 5am.',
        },
        context: {
          topics: ['economy', 'currency', 'daily-life'],
          locationName: 'Valencia, Venezuela',
          location: { latitude: 10.1579, longitude: -67.9972 },
        },
        dimSignature: author003.credentialHash,
        chainLinks: [createChainId('chain-001')],
        corroborations: { witnessCount: 18, evidenceCount: 5, expertiseCount: 0, challengeCount: 1, totalWeight: 22.3 },
        verification: unverified,
        createdAt: hoursAgo(24),
      },
      es: {
        id: createSignalId('sig-003'),
        author: author003,
        content: {
          text: 'Observando largas colas en las casas de cambio otra vez. Personas esperando más de 3 horas para convertir bolívares a dólares antes de que sus ahorros pierdan más valor. Ciudadanos mayores particularmente afectados — algunos aquí desde las 5am.',
        },
        context: {
          topics: ['economy', 'currency', 'daily-life'],
          locationName: 'Valencia, Venezuela',
          location: { latitude: 10.1579, longitude: -67.9972 },
        },
        dimSignature: author003.credentialHash,
        chainLinks: [createChainId('chain-001')],
        corroborations: { witnessCount: 18, evidenceCount: 5, expertiseCount: 0, challengeCount: 1, totalWeight: 22.3 },
        verification: unverified,
        createdAt: hoursAgo(24),
      },
    },
    {
      id: 'sig-004',
      en: {
        id: createSignalId('sig-004'),
        author: author004,
        content: {
          text: "Following the dismissal of a high-ranking official connected to powerful political families, Transparencia Venezuela is raising alarms about opacity in government appointments. No public explanation has been given for the removal.",
        },
        context: {
          topics: ['politics', 'transparency', 'governance'],
          locationName: 'Caracas, Venezuela',
          location: { latitude: 10.4806, longitude: -66.9036 },
        },
        dimSignature: author004.credentialHash,
        chainLinks: [createChainId('chain-002')],
        corroborations: { witnessCount: 8, evidenceCount: 15, expertiseCount: 6, challengeCount: 2, totalWeight: 27.8 },
        verification: { status: 'verified', verifiedBy: createCollectiveId('civic-collective') },
        createdAt: hoursAgo(72),
      },
      es: {
        id: createSignalId('sig-004'),
        author: author004,
        content: {
          text: 'Tras la destitución de un funcionario de alto rango conectado a familias políticas poderosas, Transparencia Venezuela alerta sobre la opacidad en los nombramientos gubernamentales. No se ha dado explicación pública sobre la remoción.',
        },
        context: {
          topics: ['politics', 'transparency', 'governance'],
          locationName: 'Caracas, Venezuela',
          location: { latitude: 10.4806, longitude: -66.9036 },
        },
        dimSignature: author004.credentialHash,
        chainLinks: [createChainId('chain-002')],
        corroborations: { witnessCount: 8, evidenceCount: 15, expertiseCount: 6, challengeCount: 2, totalWeight: 27.8 },
        verification: { status: 'verified', verifiedBy: createCollectiveId('civic-collective') },
        createdAt: hoursAgo(72),
      },
    },
    {
      id: 'sig-005',
      en: {
        id: createSignalId('sig-005'),
        author: author005,
        content: {
          text: 'Cross-referenced public appointment records. Three family members of the dismissed official still hold positions in state enterprises. No conflict of interest disclosures on file. Screenshots of the registry attached.',
        },
        context: {
          topics: ['politics', 'public-records', 'transparency'],
          locationName: 'Public Records Database',
        },
        dimSignature: author005.credentialHash,
        chainLinks: [createChainId('chain-002')],
        corroborations: { witnessCount: 2, evidenceCount: 18, expertiseCount: 4, challengeCount: 0, totalWeight: 35.6 },
        verification: { status: 'verified', verifiedBy: createCollectiveId('civic-collective') },
        createdAt: hoursAgo(48),
      },
      es: {
        id: createSignalId('sig-005'),
        author: author005,
        content: {
          text: 'Crucé referencias de registros de nombramientos públicos. Tres familiares del funcionario destituido aún ocupan cargos en empresas estatales. No hay declaraciones de conflicto de interés archivadas. Capturas del registro adjuntas.',
        },
        context: {
          topics: ['politics', 'public-records', 'transparency'],
          locationName: 'Public Records Database',
        },
        dimSignature: author005.credentialHash,
        chainLinks: [createChainId('chain-002')],
        corroborations: { witnessCount: 2, evidenceCount: 18, expertiseCount: 4, challengeCount: 0, totalWeight: 35.6 },
        verification: { status: 'verified', verifiedBy: createCollectiveId('civic-collective') },
        createdAt: hoursAgo(48),
      },
    },
    {
      id: 'sig-006',
      en: {
        id: createSignalId('sig-006'),
        author: author006,
        content: {
          text: 'Portugal\'s foreign ministry confirmed a meeting with Venezuelan officials regarding detained Portuguese citizens. Families have been waiting months for any news. The ministry is "cautiously optimistic" about progress.',
        },
        context: {
          topics: ['international', 'human-rights', 'diplomacy'],
          locationName: 'Lisbon, Portugal',
          location: { latitude: 38.7223, longitude: -9.1393 },
        },
        dimSignature: author006.credentialHash,
        chainLinks: [createChainId('chain-003')],
        corroborations: { witnessCount: 5, evidenceCount: 7, expertiseCount: 2, challengeCount: 0, totalWeight: 18.4 },
        verification: unverified,
        createdAt: hoursAgo(12),
      },
      es: {
        id: createSignalId('sig-006'),
        author: author006,
        content: {
          text: 'El Ministerio de Relaciones Exteriores de Portugal confirmó una reunión con funcionarios venezolanos sobre ciudadanos portugueses detenidos. Las familias han esperado meses por noticias. El ministerio está "cautelosamente optimista" sobre el progreso.',
        },
        context: {
          topics: ['international', 'human-rights', 'diplomacy'],
          locationName: 'Lisbon, Portugal',
          location: { latitude: 38.7223, longitude: -9.1393 },
        },
        dimSignature: author006.credentialHash,
        chainLinks: [createChainId('chain-003')],
        corroborations: { witnessCount: 5, evidenceCount: 7, expertiseCount: 2, challengeCount: 0, totalWeight: 18.4 },
        verification: unverified,
        createdAt: hoursAgo(12),
      },
    },
    {
      id: 'sig-007',
      en: {
        id: createSignalId('sig-007'),
        author: author007,
        content: {
          text: "My uncle has been detained for 14 months without formal charges. Today's news about the diplomatic meeting is the first hope we've had. We just want to know he's safe. Sharing his case number for the record.",
        },
        context: {
          topics: ['human-rights', 'personal-testimony', 'detention'],
          locationName: 'Porto, Portugal',
          location: { latitude: 41.1579, longitude: -8.6291 },
        },
        dimSignature: author007.credentialHash,
        chainLinks: [createChainId('chain-003')],
        corroborations: { witnessCount: 12, evidenceCount: 3, expertiseCount: 0, challengeCount: 0, totalWeight: 14.2 },
        verification: unverified,
        createdAt: hoursAgo(6),
      },
      es: {
        id: createSignalId('sig-007'),
        author: author007,
        content: {
          text: 'Mi tío ha estado detenido por 14 meses sin cargos formales. Las noticias de hoy sobre la reunión diplomática son la primera esperanza que hemos tenido. Solo queremos saber que está bien. Comparto su número de caso para el registro.',
        },
        context: {
          topics: ['human-rights', 'personal-testimony', 'detention'],
          locationName: 'Porto, Portugal',
          location: { latitude: 41.1579, longitude: -8.6291 },
        },
        dimSignature: author007.credentialHash,
        chainLinks: [createChainId('chain-003')],
        corroborations: { witnessCount: 12, evidenceCount: 3, expertiseCount: 0, challengeCount: 0, totalWeight: 14.2 },
        verification: unverified,
        createdAt: hoursAgo(6),
      },
    },
    {
      id: 'sig-008',
      en: {
        id: createSignalId('sig-008'),
        author: author008,
        content: {
          text: "Third day without reliable electricity at the regional hospital. Backup generators running low on fuel. We're prioritizing only critical surgeries. Staff working double shifts unpaid. This is unsustainable.",
        },
        context: {
          topics: ['health', 'infrastructure', 'crisis'],
          locationName: 'Barquisimeto, Venezuela',
          location: { latitude: 10.0678, longitude: -69.3467 },
        },
        dimSignature: author008.credentialHash,
        chainLinks: [createChainId('chain-004')],
        corroborations: { witnessCount: 8, evidenceCount: 4, expertiseCount: 3, challengeCount: 0, totalWeight: 19.7 },
        verification: unverified,
        createdAt: hoursAgo(18),
      },
      es: {
        id: createSignalId('sig-008'),
        author: author008,
        content: {
          text: 'Tercer día sin electricidad confiable en el hospital regional. Los generadores de respaldo con poco combustible. Solo priorizamos cirugías críticas. Personal trabajando turnos dobles sin paga. Esto es insostenible.',
        },
        context: {
          topics: ['health', 'infrastructure', 'crisis'],
          locationName: 'Barquisimeto, Venezuela',
          location: { latitude: 10.0678, longitude: -69.3467 },
        },
        dimSignature: author008.credentialHash,
        chainLinks: [createChainId('chain-004')],
        corroborations: { witnessCount: 8, evidenceCount: 4, expertiseCount: 3, challengeCount: 0, totalWeight: 19.7 },
        verification: unverified,
        createdAt: hoursAgo(18),
      },
    },
    {
      id: 'sig-009',
      en: {
        id: createSignalId('sig-009'),
        author: author009,
        content: {
          text: 'Compiled medication availability data from 12 pharmacies across Lara state. 67% of essential medications unavailable. Insulin, blood pressure meds, and antibiotics most affected. Data spreadsheet linked.',
          links: ['https://example.com/med-availability-data'],
        },
        context: {
          topics: ['health', 'medication', 'data'],
          locationName: 'Lara State, Venezuela',
        },
        dimSignature: author009.credentialHash,
        chainLinks: [createChainId('chain-004')],
        corroborations: { witnessCount: 5, evidenceCount: 14, expertiseCount: 2, challengeCount: 1, totalWeight: 24.3 },
        verification: { status: 'verified', verifiedBy: createCollectiveId('health-collective') },
        createdAt: hoursAgo(30),
      },
      es: {
        id: createSignalId('sig-009'),
        author: author009,
        content: {
          text: 'Compilé datos de disponibilidad de medicamentos de 12 farmacias en el estado Lara. 67% de medicamentos esenciales no disponibles. Insulina, medicamentos para presión arterial y antibióticos los más afectados. Hoja de datos enlazada.',
          links: ['https://example.com/med-availability-data'],
        },
        context: {
          topics: ['health', 'medication', 'data'],
          locationName: 'Lara State, Venezuela',
        },
        dimSignature: author009.credentialHash,
        chainLinks: [createChainId('chain-004')],
        corroborations: { witnessCount: 5, evidenceCount: 14, expertiseCount: 2, challengeCount: 1, totalWeight: 24.3 },
        verification: { status: 'verified', verifiedBy: createCollectiveId('health-collective') },
        createdAt: hoursAgo(30),
      },
    },
  ];
}

// ============================================================
// CHAINS DATA
// ============================================================

interface ChainSeedData {
  id: string;
  en: StoryChain;
  es: StoryChain;
}

function createChainData(): ChainSeedData[] {
  return [
    {
      id: 'chain-001',
      en: {
        id: createChainId('chain-001'),
        title: 'Economic Crisis: Currency & Food Security',
        description: 'Documenting the ongoing economic situation including currency devaluation, food basket costs, and impact on daily life for Venezuelan families.',
        topics: ['economy', 'currency', 'food-security', 'inflation'],
        location: 'Venezuela',
        status: 'active',
        signalIds: [createSignalId('sig-001'), createSignalId('sig-002'), createSignalId('sig-003')],
        stats: { signalCount: 3, totalCorroborations: 56, totalChallenges: 1, contributorCount: 3, totalWeight: 98.0 },
        createdAt: daysAgo(7),
        updatedAt: hoursAgo(24),
      },
      es: {
        id: createChainId('chain-001'),
        title: 'Crisis Económica: Moneda y Seguridad Alimentaria',
        description: 'Documentando la situación económica actual incluyendo la devaluación monetaria, costos de la canasta alimentaria e impacto en la vida diaria de las familias venezolanas.',
        topics: ['economy', 'currency', 'food-security', 'inflation'],
        location: 'Venezuela',
        status: 'active',
        signalIds: [createSignalId('sig-001'), createSignalId('sig-002'), createSignalId('sig-003')],
        stats: { signalCount: 3, totalCorroborations: 56, totalChallenges: 1, contributorCount: 3, totalWeight: 98.0 },
        createdAt: daysAgo(7),
        updatedAt: hoursAgo(24),
      },
    },
    {
      id: 'chain-002',
      en: {
        id: createChainId('chain-002'),
        title: 'Government Transparency & Appointments',
        description: 'Tracking official appointments, dismissals, and transparency concerns in Venezuelan government institutions.',
        topics: ['politics', 'transparency', 'governance', 'public-records'],
        location: 'Caracas, Venezuela',
        status: 'active',
        signalIds: [createSignalId('sig-004'), createSignalId('sig-005')],
        stats: { signalCount: 2, totalCorroborations: 31, totalChallenges: 2, contributorCount: 2, totalWeight: 63.4 },
        createdAt: daysAgo(5),
        updatedAt: hoursAgo(48),
      },
      es: {
        id: createChainId('chain-002'),
        title: 'Transparencia Gubernamental y Nombramientos',
        description: 'Seguimiento de nombramientos oficiales, destituciones y preocupaciones de transparencia en instituciones gubernamentales venezolanas.',
        topics: ['politics', 'transparency', 'governance', 'public-records'],
        location: 'Caracas, Venezuela',
        status: 'active',
        signalIds: [createSignalId('sig-004'), createSignalId('sig-005')],
        stats: { signalCount: 2, totalCorroborations: 31, totalChallenges: 2, contributorCount: 2, totalWeight: 63.4 },
        createdAt: daysAgo(5),
        updatedAt: hoursAgo(48),
      },
    },
    {
      id: 'chain-003',
      en: {
        id: createChainId('chain-003'),
        title: 'International Diplomacy: Detained Citizens',
        description: 'Following diplomatic efforts regarding detained foreign nationals and political prisoners, including family testimonies and official statements.',
        topics: ['international', 'human-rights', 'diplomacy', 'detention'],
        location: 'International',
        status: 'emerging',
        signalIds: [createSignalId('sig-006'), createSignalId('sig-007')],
        stats: { signalCount: 2, totalCorroborations: 17, totalChallenges: 0, contributorCount: 2, totalWeight: 32.6 },
        createdAt: daysAgo(2),
        updatedAt: hoursAgo(6),
      },
      es: {
        id: createChainId('chain-003'),
        title: 'Diplomacia Internacional: Ciudadanos Detenidos',
        description: 'Siguiendo los esfuerzos diplomáticos relacionados con nacionales extranjeros detenidos y presos políticos, incluyendo testimonios familiares y declaraciones oficiales.',
        topics: ['international', 'human-rights', 'diplomacy', 'detention'],
        location: 'International',
        status: 'emerging',
        signalIds: [createSignalId('sig-006'), createSignalId('sig-007')],
        stats: { signalCount: 2, totalCorroborations: 17, totalChallenges: 0, contributorCount: 2, totalWeight: 32.6 },
        createdAt: daysAgo(2),
        updatedAt: hoursAgo(6),
      },
    },
    {
      id: 'chain-004',
      en: {
        id: createChainId('chain-004'),
        title: 'Healthcare System Under Strain',
        description: 'Documenting conditions in hospitals, medication availability, and healthcare worker testimonies across Venezuela.',
        topics: ['health', 'infrastructure', 'medication', 'crisis'],
        location: 'Venezuela',
        status: 'established',
        signalIds: [createSignalId('sig-008'), createSignalId('sig-009')],
        stats: { signalCount: 2, totalCorroborations: 17, totalChallenges: 1, contributorCount: 2, totalWeight: 44.0 },
        createdAt: daysAgo(14),
        updatedAt: hoursAgo(18),
      },
      es: {
        id: createChainId('chain-004'),
        title: 'Sistema de Salud Bajo Presión',
        description: 'Documentando las condiciones en hospitales, disponibilidad de medicamentos y testimonios de trabajadores de salud en toda Venezuela.',
        topics: ['health', 'infrastructure', 'medication', 'crisis'],
        location: 'Venezuela',
        status: 'established',
        signalIds: [createSignalId('sig-008'), createSignalId('sig-009')],
        stats: { signalCount: 2, totalCorroborations: 17, totalChallenges: 1, contributorCount: 2, totalWeight: 44.0 },
        createdAt: daysAgo(14),
        updatedAt: hoursAgo(18),
      },
    },
  ];
}

// ============================================================
// BOUNTIES DATA
// ============================================================

interface BountySeedData {
  id: string;
  en: Bounty;
  es: Bounty;
}

function createBountyData(): BountySeedData[] {
  const baseBounty = {
    funderCredential: createDIMCredential('dim-funder-ve-001'),
    escrowId: createEscrowId('escrow-ve-001'),
    fundingTxHash: createTransactionHash('0xve001...abc'),
    payoutMode: 'private' as const,
    contributingSignals: [createSignalId('sig-001'), createSignalId('sig-002')],
    relatedChainId: createChainId('chain-001'),
  };

  return [
    {
      id: 'bounty-ve-001',
      en: {
        id: createBountyId('bounty-ve-001'),
        title: 'Document current food basket prices across Caracas',
        description: 'We need weekly documentation of basic food basket prices (canasta básica) from supermarkets and markets across different neighborhoods in Caracas. Include: store name/location, date, itemized prices for staples (rice, beans, flour, cooking oil, eggs), photos of price tags, and any observations about availability or shortages.',
        topics: ['economy', 'food-security', 'inflation', 'documentation'],
        location: 'Caracas, Venezuela',
        status: 'open',
        fundingAmount: createPUSDAmount(450_000_000n),
        ...baseBounty,
        createdAt: daysAgo(5),
        expiresAt: daysFromNow(25),
      },
      es: {
        id: createBountyId('bounty-ve-001'),
        title: 'Documentar precios actuales de la canasta básica en Caracas',
        description: 'Necesitamos documentación semanal de los precios de la canasta básica en supermercados y mercados de diferentes barrios de Caracas. Incluir: nombre/ubicación de la tienda, fecha, precios detallados de productos básicos (arroz, frijoles, harina, aceite, huevos), fotos de etiquetas de precios, y observaciones sobre disponibilidad o escasez.',
        topics: ['economy', 'food-security', 'inflation', 'documentation'],
        location: 'Caracas, Venezuela',
        status: 'open',
        fundingAmount: createPUSDAmount(450_000_000n),
        ...baseBounty,
        createdAt: daysAgo(5),
        expiresAt: daysFromNow(25),
      },
    },
    {
      id: 'bounty-ve-002',
      en: {
        id: createBountyId('bounty-ve-002'),
        title: 'Verify recent ministry appointments and dismissals',
        description: 'Track and verify official appointments and dismissals in Venezuelan government ministries. Looking for: official gazette publications, press conference recordings, social media announcements from official accounts, and any documentation showing appointment dates, credentials, and previous positions of new officials.',
        topics: ['politics', 'transparency', 'governance', 'public-records'],
        location: 'Venezuela',
        status: 'open',
        fundingAmount: createPUSDAmount(600_000_000n),
        funderCredential: createDIMCredential('dim-funder-ve-002'),
        escrowId: createEscrowId('escrow-ve-002'),
        fundingTxHash: createTransactionHash('0xve002...def'),
        payoutMode: 'private',
        contributingSignals: [createSignalId('sig-004'), createSignalId('sig-005')],
        relatedChainId: createChainId('chain-002'),
        createdAt: daysAgo(4),
        expiresAt: daysFromNow(26),
      },
      es: {
        id: createBountyId('bounty-ve-002'),
        title: 'Verificar nombramientos y destituciones recientes en ministerios',
        description: 'Rastrear y verificar nombramientos y destituciones oficiales en los ministerios del gobierno venezolano. Buscamos: publicaciones de la Gaceta Oficial, grabaciones de ruedas de prensa, anuncios en redes sociales de cuentas oficiales, y documentación que muestre fechas de nombramiento, credenciales y cargos anteriores de los nuevos funcionarios.',
        topics: ['politics', 'transparency', 'governance', 'public-records'],
        location: 'Venezuela',
        status: 'open',
        fundingAmount: createPUSDAmount(600_000_000n),
        funderCredential: createDIMCredential('dim-funder-ve-002'),
        escrowId: createEscrowId('escrow-ve-002'),
        fundingTxHash: createTransactionHash('0xve002...def'),
        payoutMode: 'private',
        contributingSignals: [createSignalId('sig-004'), createSignalId('sig-005')],
        relatedChainId: createChainId('chain-002'),
        createdAt: daysAgo(4),
        expiresAt: daysFromNow(26),
      },
    },
    {
      id: 'bounty-ve-003',
      en: {
        id: createBountyId('bounty-ve-003'),
        title: 'Document hospital conditions and medication availability in Maracaibo',
        description: 'We need firsthand documentation of conditions at public hospitals in Maracaibo. Looking for: photos of waiting areas, pharmacy stock levels, staff testimonies about equipment/supply shortages, and patient wait times for emergency care.',
        topics: ['health', 'infrastructure', 'crisis', 'documentation'],
        location: 'Maracaibo, Venezuela',
        status: 'open',
        fundingAmount: createPUSDAmount(350_000_000n),
        funderCredential: createDIMCredential('dim-funder-ve-003'),
        escrowId: createEscrowId('escrow-ve-003'),
        fundingTxHash: createTransactionHash('0xve003...ghi'),
        payoutMode: 'private',
        contributingSignals: [],
        createdAt: daysAgo(3),
        expiresAt: daysFromNow(27),
      },
      es: {
        id: createBountyId('bounty-ve-003'),
        title: 'Documentar condiciones hospitalarias y disponibilidad de medicamentos en Maracaibo',
        description: 'Necesitamos documentación de primera mano sobre las condiciones en hospitales públicos de Maracaibo. Buscamos: fotos de salas de espera, niveles de stock de farmacia, testimonios del personal sobre escasez de equipos/suministros, y tiempos de espera para atención de emergencias.',
        topics: ['health', 'infrastructure', 'crisis', 'documentation'],
        location: 'Maracaibo, Venezuela',
        status: 'open',
        fundingAmount: createPUSDAmount(350_000_000n),
        funderCredential: createDIMCredential('dim-funder-ve-003'),
        escrowId: createEscrowId('escrow-ve-003'),
        fundingTxHash: createTransactionHash('0xve003...ghi'),
        payoutMode: 'private',
        contributingSignals: [],
        createdAt: daysAgo(3),
        expiresAt: daysFromNow(27),
      },
    },
  ];
}

// ============================================================
// COLLECTIVES DATA (not localized)
// ============================================================

function createCollectiveData(): Collective[] {
  return [
    {
      id: createCollectiveId('econ-collective'),
      name: 'Economic Watch Venezuela',
      description: 'Verifying economic data, currency reports, and cost-of-living information.',
      mission: 'Provide accurate economic information to Venezuelan citizens through collaborative verification.',
      topics: ['economy', 'currency', 'food-security', 'wages'],
      members: [
        { credentialHash: createDIMCredential('dim-econ-001'), pseudonym: 'EconVerifier', role: 'founder', joinedAt: daysAgo(90), verificationsCompleted: 52 },
        { credentialHash: createDIMCredential('dim-econ-002'), pseudonym: 'DataChecker', role: 'moderator', joinedAt: daysAgo(60), verificationsCompleted: 38 },
      ],
      governance: { minVotesForVerdict: 2, verdictThreshold: 66, membershipApproval: 'vote' },
      reputation: { score: 94, verificationsCompleted: 89, accuracyRate: 0.96, avgResponseTime: 14 },
      createdAt: daysAgo(90),
      updatedAt: daysAgo(1),
    },
    {
      id: createCollectiveId('civic-collective'),
      name: 'Civic Transparency Network',
      description: 'Fact-checking government proceedings, public records, and official statements.',
      mission: 'Hold government accountable through verified documentation and collaborative fact-checking.',
      topics: ['politics', 'transparency', 'governance', 'public-records'],
      members: [
        { credentialHash: createDIMCredential('dim-civic-001'), pseudonym: 'RecordsKeeper', role: 'founder', joinedAt: daysAgo(120), verificationsCompleted: 78 },
      ],
      governance: { minVotesForVerdict: 2, verdictThreshold: 75, membershipApproval: 'vote' },
      reputation: { score: 91, verificationsCompleted: 98, accuracyRate: 0.93, avgResponseTime: 20 },
      createdAt: daysAgo(120),
      updatedAt: daysAgo(2),
    },
    {
      id: createCollectiveId('health-collective'),
      name: 'Health Crisis Verifiers',
      description: 'Verifying health-related information, hospital conditions, and medication availability.',
      mission: 'Document healthcare conditions accurately to support advocacy and aid efforts.',
      topics: ['health', 'medication', 'infrastructure', 'crisis'],
      members: [
        { credentialHash: createDIMCredential('dim-health-001'), pseudonym: 'MedVerifier', role: 'founder', joinedAt: daysAgo(60), verificationsCompleted: 41 },
      ],
      governance: { minVotesForVerdict: 3, verdictThreshold: 80, membershipApproval: 'invite' },
      reputation: { score: 96, verificationsCompleted: 47, accuracyRate: 0.98, avgResponseTime: 10 },
      createdAt: daysAgo(60),
      updatedAt: daysAgo(3),
    },
  ];
}

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

export function seed(): void {
  console.log('Seeding development data...');

  // Seed signals
  const signalData = createSignalData();
  seedSignals(signalData.map((s) => ({
    id: s.id,
    data: { en: s.en, es: s.es },
  })));
  console.log(`  ✓ ${signalData.length} signals`);

  // Seed chains
  const chainData = createChainData();
  seedChains(chainData.map((c) => ({
    id: c.id,
    data: { en: c.en, es: c.es },
  })));
  console.log(`  ✓ ${chainData.length} story chains`);

  // Seed bounties
  const bountyData = createBountyData();
  seedBounties(bountyData.map((b) => ({
    id: b.id,
    data: { en: b.en, es: b.es },
  })));
  console.log(`  ✓ ${bountyData.length} bounties`);

  // Seed collectives
  const collectiveData = createCollectiveData();
  seedCollectives(collectiveData);
  console.log(`  ✓ ${collectiveData.length} collectives`);

  // Mark as seeded
  markAsSeeded();

  console.log('\nDevelopment data seeded successfully!');
  console.log('The app will now display mock data until the server restarts.');
}

// Run if called directly
seed();
