/**
 * Mock data for development.
 *
 * Stories inspired by Efecto Cocuyo (efectococuyo.com), a Venezuelan
 * investigative journalism organization. Used with attribution to
 * demonstrate the Firefly Network's purpose: surveillance-resistant
 * collective intelligence for journalism in challenging environments.
 *
 * This data mirrors the eventual on-chain data structures.
 * It should NOT be imported directly into components — use the
 * service abstractions instead.
 */

import type {
  Signal, StoryChain, ChainPreview, FireflyAuthor, SignalVerification,
  Collective, CollectivePreview, VerificationRequest,
} from '@cocuyo/types';
import {
  createSignalId,
  createChainId,
  createCollectiveId,
  createDIMCredential,
  createVerificationRequestId,
} from '@cocuyo/types';
import { hoursAgo, daysAgo } from '@/lib/utils/time';

export type Locale = 'en' | 'es';

/**
 * Attribution for Efecto Cocuyo inspiration.
 */
export const ATTRIBUTION = {
  en: 'Stories inspired by Efecto Cocuyo (efectococuyo.com)',
  es: 'Historias inspiradas en Efecto Cocuyo (efectococuyo.com)',
} as const;

/**
 * Helper to create anonymous author info.
 */
function createMockAuthor(id: string, pseudonym: string, extra?: { location?: string; reputation?: number }): FireflyAuthor {
  return {
    id,
    credentialHash: createDIMCredential(`dim-anon-${id}`),
    pseudonym,
    disclosureLevel: 'anonymous',
    ...(extra?.location !== undefined && { location: extra.location }),
    ...(extra?.reputation !== undefined && { reputation: extra.reputation }),
  };
}

/**
 * Default unverified status.
 */
const unverified: SignalVerification = {
  status: 'unverified',
};

/**
 * Locale-aware signal content.
 */
interface LocalizedSignalContent {
  en: { text: string; links?: string[] };
  es: { text: string; links?: string[] };
}

interface LocalizedSignalData {
  id: string;
  author: FireflyAuthor;
  content: LocalizedSignalContent;
  context: {
    topics: string[];
    locationName?: string;
    location?: { latitude: number; longitude: number };
  };
  chainLinks: string[];
  corroborations: Signal['corroborations'];
  verification: SignalVerification;
  createdAt: number;
}

/**
 * Locale-aware chain content.
 */
interface LocalizedChainContent {
  en: { title: string; description: string };
  es: { title: string; description: string };
}

interface LocalizedChainData {
  id: string;
  content: LocalizedChainContent;
  topics: string[];
  location?: string;
  status: StoryChain['status'];
  signalIds: string[];
  stats: StoryChain['stats'];
  createdAt: number;
  updatedAt: number;
}

/**
 * Mock signals based on Efecto Cocuyo coverage themes.
 */
const localizedSignals: LocalizedSignalData[] = [
  // Chain 1: Economic Crisis / Currency Devaluation
  {
    id: 'sig-001',
    author: createMockAuthor('001', 'EconWatcher', { location: 'Caracas', reputation: 67 }),
    content: {
      en: {
        text: 'The bolívar has lost 36.4% of its value against the dollar in the first quarter alone. At my local market, prices are now posted in dollars — vendors update bolívar prices daily because they change too fast.',
      },
      es: {
        text: 'El bolívar ha perdido 36,4% de su valor frente al dólar solo en el primer trimestre. En mi mercado local, los precios ya se publican en dólares — los vendedores actualizan los precios en bolívares diariamente porque cambian muy rápido.',
      },
    },
    context: {
      topics: ['economy', 'currency', 'inflation'],
      locationName: 'Caracas, Venezuela',
      location: { latitude: 10.4806, longitude: -66.9036 },
    },
    chainLinks: ['chain-001'],
    corroborations: {
      witnessCount: 23,
      evidenceCount: 8,
      expertiseCount: 3,
      challengeCount: 0,
      totalWeight: 34.5,
    },
    verification: { status: 'verified', verifiedBy: createCollectiveId('econ-collective') },
    createdAt: hoursAgo(48),
  },
  {
    id: 'sig-002',
    author: createMockAuthor('002', 'MarketAnalyst', { location: 'Maracaibo', reputation: 78 }),
    content: {
      en: {
        text: 'The food basket for a family now exceeds $645 per month. The minimum wage covers only 0.05% of this — you would need 1,937 minimum salaries to afford basic food. I have the official CENDAS report.',
        links: ['https://cendas.org.ve/canasta-alimentaria'],
      },
      es: {
        text: 'La canasta alimentaria familiar supera los $645 mensuales. El salario mínimo cubre apenas el 0,05% — se necesitarían 1.937 salarios mínimos para cubrir la alimentación básica. Tengo el informe oficial de CENDAS.',
        links: ['https://cendas.org.ve/canasta-alimentaria'],
      },
    },
    context: {
      topics: ['economy', 'food-security', 'wages'],
      locationName: 'Maracaibo, Venezuela',
      location: { latitude: 10.6427, longitude: -71.6125 },
    },
    chainLinks: ['chain-001'],
    corroborations: {
      witnessCount: 15,
      evidenceCount: 12,
      expertiseCount: 4,
      challengeCount: 0,
      totalWeight: 41.2,
    },
    verification: { status: 'verified', verifiedBy: createCollectiveId('econ-collective') },
    createdAt: hoursAgo(36),
  },
  {
    id: 'sig-003',
    author: createMockAuthor('003', 'StreetReporter', { location: 'Valencia', reputation: 45 }),
    content: {
      en: {
        text: 'Witnessing long lines at exchange houses again. People waiting 3+ hours to convert bolívares to dollars before their savings lose more value. Elderly citizens particularly affected — some have been here since 5am.',
      },
      es: {
        text: 'Observando largas colas en las casas de cambio otra vez. Personas esperando más de 3 horas para convertir bolívares a dólares antes de que sus ahorros pierdan más valor. Ciudadanos mayores particularmente afectados — algunos aquí desde las 5am.',
      },
    },
    context: {
      topics: ['economy', 'currency', 'daily-life'],
      locationName: 'Valencia, Venezuela',
      location: { latitude: 10.1579, longitude: -67.9972 },
    },
    chainLinks: ['chain-001'],
    corroborations: {
      witnessCount: 18,
      evidenceCount: 5,
      expertiseCount: 0,
      challengeCount: 1,
      totalWeight: 22.3,
    },
    verification: unverified,
    createdAt: hoursAgo(24),
  },

  // Chain 2: Political Transparency
  {
    id: 'sig-004',
    author: createMockAuthor('004', 'TransparencyWatch', { location: 'Caracas', reputation: 82 }),
    content: {
      en: {
        text: 'Following the dismissal of a high-ranking official connected to powerful political families, Transparencia Venezuela is raising alarms about opacity in government appointments. No public explanation has been given for the removal.',
      },
      es: {
        text: 'Tras la destitución de un funcionario de alto rango conectado a familias políticas poderosas, Transparencia Venezuela alerta sobre la opacidad en los nombramientos gubernamentales. No se ha dado explicación pública sobre la remoción.',
      },
    },
    context: {
      topics: ['politics', 'transparency', 'governance'],
      locationName: 'Caracas, Venezuela',
      location: { latitude: 10.4806, longitude: -66.9036 },
    },
    chainLinks: ['chain-002'],
    corroborations: {
      witnessCount: 8,
      evidenceCount: 15,
      expertiseCount: 6,
      challengeCount: 2,
      totalWeight: 27.8,
    },
    verification: { status: 'verified', verifiedBy: createCollectiveId('civic-collective') },
    createdAt: hoursAgo(72),
  },
  {
    id: 'sig-005',
    author: createMockAuthor('005', 'DocHunter', { reputation: 71 }),
    content: {
      en: {
        text: 'Cross-referenced public appointment records. Three family members of the dismissed official still hold positions in state enterprises. No conflict of interest disclosures on file. Screenshots of the registry attached.',
      },
      es: {
        text: 'Crucé referencias de registros de nombramientos públicos. Tres familiares del funcionario destituido aún ocupan cargos en empresas estatales. No hay declaraciones de conflicto de interés archivadas. Capturas del registro adjuntas.',
      },
    },
    context: {
      topics: ['politics', 'public-records', 'transparency'],
      locationName: 'Public Records Database',
    },
    chainLinks: ['chain-002'],
    corroborations: {
      witnessCount: 2,
      evidenceCount: 18,
      expertiseCount: 4,
      challengeCount: 0,
      totalWeight: 35.6,
    },
    verification: { status: 'verified', verifiedBy: createCollectiveId('civic-collective') },
    createdAt: hoursAgo(48),
  },

  // Chain 3: International Pressure / Political Prisoners
  {
    id: 'sig-006',
    author: createMockAuthor('006', 'DiplomacyTracker', { location: 'Lisbon', reputation: 63 }),
    content: {
      en: {
        text: 'Portugal\'s foreign ministry confirmed a meeting with Venezuelan officials regarding detained Portuguese citizens. Families have been waiting months for any news. The ministry is "cautiously optimistic" about progress.',
      },
      es: {
        text: 'El Ministerio de Relaciones Exteriores de Portugal confirmó una reunión con funcionarios venezolanos sobre ciudadanos portugueses detenidos. Las familias han esperado meses por noticias. El ministerio está "cautelosamente optimista" sobre el progreso.',
      },
    },
    context: {
      topics: ['international', 'human-rights', 'diplomacy'],
      locationName: 'Lisbon, Portugal',
      location: { latitude: 38.7223, longitude: -9.1393 },
    },
    chainLinks: ['chain-003'],
    corroborations: {
      witnessCount: 5,
      evidenceCount: 7,
      expertiseCount: 2,
      challengeCount: 0,
      totalWeight: 18.4,
    },
    verification: unverified,
    createdAt: hoursAgo(12),
  },
  {
    id: 'sig-007',
    author: createMockAuthor('007', 'FamilyVoice', { location: 'Porto', reputation: 38 }),
    content: {
      en: {
        text: 'My uncle has been detained for 14 months without formal charges. Today\'s news about the diplomatic meeting is the first hope we\'ve had. We just want to know he\'s safe. Sharing his case number for the record.',
      },
      es: {
        text: 'Mi tío ha estado detenido por 14 meses sin cargos formales. Las noticias de hoy sobre la reunión diplomática son la primera esperanza que hemos tenido. Solo queremos saber que está bien. Comparto su número de caso para el registro.',
      },
    },
    context: {
      topics: ['human-rights', 'personal-testimony', 'detention'],
      locationName: 'Porto, Portugal',
      location: { latitude: 41.1579, longitude: -8.6291 },
    },
    chainLinks: ['chain-003'],
    corroborations: {
      witnessCount: 12,
      evidenceCount: 3,
      expertiseCount: 0,
      challengeCount: 0,
      totalWeight: 14.2,
    },
    verification: unverified,
    createdAt: hoursAgo(6),
  },

  // Chain 4: Healthcare Crisis
  {
    id: 'sig-008',
    author: createMockAuthor('008', 'HospitalWorker', { location: 'Barquisimeto', reputation: 54 }),
    content: {
      en: {
        text: 'Third day without reliable electricity at the regional hospital. Backup generators running low on fuel. We\'re prioritizing only critical surgeries. Staff working double shifts unpaid. This is unsustainable.',
      },
      es: {
        text: 'Tercer día sin electricidad confiable en el hospital regional. Los generadores de respaldo con poco combustible. Solo priorizamos cirugías críticas. Personal trabajando turnos dobles sin paga. Esto es insostenible.',
      },
    },
    context: {
      topics: ['health', 'infrastructure', 'crisis'],
      locationName: 'Barquisimeto, Venezuela',
      location: { latitude: 10.0678, longitude: -69.3467 },
    },
    chainLinks: ['chain-004'],
    corroborations: {
      witnessCount: 8,
      evidenceCount: 4,
      expertiseCount: 3,
      challengeCount: 0,
      totalWeight: 19.7,
    },
    verification: unverified,
    createdAt: hoursAgo(18),
  },
  {
    id: 'sig-009',
    author: createMockAuthor('009', 'MedSupplyTracker', { reputation: 66 }),
    content: {
      en: {
        text: 'Compiled medication availability data from 12 pharmacies across Lara state. 67% of essential medications unavailable. Insulin, blood pressure meds, and antibiotics most affected. Data spreadsheet linked.',
        links: ['https://example.com/med-availability-data'],
      },
      es: {
        text: 'Compilé datos de disponibilidad de medicamentos de 12 farmacias en el estado Lara. 67% de medicamentos esenciales no disponibles. Insulina, medicamentos para presión arterial y antibióticos los más afectados. Hoja de datos enlazada.',
        links: ['https://example.com/med-availability-data'],
      },
    },
    context: {
      topics: ['health', 'medication', 'data'],
      locationName: 'Lara State, Venezuela',
    },
    chainLinks: ['chain-004'],
    corroborations: {
      witnessCount: 5,
      evidenceCount: 14,
      expertiseCount: 2,
      challengeCount: 1,
      totalWeight: 24.3,
    },
    verification: { status: 'verified', verifiedBy: createCollectiveId('health-collective') },
    createdAt: hoursAgo(30),
  },
];

/**
 * Locale-aware story chains.
 */
const localizedChains: LocalizedChainData[] = [
  {
    id: 'chain-001',
    content: {
      en: {
        title: 'Economic Crisis: Currency & Food Security',
        description: 'Documenting the ongoing economic situation including currency devaluation, food basket costs, and impact on daily life for Venezuelan families.',
      },
      es: {
        title: 'Crisis Económica: Moneda y Seguridad Alimentaria',
        description: 'Documentando la situación económica actual incluyendo la devaluación monetaria, costos de la canasta alimentaria e impacto en la vida diaria de las familias venezolanas.',
      },
    },
    topics: ['economy', 'currency', 'food-security', 'inflation'],
    location: 'Venezuela',
    status: 'active',
    signalIds: ['sig-001', 'sig-002', 'sig-003'],
    stats: {
      signalCount: 3,
      totalCorroborations: 56,
      totalChallenges: 1,
      contributorCount: 3,
      totalWeight: 98.0,
    },
    createdAt: daysAgo(7),
    updatedAt: hoursAgo(24),
  },
  {
    id: 'chain-002',
    content: {
      en: {
        title: 'Government Transparency & Appointments',
        description: 'Tracking official appointments, dismissals, and transparency concerns in Venezuelan government institutions.',
      },
      es: {
        title: 'Transparencia Gubernamental y Nombramientos',
        description: 'Seguimiento de nombramientos oficiales, destituciones y preocupaciones de transparencia en instituciones gubernamentales venezolanas.',
      },
    },
    topics: ['politics', 'transparency', 'governance', 'public-records'],
    location: 'Caracas, Venezuela',
    status: 'active',
    signalIds: ['sig-004', 'sig-005'],
    stats: {
      signalCount: 2,
      totalCorroborations: 31,
      totalChallenges: 2,
      contributorCount: 2,
      totalWeight: 63.4,
    },
    createdAt: daysAgo(5),
    updatedAt: hoursAgo(48),
  },
  {
    id: 'chain-003',
    content: {
      en: {
        title: 'International Diplomacy: Detained Citizens',
        description: 'Following diplomatic efforts regarding detained foreign nationals and political prisoners, including family testimonies and official statements.',
      },
      es: {
        title: 'Diplomacia Internacional: Ciudadanos Detenidos',
        description: 'Siguiendo los esfuerzos diplomáticos relacionados con nacionales extranjeros detenidos y presos políticos, incluyendo testimonios familiares y declaraciones oficiales.',
      },
    },
    topics: ['international', 'human-rights', 'diplomacy', 'detention'],
    location: 'International',
    status: 'emerging',
    signalIds: ['sig-006', 'sig-007'],
    stats: {
      signalCount: 2,
      totalCorroborations: 17,
      totalChallenges: 0,
      contributorCount: 2,
      totalWeight: 32.6,
    },
    createdAt: daysAgo(2),
    updatedAt: hoursAgo(6),
  },
  {
    id: 'chain-004',
    content: {
      en: {
        title: 'Healthcare System Under Strain',
        description: 'Documenting conditions in hospitals, medication availability, and healthcare worker testimonies across Venezuela.',
      },
      es: {
        title: 'Sistema de Salud Bajo Presión',
        description: 'Documentando las condiciones en hospitales, disponibilidad de medicamentos y testimonios de trabajadores de salud en toda Venezuela.',
      },
    },
    topics: ['health', 'infrastructure', 'medication', 'crisis'],
    location: 'Venezuela',
    status: 'established',
    signalIds: ['sig-008', 'sig-009'],
    stats: {
      signalCount: 2,
      totalCorroborations: 17,
      totalChallenges: 1,
      contributorCount: 2,
      totalWeight: 44.0,
    },
    createdAt: daysAgo(14),
    updatedAt: hoursAgo(18),
  },
];

/**
 * Convert localized signal data to Signal type for a given locale.
 */
function toSignal(data: LocalizedSignalData, locale: Locale): Signal {
  return {
    id: createSignalId(data.id),
    author: data.author,
    content: data.content[locale],
    context: {
      ...data.context,
      ...(data.context.locationName != null ? { locationName: data.context.locationName } : {}),
      ...(data.context.location != null ? { location: data.context.location } : {}),
    },
    dimSignature: data.author.credentialHash,
    chainLinks: data.chainLinks.map(createChainId),
    corroborations: data.corroborations,
    verification: data.verification,
    createdAt: data.createdAt,
  };
}

/**
 * Convert localized chain data to StoryChain type for a given locale.
 */
function toChain(data: LocalizedChainData, locale: Locale): StoryChain {
  return {
    id: createChainId(data.id),
    title: data.content[locale].title,
    description: data.content[locale].description,
    topics: data.topics,
    ...(data.location != null ? { location: data.location } : {}),
    status: data.status,
    signalIds: data.signalIds.map(createSignalId),
    stats: data.stats,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * Get signals for a given locale.
 */
export function getSignals(locale: Locale = 'en'): Signal[] {
  return localizedSignals.map((s) => toSignal(s, locale));
}

/**
 * Get chains for a given locale.
 */
export function getChains(locale: Locale = 'en'): StoryChain[] {
  return localizedChains.map((c) => toChain(c, locale));
}

/**
 * Get chain previews for listing.
 */
export function getChainPreviews(locale: Locale = 'en'): ChainPreview[] {
  return getChains(locale).map((chain) => ({
    id: chain.id,
    title: chain.title,
    topics: chain.topics,
    ...(chain.location != null && { location: chain.location }),
    status: chain.status,
    signalCount: chain.stats.signalCount,
    totalCorroborations: chain.stats.totalCorroborations,
    updatedAt: chain.updatedAt,
  }));
}

/**
 * Get signals by chain ID.
 */
export function getSignalsByChainId(chainId: string, locale: Locale = 'en'): Signal[] {
  return getSignals(locale).filter((signal) =>
    signal.chainLinks.some((link) => link === chainId)
  );
}

/**
 * Get chain by ID.
 */
export function getChainById(chainId: string, locale: Locale = 'en'): StoryChain | undefined {
  return getChains(locale).find((c) => c.id === chainId);
}

/**
 * Get chain title by ID.
 */
export function getChainTitle(chainId: string, locale: Locale = 'en'): string | undefined {
  const chain = getChainById(chainId, locale);
  return chain?.title;
}

/**
 * Get a signal by ID.
 */
export function getSignalById(signalId: string, locale: Locale = 'en'): Signal | undefined {
  return getSignals(locale).find((s) => s.id === signalId);
}

/**
 * Get all signal IDs for static generation.
 */
export function getAllSignalIds(): string[] {
  return localizedSignals.map((s) => createSignalId(s.id));
}

/**
 * Get all chain IDs for static generation.
 */
export function getAllChainIds(): string[] {
  return localizedChains.map((c) => createChainId(c.id));
}

// ============================================================
// Legacy exports for backward compatibility during migration
// These will be removed once all consumers use locale-aware functions
// ============================================================

/** @deprecated Use getSignals(locale) instead */
export const mockSignals: Signal[] = getSignals('en');

/** @deprecated Use getChains(locale) instead */
export const mockChains: StoryChain[] = getChains('en');

// ============================================================
// Collectives (not yet localized - future enhancement)
// ============================================================

/**
 * Mock collectives for fact-checking.
 */
export const mockCollectives: Collective[] = [
  {
    id: createCollectiveId('econ-collective'),
    name: 'Economic Watch Venezuela',
    description: 'Verifying economic data, currency reports, and cost-of-living information.',
    mission: 'Provide accurate economic information to Venezuelan citizens through collaborative verification.',
    topics: ['economy', 'currency', 'food-security', 'wages'],
    members: [
      { credentialHash: createDIMCredential('dim-econ-001'), pseudonym: 'EconVerifier', role: 'founder', joinedAt: daysAgo(90), verificationsCompleted: 52 },
      { credentialHash: createDIMCredential('dim-econ-002'), pseudonym: 'DataChecker', role: 'moderator', joinedAt: daysAgo(60), verificationsCompleted: 38 },
      { credentialHash: createDIMCredential('dim-econ-003'), pseudonym: 'MarketWatch', role: 'member', joinedAt: daysAgo(30), verificationsCompleted: 21 },
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
      { credentialHash: createDIMCredential('dim-civic-002'), pseudonym: 'GovWatcher', role: 'member', joinedAt: daysAgo(45), verificationsCompleted: 34 },
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
      { credentialHash: createDIMCredential('dim-health-002'), pseudonym: 'HealthWatch', role: 'member', joinedAt: daysAgo(30), verificationsCompleted: 19 },
    ],
    governance: { minVotesForVerdict: 3, verdictThreshold: 80, membershipApproval: 'invite' },
    reputation: { score: 96, verificationsCompleted: 47, accuracyRate: 0.98, avgResponseTime: 10 },
    createdAt: daysAgo(60),
    updatedAt: daysAgo(3),
  },
];

/**
 * Get collective previews for listing.
 */
export function getCollectivePreviews(): CollectivePreview[] {
  return mockCollectives.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    topics: c.topics,
    memberCount: c.members.length,
    reputation: c.reputation.score,
    verificationsCompleted: c.reputation.verificationsCompleted,
  }));
}

/**
 * Get collective by ID.
 */
export function getCollectiveById(id: string): Collective | undefined {
  return mockCollectives.find((c) => c.id === id);
}

/**
 * Get all collective IDs for static generation.
 */
export function getAllCollectiveIds(): string[] {
  return mockCollectives.map((c) => c.id);
}

/**
 * Mock verification requests.
 */
export const mockVerificationRequests: VerificationRequest[] = [
  {
    id: createVerificationRequestId('vr-001'),
    signalId: createSignalId('sig-002'),
    signalCid: 'bafybeig...',
    collectiveId: createCollectiveId('econ-collective'),
    status: 'voting',
    evidence: [
      { submittedBy: createDIMCredential('dim-econ-001'), submitterPseudonym: 'EconVerifier', content: 'Confirmed CENDAS report figures match official publication. Food basket methodology is standard.', sources: ['https://cendas.org.ve'], supports: true, submittedAt: hoursAgo(20) },
      { submittedBy: createDIMCredential('dim-econ-002'), submitterPseudonym: 'DataChecker', content: 'Cross-referenced with BCV exchange rate data. 36.4% devaluation figure is accurate.', sources: ['https://bcv.org.ve'], supports: true, submittedAt: hoursAgo(18) },
    ],
    votes: [
      { voter: createDIMCredential('dim-econ-001'), voterPseudonym: 'EconVerifier', verdict: 'verified', reasoning: 'Evidence strongly supports the economic data claims.', votedAt: hoursAgo(12) },
    ],
    createdAt: hoursAgo(24),
    updatedAt: hoursAgo(12),
  },
  {
    id: createVerificationRequestId('vr-002'),
    signalId: createSignalId('sig-004'),
    signalCid: 'bafybeih...',
    collectiveId: createCollectiveId('civic-collective'),
    status: 'in_review',
    evidence: [
      { submittedBy: createDIMCredential('dim-civic-001'), submitterPseudonym: 'RecordsKeeper', content: 'Verified dismissal through official gazette. No public statement found explaining the removal.', sources: ['https://gaceta-oficial.example'], supports: true, submittedAt: hoursAgo(4) },
    ],
    votes: [],
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(4),
  },
  {
    id: createVerificationRequestId('vr-003'),
    signalId: createSignalId('sig-008'),
    signalCid: 'bafybeij...',
    collectiveId: createCollectiveId('health-collective'),
    status: 'pending',
    evidence: [],
    votes: [],
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },
];

/**
 * Get verification requests for a collective.
 */
export function getVerificationsByCollective(collectiveId: string): VerificationRequest[] {
  return mockVerificationRequests.filter((v) => v.collectiveId === collectiveId);
}

/**
 * Get verification request by signal ID.
 */
export function getVerificationBySignalId(signalId: string): VerificationRequest | undefined {
  return mockVerificationRequests.find((v) => v.signalId === signalId);
}

/**
 * Get all pending/in-review verification requests.
 */
export function getPendingVerifications(): VerificationRequest[] {
  return mockVerificationRequests.filter((v) => v.status !== 'completed');
}

/**
 * Get author by ID (extracted from signals).
 */
export function getAuthorById(authorId: string, locale: Locale = 'en'): FireflyAuthor | undefined {
  const signal = getSignals(locale).find((s) => s.author.id === authorId);
  return signal?.author;
}

/**
 * Get signals by author ID.
 */
export function getSignalsByAuthor(authorId: string, locale: Locale = 'en'): Signal[] {
  return getSignals(locale).filter((s) => s.author.id === authorId);
}
