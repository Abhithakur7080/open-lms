# Phase 2: Database Setup

## 5. Database Setup: Prisma, Postgres, and Neon
We use Prisma ORM to interact with a serverless Postgres database hosted on Neon.

### Prerequisites
1. Create a Neon account and provision a new Postgres database.
2. Obtain the connection string (e.g., `postgresql://...`).

### Installation
Required packages for Neon and Prisma adapter support:
```bash
pnpm add @prisma/client @prisma/adapter-pg pg
pnpm add -D prisma @types/pg
```

### Configuration
Initialize Prisma in the project:
```bash
npx prisma init
```

Update your `.env` file with the database URL provided by Neon:
```env
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"
```

Next, define your user schemas inside `prisma/schema.prisma` and push them to the database:
```bash
npx prisma db push
```