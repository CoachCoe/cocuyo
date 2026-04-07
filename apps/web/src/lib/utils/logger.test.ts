/**
 * Tests for logger utility.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, logger } from './logger';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createLogger', () => {
    it('should create a logger with all methods', () => {
      const log = createLogger('test-module');

      expect(typeof log.debug).toBe('function');
      expect(typeof log.info).toBe('function');
      expect(typeof log.warn).toBe('function');
      expect(typeof log.error).toBe('function');
    });

    it('should not throw when calling debug', () => {
      const log = createLogger('test');
      expect(() => log.debug('debug message')).not.toThrow();
    });

    it('should not throw when calling info', () => {
      const log = createLogger('test');
      expect(() => log.info('info message')).not.toThrow();
    });

    it('should not throw when calling warn', () => {
      const log = createLogger('test');
      expect(() => log.warn('warning message')).not.toThrow();
    });

    it('should not throw when calling error', () => {
      const log = createLogger('test');
      expect(() => log.error('error message', new Error('test error'))).not.toThrow();
    });

    it('should not throw when calling error with context', () => {
      const log = createLogger('test');
      expect(() =>
        log.error('error message', new Error('test'), { extra: 'data' })
      ).not.toThrow();
    });

    it('should handle non-Error objects in error logs', () => {
      const log = createLogger('test');
      expect(() => log.error('something failed', 'string error')).not.toThrow();
    });

    it('should handle null/undefined errors', () => {
      const log = createLogger('test');
      expect(() => log.error('something failed', null)).not.toThrow();
      expect(() => log.error('something failed', undefined)).not.toThrow();
    });

    it('should accept context with debug', () => {
      const log = createLogger('test');
      expect(() => log.debug('message', { key: 'value' })).not.toThrow();
    });

    it('should accept context with info', () => {
      const log = createLogger('test');
      expect(() => log.info('message', { key: 'value' })).not.toThrow();
    });

    it('should accept context with warn', () => {
      const log = createLogger('test');
      expect(() => log.warn('message', { key: 'value' })).not.toThrow();
    });
  });

  describe('default logger', () => {
    it('should be an instance of logger', () => {
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('should not throw when logging', () => {
      expect(() => logger.info('test')).not.toThrow();
      expect(() => logger.debug('test')).not.toThrow();
      expect(() => logger.warn('test')).not.toThrow();
      expect(() => logger.error('test', new Error('e'))).not.toThrow();
    });
  });
});
