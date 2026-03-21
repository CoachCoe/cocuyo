'use client';

/**
 * Create Collective Page
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { MembershipApproval } from '@cocuyo/types';
import { useIdentity } from '@/hooks/useIdentity';

const AVAILABLE_TOPICS = [
  'environmental', 'water-quality', 'public-health', 'health',
  'local-government', 'public-records', 'development', 'education',
  'corruption', 'security', 'economy', 'migration',
];

export default function CreateCollectivePage(): ReactNode {
  const router = useRouter();
  const { status } = useIdentity();
  const isReady = status === 'ready';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mission, setMission] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [approval, setApproval] = useState<MembershipApproval>('vote');
  const [threshold, setThreshold] = useState(66);
  const [minVotes, setMinVotes] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = isReady && name.trim() !== '' && description.trim() !== '' && mission.trim() !== '' && topics.length > 0;

  const toggleTopic = (topic: string): void => {
    setTopics((prev) => prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]);
  };

  const handleSubmit = (): void => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setTimeout(() => {
      router.push('/collectives');
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Link href="/collectives" className="inline-flex items-center gap-2 text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors mb-6">
          <span>&larr;</span> Back to Collectives
        </Link>

        <h1 className="text-2xl font-bold text-[var(--fg-primary)] mb-2">Create Collective</h1>
        <p className="text-[var(--fg-secondary)] mb-8">Start a fact-checking group focused on topics you care about.</p>

        {!isReady && (
          <div className="mb-6 p-4 bg-[var(--fg-warning)]/10 border border-[var(--fg-warning)]/30 rounded-container text-sm text-[var(--fg-warning)]">
            Complete your profile setup to create a collective.
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g., NH Environmental Watch"
              className="w-full px-4 py-3 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-nested text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--color-firefly-gold)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what your collective verifies..."
              rows={2}
              className="w-full px-4 py-3 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-nested text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--color-firefly-gold)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Mission *</label>
            <textarea value={mission} onChange={(e) => setMission(e.target.value)}
              placeholder="Your collective's mission statement..."
              rows={3}
              className="w-full px-4 py-3 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-nested text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--color-firefly-gold)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--fg-primary)] mb-2">Focus Topics *</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TOPICS.map((topic) => (
                <button key={topic} type="button" onClick={() => toggleTopic(topic)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors capitalize ${
                    topics.includes(topic)
                      ? 'border-[var(--color-firefly-gold)] bg-[var(--color-firefly-gold)]/10 text-[var(--color-firefly-gold)]'
                      : 'border-[var(--border-default)] text-[var(--fg-secondary)] hover:border-[var(--border-emphasis)]'
                  }`}>
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container space-y-4">
            <h3 className="font-medium text-[var(--fg-primary)]">Governance</h3>

            <div>
              <label className="block text-sm text-[var(--fg-secondary)] mb-2">Membership Approval</label>
              <div className="grid grid-cols-3 gap-2">
                {(['open', 'vote', 'invite'] as const).map((type) => (
                  <button key={type} type="button" onClick={() => setApproval(type)}
                    className={`p-3 text-center border rounded-nested transition-colors capitalize ${
                      approval === type
                        ? 'border-[var(--color-firefly-gold)] bg-[var(--color-firefly-gold)]/10'
                        : 'border-[var(--border-default)] hover:border-[var(--border-emphasis)]'
                    }`}>
                    <span className="text-sm text-[var(--fg-primary)]">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--fg-secondary)] mb-2">Verdict Threshold</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}
                    min={51} max={100}
                    className="w-20 px-3 py-2 bg-[var(--bg-surface-container)] border border-[var(--border-default)] rounded-nested text-[var(--fg-primary)] text-center"
                  />
                  <span className="text-[var(--fg-tertiary)]">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--fg-secondary)] mb-2">Min Votes</label>
                <input type="number" value={minVotes} onChange={(e) => setMinVotes(Number(e.target.value))}
                  min={1} max={10}
                  className="w-20 px-3 py-2 bg-[var(--bg-surface-container)] border border-[var(--border-default)] rounded-nested text-[var(--fg-primary)] text-center"
                />
              </div>
            </div>
          </div>

          <button type="button" onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full px-4 py-3 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-semibold rounded-nested hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Creating...' : 'Create Collective'}
          </button>
        </div>
      </div>
    </main>
  );
}
