# FounderWeb Backend

This backend is a Supabase-backed API service that preserves the existing FounderWeb application flow while separating server-side data and auth responsibilities from the Next.js frontend.

## Stack

- Node.js + Express
- TypeScript
- Supabase JavaScript client
- Environment-driven runtime config

## Local setup

1. Copy `.env.example` to a local `.env` file.
2. Add your Supabase project URL and service role key. The service role key must remain server-side and must never use a `NEXT_PUBLIC_` variable.
3. In the Supabase SQL Editor, run every migration in `supabase/migrations` in filename order.
4. Register the EDC account, copy its user UUID from Supabase Authentication, and set `EDC_USER_IDS` in the backend `.env` file. Separate multiple UUIDs with commas.
5. Start the server:

```bash
npm install
npm run dev
```

The server runs on port 4000 by default.

## API endpoints

- `GET /api/health`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/requirements`
- `GET /api/requirements/:id`
- `POST /api/requirements`
- `POST /api/requirements/:id/approve`
- `POST /api/requirements/:id/reject`
- `GET /api/startups`
- `GET /api/startups/:id`
- `GET /api/applications`
- `POST /api/applications`
- `PATCH /api/applications/:id/status`
- `POST /api/applications/:id/resume-upload`
- `PATCH /api/applications/:id/resume`
- `GET /api/applications/:id/resume-url`

## Notes

- Requirement creation and application endpoints require a valid Supabase access token. Resume files are kept in the private `application-files` bucket; the API only issues short-lived upload and download links after checking ownership.
- Student, founder, and EDC profile records are created by a database trigger at signup and read or updated through the authenticated profile endpoints. EDC approval and rejection are limited to user IDs configured in `EDC_USER_IDS`.
- The tables must use the snake_case columns referenced by the backend, including `requirement_id`, `founder_email`, and `applicant_email`. The migration adds the founder/applicant identity columns and `resume_path`.
- If Supabase env vars are not configured yet, the backend falls back to the existing seeded startup/requirement data so the app keeps working during migration.
- This keeps the current FounderWeb behavior intact while creating a clean server-side boundary for future Supabase table-backed persistence.
