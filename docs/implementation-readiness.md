# Implementation Readiness Assessment

> Evaluating whether we can create a detailed implementation plan for pUSD + Coinage integration

## Summary

**Can we make a detailed plan?** Partially. We can plan Phases 1-2 in detail, but Phases 3-5 have blocking dependencies.

| Phase                      | Readiness | Blocker                              |
| -------------------------- | --------- | ------------------------------------ |
| 1. Currency Foundation     | Ready     | None                                 |
| 2. Public pUSD (Bounties)  | Blocked   | Need pUSD Asset ID                   |
| 3. Treasury Infrastructure | Blocked   | Need multi-sig design decisions      |
| 4. Coinage Integration     | Blocked   | Coinage not deployed, API may change |
| 5. Full Payment System     | Blocked   | Depends on Phases 2-4                |

---

## What We Know (Sufficient Information)

### 1. Architecture & Infrastructure

- Wallet integration via `@polkadot-apps/signer`
- DIM client structure (mock implemented, production scaffolded)
- Bulletin Chain for content storage
- Chain endpoints (Polkadot, Kusama, Westend, Asset Hub, Paseo)
- Type system patterns (branded types, service interfaces)

### 2. Use Cases (Well-Defined)

- Information bounties with escrow
- Crowdstacking treasury contributions
- Journalist compensation
- Membership fees
- Alliance settlements

### 3. Coinage Design (Detailed but Not Final)

- Coin denomination system (powers of 2)
- Age-based transfer limits
- Recycler anonymization mechanism
- Free usage for People/Lite People via DIM
- Pull-based transfer mechanic

### 4. Privacy Model

- When to use public vs private payments
- Threat model for journalists
- Information leakage points

---

## Blocking Dependencies

### Critical Blockers (Cannot Proceed Without)

#### 1. pUSD Asset ID on Asset Hub

**Status:** Unknown
**Impact:** Cannot implement any pUSD transfer logic
**Question:** What is the Asset Hub asset ID for pUSD?
**Who to ask:** Polkadot/Parity team

#### 2. Coinage Deployment Timeline

**Status:** Design doc "under review"
**Impact:** Cannot implement private payments
**Questions:**

- When will Coinage be deployed?
- Will it be on People Chain or Asset Hub? (doc says "probably People Chain")
- What testnets are available for development?

**Who to ask:** Guillaume Thiolliere, George Pisaltu (design doc authors)

#### 3. Coinage API Stability

**Status:** Design doc shows API signatures, but may change
**Impact:** Code written now may need rewriting
**Questions:**

- Are the pallet call signatures finalized?
- Are the ring-VRF proof formats finalized?
- Will there be an SDK/client library?

**Who to ask:** Coinage development team

### Major Dependencies (Needed Before Production)

#### 4. DIM → Coinage Integration Path

**Status:** Conceptually understood, not specified
**Impact:** Cannot implement free usage tier
**Questions:**

- How do we query a user's available free claim tokens?
- What's the exact ring context for People vs Lite People?
- How do we generate the ring-VRF proofs?

**Current understanding:**

```
DIM Credential → Ring membership → Context-specific alias → Claim token
```

But the exact API calls are not specified.

#### 5. XCM Flow: Asset Hub ↔ People Chain

**Status:** Not specified
**Impact:** Cannot move pUSD into Coinage recycler
**Questions:**

- How do we transfer pUSD from Asset Hub to People Chain?
- Is this automatic when loading the recycler?
- Are there fees for cross-chain transfers?

#### 6. Chat Integration for Key Sharing

**Status:** Coinage requires off-chain key exchange
**Impact:** Core transfer UX depends on this
**Questions:**

- Does Firefly Network have existing E2E encrypted chat?
- How do we handle offline recipients?
- What's the key format for sharing?

**From codebase exploration:** No chat implementation found. This is a significant gap.

#### 7. On/Off Ramp Partners

**Status:** User said "coming"
**Impact:** Limits adoption to crypto-native users
**Questions:**

- Which partners are being pursued?
- What's the timeline?
- Will they support direct pUSD, or only DOT?

### Design Decisions Needed

#### 8. Treasury Multi-Sig Structure

**Status:** Conceptual only
**Questions:**

- Who are the signers? (Founding outlets? Elected representatives?)
- What's the threshold? (2-of-3? 3-of-5?)
- How do we handle signer rotation?
- Is this a Polkadot native multi-sig or a smart contract?

#### 9. Bounty Escrow Mechanism

**Status:** Types defined, implementation not designed
**Options:**
a. Multi-sig account per bounty (simple but expensive)
b. Shared multi-sig with accounting (complex but efficient)
c. Smart contract (most flexible but requires ink! development)

**Question:** Which approach?

#### 10. Compliance Requirements

**Status:** Coinage doc says "compliance not enforced on chain"
**Questions:**

- What are the actual legal requirements for the target jurisdictions?
- Do we need KYC at any point?
- Are there transaction limits we need to enforce?
- Has Parity legal team reviewed the Firefly use case?

#### 11. Ring Size Minimums

**Status:** Privacy depends on ring size, but no guarantees
**Questions:**

- What's the minimum ring size for acceptable privacy?
- How do we handle low-traffic scenarios?
- Should we delay transactions until ring is sufficient?
- Can we coordinate with other Coinage users to fill rings?

---

## What We CAN Plan in Detail

### Phase 1: Currency Foundation (Ready Now)

No external dependencies. Can implement immediately.

```
Tasks:
├── 1.1 Create @cocuyo/types/currency.ts
│   ├── PUSDAmount branded type
│   ├── Formatting utilities
│   ├── Arithmetic helpers
│   └── Unit tests
│
├── 1.2 Create @cocuyo/types/coinage.ts
│   ├── Coin types (exponent, age)
│   ├── CoinWallet interface
│   ├── Denomination utilities
│   └── Unit tests
│
├── 1.3 Create @cocuyo/types/payment-mode.ts
│   ├── PaymentMode enum
│   ├── Mode selection logic
│   └── Unit tests
│
└── 1.4 Extend existing types
    ├── Update bounty.ts with PUSDAmount
    ├── Add EscrowId branded type
    └── Add TransactionHash branded type
```

**Estimated effort:** 1-2 weeks
**Dependencies:** None

### Phase 2: Mock Payment Services (Ready Now)

Can build service interfaces and mock implementations without real chain integration.

```
Tasks:
├── 2.1 Create @cocuyo/payments package
│   ├── Package setup
│   ├── PaymentService interface
│   └── MockPaymentService implementation
│
├── 2.2 Create EscrowService interface
│   ├── createEscrow()
│   ├── releaseFunds()
│   ├── refundFunds()
│   └── MockEscrowService implementation
│
├── 2.3 Create @cocuyo/coinage package (interfaces only)
│   ├── CoinageClient interface
│   ├── Coin management methods
│   ├── Recycler methods
│   └── MockCoinageClient implementation
│
└── 2.4 Create PaymentRouter
    ├── Mode selection logic
    ├── Route to appropriate service
    └── Unit tests
```

**Estimated effort:** 2-3 weeks
**Dependencies:** Phase 1

### Phase 2b: Bounty UI (Ready Now, with Mocks)

Can build the bounty creation and fulfillment UI using mock services.

```
Tasks:
├── 2b.1 Bounty creation flow
│   ├── Amount input (with pUSD formatting)
│   ├── Topic/location selection
│   ├── Duration selection
│   └── Wallet connection prompt
│
├── 2b.2 Bounty list view
│   ├── Filter by topic/status
│   ├── Funding amount display
│   └── Time remaining indicator
│
├── 2b.3 Bounty fulfillment flow
│   ├── Link signal to bounty
│   ├── Verification status display
│   └── Payout status tracking
│
└── 2b.4 Wallet dashboard
    ├── pUSD balance display (mock)
    ├── Private coin balance display (mock)
    └── Transaction history (mock)
```

**Estimated effort:** 3-4 weeks
**Dependencies:** Phase 2

---

## What We CANNOT Plan in Detail

### Phase 3: Real Asset Hub Integration

**Blocked by:** pUSD Asset ID

```
Tasks (outline only):
├── 3.1 Asset Hub client implementation
│   ├── Balance queries
│   ├── Transfer execution
│   └── Event subscription
│
├── 3.2 Replace mock payment service
│   └── Wire to real Asset Hub
│
└── 3.3 Escrow implementation
    └── Depends on design decision (multi-sig vs contract)
```

**Cannot estimate** until we know:

- pUSD asset ID
- Escrow mechanism choice
- Multi-sig structure (if applicable)

### Phase 4: Real Coinage Integration

**Blocked by:** Coinage deployment, API stability, DIM integration path

```
Tasks (outline only):
├── 4.1 Coinage client implementation
│   ├── Coin scanning
│   ├── Key derivation
│   ├── Recycler operations
│   └── Ring-VRF proof generation
│
├── 4.2 DIM → Claim token integration
│   └── Query free tokens, generate proofs
│
├── 4.3 Chat integration for key sharing
│   └── E2E encrypted messaging (may need to build)
│
└── 4.4 XCM integration
    └── pUSD ↔ Coinage transfers
```

**Cannot estimate** until we have:

- Deployed Coinage testnet
- Finalized API signatures
- DIM integration documentation
- Chat infrastructure (or decision to build)

### Phase 5: Treasury & Alliance Features

**Blocked by:** Design decisions, Phases 3-4

```
Tasks (outline only):
├── 5.1 Treasury multi-sig setup
├── 5.2 Contribution flow
├── 5.3 Allocation governance
├── 5.4 Outlet onboarding
└── 5.5 Alliance settlement
```

---

## Recommended Next Steps

### Immediate (Can Start Now)

1. **Implement Phase 1** — Currency types and utilities
2. **Implement Phase 2** — Mock payment services
3. **Implement Phase 2b** — Bounty UI with mocks

This gives us a working prototype to demonstrate, even without real chain integration.

### Questions to Resolve (Priority Order)

| #   | Question                                        | Who to Ask            | Impact                |
| --- | ----------------------------------------------- | --------------------- | --------------------- |
| 1   | What is the pUSD Asset ID?                      | Polkadot/Parity       | Blocks Phase 3        |
| 2   | When will Coinage be on testnet?                | Coinage team          | Blocks Phase 4        |
| 3   | Is there an existing chat system we should use? | Team decision         | Blocks transfer UX    |
| 4   | What escrow mechanism should we use?            | Architecture decision | Blocks bounty payouts |
| 5   | Who are the treasury signers?                   | Governance decision   | Blocks treasury       |
| 6   | What are the compliance requirements?           | Legal team            | Blocks production     |

### Proposed Timeline (Optimistic)

```
Month 1-2: Phases 1, 2, 2b (No external dependencies)
           └── Deliverable: Working prototype with mocks

Month 3:   Resolve blocking questions
           └── Deliverable: Detailed Phase 3-5 plans

Month 4-5: Phase 3 (Asset Hub integration)
           └── Deliverable: Real pUSD bounties (public payments)

Month 6+:  Phase 4-5 (Coinage, Treasury)
           └── Depends on Coinage deployment timeline
```

---

## Risk Assessment

### High Risk

| Risk                       | Mitigation                                       |
| -------------------------- | ------------------------------------------------ |
| Coinage deployment delayed | Build public-only MVP first; add privacy later   |
| pUSD not available         | Use USDC or DOT as interim stablecoin            |
| Chat infrastructure gap    | Evaluate existing solutions (Matrix, XMTP, etc.) |

### Medium Risk

| Risk                              | Mitigation                                                          |
| --------------------------------- | ------------------------------------------------------------------- |
| API changes after implementation  | Build abstraction layers; minimize direct coupling                  |
| Ring sizes too small for privacy  | Coordinate with other Coinage users; accept lower privacy initially |
| Compliance issues discovered late | Engage legal early; build with compliance hooks                     |

### Low Risk

| Risk                   | Mitigation                                     |
| ---------------------- | ---------------------------------------------- |
| Type system changes    | Well-tested foundation; migration scripts      |
| UI requirements change | Component-based architecture; easy to refactor |

---

## Conclusion

**We can start implementation now** with Phases 1-2b, which have no external dependencies and will produce a working prototype.

**We cannot create a detailed end-to-end plan** until we resolve the blocking questions, particularly:

1. pUSD Asset ID
2. Coinage deployment timeline
3. Escrow mechanism decision
4. Chat infrastructure decision

**Recommended action:** Start Phases 1-2b immediately while pursuing answers to blocking questions in parallel.
