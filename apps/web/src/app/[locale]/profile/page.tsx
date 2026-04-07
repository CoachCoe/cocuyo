/**
 * Profile page — Private firefly profile with reputation dashboard.
 *
 * Shows topic-weighted reputation scores for the connected user.
 * This is a private page - users can only view their own profile.
 */

import type { ReactElement } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProfileView } from './ProfileView';

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps): Promise<ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const tProfile = await getTranslations('profile');
  const tPosts = await getTranslations('posts');

  // Build topic translation map for common topics
  const commonTopics = ['economy', 'health', 'politics', 'transparency', 'infrastructure'];
  const topicTranslations: Record<string, string> = {};
  for (const topic of commonTopics) {
    try {
      topicTranslations[topic] = tPosts(`topics.${topic}`);
    } catch {
      topicTranslations[topic] = topic.replace(/-/g, ' ');
    }
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
        <div className="container-wide py-8">
          <h1 className="text-2xl font-display font-medium text-[var(--fg-primary)] mb-2">
            {tProfile('title')}
          </h1>
          <p className="text-[var(--fg-secondary)] text-sm max-w-2xl">
            {tProfile('description')}
          </p>
        </div>
      </header>

      {/* Main content */}
      <section className="py-8">
        <div className="container-wide">
          <ProfileView
            topicTranslations={topicTranslations}
            translations={{
              signInRequired: tProfile('signInRequired'),
              signInDescription: tProfile('signInDescription'),
              reputation: tProfile('reputation'),
              overallScore: tProfile('overallScore'),
              topicScores: tProfile('topicScores'),
              contributions: tProfile('contributions'),
              posts: tProfile('posts'),
              corroborations: tProfile('corroborations'),
              challenges: tProfile('challenges'),
              noActivity: tProfile('noActivity'),
            }}
          />
        </div>
      </section>
    </main>
  );
}
