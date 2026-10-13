# CAB432 A3 — Stage 1 (local container smoke test)

This is an incremental copy of the IFN666 project. No football business rules, web pages,
or player data have been changed. The mobile app is not part of the A3 work.

## Changes in this copy

- `server/server.js`: `GET /health` (liveness), `GET /ready` (MongoDB readiness),
  required environment variable checks, and non-zero exit on startup DB errors.
- `server/Dockerfile`: deployable Node.js 20 container (Debian base because bcrypt is native).
- `server/.dockerignore`: excludes secrets and unnecessary files from the image.
- `compose.yaml`: **local-only** Express API + MongoDB test stack; MongoDB is not published
  outside Docker, and data is stored in a named Docker volume.
- `.env.example`: template for Compose secret; never commit a real `.env`.
- `server/.env.example`: template if running the server directly without Compose.

## Local test on Windows (PowerShell)

1. Install/start Docker Desktop and make sure it is running (Linux containers).
2. Unzip project, open PowerShell in the folder containing `compose.yaml`.
3. Create the root `.env` file from template:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Generate a random JWT secret:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Paste the result into the root `.env` file in place of the sample value.
5. Build and start:

   ```powershell
   docker compose up --build -d
   docker compose ps
   ```

6. Verify API and DB readiness:

   ```powershell
   Invoke-RestMethod http://localhost:3000/health
   Invoke-RestMethod http://localhost:3000/ready
   Invoke-RestMethod http://localhost:3000/
   ```

   `/health` should return `status=ok`, `/ready` should return `status=ready`,
   and `/` should return the original API welcome message.
7. If something fails:

   ```powershell
   docker compose logs --tail=80 api
   docker compose logs --tail=80 mongo
   ```

8. Stop without deleting local data:

   ```powershell
   docker compose down
   ```

   `docker compose down -v` **deletes the test MongoDB data**. Only run it if intended.

## Web UI (optional for this stage)

In a separate PowerShell terminal:

```powershell
cd client
npm ci
$env:VITE_API_BASE_URL="http://localhost:3000/api"
npm run dev
```

The existing API uses permissive CORS in local development. Do **not** publicly deploy
this code as-is: GET endpoints may expose personal data, and the registration endpoint
currently accepts a client-provided role. We should address those before public access.

## Before deploying to AWS

- Decide production database hosting, secrets storage, and ALB health strategy.
- Add authentication/authorization controls before making personal data public.
- Add `branchId` and season assignment flows only after the container smoke test passes.
- Configure AWS resource tags and region according to CAB432 A3.

## Verification performed in this environment

JavaScript syntax and Compose YAML structure can be checked, but Docker Engine and a
MongoDB service are not available here, so a live container smoke test must be performed
on your computer.
