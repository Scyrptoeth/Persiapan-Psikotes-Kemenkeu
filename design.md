# Design

## Problem
Build a focused learning website for Kementerian Keuangan psychotest preparation, starting with fast arithmetic drills that can be attempted repeatedly and scored historically per user.

## Chosen Approach
- Next.js App Router with TypeScript for UI, protected routes, and server-side scoring.
- Supabase Auth password flow and Supabase Postgres for profiles, attempts, superadmin operations, and single-active-session enforcement. The UI remains Nomor WhatsApp + Password; internally the app maps each phone number to a synthetic auth email because Supabase Phone logins require provider enablement.
- Deterministic arithmetic package generator for 2,000 stable questions without storing a large static fixture.
- Hand-drawn rough wireframe UI inspired by the provided video reference.

## Key Decisions
- No public signup; superadmin creates users.
- Users can change password only, not phone number.
- Superadmin can reset attempts; users cannot reset their own history.
- Package `Mix` is balanced across operations.
- Decimal answers use up to two decimal places.
- Disclaimer is shown in app chrome and login.

## Out Of Scope
- Verbal and Sikap modules.
- OTP/WhatsApp verification.
- Custom domain setup.
- External analytics.
