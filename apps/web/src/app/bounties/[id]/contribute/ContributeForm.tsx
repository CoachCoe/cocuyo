'use client';

/**
 * Interactive form for contributing a signal to a bounty.
 */

import type { ReactElement } from 'react';
import { useState } from 'react';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { Button } from '@cocuyo/ui';

interface ContributeFormProps {
  bountyId: string;
  bountyTitle: string;
}

export function ContributeForm({
  bountyId,
  bountyTitle,
}: ContributeFormProps): ReactElement {
  const { address, isConnected } = useWeb3ModalAccount();
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [links, setLinks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet first');
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
    await new Promise((resolve) => setTimeout(resolve, 1500));

    alert(
      `Signal submitted to bounty "${bountyTitle}"!\n\n` +
        `In the production version, this would:\n` +
        `- Sign with your DIM credential\n` +
        `- Record on Polkadot\n` +
        `- Make you eligible for bounty rewards\n\n` +
        `Connected wallet: ${address?.slice(0, 8)}...${address?.slice(-6)}`
    );

    setIsSubmitting(false);
    setContent('');
    setLocation('');
    setLinks('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Wallet status */}
      {!isConnected && (
        <div className="p-4 bg-[rgba(248,113,113,0.1)] border border-[var(--color-challenged)] rounded-lg">
          <p className="text-sm text-[var(--color-challenged)]">
            <strong>Wallet not connected.</strong> You must connect your wallet
            to submit a signal and be eligible for rewards.
          </p>
        </div>
      )}

      {isConnected && (
        <div className="p-4 bg-[var(--color-accent-glow)] border border-[var(--color-accent)] rounded-lg">
          <p className="text-sm text-[var(--color-accent)]">
            <strong>Wallet connected:</strong> {address?.slice(0, 8)}...
            {address?.slice(-6)}
          </p>
        </div>
      )}

      {/* Signal content */}
      <div>
        <label
          htmlFor="signal-content"
          className="block text-sm font-medium mb-2"
        >
          Your Signal <span className="text-[var(--color-challenged)]">*</span>
        </label>
        <textarea
          id="signal-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe your observation, evidence, or information. Be specific about what you witnessed, when, and where. Include relevant details that others could verify."
          className="w-full p-4 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] min-h-[160px]"
          required
          minLength={50}
        />
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
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
          className="w-full p-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)]"
        />
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
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
          className="w-full p-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)]"
          rows={3}
        />
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          Optional. External evidence strengthens your signal.
        </p>
      </div>

      {/* Acknowledgment */}
      <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] rounded-lg">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            className="mt-1 w-4 h-4 accent-[var(--color-accent)]"
          />
          <span className="text-sm text-[var(--color-text-secondary)]">
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
          className="px-6 py-2 text-center text-sm border border-[var(--color-border-default)] rounded-md text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-border-emphasis)] transition-colors"
        >
          Cancel
        </a>
      </div>

      {/* Fine print */}
      <p className="text-xs text-[var(--color-text-tertiary)] text-center">
        Your signal will be signed with your DIM credential and recorded on
        Polkadot. You retain ownership and can reference it in other contexts.
      </p>
    </form>
  );
}
