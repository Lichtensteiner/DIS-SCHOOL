# Security Specification & Threat Model - DIS'SCHOOL Gabon

This document details the Zero-Trust attribute-based security model for DIS'SCHOOL Gabon. It describes the data invariants, 12 malicious payload vectors (The "Dirty Dozen"), and verifies how we prevent vulnerability leaks across Firestore paths.

## 1. Data Invariants

- **Identity Ownership**: Users can only create or update their own `UserProfile` at `/users/{userId}` where `{userId}` matches `request.auth.uid`. No user can rewrite another user's email, name, or role.
- **Role Isolation (Non-Escalation)**: Users cannot self-escalate their profile role attribute (e.g. standard pupils cannot elevate themselves to `teacher` or `coach_admin` profiles).
- **Payment Integrity (Escrow Lock)**: Escrow transactions at `/transactions/{txId}` cannot be deleted. Standard users cannot arbitrarily mark an `Escrow` state as `Released` without actual `coach_admin` action or peer-signed releases. No user can change the amount or sender of an existing transaction document.
- **Teacher Verification Gate**: Profile variables like `verified` in `/teachers/{teacherId}` can only be set to `true` by an authorized `coach_admin` account.
- **Temporal Invariants**: All write operations for `createdAt` and `updatedAt` timestamps must strictly validate that the payload contains `request.time`. They are immutable after creation.
- **ID Characters Constraints**: Document IDs must be structurally constrained to `^[a-zA-Z0-9_\-]+$` and limited to under 128 characters to protect against path poisoning.

---

## 2. The "Dirty Dozen" Payloads (Auden Attacks & Vulnerability Checks)

The following 12 payloads are explicitly designed to test permission gaps. Under the custom security rules, they must return `PERMISSION_DENIED`.

### Attack Vector 1: Self-Role Escalation
- **Target**: `/users/attacker_uid`
- **Method**: `CREATE` / `UPDATE`
- **Description**: Standard pupil attempts to set their role to `coach_admin` or `teacher` during registration.
- **Payload**:
  ```json
  {
    "id": "attacker_uid",
    "name": "Malicious Student",
    "email": "student@attacker.com",
    "role": "coach_admin",
    "phone": "+241 077 00 00 00",
    "zone": "Libreville"
  }
  ```
- **Mitigation**: Validation forces matching with existing metadata or locks the role to 'élève' or 'parent' on initial sign-up, or enforces that changing roles is strictly forbidden.

### Attack Vector 2: Profile Spoofing / Impersonation
- **Target**: `/users/victim_uid`
- **Method**: `SET` / `UPDATE`
- **Description**: An authenticated user with UID `attacker_uid` attempts to overwrite the profile of a victim with UID `victim_uid`.
- **Payload**:
  ```json
  {
    "id": "victim_uid",
    "name": "Vulnerable Parent",
    "email": "victim@disschool.ga",
    "role": "parent"
  }
  ```
- **Mitigation**: Check `match /users/{userId}` requires `request.auth.uid == userId`.

### Attack Vector 3: Self-Assigned Teacher Verification Badges
- **Target**: `/teachers/attacker_uid`
- **Method**: `UPDATE`
- **Description**: An unapproved teacher attempts to bypass manual ENS check and set their own status to `verified: true`.
- **Payload**:
  ```json
  {
    "verified": true,
    "savedWallet": 50000
  }
  ```
- **Mitigation**: `affectedKeys().hasOnly()` gates update. Only `coach_admin` accounts can write changes to the field `verified`.

### Attack Vector 4: Shadow Fields Injection / Ghost Field Attack
- **Target**: `/users/attacker_uid`
- **Method**: `CREATE`
- **Description**: Attacker tries to inject extra hidden credentials (e.g., `isAdmin: true` or `bypassed: true`) through schema-unlisted properties.
- **Payload**:
  ```json
  {
    "id": "attacker_uid",
    "name": "Attacker",
    "email": "attacker@gmail.com",
    "role": "élève",
    "isAdmin": true,
    "bypassCheck": "SuperSecretKey"
  }
  ```
- **Mitigation**: Exclude creation with payload sizes exceeding schema field counts or enforce explicit keys checking: `data.keys().hasAll(...) && data.keys().size() == N`.

### Attack Vector 5: Escrow Siphon Attack / Direct Payout Release
- **Target**: `/transactions/tx_to_steal`
- **Method**: `UPDATE`
- **Description**: A fraudulent teacher attempts to manually release funds held in Escrow directly to their own account.
- **Payload**:
  ```json
  {
    "status": "Released"
  }
  ```
- **Mitigation**: Validate that updates to the status field from `Escrow` to `Released` are strictly restricted to the parent (who booked it) or a validated `coach_admin`.

### Attack Vector 6: Transaction Mutability Alteration
- **Target**: `/transactions/tx_1`
- **Method**: `UPDATE`
- **Description**: Attacker attempts to change the amount and sender of an already established transaction.
- **Payload**:
  ```json
  {
    "amount": 999999,
    "parentId": "attacker_uid"
  }
  ```
- **Mitigation**: Validate that `amount` and `parentId` are immutable after creation: `incoming().amount == existing().amount && incoming().parentId == existing().parentId`.

### Attack Vector 7: Denial of Wallet Space Poisoning
- **Target**: `/users/attacker_uid`
- **Method**: `CREATE`
- **Description**: Injecting a 1MB massive payload or a huge custom ID string (`isValidId(...)` violation or huge string size) to inflate indexing storage.
- **Payload**:
  ```json
  {
    "id": "attacker_uid_with_extreme_long_garbage_character_padding_over_10kb...",
    "name": "Student A",
    "email": "student@gmail.com",
    "role": "élève",
    "phone": "a".repeat(10000)
  }
  ```
- **Mitigation**: Limit variable sizes: `phone.size() <= 32 && name.size() <= 128` and call `isValidId(userId)`.

### Attack Vector 8: Orphans Creation (Referential Check Failure)
- **Target**: `/lessons/lesson_orphan`
- **Method**: `CREATE`
- **Description**: Attacker assigns a home lesson to a non-existent student target or forged teacher profile ID.
- **Payload**:
  ```json
  {
    "id": "lesson_orphan",
    "title": "Algèbre linéaire",
    "type": "Devoir",
    "studentId": "non_existent_student",
    "teacherId": "forged_teacher_id",
    "status": "Assigné"
  }
  ```
- **Mitigation**: Rules during create check `exists(/databases/$(database)/documents/users/$(incoming().studentId))` to enforce relational sync.

### Attack Vector 9: Grade Tampering Attack
- **Target**: `/lessons/lesson_1`
- **Method**: `UPDATE`
- **Description**: Student attempts to override their homework grade score from 05/20 to 20/20.
- **Payload**:
  ```json
  {
    "aiScore": 20,
    "status": "Corrigé"
  }
  ```
- **Mitigation**: Score variables and feedback are immutable for standard student roles. Only AI-server/teacher has writes for evaluations (`affectedKeys().hasOnly(['studentAnswers', 'submissionText', 'status'])` for student actions).

### Attack Vector 10: Email Spoofing Trigger
- **Target**: Admin match blocks
- **Method**: `READ` / `WRITE`
- **Description**: An attacker signs up with an unverified email matching a system administrator (`admin@disschool.ga`) with `email_verified == false` to gain authorization.
- **Mitigation**: Require `request.auth.token.email_verified == true`.

### Attack Vector 11: Message Injection Hijack
- **Target**: `/messages/msg_forged`
- **Method**: `CREATE`
- **Description**: Attacker posts a chat message pretending to be an ENS Professor with a spoofed senderRole.
- **Payload**:
  ```json
  {
    "id": "msg_forged",
    "senderId": "attacker_uid",
    "senderName": "Pr. Forged Name",
    "senderRole": "teacher",
    "recipientId": "parent-1",
    "text": "Please send money directly to this number.",
    "createdAt": "2026-05-29T12:00:00Z"
  }
  ```
- **Mitigation**: Validation rules compare `incoming().senderId == request.auth.uid` and verify the sender's actual role from their registered user document.

### Attack Vector 12: Terminal State Shortcutting (Bypass Status Steps)
- **Target**: `/lessons/lesson_2`
- **Method**: `UPDATE`
- **Description**: A student marks an evaluation as completed/corrected (`status: 'Corrigé'`) skipping the intermediate submission or grading.
- **Payload**:
  ```json
  {
    "status": "Corrigé"
  }
  ```
- **Mitigation**: Strict status phase transitions enforced. If `existing().status == 'Corrigé'`, fail any subsequent update.

---

## 3. The Test Runner Spec (`firestore.rules.test.ts`)

A mock typescript test suite is declared to run these validation tests, affirming that every one of the "Dirty Dozen" payloads results in a `PERMISSION_DENIED` status.

```typescript
import { assertFails, assertSucceeds, initializeTestApp } from '@firebase/rules-unit-testing';

describe('DIS\'SCHOOL Gabon - Zero Trust Security Rules Tests', () => {
  it('should block Attack Vector 1 (Self-Role Escalation)', async () => {
    // ... test logic affirming rejection for role alterations ...
  });

  it('should block Attack Vector 2 (Profile Spoofing)', async () => {
    // ... test logic ...
  });
  
  // ... tests for vectors 1-12 ...
});
```
