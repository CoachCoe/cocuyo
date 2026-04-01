import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  describe('rendering', () => {
    it('renders the wordmark', () => {
      render(<Footer />);
      expect(screen.getByText('FIREFLY NETWORK')).toBeInTheDocument();
    });

    it('renders the tagline', () => {
      render(<Footer />);
      expect(screen.getByText('Lights in the dark.')).toBeInTheDocument();
    });

    it('renders firefly symbol', () => {
      render(<Footer />);
      expect(screen.getByLabelText('Firefly')).toBeInTheDocument();
    });
  });

  describe('navigation columns', () => {
    it('renders Network column', () => {
      render(<Footer />);
      expect(screen.getByText('Network')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Explore' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Bounties' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Story Chains' })).toBeInTheDocument();
    });

    it('renders Resources column', () => {
      render(<Footer />);
      expect(screen.getByText('Resources')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Inspiration/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Contributing' })).toBeInTheDocument();
    });

    it('renders Community column', () => {
      render(<Footer />);
      expect(screen.getByText('Community')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /GitHub/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Polkadot/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Web3 Foundation/i })).toBeInTheDocument();
    });
  });

  describe('external links', () => {
    it('opens external links in new tab', () => {
      render(<Footer />);
      const githubLink = screen.getByRole('link', { name: /GitHub/i });
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('has screen reader text for external links', () => {
      render(<Footer />);
      expect(screen.getAllByText('(opens in new tab)').length).toBeGreaterThan(0);
    });
  });

  describe('copyright', () => {
    it('shows current year by default', () => {
      render(<Footer />);
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
    });

    it('accepts custom year', () => {
      render(<Footer year={2025} />);
      expect(screen.getByText(/© 2025/)).toBeInTheDocument();
    });

    it('shows Parity Technologies attribution', () => {
      render(<Footer />);
      expect(screen.getByText(/Parity Technologies/)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has contentinfo role', () => {
      render(<Footer />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<Footer />);
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(3);
    });
  });
});
