'use client';

/**
 * EvidenceSection — Display corroborations/evidence in the TrustDrawer.
 */

import type { ReactElement } from 'react';
import type { Corroboration } from '@cocuyo/types';

interface EvidenceSectionProps {
  title: string;
  type: 'supporting' | 'challenging';
  corroborations: Corroboration[];
}

/** Map evidence type to display info */
const EVIDENCE_TYPE_DISPLAY: Record<string, { icon: string; label: string }> = {
  source_link: { icon: '🔗', label: 'Link' },
  document: { icon: '📄', label: 'Document' },
  photo: { icon: '📷', label: 'Photo' },
  observation: { icon: '👁', label: 'Firsthand' },
};

/** Map corroboration type to display info */
const CORR_TYPE_DISPLAY: Record<string, { icon: string; label: string }> = {
  witness: { icon: '👁', label: 'Witness' },
  evidence: { icon: '📎', label: 'Evidence' },
  expertise: { icon: '🎓', label: 'Expert' },
  challenge: { icon: '⚠️', label: 'Challenge' },
};

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const ts = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const diff = now - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) {
    return minutes <= 1 ? 'just now' : `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  return new Date(ts).toLocaleDateString();
}

export function EvidenceSection({ title, type, corroborations }: EvidenceSectionProps): ReactElement {
  const accentColor = type === 'supporting' ? 'var(--fg-success)' : 'var(--fg-error)';

  return (
    <section>
      <h3 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
        <span style={{ color: accentColor }}>
          {type === 'supporting' ? '✓' : '⚠'}
        </span>
        {title} ({corroborations.length})
      </h3>

      <div className="space-y-3">
        {corroborations.map((corr) => {
          const defaultType = { icon: '📎', label: 'Evidence' };
          const corrType = CORR_TYPE_DISPLAY[corr.type] ?? defaultType;
          const evidenceType = corr.evidenceType !== undefined
            ? EVIDENCE_TYPE_DISPLAY[corr.evidenceType]
            : undefined;

          return (
            <div
              key={corr.id}
              className="p-4 rounded-nested bg-surface-container border border-subtle"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{corrType.icon}</span>
                  <span className="text-xs font-medium text-secondary">{corrType.label}</span>
                  {evidenceType !== undefined && (
                    <>
                      <span className="text-tertiary">•</span>
                      <span className="text-xs text-tertiary">{evidenceType.label}</span>
                    </>
                  )}
                </div>
                <span className="text-xs text-tertiary">
                  {formatRelativeTime(corr.createdAt)}
                </span>
              </div>

              {/* Content */}
              {corr.evidenceContent !== undefined && (
                <div className="mb-2">
                  {corr.evidenceType === 'source_link' ? (
                    <a
                      href={corr.evidenceContent}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--fg-accent)] hover:underline break-all"
                    >
                      {corr.evidenceContent}
                    </a>
                  ) : (
                    <p className="text-sm text-primary">{corr.evidenceContent}</p>
                  )}
                </div>
              )}

              {/* Description */}
              {corr.evidenceDescription !== undefined && (
                <p className="text-xs text-secondary italic">
                  &ldquo;{corr.evidenceDescription}&rdquo;
                </p>
              )}

              {/* Quality indicator */}
              <div className="mt-2 pt-2 border-t border-subtle flex items-center gap-2 text-xs text-tertiary">
                <span>Quality: {corr.quality}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
