---
name: security
description: 'Implement surveillance-resistant security patterns. Triggers: security, privacy, encryption, CSP, headers, validation, audit, logging, PII'
---

# Security Skill — Firefly Network

## When to Activate

- Implementing user-facing features
- Handling user input
- Adding dependencies
- Configuring HTTP headers
- Implementing logging
- Reviewing code for security issues
- Any change touching authentication or identity

---

## Global Invariants

| Rule                    | Enforcement                  | Status    |
| ----------------------- | ---------------------------- | --------- |
| Zero PII collection     | No emails, IPs, fingerprints | MANDATORY |
| No cookies              | Stateless patterns only      | MANDATORY |
| No third-party tracking | Self-hosted metrics only     | MANDATORY |
| Fail toward privacy     | Errors reveal nothing        | MANDATORY |
| Defense in depth        | Multiple security layers     | MANDATORY |
| Minimal dependencies    | Justify every package        | MANDATORY |

---

## Threat Model

**Primary adversaries:** Governments, corporations, and hostile actors who want to:

- Identify fireflies
- Suppress information
- Compromise verification trails

---

## Data Collection Policy

### NEVER Collect

| Data Type                   | Status    | Rationale                          |
| --------------------------- | --------- | ---------------------------------- |
| Email addresses             | FORBIDDEN | Not needed, can't be subpoenaed    |
| IP addresses                | FORBIDDEN | Don't log, configure reverse proxy |
| Device fingerprints         | FORBIDDEN | No canvas, WebGL, font enumeration |
| User agent strings          | FORBIDDEN | Fingerprinting vector              |
| Cookies                     | FORBIDDEN | No cookies, period                 |
| localStorage/sessionStorage | FORBIDDEN | Use memory-only tokens             |

### Allowed Collection

| Data Type             | Constraints                 |
| --------------------- | --------------------------- |
| DIM credentials       | Public by design            |
| Signal content        | User-submitted, hashed      |
| Corroboration records | Public verification data    |
| Aggregate metrics     | Non-identifying counts only |

---

## Contrastive Exemplars

### Error Handling

✅ CORRECT:

```typescript
catch (error) {
  logger.error('Signal submission failed', {
    errorCode: error.code,
    signalType: signal.context.topics[0],  // Generic, not identifying
  });
  throw new AppError('Unable to submit signal. Please try again.');
}
```

❌ FAIL:

```typescript
catch (error) {
  logger.error('Signal submission failed', {
    userId: user.id,          // PII in logs!
    ipAddress: req.ip,        // Network identity in logs!
    credential: user.dimCred, // Credential in logs!
    fullSignal: signal,       // Content in logs!
  });
}
```

### Session Management

✅ CORRECT:

```typescript
// Token lives in JavaScript memory only, never persisted
const [token, setToken] = useState<string | null>(null);
```

❌ FAIL:

```typescript
// Persisted storage — FORBIDDEN
document.cookie = 'session=...';
localStorage.setItem('session', '...');
sessionStorage.setItem('token', '...');
```

---

## HTTP Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' wss:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
];
```

---

## Input Validation

### Zod Schemas

```typescript
import { z } from 'zod';

export const SignalContentSchema = z.object({
  text: z
    .string()
    .min(10, 'Signal must be at least 10 characters')
    .max(5000, 'Signal must be under 5000 characters')
    .refine((val) => !containsMaliciousPatterns(val), 'Content contains disallowed patterns'),
  media: z.array(MediaAttachmentSchema).max(5).optional(),
  links: z.array(z.string().url()).max(10).optional(),
});

export const TopicTagSchema = z
  .string()
  .min(2)
  .max(50)
  .regex(/^[a-zA-Z0-9\s\-]+$/, 'Topics must be alphanumeric');
```

### Validation Rules

| Type    | Constraints                                |
| ------- | ------------------------------------------ |
| Strings | Max length, no HTML, XSS patterns rejected |
| Numbers | Range-checked, no NaN/Infinity             |
| Arrays  | Max length, each element validated         |
| URLs    | Valid URL, no javascript:/data: schemes    |
| Files   | Magic bytes check, size limit, virus scan  |

---

## Logging Security

### Secure Logger

```typescript
export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'production') {
      assertNoSensitiveData(meta);
    }
    // ... log
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'production') {
      assertNoSensitiveData(meta);
    }
    // ... log
  },
};

function assertNoSensitiveData(meta?: Record<string, unknown>): void {
  if (!meta) return;
  const sensitiveKeys = [
    'ip',
    'address',
    'credential',
    'dim',
    'email',
    'phone',
    'name',
    'userAgent',
  ];
  const keys = Object.keys(meta);
  for (const key of keys) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      throw new Error(`SECURITY: Attempted to log sensitive key "${key}". This is a bug.`);
    }
  }
}
```

### Logging Matrix

| ✅ Log              | ❌ Never Log        |
| ------------------- | ------------------- |
| Error codes         | IP addresses        |
| Timestamps          | DIM credentials     |
| Feature counts      | Signal content      |
| Performance metrics | User agent strings  |
|                     | Referrer URLs       |
|                     | Stack traces (prod) |

---

## Dependency Security

### Audit Process

```bash
# On every install and in CI
pnpm audit --audit-level=high

# Must pass with ZERO critical or high vulnerabilities
```

### Dependency Rules

| Rule                       | Enforcement                      |
| -------------------------- | -------------------------------- |
| Justify every dependency   | Document why needed              |
| Prefer audited packages    | @polkadot/_, tweetnacl, @noble/_ |
| Lock everything            | Commit pnpm-lock.yaml            |
| Review before update       | Read changelogs                  |
| SRI for external resources | integrity="sha384-..."           |

### Approved Crypto Libraries

| Library               | Use Case                  |
| --------------------- | ------------------------- |
| @polkadot/util-crypto | Polkadot ecosystem crypto |
| tweetnacl             | Tiny, audited, no deps    |
| @noble/\*             | Audited, no deps          |

**NEVER roll custom cryptography.**

---

## Third-Party Service Policy

| Category           | Policy                                      |
| ------------------ | ------------------------------------------- |
| Analytics          | NO third-party. Self-hosted aggregate only  |
| Fonts              | Google Fonts with SRI. Self-host long-term  |
| CDNs               | Minimize. Self-host static assets           |
| Auth providers     | NONE. DIM handles identity                  |
| Payment processors | NONE. On-chain payments only                |
| Error tracking     | Self-hosted only (e.g., Sentry self-hosted) |
| CI/CD              | GitHub Actions acceptable                   |

**The rule:** If a service can see our users' data, we don't use it.

---

## Security Checklists

### Before Every PR

- [ ] No PII in logs (grep for: ip, email, credential, name, userAgent)
- [ ] No `eval()`, `Function()`, `innerHTML`, `dangerouslySetInnerHTML`
- [ ] All user input validated with Zod
- [ ] No hardcoded secrets, keys, or credentials
- [ ] No `console.log` in production code
- [ ] `pnpm audit` passes with zero critical/high
- [ ] Security headers present (test with curl)

### Before Every Release

- [ ] Full dependency audit with changelog review
- [ ] CSP tested (no browser violations)
- [ ] HTTPS-only verified
- [ ] Headers verified (securityheaders.com)
- [ ] No new external resources without SRI

### Quarterly

- [ ] Full dependency tree review
- [ ] Threat model review
- [ ] Penetration testing (when user-facing)
- [ ] PII creep audit

---

## Anti-Patterns

| Pattern                      | Status    | Reason                        |
| ---------------------------- | --------- | ----------------------------- |
| `eval()`                     | FORBIDDEN | Code injection                |
| `Function()`                 | FORBIDDEN | Code injection                |
| `innerHTML`                  | FORBIDDEN | XSS vector                    |
| `dangerouslySetInnerHTML`    | FORBIDDEN | XSS vector (unless sanitized) |
| Inline event handlers        | FORBIDDEN | CSP violation                 |
| External scripts without SRI | FORBIDDEN | Supply chain risk             |
| Third-party analytics        | FORBIDDEN | Privacy violation             |
| Cookie usage                 | FORBIDDEN | Tracking vector               |
| localStorage for auth        | FORBIDDEN | XSS accessible                |
| Custom crypto                | FORBIDDEN | Use audited libraries         |

---

## Incident Response

1. **Do not discuss in public channels**
2. **Document privately** — what, how, impact scope
3. **Patch immediately** — security fixes are top priority
4. **Disclose responsibly** — after patch, publish advisory

Establish security contact: `security@fireflynetwork.org`
