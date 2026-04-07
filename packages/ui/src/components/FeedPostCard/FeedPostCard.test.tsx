import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedPostCard } from './FeedPostCard';
import type { Post } from '@cocuyo/types';
import { createPostId, createChainId, createDIMCredential } from '@cocuyo/types';

const mockPost: Post = {
  id: createPostId('post-001'),
  author: {
    id: '001',
    credentialHash: createDIMCredential('dim-anon-001'),
    pseudonym: 'TestUser',
    disclosureLevel: 'anonymous',
    location: 'Test City',
    reputation: 42,
  },
  content: {
    text: 'This is a test post with important information.',
  },
  context: {
    topics: ['environmental', 'water-quality'],
    locationName: 'Test Location, NH',
    location: { latitude: 43.0, longitude: -71.0 },
  },
  dimSignature: createDIMCredential('dim-anon-001'),
  status: 'published',
  chainLinks: [createChainId('chain-001')],
  corroborations: {
    witnessCount: 5,
    evidenceCount: 2,
    expertiseCount: 1,
    challengeCount: 0,
    totalWeight: 8.5,
  },
  verification: { status: 'unverified' },
  createdAt: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
};

describe('FeedPostCard', () => {
  describe('rendering', () => {
    it('renders post content', () => {
      render(<FeedPostCard post={mockPost} />);
      expect(screen.getByText(mockPost.content.text)).toBeInTheDocument();
    });

    it('renders author pseudonym', () => {
      render(<FeedPostCard post={mockPost} />);
      expect(screen.getByText('TestUser')).toBeInTheDocument();
    });

    it('renders author initial in avatar', () => {
      render(<FeedPostCard post={mockPost} />);
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('renders author location when disclosed', () => {
      render(<FeedPostCard post={mockPost} />);
      expect(screen.getByText('Test City')).toBeInTheDocument();
    });

    it('renders first topic', () => {
      render(<FeedPostCard post={mockPost} />);
      expect(screen.getByText('environmental')).toBeInTheDocument();
    });

    it('renders location name', () => {
      render(<FeedPostCard post={mockPost} />);
      expect(screen.getByText('Test Location, NH')).toBeInTheDocument();
    });

    it('renders relative time', () => {
      render(<FeedPostCard post={mockPost} />);
      expect(screen.getByText('1h ago')).toBeInTheDocument();
    });
  });

  describe('corroborations', () => {
    it('renders total corroboration count', () => {
      render(<FeedPostCard post={mockPost} />);
      // witnessCount + expertiseCount = 5 + 1 = 6
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('corroborations')).toBeInTheDocument();
    });

    it('renders evidence count when present', () => {
      render(<FeedPostCard post={mockPost} />);
      expect(screen.getByText('2 evidence')).toBeInTheDocument();
    });

    it('renders challenge count when present', () => {
      const postWithChallenges = {
        ...mockPost,
        corroborations: { ...mockPost.corroborations, challengeCount: 2 },
      };
      render(<FeedPostCard post={postWithChallenges} />);
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('challenges')).toBeInTheDocument();
    });

    it('hides evidence when zero', () => {
      const postNoEvidence = {
        ...mockPost,
        corroborations: { ...mockPost.corroborations, evidenceCount: 0 },
      };
      render(<FeedPostCard post={postNoEvidence} />);
      expect(screen.queryByText('0 evidence')).not.toBeInTheDocument();
    });
  });

  describe('chain link', () => {
    it('renders chain link when chainTitle provided', () => {
      render(<FeedPostCard post={mockPost} chainTitle="Water Quality Investigation" />);
      expect(screen.getByText('Part of:')).toBeInTheDocument();
      expect(screen.getByText('Water Quality Investigation')).toBeInTheDocument();
    });

    it('hides chain link when no chainTitle', () => {
      render(<FeedPostCard post={mockPost} />);
      expect(screen.queryByText('Part of:')).not.toBeInTheDocument();
    });

    it('calls onChainClick when chain link clicked', () => {
      const handleChainClick = vi.fn();
      render(
        <FeedPostCard
          post={mockPost}
          chainTitle="Water Quality"
          onChainClick={handleChainClick}
        />
      );
      fireEvent.click(screen.getByText('Water Quality'));
      expect(handleChainClick).toHaveBeenCalledWith(mockPost.chainLinks[0]);
    });
  });

  describe('verification badge', () => {
    it('renders verified badge', () => {
      const verifiedPost = {
        ...mockPost,
        verification: { status: 'verified' as const },
      };
      render(<FeedPostCard post={verifiedPost} />);
      expect(screen.getByLabelText('Verified')).toBeInTheDocument();
    });

    it('renders disputed badge', () => {
      const disputedPost = {
        ...mockPost,
        verification: { status: 'disputed' as const },
      };
      render(<FeedPostCard post={disputedPost} />);
      expect(screen.getByText('Disputed')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onClick when card clicked', () => {
      const handleClick = vi.fn();
      render(<FeedPostCard post={mockPost} onClick={handleClick} />);
      // When clickable, article becomes a button
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      fireEvent.click(buttons[0] as HTMLElement);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onAuthorClick when author clicked', () => {
      const handleAuthorClick = vi.fn();
      render(<FeedPostCard post={mockPost} onAuthorClick={handleAuthorClick} />);
      fireEvent.click(screen.getByText('TestUser'));
      expect(handleAuthorClick).toHaveBeenCalledWith(mockPost.author.credentialHash);
    });

    it('supports keyboard navigation when clickable', () => {
      const handleClick = vi.fn();
      render(<FeedPostCard post={mockPost} onClick={handleClick} />);
      // First button is the card itself
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      fireEvent.keyDown(buttons[0] as HTMLElement, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has article role when not clickable', () => {
      render(<FeedPostCard post={mockPost} />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('has button role when clickable', () => {
      render(<FeedPostCard post={mockPost} onClick={vi.fn()} />);
      // The card becomes a button, plus there's the author button
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('is focusable when clickable', () => {
      render(<FeedPostCard post={mockPost} onClick={vi.fn()} />);
      // First button is the card
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons[0]).toHaveAttribute('tabIndex', '0');
    });

    it('has proper time element', () => {
      render(<FeedPostCard post={mockPost} />);
      const timeEl = screen.getByText('1h ago').closest('time');
      expect(timeEl).toHaveAttribute('dateTime');
    });
  });

  describe('edge cases', () => {
    it('handles post without location', () => {
      // Create a new post without location fields (omitted, not undefined)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { location: _authorLoc, ...authorWithoutLocation } = mockPost.author;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { locationName: _locName, location: _loc, ...contextWithoutLocation } = mockPost.context;
      const postNoLocation: Post = {
        ...mockPost,
        author: authorWithoutLocation,
        context: contextWithoutLocation,
      };
      render(<FeedPostCard post={postNoLocation} />);
      expect(screen.getByText('TestUser')).toBeInTheDocument();
    });

    it('handles empty chain links', () => {
      const postNoChains: Post = {
        ...mockPost,
        chainLinks: [],
      };
      render(<FeedPostCard post={postNoChains} chainTitle="Some Chain" />);
      expect(screen.queryByText('Part of:')).not.toBeInTheDocument();
    });
  });
});
