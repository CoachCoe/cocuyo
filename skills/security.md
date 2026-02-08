# Security Skill — Firefly Network

## Overview

The Firefly Network is a surveillance-resistant platform. Security is not a feature to be added later — it is a foundational architectural constraint. Every line of code, every dependency, every configuration choice must be evaluated through a security lens.

**Threat model summary:** Governments, corporations, and hostile actors who want to identify fireflies, suppress information, or compromise the integrity of verification trails.

---

## Security Principles

### 1. Collect Nothing

The most secure data is data that doesn't exist.

- **No user accounts** in the traditional sense — DIM credentials are the only identity
- **No email addresses** — not for signup, not for recovery, not for newsletters
- **No IP logging** — access logs must not contain client IPs (configure reverse proxy accordingly)
- **No device fingerprinting** — no canvas fingerprinting, no WebGL hashing, no font enumeration
- **No analytics that track individuals** — if analytics are needed, use privacy-preserving aggregate methods only (e.g., Plausible self-hosted, or custom event counts with no user correlation)
- **No cookies** — none. Zero. Not even "functional" cookies. Use stateless patterns.

```typescript
// Correct — stateless session via signed token in memory
// Token lives in JavaScript memory only, never persisted to storage

// Wrong — any of these
document.cookie = '...';
localStorage.setItem('session', '...');
sessionStorage.setItem('token', '...');
```

### 2. Fail Toward Privacy

When something goes wrong, it should fail in a way that protects the user, not exposes them.

```typescript
// Correct — error reveals nothing about the user
catch (error) {
  logger.error('Signal submission failed', {
    errorCode: error.code,
    signalType: signal.context.topics[0],  // Generic, not identifying
  });
  throw new AppError('Unable to submit signal. Please try again.');
}

// Wrong — error leaks identifying information
catch (error) {
  logger.error('Signal submission failed', {
    userId: user.id,          // PII in logs!
    ipAddress: req.ip,        // Network identity in logs!
    credential: user.dimCred, // Credential in logs!
    fullSignal: signal,       // Content in logs!
  });
}
```

### 3. Defense in Depth

No single security measure is sufficient. Layer defenses.

| Layer | Measures |
|-------|----------|
| Network | HTTPS only, HSTS, strict CSP, no mixed content |
| Application | Input validation, output encoding, CSRF protection |
| Data | Encryption at rest, encryption in transit, minimal collection |
| Identity | DIM proof-of-personhood, no PII correlation |
| Infrastructure | Minimal attack surface, principle of least privilege |
| Supply chain | Dependency auditing, lockfile integrity, SRI hashes |

---

## HTTP Security Headers

Every response from the application must include these headers. Configure in Next.js middleware or `next.config.js`.

```typescript
// next.config.js — Security headers
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self'",                           // No inline scripts, no eval
      "style-src 'self' 'unsafe-inline'",             // Tailwind requires unsafe-inline (minimize)
      "font-src 'self' https://fonts.gstatic.com",    // Google Fonts for Unbounded/Inter
      "img-src 'self' data: blob:",                    // Allow data URIs for inline images
      "connect-src 'self' wss:",                       // WebSocket for future chain connection
      "frame-src 'none'",                              // No iframes
      "object-src 'none'",                             // No plugins
      "base-uri 'self'",                               // Prevent base tag injection
      "form-action 'self'",                            // Restrict form submissions
      "frame-ancestors 'none'",                        // Prevent clickjacking
    ].join('; '),
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
];
```

### Why Each Header Matters

- **CSP**: Prevents XSS, data injection, clickjacking. The most critical header.
- **X-Frame-Options: DENY**: Prevents the site from being embedded in iframes (clickjacking defense).
- **no-referrer**: Prevents leaking the current URL when navigating to external links. Critical for a privacy platform.
- **HSTS**: Forces HTTPS. Prevents SSL stripping attacks.
- **Permissions-Policy**: Disables browser APIs we don't need (camera, microphone, location, FLoC).
- **COOP/CORP/COEP**: Cross-origin isolation. Prevents Spectre-class side-channel attacks.

---

## Input Validation

All user input must be validated and sanitized. Never trust client-side validation alone.

```typescript
// packages/types/src/validation.ts

import { z } from 'zod';

/** Signal content validation */
export const SignalContentSchema = z.object({
  text: z.string()
    .min(10, 'Signal must be at least 10 characters')   // Discourages low-effort content
    .max(5000, 'Signal must be under 5000 characters')
    .refine(
      (val) => !containsMaliciousPatterns(val),
      'Content contains disallowed patterns'
    ),
  media: z.array(MediaAttachmentSchema).max(5).optional(),
  links: z.array(z.string().url()).max(10).optional(),
});

/** Topic tag validation */
export const TopicTagSchema = z.string()
  .min(2).max(50)
  .regex(/^[a-zA-Z0-9\s\-]+$/, 'Topics must be alphanumeric');

/** NEVER allow raw HTML in any user input */
function sanitizeText(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

### Validation Rules

- **All strings**: Max length enforced. No raw HTML. XSS patterns rejected.
- **All numbers**: Range-checked. No NaN, no Infinity.
- **All arrays**: Max length enforced. Each element individually validated.
- **All URLs**: Must be valid URLs. No `javascript:` or `data:` schemes.
- **File uploads** (future): Type-checked by magic bytes, not just extension. Size-limited. Virus-scanned.

---

## Dependency Security

### Audit Process

```bash
# On every install and in CI
pnpm audit --audit-level=high

# Must pass with ZERO critical or high vulnerabilities
# Moderate and low should be documented and tracked
```

### Dependency Rules

1. **Justify every dependency.** Before adding a package, document:
   - What it does
   - Why we can't build it ourselves in <100 lines
   - Who maintains it (check bus factor)
   - When it was last updated
   - What its dependency tree looks like (beware deep trees)

2. **Prefer well-known, audited packages.** For crypto, ONLY use:
   - `@polkadot/util-crypto` — Polkadot ecosystem standard
   - `tweetnacl` — tiny, audited, no dependencies
   - `@noble/*` — audited, no dependencies
   - **NEVER** roll your own cryptography

3. **Lock everything.** `pnpm-lock.yaml` must be committed. CI must use `pnpm install --frozen-lockfile`.

4. **Review before update.** Don't blindly `pnpm update`. Read changelogs. Check for new dependencies.

### Subresource Integrity

Any external script or stylesheet must include SRI hashes.

```html
<!-- Correct — SRI hash verified -->
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/..."
  integrity="sha384-..."
  crossorigin="anonymous"
/>

<!-- Wrong — no SRI, browser blindly trusts CDN -->
<link rel="stylesheet" href="https://fonts.googleapis.com/..." />
```

---

## Logging Security

### What to Log

- Error codes and types (generic)
- Request timestamps
- Feature usage counts (aggregate)
- Performance metrics (aggregate)

### What NEVER to Log

- IP addresses
- DIM credentials
- Signal content
- User agent strings (can be used for fingerprinting)
- Referrer URLs
- Any data that could correlate a firefly's activities across signals
- Stack traces in production (only in development)

```typescript
// lib/logger.ts

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'production') {
      assertNoSensitiveData(meta);  // Runtime check in production
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
  const sensitiveKeys = ['ip', 'address', 'credential', 'dim', 'email', 'phone', 'name', 'userAgent'];
  const keys = Object.keys(meta);
  for (const key of keys) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      throw new Error(`SECURITY: Attempted to log sensitive key "${key}". This is a bug.`);
    }
  }
}
```

---

## Security Testing Checklist

### Before Every PR

- [ ] No PII in logs (grep for IP, email, credential, name, userAgent)
- [ ] No `eval()`, `Function()`, `innerHTML`, or `dangerouslySetInnerHTML`
- [ ] All user input validated with Zod schemas
- [ ] No hardcoded secrets, keys, or credentials
- [ ] No `console.log` in production code
- [ ] `pnpm audit` passes with zero critical/high
- [ ] Security headers present in response (test with curl)

### Before Every Release

- [ ] Full dependency audit with changelog review
- [ ] CSP header tested (use browser dev tools to verify no violations)
- [ ] HTTPS-only verified (no mixed content warnings)
- [ ] Headers verified with securityheaders.com or equivalent
- [ ] Lighthouse security audit score reviewed
- [ ] No new third-party scripts or external resources added without SRI

### Quarterly

- [ ] Full dependency tree review — remove unused, update outdated
- [ ] Threat model review — has the threat landscape changed?
- [ ] Penetration testing (when the app is user-facing)
- [ ] Review all logged data for PII creep

---

## Incident Response

If a security vulnerability is discovered:

1. **Do not discuss in public channels** (GitHub issues, Discord, etc.)
2. **Document the vulnerability** privately — what, how, impact scope
3. **Patch immediately** — security fixes take priority over all other work
4. **Disclose responsibly** — after patch, publish an advisory with details

### Security Contact

Establish a `security@fireflynetwork.org` (or equivalent) for responsible disclosure.

---

## Third-Party Service Policy

| Category | Policy |
|----------|--------|
| Analytics | No third-party analytics. Self-hosted aggregate metrics only. |
| Fonts | Google Fonts CDN acceptable (SRI required). Self-hosting preferred long-term. |
| CDNs | Minimize. Self-host static assets where possible. |
| Auth providers | None. DIM handles identity. |
| Payment processors | None. On-chain payments only (future). |
| Error tracking | Self-hosted only (e.g., Sentry self-hosted). No SaaS error tracking. |
| CI/CD | GitHub Actions acceptable. No third-party CI that runs on our code. |

**The rule:** If a service can see our users' data, we don't use it. Period.
