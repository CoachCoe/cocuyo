/**
 * Structured Logging Utility
 *
 * Provides structured logging for production code. In development,
 * logs to console. In production, this can be extended to send
 * logs to a service.
 *
 * Never logs PII or sensitive data.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  /** Component or module name */
  module?: string;
  /** Additional context data (never include PII) */
  [key: string]: unknown;
}

interface Logger {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, error?: unknown, context?: LogContext) => void;
}

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Format error for logging (strips stack in production).
 */
function formatError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      ...(isDevelopment && { stack: error.stack }),
    };
  }
  return { raw: String(error) };
}

/**
 * Create a logger for a specific module.
 */
export function createLogger(moduleName: string): Logger {
  const log = (level: LogLevel, message: string, context?: LogContext): void => {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      module: moduleName,
      message,
      ...context,
    };

    if (isDevelopment) {
      const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      // eslint-disable-next-line no-console
      console[method](`[${moduleName}] ${message}`, context ?? '');
    } else {
      // In production, could send to logging service
      // For now, only log warnings and errors
      if (level === 'error' || level === 'warn') {
        // eslint-disable-next-line no-console
        console[level](JSON.stringify(entry));
      }
    }
  };

  return {
    debug: (message, context) => log('debug', message, context),
    info: (message, context) => log('info', message, context),
    warn: (message, context) => log('warn', message, context),
    error: (message, error, context) =>
      log('error', message, { ...context, error: formatError(error) }),
  };
}

/**
 * Default application logger.
 */
export const logger = createLogger('app');
