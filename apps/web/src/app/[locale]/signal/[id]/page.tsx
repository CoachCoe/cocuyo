/**
 * Signal route redirect.
 *
 * In the new UX model, "Signal" is now called "Post".
 * This route redirects to the post detail page for backwards compatibility.
 */

import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

/**
 * Generate static params for build.
 */
export function generateStaticParams(): { id: string }[] {
  return [{ id: '_' }];
}

export default async function SignalRedirect({ params }: Props): Promise<never> {
  const { locale, id } = await params;
  setRequestLocale(locale);

  // Redirect to the post page
  redirect(`/${locale}/post/${id}`);
}
