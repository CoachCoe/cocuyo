import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SignalCard } from './SignalCard';
import type { Signal } from '@cocuyo/types';
import { createSignalId, createChainId, createDIMCredential } from '@cocuyo/types';

const mockSignal: Signal = {
  id: createSignalId('sig-001'),
  author: {
    id: '001',
    credentialHash: createDIMCredential('dim-anon-001'),
    pseudonym: 'TestUser',
    disclosureLevel: 'anonymous',
    location: 'Test City',
    reputation: 42,
  },
  content: {
    text: 'This is a test signal with important information.',
  },
  context: {
    topics: ['environmental', 'water-quality'],
    locationName: 'Test Location, NH',
    location: { latitude: 43.0, longitude: -71.0 },
  },
  dimSignature: createDIMCredential('dim-anon-001'),
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

describe('SignalCard', () => {
  describe('rendering', () => {
    it('renders signal content', () => {
      render(<SignalCard signal={mockSignal} />);
      expect(screen.getByText(mockSignal.content.text)).toBeInTheDocument();
    });

    it('renders author pseudonym', () => {
      render(<SignalCard signal={mockSignal} />);
      expect(screen.getByText('TestUser')).toBeInTheDocument();
    });

    it('renders author initial in avatar', () => {
      render(<SignalCard signal={mockSignal} />);
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('renders author location when disclosed', () => {
      render(<SignalCard signal={mockSignal} />);
      expect(screen.getByText('Test City')).toBeInTheDocument();
    });

    it('renders first topic', () => {
      render(<SignalCard signal={mockSignal} />);
      expect(screen.getByText('environmental')).toBeInTheDocument();
    });

    it('renders location name', () => {
      render(<SignalCard signal={mockSignal} />);
      expect(screen.getByText('Test Location, NH')).toBeInTheDocument();
    });

    it('renders relative time', () => {
      render(<SignalCard signal={mockSignal} />);
      expect(screen.getByText('1h ago')).toBeInTheDocument();
    });
  });

  describe('corroborations', () => {
    it('renders total corroboration count', () => {
      render(<SignalCard signal={mockSignal} />);
      // witnessCount + expertiseCount = 5 + 1 = 6
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('corroborations')).toBeInTheDocument();
    });

    it('renders evidence count when present', () => {
      render(<SignalCard signal={mockSignal} />);
      expect(screen.getByText('2 evidence')).toBeInTheDocument();
    });

    it('renders challenge count when present', () => {
      const signalWithChallenges = {
        ...mockSignal,
        corroborations: { ...mockSignal.corroborations, challengeCount: 2 },
      };
      render(<SignalCard signal={signalWithChallenges} />);
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('challenges')).toBeInTheDocument();
    });

    it('hides evidence when zero', () => {
      const signalNoEvidence = {
        ...mockSignal,
        corroborations: { ...mockSignal.corroborations, evidenceCount: 0 },
      };
      render(<SignalCard signal={signalNoEvidence} />);
      expect(screen.queryByText('0 evidence')).not.toBeInTheDocument();
    });
  });

  describe('chain link', () => {
    it('renders chain link when chainTitle provided', () => {
      render(<SignalCard signal={mockSignal} chainTitle="Water Quality Investigation" />);
      expect(screen.getByText('Part of:')).toBeInTheDocument();
      expect(screen.getByText('Water Quality Investigation')).toBeInTheDocument();
    });

    it('hides chain link when no chainTitle', () => {
      render(<SignalCard signal={mockSignal} />);
      expect(screen.queryByText('Part of:')).not.toBeInTheDocument();
    });

    it('calls onChainClick when chain link clicked', () => {
      const handleChainClick = vi.fn();
      render(
        <SignalCard
          signal={mockSignal}
          chainTitle="Water Quality"
          onChainClick={handleChainClick}
        />
      );
      fireEvent.click(screen.getByText('Water Quality'));
      expect(handleChainClick).toHaveBeenCalledWith(mockSignal.chainLinks[0]);
    });
  });

  describe('verification badge', () => {
    it('renders verified badge', () => {
      const verifiedSignal = {
        ...mockSignal,
        verification: { status: 'verified' as const },
      };
      render(<SignalCard signal={verifiedSignal} />);
      expect(screen.getByLabelText('Verified')).toBeInTheDocument();
    });

    it('renders disputed badge', () => {
      const disputedSignal = {
        ...mockSignal,
        verification: { status: 'disputed' as const },
      };
      render(<SignalCard signal={disputedSignal} />);
      expect(screen.getByText('Disputed')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onClick when card clicked', () => {
      const handleClick = vi.fn();
      render(<SignalCard signal={mockSignal} onClick={handleClick} />);
      // When clickable, article becomes a button
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      fireEvent.click(buttons[0] as HTMLElement);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onAuthorClick when author clicked', () => {
      const handleAuthorClick = vi.fn();
      render(<SignalCard signal={mockSignal} onAuthorClick={handleAuthorClick} />);
      fireEvent.click(screen.getByText('TestUser'));
      expect(handleAuthorClick).toHaveBeenCalledWith(mockSignal.author.credentialHash);
    });

    it('supports keyboard navigation when clickable', () => {
      const handleClick = vi.fn();
      render(<SignalCard signal={mockSignal} onClick={handleClick} />);
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
      render(<SignalCard signal={mockSignal} />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('has button role when clickable', () => {
      render(<SignalCard signal={mockSignal} onClick={vi.fn()} />);
      // The card becomes a button, plus there's the author button
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('is focusable when clickable', () => {
      render(<SignalCard signal={mockSignal} onClick={vi.fn()} />);
      // First button is the card
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons[0]).toHaveAttribute('tabIndex', '0');
    });

    it('has proper time element', () => {
      render(<SignalCard signal={mockSignal} />);
      const timeEl = screen.getByText('1h ago').closest('time');
      expect(timeEl).toHaveAttribute('dateTime');
    });
  });

  describe('edge cases', () => {
    it('handles signal without location', () => {
      // Create a new signal without location fields (omitted, not undefined)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { location: _authorLoc, ...authorWithoutLocation } = mockSignal.author;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { locationName: _locName, location: _loc, ...contextWithoutLocation } = mockSignal.context;
      const signalNoLocation: Signal = {
        ...mockSignal,
        author: authorWithoutLocation,
        context: contextWithoutLocation,
      };
      render(<SignalCard signal={signalNoLocation} />);
      expect(screen.getByText('TestUser')).toBeInTheDocument();
    });

    it('handles empty chain links', () => {
      const signalNoChains: Signal = {
        ...mockSignal,
        chainLinks: [],
      };
      render(<SignalCard signal={signalNoChains} chainTitle="Some Chain" />);
      expect(screen.queryByText('Part of:')).not.toBeInTheDocument();
    });
  });
});
