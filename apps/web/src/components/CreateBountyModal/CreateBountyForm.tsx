'use client';

/**
 * CreateBountyForm — Form for creating a new bounty.
 *
 * Collects: title, description, topics, location, funding amount, duration
 */

import { useState, useCallback, type ReactElement, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { createPUSDAmount, type NewBounty } from '@cocuyo/types';
import { useSigner } from '@/lib/context/SignerContext';
import { useCreateBounty } from '@/hooks/useCreateBounty';
import { bountyService } from '@/lib/services';
import { TopicInput } from '@/components/IlluminateModal/TopicInput';

// Duration options in seconds
const DURATION_OPTIONS = [
  { label: '7 days', value: 7 * 24 * 60 * 60 },
  { label: '14 days', value: 14 * 24 * 60 * 60 },
  { label: '30 days', value: 30 * 24 * 60 * 60 },
  { label: '60 days', value: 60 * 24 * 60 * 60 },
] as const;

const DEFAULT_DURATION = DURATION_OPTIONS[1].value;

export function CreateBountyForm(): ReactElement {
  const t = useTranslations('bounties.create');
  const router = useRouter();
  const locale = useLocale();
  const { closeModal } = useCreateBounty();
  const { isConnected } = useSigner();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [fundingAmount, setFundingAmount] = useState('');
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    topics.length > 0 &&
    fundingAmount.trim().length > 0 &&
    parseFloat(fundingAmount) > 0;

  const handleSubmit = useCallback(
    async (e: FormEvent): Promise<void> => {
      e.preventDefault();
      if (!isValid || isSubmitting) return;

      setIsSubmitting(true);
      setError(null);

      try {
        // Parse funding amount to pUSD cents (1 pUSD = 1_000_000 micro units)
        const amountFloat = parseFloat(fundingAmount);
        const amountMicro = BigInt(Math.round(amountFloat * 1_000_000));

        const newBounty: NewBounty = {
          title: title.trim(),
          description: description.trim(),
          topics,
          ...(location.trim().length > 0 && { location: location.trim() }),
          fundingAmount: createPUSDAmount(amountMicro),
          duration,
          payoutMode: 'private',
        };

        const result = await bountyService.createBounty(newBounty);

        if (result.ok) {
          closeModal();
          router.push(`/${locale}/bounty/${result.value}`);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create bounty');
      } finally {
        setIsSubmitting(false);
      }
    },
    [isValid, isSubmitting, title, description, topics, location, fundingAmount, duration, closeModal, router, locale]
  );

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-secondary mb-4">{t('connectWallet')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="bounty-title" className="block text-sm font-medium text-primary mb-2">
          {t('titleLabel')}
        </label>
        <input
          id="bounty-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('titlePlaceholder')}
          className="w-full px-4 py-3 bg-surface border border-DEFAULT rounded-nested text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          maxLength={200}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="bounty-description" className="block text-sm font-medium text-primary mb-2">
          {t('descriptionLabel')}
        </label>
        <textarea
          id="bounty-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('descriptionPlaceholder')}
          rows={4}
          className="w-full px-4 py-3 bg-surface border border-DEFAULT rounded-nested text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
          maxLength={2000}
        />
        <p className="mt-1 text-xs text-tertiary">
          {description.length}/2000
        </p>
      </div>

      {/* Topics */}
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          {t('topicsLabel')}
        </label>
        <TopicInput
          topics={topics}
          onChange={setTopics}
          placeholder={t('topicsPlaceholder')}
        />
      </div>

      {/* Location (optional) */}
      <div>
        <label htmlFor="bounty-location" className="block text-sm font-medium text-primary mb-2">
          {t('locationLabel')}
          <span className="text-tertiary ml-1">({t('optional')})</span>
        </label>
        <input
          id="bounty-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t('locationPlaceholder')}
          className="w-full px-4 py-3 bg-surface border border-DEFAULT rounded-nested text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      {/* Funding Amount */}
      <div>
        <label htmlFor="bounty-funding" className="block text-sm font-medium text-primary mb-2">
          {t('fundingLabel')}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">$</span>
          <input
            id="bounty-funding"
            type="number"
            min="1"
            step="0.01"
            value={fundingAmount}
            onChange={(e) => setFundingAmount(e.target.value)}
            placeholder="100.00"
            className="w-full pl-8 pr-16 py-3 bg-surface border border-DEFAULT rounded-nested text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary text-sm">pUSD</span>
        </div>
      </div>

      {/* Duration */}
      <div>
        <label htmlFor="bounty-duration" className="block text-sm font-medium text-primary mb-2">
          {t('durationLabel')}
        </label>
        <select
          id="bounty-duration"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full px-4 py-3 bg-surface border border-DEFAULT rounded-nested text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          {DURATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error message */}
      {error !== null && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-nested">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full py-3 px-4 bg-accent text-black font-semibold rounded-nested hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? t('creating') : t('submit')}
      </button>
    </form>
  );
}
