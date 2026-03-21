'use client';

/**
 * Interactive form for contributing a signal to a bounty.
 */

import type { ReactElement } from 'react';
import { useState } from 'react';
import { useTriangleAccount } from '@/hooks/useTriangleAccount';
import { Button } from '@cocuyo/ui';

interface ContributeFormProps {
  bountyId: string;
  bountyTitle: string;
}

export function ContributeForm({
  bountyId,
  bountyTitle,
}: ContributeFormProps): ReactElement {
  const { address, isConnected, isInHost } = useTriangleAccount();
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [links, setLinks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    if (!isConnected) {
      alert(isInHost ? 'Please sign in to Triangle first' : 'Please open this app in Triangle');
      return;
    }

    if (content.trim().length < 50) {
      alert('Please provide more detail in your signal (at least 50 characters)');
      return;
    }

    setIsSubmitting(true);

    // Mock submission - in real implementation, this would:
    // 1. Sign the signal with DIM credential
    // 2. Submit to the chain
    // 3. Link to the bounty
    setTimeout(() => {
      const walletInfo = address !== null && address.length > 0
        ? address.slice(0, 8) + '...' + address.slice(-6)
        : 'Connected wallet';

      alert(
        'Signal submitted to bounty "' + bountyTitle + '"!\n\n' +
          'In the production version, this would:\n' +
          '- Sign with your DIM credential\n' +
          '- Record on Polkadot\n' +
          '- Make you eligible for bounty rewards\n\n' +
          walletInfo
      );

      setIsSubmitting(false);
      setContent('');
      setLocation('');
      setLinks('');
    }, 1500);
  };

  const displayAddress = address !== null && address.length > 0
    ? `${address.slice(0, 8)}...${address.slice(-6)}`
    : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Connection status */}
      {!isInHost && (
        <div className="p-4 bg-error/10 border border-error rounded-nested">
          <p className="text-sm text-[var(--fg-error)]">
            <strong>Not in Triangle.</strong> Open this app in Triangle to submit
            signals and be eligible for rewards.
          </p>
        </div>
      )}

      {isInHost && !isConnected && (
        <div className="p-4 bg-error/10 border border-error rounded-nested">
          <p className="text-sm text-[var(--fg-error)]">
            <strong>Not signed in.</strong> Sign in to Triangle to submit a signal
            and be eligible for rewards.
          </p>
        </div>
      )}

      {isConnected && displayAddress.length > 0 && (
        <div className="p-4 bg-[var(--color-firefly-gold-glow)] border border-accent rounded-nested">
          <p className="text-sm text-firefly-gold">
            <strong>Connected:</strong> {displayAddress}
          </p>
        </div>
      )}

      {/* Signal content */}
      <div>
        <label
          htmlFor="signal-content"
          className="block text-sm font-medium mb-2"
        >
          Your Signal <span className="text-[var(--fg-error)]">*</span>
        </label>
        <textarea
          id="signal-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe your observation, evidence, or information. Be specific about what you witnessed, when, and where. Include relevant details that others could verify."
          className="w-full p-4 bg-surface-muted border border-DEFAULT rounded-nested text-primary placeholder-tertiary focus:outline-none focus:border-accent min-h-[160px]"
          required
          minLength={50}
        />
        <p className="mt-2 text-xs text-tertiary">
          {content.length} characters (minimum 50)
        </p>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="signal-location" className="block text-sm font-medium mb-2">
          Location
        </label>
        <input
          id="signal-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Concord, NH or specific address"
          className="w-full p-3 bg-surface-muted border border-DEFAULT rounded-nested text-primary placeholder-tertiary focus:outline-none focus:border-accent"
        />
        <p className="mt-2 text-xs text-tertiary">
          Optional. Add if your observation is location-specific.
        </p>
      </div>

      {/* Supporting links */}
      <div>
        <label htmlFor="signal-links" className="block text-sm font-medium mb-2">
          Supporting Links
        </label>
        <textarea
          id="signal-links"
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="Add links to photos, documents, or other evidence (one per line)"
          className="w-full p-3 bg-surface-muted border border-DEFAULT rounded-nested text-primary placeholder-tertiary focus:outline-none focus:border-accent"
          rows={3}
        />
        <p className="mt-2 text-xs text-tertiary">
          Optional. External evidence strengthens your signal.
        </p>
      </div>

      {/* Acknowledgment */}
      <div className="p-4 bg-surface-container border border-subtle rounded-nested">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            className="mt-1 w-4 h-4 accent-firefly-gold"
          />
          <span className="text-sm text-secondary">
            I affirm this signal represents my honest observation or evidence.
            I understand that my reputation is staked on this contribution, and
            that misleading information will negatively impact my standing in
            the network.
          </span>
        </label>
      </div>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="submit"
          variant="illuminate"
          disabled={!isConnected || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Signal'}
        </Button>
        <a
          href={`/bounties/${bountyId}`}
          className="px-6 py-2 text-center text-sm border border-DEFAULT rounded-nested text-secondary hover:text-primary hover:border-emphasis transition-colors"
        >
          Cancel
        </a>
      </div>

      {/* Fine print */}
      <p className="text-xs text-tertiary text-center">
        Your signal will be signed with your DIM credential and recorded on
        Polkadot. You retain ownership and can reference it in other contexts.
      </p>
    </form>
  );
}
