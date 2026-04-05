/**
 * Structured logging utilities.
 *
 * Provides consistent logging across the application with:
 * - Environment-aware verbosity (dev vs prod)
 * - Structured context for debugging
 * - Swallowed error tracking
 *
 * Note: In production, you may want to send these to an external service.
 * Never log PII or sensitive data.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  /** Module or component name */
  module: string;
  /** Operation being performed */
  operation: string;
  /** Additional context (no PII!) */
  context?: Record<string, unknown>;
}

const isDev = process.env.NODE_ENV === 'development';

/**
 * Log a message with structured context.
 */
function log(level: LogLevel, message: string, ctx: LogContext): void {
  // In production, only log warnings and errors
  if (!isDev && (level === 'debug' || level === 'info')) {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${ctx.module}:${ctx.operation}]`;

  const logFn = level === 'error' ? console.error
    : level === 'warn' ? console.warn
    : level === 'debug' ? console.debug
    : console.info;

  if (ctx.context !== undefined) {
    logFn(prefix, message, ctx.context);
  } else {
    logFn(prefix, message);
  }
}

/**
 * Log a debug message (dev only).
 */
export function logDebug(message: string, ctx: LogContext): void {
  log('debug', message, ctx);
}

/**
 * Log an info message.
 */
export function logInfo(message: string, ctx: LogContext): void {
  log('info', message, ctx);
}

/**
 * Log a warning.
 */
export function logWarn(message: string, ctx: LogContext): void {
  log('warn', message, ctx);
}

/**
 * Log an error.
 * Note: For swallowed errors where fallback behavior is expected,
 * use logSwallowedError instead.
 */
export function logError(message: string, ctx: LogContext, error?: unknown): void {
  const baseContext = ctx.context ?? {};
  const errorContext = error !== undefined
    ? { ...baseContext, error: error instanceof Error ? error.message : String(error) }
    : baseContext;

  log('error', message, { module: ctx.module, operation: ctx.operation, context: errorContext });
}

/**
 * Log a swallowed error - an error that was caught but where we're
 * proceeding with fallback behavior. Only logs in development.
 */
export function logSwallowedError(
  message: string,
  ctx: LogContext,
  error?: unknown
): void {
  if (!isDev) return;

  const baseContext = ctx.context ?? {};
  const errorContext = error !== undefined
    ? { ...baseContext, error: error instanceof Error ? error.message : String(error) }
    : baseContext;

  log('debug', `[Swallowed] ${message}`, { module: ctx.module, operation: ctx.operation, context: errorContext });
}

/**
 * Create a scoped logger for a specific module.
 */
export function createLogger(module: string) {
  return {
    debug: (message: string, operation: string, context?: Record<string, unknown>) =>
      logDebug(message, { module, operation, ...(context !== undefined && { context }) }),
    info: (message: string, operation: string, context?: Record<string, unknown>) =>
      logInfo(message, { module, operation, ...(context !== undefined && { context }) }),
    warn: (message: string, operation: string, context?: Record<string, unknown>) =>
      logWarn(message, { module, operation, ...(context !== undefined && { context }) }),
    error: (message: string, operation: string, error?: unknown, context?: Record<string, unknown>) =>
      logError(message, { module, operation, ...(context !== undefined && { context }) }, error),
    swallowed: (message: string, operation: string, error?: unknown, context?: Record<string, unknown>) =>
      logSwallowedError(message, { module, operation, ...(context !== undefined && { context }) }, error),
  };
}
