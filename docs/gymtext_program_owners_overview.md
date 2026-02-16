# GymText Program Owners --- Comprehensive Overview

## 1. Core Reframe: What GymText Becomes

GymText evolves from:

> *"An AI that texts you workouts"*

into:

> **A coaching delivery platform that distributes structured fitness
> programs via SMS, on behalf of program owners.**

The key shift: - GymText is no longer the only "author" - GymText
becomes **infrastructure** - Coaches, trainers, and influencers become
**program owners**

------------------------------------------------------------------------

## 2. The Unifying Abstraction: Programs

Everything revolves around a single concept:

> **Program = content + policies + delivery runtime**

There are **no separate systems** for AI programs, coach programs,
trainer programs, or influencer programs. They all become **Programs**
with different configuration.

------------------------------------------------------------------------

## 3. Program Owners (Who They Are)

A **Program Owner** is any entity that controls a program.

Examples: - Strength & conditioning coach (team-based) - Personal
trainer (1:many) - Influencer (1:many at scale) - Gym / school /
organization (future)

Ownership is **metadata + permissions**, not a different product.

------------------------------------------------------------------------

## 4. Program Creation: Two Entry Points, One Pipeline

### Entry Point A: AI-Generated Programs

GymText generates long-form plan text, weekly structure, and daily
workouts.

### Entry Point B: Owner-Uploaded Programs

Owners upload anything: text, PDF, Google Docs, CSV, or existing program
materials.

Owner-uploaded programs are **translated**, not regenerated.

------------------------------------------------------------------------

## 5. Canonical Program Pipeline

Every program converges into the same lifecycle: 1. Canonical long-form
program text 2. Structured JSON representations 3. Delivery artifacts
(SMS)

------------------------------------------------------------------------

## 6. Owner Upload Translation Flow

1.  Extract raw text
2.  Normalize to canonical GymText format
3.  Resolve references
4.  Validate completeness
5.  Surface assumptions
6.  Owner review and approval

------------------------------------------------------------------------

## 7. Program Versioning

Programs are immutable once users are enrolled. Any edits create a new
version.

------------------------------------------------------------------------

## 8. Scheduling Modes

-   **Rolling Start** -- users start from Day 1
-   **Cohort Schedule** -- all users receive the same workout on the
    same day

------------------------------------------------------------------------

## 9. Cadence Control

-   calendar_days
-   training_days_only

------------------------------------------------------------------------

## 10. Late Joiners

Cohort programs define whether late joiners start at the current day or
Day 1.

------------------------------------------------------------------------

## 11. Program Owner Dashboard

-   Program overview
-   Program content
-   Members
-   Messaging

------------------------------------------------------------------------

## 12. Messaging Architecture

AI is the first responder. Owners supervise.

------------------------------------------------------------------------

## 13. Billing Models

-   Owner pays (teams)
-   Users pay with revenue split (trainers/influencers)

------------------------------------------------------------------------

## 14. Program Templates

Coach, Trainer, and Influencer are presets, not rules.

------------------------------------------------------------------------

## 15. Role of AI

AI handles explanation, adaptation, substitutions, and feedback
interpretation.

------------------------------------------------------------------------

## 16. Explicit Non-Goals (Initial)

-   No retroactive edits
-   No complex permissions
-   No full training software

------------------------------------------------------------------------

## 17. Implementation Phases

Phase 1: Program ownership + AI programs\
Phase 2: Owner uploads + translation\
Phase 3: Monetization + scale\
Phase 4: Power features

------------------------------------------------------------------------

## 18. Big Picture

GymText becomes the **Twilio + Stripe layer for fitness coaching**.

------------------------------------------------------------------------

## 19. Summary

GymText Program Owners allow coaches, trainers, and influencers to
upload or create programs in any format and distribute daily workouts
via SMS using a unified, scalable runtime.
