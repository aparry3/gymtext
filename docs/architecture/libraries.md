# External Libraries

## Core Framework

| Library | Version | Purpose | Where Used |
|---------|---------|---------|------------|
| Next.js | 16.0.7 | Full-stack React framework (App Router) | apps/web, apps/admin |
| React | 19.0.0 | UI library | All apps |
| TypeScript | 5.x | Type safety | Everywhere |
| Tailwind CSS | 4.x | Utility-first styling | All apps |

## Database & ORM

| Library | Version | Purpose | Where Used |
|---------|---------|---------|------------|
| PostgreSQL (pg) | 8.14.1 | Database driver | packages/shared |
| Kysely | 0.28.0 | Type-safe SQL query builder | Repositories |
| kysely-codegen | 0.18.5 | Auto-generate types from DB schema | Build tooling |

## AI & LLM

| Library | Version | Purpose | Where Used |
|---------|---------|---------|------------|
| LangChain | 0.3.23 | LLM framework with tool calling | Agent system |
| @langchain/core | 1.1.3 | LangChain base utilities | Agent system |
| @langchain/openai | 0.6.13 | OpenAI integration for LangChain | Agent system |
| @langchain/google-genai | 0.2.4 | Google Gemini integration | Agent system |
| OpenAI | 4.95.1 | OpenAI API client | Agent system |
| @google/genai | 1.31.0 | Google Generative AI SDK | Agent system |
| @pinecone-database/pinecone | 5.1.1 | Vector database | Exercise search, memory |
| @dqbd/tiktoken | 1.0.21 | Token counting for LLMs | Agent utilities |

## External Services

| Library | Version | Purpose | Where Used |
|---------|---------|---------|------------|
| Twilio | 5.5.2 | SMS and WhatsApp messaging | Messaging system |
| Stripe | 14.9.0 | Payment processing | Subscriptions |
| inngest | 3.44.2 | Serverless workflow orchestration | Async tasks, scheduling |
| Redis | 5.6.0 | Caching and job queues | Various |
| @vercel/blob | 2.0.0 | Blob storage | Image uploads |

## Date & Time

| Library | Version | Purpose | Where Used |
|---------|---------|---------|------------|
| Luxon | 3.7.1 | Timezone-aware date handling | Primary date library |
| date-fns | 3.3.1 | Lightweight date utilities | Legacy/supplementary |

## Validation & Schema

| Library | Version | Purpose | Where Used |
|---------|---------|---------|------------|
| Zod | 3.25.67 | TypeScript-first schema validation | Tool schemas, API validation |
| zod-to-json-schema | 3.25.1 | Convert Zod → JSON Schema | Agent output schemas |

## File Handling

| Library | Version | Purpose | Where Used |
|---------|---------|---------|------------|
| pdfjs-dist | 4.10.38 | PDF parsing | Program import |
| unpdf | 1.4.0 | Unified PDF library | Program import |
| papaparse | 5.5.3 | CSV parsing | Data import |
| xlsx | 0.18.5 | Excel file handling | Data import |
| sharp | 0.34.3 | Image processing | Image uploads |

## UI Components

| Library | Version | Purpose | Where Used |
|---------|---------|---------|------------|
| Radix UI | various | Accessible UI primitives | Admin app |
| lucide-react | 0.331.0 | Icon library | All apps |
| react-hook-form | 7.50.0 | Form management | Admin app |
| @hookform/resolvers | 3.3.4 | Schema validation resolvers | Admin forms |
| react-markdown | 10.1.0 | Markdown rendering | Blog, chat |
| @stripe/react-stripe-js | 2.4.0 | Stripe React components | Checkout |
| clsx | 2.1.0 | Conditional CSS classes | All apps |

## Monorepo & Build

| Library | Version | Purpose | Where Used |
|---------|---------|---------|------------|
| pnpm | 9.15.0 | Package manager | Monorepo root |
| Turborepo | 2.3.3 | Monorepo build system | Build orchestration |
| ESLint | 9.x | Code linting | All packages |
| Vitest | latest | Unit testing | Test suite |

## Development & CLI

| Library | Version | Purpose | Where Used |
|---------|---------|---------|------------|
| tsx | 4.7.1 | Run TypeScript directly | Scripts |
| @faker-js/faker | 9.0.0 | Fake data generation | Test personas, anonymization |
| inquirer | 12.9.2 | Interactive CLI prompts | Migration scripts |
| Commander | 14.0.0 | CLI command parsing | Scripts |
| chalk | 5.4.1 | Terminal colors | Script output |
| UUID | 11.1.0 | UUID generation | Various |
