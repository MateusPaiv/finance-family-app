# Deployment Guide - Family Finance Hub

Guide to deploy the Family Finance Hub on your Umbrel server (or any Docker-capable machine).

---

## Prerequisites

- Docker and Docker Compose installed
- Git installed
- At least 1 GB of free RAM
- Port 3000 available (frontend) and 3001 (backend API)

---

## 1. Clone the Repository

```bash
ssh umbrel@umbrel.local
cd ~
git clone git@github.com:MateusPaiv/finance-family-app.git
cd finance-family-app
```

---

## 2. Configure Environment Variables

### Generate a secure JWT secret

```bash
openssl rand -base64 32
```

### Create a `.env` file in the project root

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# JWT - REQUIRED: replace with the output from openssl command above
JWT_SECRET=your-generated-secret-here

# PostgreSQL credentials (change for production)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=a-strong-password-here
POSTGRES_DB=family_finance

# CORS - set to your server's address
# Use your Umbrel's local IP or hostname
CORS_ORIGIN=http://umbrel.local:3000
```

> **Note:** The frontend uses nginx to proxy API requests to the backend internally, so no separate `VITE_API_URL` is needed in production.

---

## 3. Build and Start

```bash
docker compose up -d --build
```

This will:
1. Start PostgreSQL and wait until it's healthy
2. Build the backend, run database migrations (`prisma migrate deploy`), and start the API
3. Build the frontend and serve it via nginx

### Check that all services are running

```bash
docker compose ps
```

You should see three containers running:
- `finance-postgres` (healthy)
- `finance-backend` (running)
- `finance-frontend` (healthy)

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

---

## 4. Access the App

Open your browser and navigate to:

```
http://umbrel.local:3000
```

Or use your server's local IP:

```
http://192.168.x.x:3000
```

Register your first user account and start tracking expenses.

---

## 5. Useful Commands

### Stop all services

```bash
docker compose down
```

### Restart services

```bash
docker compose restart
```

### Rebuild after code changes

```bash
git pull
docker compose up -d --build
```

### Reset database (destroys all data)

```bash
docker compose down -v
docker compose up -d --build
```

### Access the database directly

```bash
docker compose exec postgres psql -U postgres -d family_finance
```

### Run Prisma Studio (database GUI)

```bash
docker compose exec backend npx prisma studio
```

---

## 6. Updating

To update to the latest version:

```bash
cd ~/finance-family-app
git pull origin main
docker compose up -d --build
```

Migrations run automatically on startup via `prisma migrate deploy`.

---

## 7. Backup

### Database backup

```bash
docker compose exec postgres pg_dump -U postgres family_finance > backup_$(date +%Y%m%d).sql
```

### Restore from backup

```bash
cat backup_20260209.sql | docker compose exec -T postgres psql -U postgres family_finance
```

### Receipt uploads

Receipts are stored in `./backend/uploads/`. Back up this directory:

```bash
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz ./backend/uploads
```

---

## 8. Troubleshooting

### Backend won't start

Check logs:
```bash
docker compose logs backend
```

Common causes:
- PostgreSQL not ready yet (the healthcheck should handle this)
- Invalid `JWT_SECRET` or `DATABASE_URL`
- Migration errors (check if schema matches)

### Frontend shows blank page

```bash
docker compose logs frontend
```

Ensure nginx is proxying correctly to the backend. The frontend container must be on the same Docker network as the backend.

### CORS errors in browser

Update `CORS_ORIGIN` in your `.env` to match the URL you're accessing the app from:
```env
CORS_ORIGIN=http://192.168.1.100:3000
```

Then restart:
```bash
docker compose up -d
```

### Database connection refused

```bash
docker compose ps postgres
docker compose logs postgres
```

Ensure the postgres container is healthy and the credentials match.
