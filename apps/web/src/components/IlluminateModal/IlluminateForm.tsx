'use client';

/**
 * IlluminateForm — Form for creating a new post.
 *
 * Fields:
 * - Post content (required, 50+ chars)
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
import { useSigner } from '@/lib/context/SignerContext';
import type { ChainId, CampaignId, NewPost, MediaAttachment } from '@cocuyo/types';
import { createContentHash } from '@cocuyo/types';
import { useIlluminate } from '@/hooks/useIlluminate';
import { useSignalService, useClaimService } from '@/lib/services/hooks';
import { getBulletinClient } from '@/lib/chain/client';
import { TopicInput } from './TopicInput';
import { SuggestionsList } from './SuggestionsList';
import { StoryLinkSection } from './StoryLinkSection';
import { useDebouncedSuggestions } from '@/lib/hooks/useDebouncedSuggestions';
import { PhotoUpload } from '@/components/PhotoUpload';
import { useAppState } from '@/components/AppStateProvider';

interface PendingNewStory {
  title: string;
  description: string;
}

interface FormState {
  content: string;
  topics: string[];
  location: string;
  links: string;
  photos: File[];
  selectedChains: ChainId[];
  selectedCampaigns: CampaignId[];
  pendingNewStory: PendingNewStory | null;
  acknowledged: boolean;
}

const MIN_CONTENT_LENGTH = 50;

export function IlluminateForm(): ReactElement {
  const { isConnected, isInHost } = useSigner();
  const signalService = useSignalService();
  const claimService = useClaimService();
  const { preSelectedChainId, preSelectedCampaignId, evidenceClaimId, evidenceType, closeModal } = useIlluminate();

  // Track if we're submitting evidence for a claim
  const isEvidenceSubmission = evidenceClaimId !== null && evidenceType !== null;

  const { createStory } = useAppState();

  const [formState, setFormState] = useState<FormState>(() => ({
    content: '',
    topics: [],
    location: '',
    links: '',
    photos: [],
    selectedChains: preSelectedChainId != null ? [preSelectedChainId] : [],
    selectedCampaigns: preSelectedCampaignId != null ? [preSelectedCampaignId] : [],
    pendingNewStory: null,
    acknowledged: false,
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Get suggestions based on topics and location
  const { chains: suggestedChains, campaigns: suggestedCampaigns, isLoading: isSuggestionsLoading } =
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

  const handlePhotosChange = useCallback((photos: File[]): void => {
    setFormState((prev) => ({ ...prev, photos }));
  }, []);

  const handleChainToggle = useCallback((chainId: ChainId): void => {
    setFormState((prev) => ({
      ...prev,
      selectedChains: prev.selectedChains.includes(chainId)
        ? prev.selectedChains.filter((id) => id !== chainId)
        : [...prev.selectedChains, chainId],
    }));
  }, []);

  const handleCampaignToggle = useCallback((campaignId: CampaignId): void => {
    setFormState((prev) => ({
      ...prev,
      selectedCampaigns: prev.selectedCampaigns.includes(campaignId)
        ? prev.selectedCampaigns.filter((id) => id !== campaignId)
        : [...prev.selectedCampaigns, campaignId],
    }));
  }, []);

  const handleCreateNewStory = useCallback((title: string, description: string): void => {
    setFormState((prev) => ({
      ...prev,
      pendingNewStory: { title, description },
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

        // Upload photos to Bulletin Chain and create media attachments
        let mediaAttachments: MediaAttachment[] = [];
        if (formState.photos.length > 0) {
          const bulletin = await getBulletinClient();
          mediaAttachments = await Promise.all(
            formState.photos.map(async (photo): Promise<MediaAttachment> => {
              const arrayBuffer = await photo.arrayBuffer();
              const data = new Uint8Array(arrayBuffer);
              const result = await bulletin.upload(data);
              return {
                hash: createContentHash(result.cid),
                mimeType: photo.type,
                size: photo.size,
                ...(photo.name && { altText: photo.name }),
              };
            })
          );
        }

        const newPost: NewPost = {
          content: {
            text: formState.content,
            ...(linksArray.length > 0 && { links: linksArray }),
            ...(mediaAttachments.length > 0 && { media: mediaAttachments }),
          },
          context: {
            topics: formState.topics,
            ...(formState.location && { locationName: formState.location }),
          },
          chainLinks: formState.selectedChains,
        };

        const result = await signalService.illuminate(newPost);

        if (result.ok) {
          const postId = result.value;

          // If user wanted to create a new story, do it now
          if (formState.pendingNewStory !== null) {
            createStory(
              formState.pendingNewStory.title,
              formState.pendingNewStory.description,
              postId,
              formState.topics
            );
          }

          // If this is evidence submission, link the post to the claim
          if (evidenceClaimId !== null && evidenceType !== null) {
            const evidenceResult = await claimService.submitEvidence(evidenceClaimId, {
              postId,
              supports: evidenceType === 'support',
            });

            if (!evidenceResult.ok) {
              // Post was created but evidence linking failed
              setSubmitError(`Post created, but failed to link as evidence: ${evidenceResult.error}`);
              return;
            }
          }

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
    [canSubmit, formState, closeModal, signalService, claimService, createStory, evidenceClaimId, evidenceType]
  );

  if (submitSuccess) {
    return (
      <div className="text-center py-12">
        <div className={`inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full ${
          isEvidenceSubmission
            ? evidenceType === 'support'
              ? 'bg-[var(--fg-success)]/15'
              : 'bg-[var(--fg-error)]/15'
            : 'bg-[var(--color-firefly-gold-glow)]'
        }`}>
          <svg
            className={`w-8 h-8 ${
              isEvidenceSubmission
                ? evidenceType === 'support'
                  ? 'text-[var(--fg-success)]'
                  : 'text-[var(--fg-error)]'
                : 'text-firefly-gold'
            }`}
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
        <h3 className="text-xl font-semibold text-primary mb-2">
          {isEvidenceSubmission ? 'Evidence Submitted' : 'Signal Illuminated'}
        </h3>
        <p className="text-secondary">
          {isEvidenceSubmission
            ? evidenceType === 'support'
              ? 'Your supporting evidence has been linked to the claim.'
              : 'Your contradicting evidence has been linked to the claim.'
            : 'Your observation has been added to the network.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 sm:space-y-6">
      {/* Connection warning */}
      {!isConnected && (
        <div className="p-4 bg-error/10 border border-error/30 rounded-nested">
          <p className="text-sm text-[var(--fg-error)]">
            {isInHost
              ? 'Sign in to Triangle to illuminate a post. Your identity remains anonymous through DIM verification.'
              : 'Open this app in Triangle to illuminate a post. Your identity remains anonymous through DIM verification.'}
          </p>
        </div>
      )}

      {/* Post content */}
      <div>
        <label htmlFor="post-content" className="block text-sm font-medium text-primary mb-2">
          What did you observe? <span className="text-[var(--fg-error)]">*</span>
        </label>
        <textarea
          id="post-content"
          value={formState.content}
          onChange={handleContentChange}
          placeholder="Describe what you witnessed, heard, or documented. Be specific and factual."
          rows={4}
          className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-surface-muted border border-DEFAULT rounded-nested text-primary placeholder-tertiary focus:outline-none focus:border-accent transition-colors resize-none text-base"
          required
        />
        <div className="mt-1 flex justify-between text-xs">
          <span
            className={
              formState.content.length >= MIN_CONTENT_LENGTH
                ? 'text-corroborated'
                : 'text-tertiary'
            }
          >
            {formState.content.length >= MIN_CONTENT_LENGTH
              ? 'Minimum length met'
              : `${MIN_CONTENT_LENGTH - formState.content.length} more characters required`}
          </span>
          <span className="text-tertiary">
            {formState.content.length} characters
          </span>
        </div>
      </div>

      {/* Topics */}
      <div>
        <label htmlFor="post-topics" className="block text-sm font-medium text-primary mb-2">
          Topics <span className="text-[var(--fg-error)]">*</span>
        </label>
        <TopicInput
          id="post-topics"
          topics={formState.topics}
          onChange={handleTopicsChange}
          placeholder="Add topics (press Enter or comma)"
        />
        <p className="mt-1 text-xs text-tertiary">
          Add at least one topic to categorize your post.
        </p>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="post-location" className="block text-sm font-medium text-primary mb-2">
          Location
        </label>
        <input
          id="post-location"
          type="text"
          value={formState.location}
          onChange={handleLocationChange}
          placeholder="City, region, or general area"
          className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-surface-muted border border-DEFAULT rounded-nested text-primary placeholder-tertiary focus:outline-none focus:border-accent transition-colors text-base"
        />
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Photos
        </label>
        <PhotoUpload
          photos={formState.photos}
          onChange={handlePhotosChange}
          disabled={!isConnected}
        />
      </div>

      {/* Supporting links */}
      <div>
        <label htmlFor="post-links" className="block text-sm font-medium text-primary mb-2">
          Supporting Links
        </label>
        <textarea
          id="post-links"
          value={formState.links}
          onChange={handleLinksChange}
          placeholder="Add URLs to supporting documents, images, or sources (one per line)"
          rows={2}
          className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-surface-muted border border-DEFAULT rounded-nested text-primary placeholder-tertiary focus:outline-none focus:border-accent transition-colors resize-none font-mono text-sm"
        />
      </div>

      {/* Story chain linking */}
      <StoryLinkSection
        suggestedChains={suggestedChains}
        selectedChains={formState.selectedChains}
        onChainToggle={handleChainToggle}
        onCreateStory={handleCreateNewStory}
        isLoadingSuggestions={isSuggestionsLoading}
      />

      {/* Pending new story indicator */}
      {formState.pendingNewStory !== null && (
        <div className="p-3 bg-[var(--fg-accent)]/10 border border-[var(--fg-accent)]/30 rounded-nested">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-accent)]">
                New story will be created: {formState.pendingNewStory.title}
              </p>
              {formState.pendingNewStory.description && (
                <p className="text-xs text-secondary mt-0.5">
                  {formState.pendingNewStory.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setFormState((prev) => ({ ...prev, pendingNewStory: null }))}
              className="text-xs text-secondary hover:text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Campaign suggestions */}
      {suggestedCampaigns.length > 0 && (
        <SuggestionsList
          chains={[]}
          campaigns={suggestedCampaigns}
          selectedChains={[]}
          selectedCampaigns={formState.selectedCampaigns}
          preSelectedChainId={null}
          preSelectedCampaignId={preSelectedCampaignId}
          onChainToggle={(): void => { /* no-op: chains disabled in campaign mode */ }}
          onCampaignToggle={handleCampaignToggle}
          isLoading={false}
        />
      )}

      {/* Acknowledgment */}
      <div className="p-4 bg-surface-muted border border-DEFAULT rounded-nested">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formState.acknowledged}
            onChange={handleAcknowledgeChange}
            className="mt-1 w-4 h-4 rounded border-emphasis bg-surface-nested text-firefly-gold focus:ring-firefly-gold focus:ring-offset-0"
            required
          />
          <span className="text-sm text-secondary">
            I understand that illuminating this signal stakes my reputation. False or
            misleading information will affect my standing in the network. I affirm this
            is an honest observation to the best of my knowledge.
          </span>
        </label>
      </div>

      {/* Error message */}
      {submitError != null && (
        <div className="p-4 bg-error/10 border border-error/30 rounded-nested">
          <p className="text-sm text-[var(--fg-error)]">{submitError}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!canSubmit}
        className={`
          w-full py-3 sm:py-4 px-6 text-base sm:text-lg font-semibold rounded-nested transition-all
          ${
            canSubmit
              ? 'bg-firefly-gold text-[var(--fg-inverse)] hover:brightness-110 cursor-pointer'
              : 'bg-surface-muted text-tertiary cursor-not-allowed'
          }
        `}
      >
        {isSubmitting ? 'Illuminating...' : 'Illuminate'}
      </button>

      {/* Requirements hint */}
      {!canSubmit && !isSubmitting && (
        <p className="text-center text-xs text-tertiary">
          {!isConnected
            ? isInHost ? 'Sign in to Triangle to continue' : 'Open in Triangle to continue'
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
