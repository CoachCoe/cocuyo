'use client';

/**
 * IlluminateForm — Form for creating a new signal.
 *
 * Fields:
 * - Signal content (required, 50+ chars)
 * - Topics (required, at least 1)
 * - Location (optional)
 * - Supporting links (optional)
 * - Link to chains/bounties (from suggestions)
 * - Acknowledgment checkbox (required)
 */

import {
  useState,
  useCallback,
  type ReactElement,
  type FormEvent,
} from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import type { ChainId, BountyId, NewSignal } from '@cocuyo/types';
import { useIlluminate } from '@/hooks/useIlluminate';
import { signalService } from '@/lib/services';
import { TopicInput } from './TopicInput';
import { SuggestionsList } from './SuggestionsList';
import { useDebouncedSuggestions } from '@/lib/hooks/useDebouncedSuggestions';

interface FormState {
  content: string;
  topics: string[];
  location: string;
  links: string;
  selectedChains: ChainId[];
  selectedBounties: BountyId[];
  acknowledged: boolean;
}

const MIN_CONTENT_LENGTH = 50;

export function IlluminateForm(): ReactElement {
  const { isConnected } = useAppKitAccount();
  const { preSelectedChainId, preSelectedBountyId, closeModal } = useIlluminate();

  const [formState, setFormState] = useState<FormState>(() => ({
    content: '',
    topics: [],
    location: '',
    links: '',
    selectedChains: preSelectedChainId != null ? [preSelectedChainId] : [],
    selectedBounties: preSelectedBountyId != null ? [preSelectedBountyId] : [],
    acknowledged: false,
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Get suggestions based on topics and location
  const { chains: suggestedChains, bounties: suggestedBounties, isLoading: isSuggestionsLoading } =
    useDebouncedSuggestions(formState.topics, formState.location);

  // Validation
  const contentValid = formState.content.length >= MIN_CONTENT_LENGTH;
  const topicsValid = formState.topics.length >= 1;
  const canSubmit =
    isConnected &&
    contentValid &&
    topicsValid &&
    formState.acknowledged &&
    !isSubmitting;

  const handleContentChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setFormState((prev) => ({ ...prev, content: event.target.value }));
    },
    []
  );

  const handleTopicsChange = useCallback((topics: string[]): void => {
    setFormState((prev) => ({ ...prev, topics }));
  }, []);

  const handleLocationChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setFormState((prev) => ({ ...prev, location: event.target.value }));
    },
    []
  );

  const handleLinksChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setFormState((prev) => ({ ...prev, links: event.target.value }));
    },
    []
  );

  const handleChainToggle = useCallback((chainId: ChainId): void => {
    setFormState((prev) => ({
      ...prev,
      selectedChains: prev.selectedChains.includes(chainId)
        ? prev.selectedChains.filter((id) => id !== chainId)
        : [...prev.selectedChains, chainId],
    }));
  }, []);

  const handleBountyToggle = useCallback((bountyId: BountyId): void => {
    setFormState((prev) => ({
      ...prev,
      selectedBounties: prev.selectedBounties.includes(bountyId)
        ? prev.selectedBounties.filter((id) => id !== bountyId)
        : [...prev.selectedBounties, bountyId],
    }));
  }, []);

  const handleAcknowledgeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setFormState((prev) => ({ ...prev, acknowledged: event.target.checked }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: FormEvent): Promise<void> => {
      event.preventDefault();

      if (!canSubmit) return;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        // Parse links (one per line, filter empty)
        const linksArray = formState.links
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        const newSignal: NewSignal = {
          content: {
            text: formState.content,
            ...(linksArray.length > 0 && { links: linksArray }),
          },
          context: {
            topics: formState.topics,
            ...(formState.location && { locationName: formState.location }),
          },
          chainLinks: formState.selectedChains,
        };

        const result = await signalService.illuminate(newSignal);

        if (result.ok) {
          setSubmitSuccess(true);
          // Close modal after brief delay
          setTimeout(() => {
            closeModal();
          }, 1500);
        } else {
          setSubmitError(result.error);
        }
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'Failed to illuminate signal'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [canSubmit, formState, closeModal]
  );

  if (submitSuccess) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-[var(--color-accent-glow)]">
          <svg
            className="w-8 h-8 text-[var(--color-accent)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">Signal Illuminated</h3>
        <p className="text-[var(--color-text-secondary)]">
          Your observation has been added to the network.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      {/* Wallet warning */}
      {!isConnected && (
        <div className="p-4 bg-[var(--color-challenged)]/10 border border-[var(--color-challenged)]/30 rounded-lg">
          <p className="text-sm text-[var(--color-challenged)]">
            Connect your wallet to illuminate a signal. Your identity remains anonymous
            through DIM verification.
          </p>
        </div>
      )}

      {/* Signal content */}
      <div>
        <label htmlFor="signal-content" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
          What did you observe? <span className="text-[var(--color-challenged)]">*</span>
        </label>
        <textarea
          id="signal-content"
          value={formState.content}
          onChange={handleContentChange}
          placeholder="Describe what you witnessed, heard, or documented. Be specific and factual."
          rows={5}
          className="w-full px-4 py-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
          required
        />
        <div className="mt-1 flex justify-between text-xs">
          <span
            className={
              formState.content.length >= MIN_CONTENT_LENGTH
                ? 'text-[var(--color-corroborated)]'
                : 'text-[var(--color-text-tertiary)]'
            }
          >
            {formState.content.length >= MIN_CONTENT_LENGTH
              ? 'Minimum length met'
              : `${MIN_CONTENT_LENGTH - formState.content.length} more characters required`}
          </span>
          <span className="text-[var(--color-text-tertiary)]">
            {formState.content.length} characters
          </span>
        </div>
      </div>

      {/* Topics */}
      <div>
        <label htmlFor="signal-topics" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
          Topics <span className="text-[var(--color-challenged)]">*</span>
        </label>
        <TopicInput
          id="signal-topics"
          topics={formState.topics}
          onChange={handleTopicsChange}
          placeholder="Add topics (press Enter or comma)"
        />
        <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
          Add at least one topic to categorize your signal.
        </p>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="signal-location" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
          Location
        </label>
        <input
          id="signal-location"
          type="text"
          value={formState.location}
          onChange={handleLocationChange}
          placeholder="City, region, or general area"
          className="w-full px-4 py-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
        />
      </div>

      {/* Supporting links */}
      <div>
        <label htmlFor="signal-links" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
          Supporting Links
        </label>
        <textarea
          id="signal-links"
          value={formState.links}
          onChange={handleLinksChange}
          placeholder="Add URLs to supporting documents, images, or sources (one per line)"
          rows={3}
          className="w-full px-4 py-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none font-mono text-sm"
        />
      </div>

      {/* Chain/Bounty suggestions */}
      <SuggestionsList
        chains={suggestedChains}
        bounties={suggestedBounties}
        selectedChains={formState.selectedChains}
        selectedBounties={formState.selectedBounties}
        preSelectedChainId={preSelectedChainId}
        preSelectedBountyId={preSelectedBountyId}
        onChainToggle={handleChainToggle}
        onBountyToggle={handleBountyToggle}
        isLoading={isSuggestionsLoading}
      />

      {/* Acknowledgment */}
      <div className="p-4 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-lg">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formState.acknowledged}
            onChange={handleAcknowledgeChange}
            className="mt-1 w-4 h-4 rounded border-[var(--color-border-emphasis)] bg-[var(--color-bg-tertiary)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-0"
            required
          />
          <span className="text-sm text-[var(--color-text-secondary)]">
            I understand that illuminating this signal stakes my reputation. False or
            misleading information will affect my standing in the network. I affirm this
            is an honest observation to the best of my knowledge.
          </span>
        </label>
      </div>

      {/* Error message */}
      {submitError != null && (
        <div className="p-4 bg-[var(--color-challenged)]/10 border border-[var(--color-challenged)]/30 rounded-lg">
          <p className="text-sm text-[var(--color-challenged)]">{submitError}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!canSubmit}
        className={`
          w-full py-4 px-6 text-lg font-semibold rounded-lg transition-all
          ${
            canSubmit
              ? 'bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-dim)] cursor-pointer'
              : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] cursor-not-allowed'
          }
        `}
      >
        {isSubmitting ? 'Illuminating...' : 'Illuminate'}
      </button>

      {/* Requirements hint */}
      {!canSubmit && !isSubmitting && (
        <p className="text-center text-xs text-[var(--color-text-tertiary)]">
          {!isConnected
            ? 'Connect your wallet to continue'
            : !contentValid
              ? 'Add more detail to your observation'
              : !topicsValid
                ? 'Add at least one topic'
                : !formState.acknowledged
                  ? 'Acknowledge the reputation stake'
                  : ''}
        </p>
      )}
    </form>
  );
}
