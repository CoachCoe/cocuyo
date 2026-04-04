/**
 * Mock data for posts and claims.
 *
 * Posts are longer-form content that may contain verifiable claims.
 * Claims are truth targets extracted from posts that can be verified.
 *
 * This data should NOT be imported directly into components — use the
 * service abstractions instead.
 */

import type {
  Post,
  PostPreview,
  Claim,
  ClaimPreview,
  ClaimStatus,
  PostStatus,
} from '@cocuyo/types';
import {
  createPostId,
  createClaimId,
  createDIMCredential,
  createSignalId,
  createChainId,
  createCollectiveId,
} from '@cocuyo/types';
import { daysAgo } from '@/lib/utils/time';
import type { Locale } from './mock-data';

export type { Locale } from './mock-data';

/**
 * Helper to create anonymous author info for posts.
 */
interface MockAuthor {
  id: string;
  credentialHash: ReturnType<typeof createDIMCredential>;
  pseudonym: string;
  disclosureLevel: 'anonymous';
  location?: string;
  reputation?: number;
}

function createMockAuthor(id: string, pseudonym: string, extra?: { location?: string; reputation?: number }): MockAuthor {
  return {
    id,
    credentialHash: createDIMCredential(`dim-author-${id}`),
    pseudonym,
    disclosureLevel: 'anonymous' as const,
    ...(extra?.location !== undefined && { location: extra.location }),
    ...(extra?.reputation !== undefined && { reputation: extra.reputation }),
  };
}

/**
 * Locale-aware post content.
 */
interface LocalizedPostContent {
  en: { title: string; text: string; links?: string[] };
  es: { title: string; text: string; links?: string[] };
}

interface LocalizedPostData {
  id: string;
  author: ReturnType<typeof createMockAuthor>;
  content: LocalizedPostContent;
  context: {
    topics: string[];
    locationName?: string;
  };
  status: PostStatus;
  extractedClaimIds: string[];
  relatedSignalIds: string[];
  relatedChainId?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Locale-aware claim content.
 */
interface LocalizedClaimContent {
  en: { statement: string };
  es: { statement: string };
}

interface LocalizedClaimData {
  id: string;
  content: LocalizedClaimContent;
  sourcePostId: string;
  extractedBy: string;
  status: ClaimStatus;
  evidenceSignalIds: { signalId: string; supports: boolean; note?: { en: string; es: string } }[];
  topics: string[];
  verdict?: {
    collectiveId: string;
    reasoning: { en: string; es: string };
    issuedAt: number;
  };
  createdAt: number;
  updatedAt: number;
}

/**
 * Mock posts based on Venezuelan themes.
 */
const localizedPosts: LocalizedPostData[] = [
  {
    id: 'post-001',
    author: createMockAuthor('p001', 'EconomicAnalyst', { location: 'Caracas', reputation: 72 }),
    content: {
      en: {
        title: 'The Hidden Cost of Hyperinflation: A Family Budget Analysis',
        text: `After months of tracking household expenses across 15 families in Caracas, I've compiled data that reveals the true impact of currency devaluation on everyday life.

The numbers are stark: families are now spending 78% of their income on food alone, up from 45% just six months ago. The remaining 22% must cover transportation, healthcare, and utilities — an impossible equation that forces impossible choices.

One family shared that they've reduced meals to twice daily. Another sold their car to buy three months of groceries. These aren't outliers — this is the new normal.

The official inflation figures don't capture this reality. The lived experience of hyperinflation is not a statistic; it's a daily negotiation with survival.`,
        links: ['https://example.com/family-budget-study'],
      },
      es: {
        title: 'El Costo Oculto de la Hiperinflación: Análisis del Presupuesto Familiar',
        text: `Después de meses rastreando gastos domésticos en 15 familias de Caracas, he compilado datos que revelan el verdadero impacto de la devaluación en la vida cotidiana.

Los números son contundentes: las familias ahora gastan el 78% de sus ingresos solo en comida, frente al 45% hace apenas seis meses. El 22% restante debe cubrir transporte, salud y servicios — una ecuación imposible que obliga a tomar decisiones imposibles.

Una familia compartió que han reducido las comidas a dos al día. Otra vendió su carro para comprar tres meses de alimentos. Estos no son casos aislados — esta es la nueva normalidad.

Las cifras oficiales de inflación no capturan esta realidad. La experiencia vivida de la hiperinflación no es una estadística; es una negociación diaria con la supervivencia.`,
        links: ['https://example.com/family-budget-study'],
      },
    },
    context: {
      topics: ['economy', 'inflation', 'food-security'],
      locationName: 'Caracas, Venezuela',
    },
    status: 'published',
    extractedClaimIds: ['claim-001', 'claim-002'],
    relatedSignalIds: ['sig-001', 'sig-002'],
    relatedChainId: 'chain-001',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: 'post-002',
    author: createMockAuthor('p002', 'HealthReporter', { location: 'Maracaibo', reputation: 65 }),
    content: {
      en: {
        title: 'Hospital Conditions in Zulia State: A Firsthand Account',
        text: `I spent two weeks visiting eight hospitals across Zulia State. What I found was a healthcare system operating on the edge of collapse.

At University Hospital of Maracaibo, only 3 of 12 operating rooms are functional. The others lack basic equipment or have been converted to storage. Surgeons are performing procedures by flashlight during power outages.

The medication crisis is equally severe. Hospital pharmacies are operating at 15% capacity. Patients are told to purchase their own supplies — from sutures to antibiotics — before receiving treatment.

Healthcare workers haven't been paid in two months. Many are leaving for Colombia or seeking work in other sectors. The doctors who remain are stretched beyond breaking point.

This is not about politics. This is about documenting conditions that must change.`,
      },
      es: {
        title: 'Condiciones Hospitalarias en el Estado Zulia: Un Relato de Primera Mano',
        text: `Pasé dos semanas visitando ocho hospitales del estado Zulia. Lo que encontré fue un sistema de salud operando al borde del colapso.

En el Hospital Universitario de Maracaibo, solo 3 de 12 quirófanos están funcionales. Los demás carecen de equipos básicos o se han convertido en almacenes. Los cirujanos realizan procedimientos con linternas durante los apagones.

La crisis de medicamentos es igualmente severa. Las farmacias hospitalarias operan al 15% de capacidad. A los pacientes se les dice que compren sus propios suministros — desde suturas hasta antibióticos — antes de recibir tratamiento.

Los trabajadores de salud no han cobrado en dos meses. Muchos se van a Colombia o buscan trabajo en otros sectores. Los médicos que quedan están exigidos más allá del punto de quiebre.

Esto no es sobre política. Esto es sobre documentar condiciones que deben cambiar.`,
      },
    },
    context: {
      topics: ['health', 'infrastructure', 'crisis'],
      locationName: 'Maracaibo, Zulia',
    },
    status: 'published',
    extractedClaimIds: ['claim-003', 'claim-004', 'claim-005'],
    relatedSignalIds: ['sig-008', 'sig-009'],
    relatedChainId: 'chain-004',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
  },
  {
    id: 'post-003',
    author: createMockAuthor('p003', 'CivicWatcher', { location: 'Caracas', reputation: 58 }),
    content: {
      en: {
        title: 'Tracking Government Appointments: A Pattern of Opacity',
        text: `Over the past year, I've tracked 47 high-level government appointments and dismissals. The pattern is clear: accountability is absent.

Of these 47 changes, only 12 included any public explanation. The remaining 35 were announced without context, without justification, and without any record of the decision-making process.

More concerning: 28 of the appointees have family connections to existing officials. This isn't speculation — it's documented in public records that few bother to cross-reference.

Transparency isn't just an ideal. It's the minimum standard for public service. When appointments happen in darkness, citizens cannot hold their government accountable.`,
      },
      es: {
        title: 'Rastreando Nombramientos Gubernamentales: Un Patrón de Opacidad',
        text: `Durante el último año, he rastreado 47 nombramientos y destituciones de alto nivel gubernamental. El patrón es claro: la rendición de cuentas está ausente.

De estos 47 cambios, solo 12 incluyeron alguna explicación pública. Los 35 restantes fueron anunciados sin contexto, sin justificación, y sin ningún registro del proceso de toma de decisiones.

Más preocupante: 28 de los nombrados tienen conexiones familiares con funcionarios existentes. Esto no es especulación — está documentado en registros públicos que pocos se molestan en cruzar.

La transparencia no es solo un ideal. Es el estándar mínimo para el servicio público. Cuando los nombramientos ocurren en la oscuridad, los ciudadanos no pueden exigir cuentas a su gobierno.`,
      },
    },
    context: {
      topics: ['politics', 'transparency', 'governance'],
      locationName: 'Caracas, Venezuela',
    },
    status: 'published',
    extractedClaimIds: ['claim-006', 'claim-007'],
    relatedSignalIds: ['sig-004', 'sig-005'],
    relatedChainId: 'chain-002',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(6),
  },
  {
    id: 'post-004',
    author: createMockAuthor('p004', 'LocalVoice', { location: 'Valencia', reputation: 42 }),
    content: {
      en: {
        title: 'Power Outages Are Getting Worse: My Community\'s Experience',
        text: `I've been logging power outages in my neighborhood for three months. The situation is deteriorating.

In January, we averaged 4 hours without power daily. In February, it rose to 7 hours. This month, we've had days with only 5 hours of electricity total.

The unpredictability is the worst part. Businesses can't operate. Students can't study. Medical equipment fails. Food spoils.

This isn't just inconvenience — it's a humanitarian issue. We need accurate documentation of what's happening in communities across the country.`,
      },
      es: {
        title: 'Los Apagones Empeoran: La Experiencia de Mi Comunidad',
        text: `He estado registrando los apagones en mi vecindario durante tres meses. La situación está empeorando.

En enero, promediamos 4 horas sin energía al día. En febrero, subió a 7 horas. Este mes, hemos tenido días con solo 5 horas de electricidad en total.

La imprevisibilidad es lo peor. Los negocios no pueden operar. Los estudiantes no pueden estudiar. Los equipos médicos fallan. La comida se daña.

Esto no es solo inconveniente — es un asunto humanitario. Necesitamos documentación precisa de lo que está pasando en comunidades de todo el país.`,
      },
    },
    context: {
      topics: ['infrastructure', 'daily-life', 'crisis'],
      locationName: 'Valencia, Venezuela',
    },
    status: 'published',
    extractedClaimIds: ['claim-008'],
    relatedSignalIds: ['sig-003'],
    relatedChainId: 'chain-001',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
];

/**
 * Mock claims extracted from posts.
 */
const localizedClaims: LocalizedClaimData[] = [
  // From post-001
  {
    id: 'claim-001',
    content: {
      en: { statement: 'Families in Caracas are spending 78% of their income on food alone.' },
      es: { statement: 'Las familias de Caracas gastan el 78% de sus ingresos solo en comida.' },
    },
    sourcePostId: 'post-001',
    extractedBy: 'dim-verifier-001',
    status: 'verified',
    evidenceSignalIds: [
      { signalId: 'sig-001', supports: true, note: { en: 'Confirms currency devaluation impact', es: 'Confirma impacto de devaluación' } },
      { signalId: 'sig-002', supports: true, note: { en: 'CENDAS data corroborates food basket costs', es: 'Datos de CENDAS corroboran costos de canasta' } },
    ],
    topics: ['economy', 'food-security'],
    verdict: {
      collectiveId: 'econ-collective',
      reasoning: {
        en: 'Multiple independent sources confirm the 78% figure. CENDAS data and field surveys align.',
        es: 'Múltiples fuentes independientes confirman la cifra del 78%. Datos de CENDAS y encuestas de campo coinciden.',
      },
      issuedAt: daysAgo(2),
    },
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  },
  {
    id: 'claim-002',
    content: {
      en: { statement: 'Families have reduced meals to twice daily due to economic pressure.' },
      es: { statement: 'Las familias han reducido las comidas a dos al día debido a presión económica.' },
    },
    sourcePostId: 'post-001',
    extractedBy: 'dim-verifier-002',
    status: 'pending',
    evidenceSignalIds: [
      { signalId: 'sig-001', supports: true },
    ],
    topics: ['economy', 'food-security', 'daily-life'],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  // From post-002
  {
    id: 'claim-003',
    content: {
      en: { statement: 'Only 3 of 12 operating rooms at University Hospital of Maracaibo are functional.' },
      es: { statement: 'Solo 3 de 12 quirófanos en el Hospital Universitario de Maracaibo están funcionales.' },
    },
    sourcePostId: 'post-002',
    extractedBy: 'dim-verifier-001',
    status: 'under_review',
    evidenceSignalIds: [
      { signalId: 'sig-008', supports: true, note: { en: 'Hospital worker confirms equipment failures', es: 'Trabajador hospitalario confirma fallas de equipos' } },
    ],
    topics: ['health', 'infrastructure'],
    createdAt: daysAgo(4),
    updatedAt: daysAgo(1),
  },
  {
    id: 'claim-004',
    content: {
      en: { statement: 'Hospital pharmacies in Zulia are operating at 15% capacity.' },
      es: { statement: 'Las farmacias hospitalarias en Zulia operan al 15% de capacidad.' },
    },
    sourcePostId: 'post-002',
    extractedBy: 'dim-verifier-003',
    status: 'verified',
    evidenceSignalIds: [
      { signalId: 'sig-009', supports: true, note: { en: 'Medication tracking data confirms shortage', es: 'Datos de seguimiento de medicamentos confirman escasez' } },
    ],
    topics: ['health', 'medication'],
    verdict: {
      collectiveId: 'health-collective',
      reasoning: {
        en: 'Pharmacy inventory data from 12 facilities confirms 15-18% average availability.',
        es: 'Datos de inventario de farmacia de 12 instalaciones confirman disponibilidad promedio del 15-18%.',
      },
      issuedAt: daysAgo(3),
    },
    createdAt: daysAgo(5),
    updatedAt: daysAgo(3),
  },
  {
    id: 'claim-005',
    content: {
      en: { statement: 'Healthcare workers haven\'t been paid in two months.' },
      es: { statement: 'Los trabajadores de salud no han cobrado en dos meses.' },
    },
    sourcePostId: 'post-002',
    extractedBy: 'dim-verifier-002',
    status: 'disputed',
    evidenceSignalIds: [
      { signalId: 'sig-008', supports: true },
    ],
    topics: ['health', 'wages'],
    createdAt: daysAgo(5),
    updatedAt: daysAgo(2),
  },
  // From post-003
  {
    id: 'claim-006',
    content: {
      en: { statement: 'Only 12 of 47 government appointments included public explanations.' },
      es: { statement: 'Solo 12 de 47 nombramientos gubernamentales incluyeron explicaciones públicas.' },
    },
    sourcePostId: 'post-003',
    extractedBy: 'dim-verifier-001',
    status: 'verified',
    evidenceSignalIds: [
      { signalId: 'sig-004', supports: true },
      { signalId: 'sig-005', supports: true },
    ],
    topics: ['politics', 'transparency'],
    verdict: {
      collectiveId: 'civic-collective',
      reasoning: {
        en: 'Public records review confirms the transparency gap. 35 appointments lack documentation.',
        es: 'Revisión de registros públicos confirma la brecha de transparencia. 35 nombramientos carecen de documentación.',
      },
      issuedAt: daysAgo(5),
    },
    createdAt: daysAgo(6),
    updatedAt: daysAgo(5),
  },
  {
    id: 'claim-007',
    content: {
      en: { statement: '28 government appointees have family connections to existing officials.' },
      es: { statement: '28 funcionarios nombrados tienen conexiones familiares con funcionarios existentes.' },
    },
    sourcePostId: 'post-003',
    extractedBy: 'dim-verifier-003',
    status: 'pending',
    evidenceSignalIds: [
      { signalId: 'sig-005', supports: true },
    ],
    topics: ['politics', 'transparency', 'governance'],
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },
  // From post-004
  {
    id: 'claim-008',
    content: {
      en: { statement: 'Power outages in Valencia averaged 4 hours daily in January, rising to 7 hours in February.' },
      es: { statement: 'Los apagones en Valencia promediaron 4 horas diarias en enero, subiendo a 7 horas en febrero.' },
    },
    sourcePostId: 'post-004',
    extractedBy: 'dim-verifier-002',
    status: 'pending',
    evidenceSignalIds: [
      { signalId: 'sig-003', supports: true },
    ],
    topics: ['infrastructure', 'daily-life'],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
];

/**
 * Convert localized post data to Post type for a given locale.
 */
function toPost(data: LocalizedPostData, locale: Locale): Post {
  return {
    id: createPostId(data.id),
    author: data.author,
    content: {
      title: data.content[locale].title,
      text: data.content[locale].text,
      ...(data.content[locale].links !== undefined && { links: data.content[locale].links }),
    },
    context: data.context,
    dimSignature: data.author.credentialHash,
    status: data.status,
    extractedClaimIds: data.extractedClaimIds.map(createClaimId),
    relatedSignalIds: data.relatedSignalIds.map(createSignalId),
    ...(data.relatedChainId !== undefined && { relatedChainId: createChainId(data.relatedChainId) }),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * Convert localized claim data to Claim type for a given locale.
 */
function toClaim(data: LocalizedClaimData, locale: Locale): Claim {
  return {
    id: createClaimId(data.id),
    statement: data.content[locale].statement,
    sourcePostId: createPostId(data.sourcePostId),
    extractedBy: createDIMCredential(data.extractedBy),
    status: data.status,
    evidence: data.evidenceSignalIds.map((e) => ({
      signalId: createSignalId(e.signalId),
      supports: e.supports,
      submittedBy: createDIMCredential('dim-evidence-submitter'),
      ...(e.note !== undefined && { note: e.note[locale] }),
      submittedAt: data.createdAt,
    })),
    ...(data.verdict !== undefined && {
      verdict: {
        status: data.status as 'verified' | 'disputed' | 'false',
        collectiveId: createCollectiveId(data.verdict.collectiveId),
        reasoning: data.verdict.reasoning[locale],
        issuedAt: data.verdict.issuedAt,
      },
    }),
    topics: data.topics,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * Get posts for a given locale.
 */
export function getPosts(locale: Locale = 'en'): Post[] {
  return localizedPosts.map((p) => toPost(p, locale));
}

/**
 * Get post previews for listing.
 */
export function getPostPreviews(locale: Locale = 'en'): PostPreview[] {
  return getPosts(locale).map((post) => ({
    id: post.id,
    title: post.content.title,
    excerpt: post.content.text.slice(0, 200) + '...',
    topics: post.context.topics,
    ...(post.context.locationName !== undefined && { locationName: post.context.locationName }),
    status: post.status,
    claimCount: post.extractedClaimIds.length,
    signalCount: post.relatedSignalIds.length,
    createdAt: post.createdAt,
  }));
}

/**
 * Get a post by ID.
 */
export function getPostById(postId: string, locale: Locale = 'en'): Post | undefined {
  return getPosts(locale).find((p) => p.id === postId);
}

/**
 * Get claims for a given locale.
 */
export function getClaims(locale: Locale = 'en'): Claim[] {
  return localizedClaims.map((c) => toClaim(c, locale));
}

/**
 * Get claim previews for listing.
 */
export function getClaimPreviews(locale: Locale = 'en'): ClaimPreview[] {
  return getClaims(locale).map((claim) => ({
    id: claim.id,
    statement: claim.statement,
    sourcePostId: claim.sourcePostId,
    status: claim.status,
    topics: claim.topics,
    evidenceCount: claim.evidence.length,
    supportingCount: claim.evidence.filter((e) => e.supports).length,
    contradictingCount: claim.evidence.filter((e) => !e.supports).length,
    createdAt: claim.createdAt,
  }));
}

/**
 * Get a claim by ID.
 */
export function getClaimById(claimId: string, locale: Locale = 'en'): Claim | undefined {
  return getClaims(locale).find((c) => c.id === claimId);
}

/**
 * Get claims by post ID.
 */
export function getClaimsByPostId(postId: string, locale: Locale = 'en'): Claim[] {
  return getClaims(locale).filter((c) => c.sourcePostId === postId);
}

/**
 * Get claims by status.
 */
export function getClaimsByStatus(status: ClaimStatus, locale: Locale = 'en'): Claim[] {
  return getClaims(locale).filter((c) => c.status === status);
}

/**
 * Get pending claims for workbench.
 */
export function getPendingClaims(locale: Locale = 'en'): Claim[] {
  return getClaims(locale).filter((c) =>
    c.status === 'pending' || c.status === 'under_review'
  );
}

/**
 * Get all post IDs for static generation.
 */
export function getAllPostIds(): string[] {
  return localizedPosts.map((p) => createPostId(p.id));
}

/**
 * Get all claim IDs for static generation.
 */
export function getAllClaimIds(): string[] {
  return localizedClaims.map((c) => createClaimId(c.id));
}
