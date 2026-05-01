# Next-React-S3-Console

A Clerk-authenticated Next.js app to connect to AWS S3 and manage files/folders from a web UI, with storage analytics and optional AI file summaries.

## Features

- AWS S3 file manager:
  - connect and test bucket access
  - browse folders/files with pagination
  - upload, download, delete, move files
  - create, rename, delete folders
  - bulk operations (download ZIP, delete, move)
- Search files and paths inside a bucket prefix
- Analytics dashboard:
  - total files/folders/size
  - file-type and storage-class distribution
  - recent activity windows
  - cost estimates and optimization hints
  - report export (JSON/CSV)
- AI file summaries (Groq) for supported text/code-like files
- Clerk authentication for app pages and most API routes

## Requirements

- Node.js 18+
- npm 8+
- AWS account with S3 access
- Clerk keys (authentication)
- Groq API key (only if using AI summaries)

## Environment Variables

Create `.env.local` and configure:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
GROQ_API_KEY=your_groq_api_key
```

Notes:
- `GROQ_API_KEY` is required only for AI summary endpoints.
- Additional Clerk URL variables may be used for production auth redirects:
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
  - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
  - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Add required values to `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
GROQ_API_KEY=your_groq_api_key
```

4. Start development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## AWS Permissions (Minimum)

Ensure the IAM user/role has access to:
- `s3:ListBucket`
- `s3:GetObject`
- `s3:PutObject`
- `s3:DeleteObject`

for your target bucket and its objects.

## Scripts

- `npm run dev` - Run development server
- `npm run build` - Build production app
- `npm run start` - Start production server
- `npm run lint` - Run lint checks
- `npm run lint:fix` - Auto-fix lint issues
- `npm run clean` - Remove build artifacts
- `npm run analyze` - Build with analyzer flag

Note: `npm run clean` uses `rm -rf` and may require a Unix-like shell on Windows.

## API Overview

All routes are under `src/app/api`.

### Health and Utility
- `GET /api/health-check` - app runtime health snapshot
- `GET /api/aws/regions` - list AWS regions for selector UI

### S3 Operations
- `POST /api/s3/test-connection` - validate credentials + bucket access
- `POST /api/s3/list-objects` - list files/folders for a prefix
- `POST /api/s3/search-files` - search keys by query text
- `POST /api/s3/upload` - upload file to bucket
- `POST /api/s3/download-url` - generate presigned download URL
- `POST /api/s3/delete-file` - delete one object
- `POST /api/s3/create-folder` - create folder marker key
- `POST /api/s3/delete-folder` - delete all keys under prefix
- `POST /api/s3/rename-folder` - copy keys to new prefix and remove old
- `POST /api/s3/move-file` - move key via copy+delete
- `POST /api/s3/list-all-folders` - recursive folder listing
- `POST /api/s3/bulk-download` - stream selected files as ZIP
- `POST /api/s3/summarize-file` - AI summary for supported file types

### Analytics
- `POST /api/analytics/storage` - storage analytics snapshot
- `POST /api/analytics/activity` - track action or fetch activity analytics
- `POST /api/analytics/optimizations` - optimization recommendations
- `POST /api/analytics/reports` - generate/export report

### Internal Test Routes
- `POST /api/analytics/test`
- `POST /api/analytics/test-fix`
- `POST /api/analytics/test-storage`

## Auth and Access

- Clerk provides authentication (`sign-in`, `sign-up`, protected pages).
- `/dashboard` and `/analytics` are guarded by `ProtectedRoute`.
- Most API routes use `protectApiRoute` and return `401` when unauthenticated.
- Home page (`/`) redirects authenticated users to `/dashboard`.

## Project Structure

```text
src/
  app/            # Next.js App Router pages + API routes
  components/     # UI components and dialogs
  hooks/          # Client hooks for S3, analytics, and UI state
  lib/            # Shared logic (auth, analytics, S3, storage, summarizer)
scripts/          # Local API/performance test scripts
```

## Operational Notes

- AWS credentials are sent to backend API routes in request bodies to perform S3 operations.
- Stored AWS config is kept in browser localStorage (base64-encoded JSON).
- AI summaries enforce size/type limits (for example, large files are rejected/truncated).
- Some folder operations can be expensive on very large prefixes due to iterative copy/delete/list patterns.
