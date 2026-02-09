# 🐳 Docker Deployment Guide

Complete guide to deploy Family Finance Hub using Docker Compose.

---

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- At least 2GB free disk space

---

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd finance-family-app
```

### 2. Set environment variables

Create a `.env` file in the root directory (optional):

```bash
# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET" > .env
```

### 3. Build and start all services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Backend API (port 3001)
- Frontend web app (port 3000)

### 4. Access the application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3000/health

---

## Services

### PostgreSQL Database

- **Image**: postgres:16-alpine
- **Port**: 5432
- **Database**: family_finance
- **Credentials**: postgres/postgres (change in production!)
- **Volume**: postgres_data (persistent storage)

### Backend API

- **Build**: ./backend
- **Port**: 3001
- **Environment**:
  - `DATABASE_URL`: Connection string to PostgreSQL
  - `JWT_SECRET`: Secret for JWT token signing
  - `NODE_ENV`: production
  - `CORS_ORIGIN`: http://localhost:3000
- **Volume**: ./backend/uploads (receipt storage)
- **Depends on**: postgres

### Frontend Web App

- **Build**: ./frontend
- **Port**: 3000 (host) → 80 (container)
- **Environment**:
  - `VITE_API_URL`: http://localhost:3001
- **Nginx**: Serves static files and proxies /api to backend
- **Depends on**: backend

---

## Commands

### Start services

```bash
# Start in detached mode
docker-compose up -d

# Start with logs
docker-compose up
```

### Stop services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes all data)
docker-compose down -v
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Rebuild services

```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build frontend
docker-compose build backend

# Rebuild and restart
docker-compose up -d --build
```

### Execute commands in containers

```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh

# PostgreSQL shell
docker-compose exec postgres psql -U postgres -d family_finance
```

### Database operations

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Open Prisma Studio (database GUI)
docker-compose exec backend npx prisma studio

# Reset database (⚠️ deletes all data)
docker-compose exec backend npx prisma migrate reset
```

---

## Production Deployment

### Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Generate strong JWT_SECRET (use `openssl rand -base64 32`)
- [ ] Use environment variables (don't commit secrets)
- [ ] Enable HTTPS with reverse proxy (nginx/Caddy)
- [ ] Set up firewall rules
- [ ] Configure backups for postgres_data volume
- [ ] Set resource limits in docker-compose.yml
- [ ] Review and update CORS_ORIGIN

### Recommended `.env` for Production

```bash
# Database
POSTGRES_USER=financeuser
POSTGRES_PASSWORD=<generate-strong-password>
POSTGRES_DB=family_finance

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=<your-generated-secret>

# Node Environment
NODE_ENV=production

# API Configuration
PORT=3001
CORS_ORIGIN=https://yourdomain.com
MAX_FILE_SIZE=5242880
```

### Reverse Proxy (Nginx/Caddy)

For production, add a reverse proxy in front:

**Example Caddy configuration:**

```caddy
yourdomain.com {
    reverse_proxy localhost:3000
}

api.yourdomain.com {
    reverse_proxy localhost:3001
}
```

**Example Nginx configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Troubleshooting

### Container won't start

```bash
# Check container logs
docker-compose logs <service-name>

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart <service-name>
```

### Database connection issues

```bash
# Verify postgres is healthy
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec backend npx prisma db push
```

### Frontend can't reach backend

1. Check backend is running: `docker-compose ps backend`
2. Verify nginx config: `docker-compose exec frontend cat /etc/nginx/conf.d/default.conf`
3. Check network: `docker network inspect finance-family-app_finance-network`

### Port already in use

```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Stop conflicting service or change port in docker-compose.yml
```

---

## Backup & Restore

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres family_finance > backup.sql

# With timestamp
docker-compose exec postgres pg_dump -U postgres family_finance > backup-$(date +%Y%m%d-%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T postgres psql -U postgres family_finance < backup.sql
```

### Backup Uploads

```bash
# Create backup of receipts
tar -czf uploads-backup-$(date +%Y%m%d-%H%M%S).tar.gz backend/uploads/
```

---

## Monitoring

### Health Checks

- Frontend: http://localhost:3000/health
- Backend: http://localhost:3001/health (if implemented)
- Database: `docker-compose exec postgres pg_isready`

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Volume size
docker volume inspect finance-family-app_postgres_data
```

---

## Cleanup

### Remove unused images

```bash
docker image prune -a
```

### Remove all data (⚠️ WARNING: Deletes everything)

```bash
docker-compose down -v --rmi all
```

---

## Development vs Production

### Development

- Use `docker-compose.yml` as-is
- Access on http://localhost:3000
- Hot reload not supported (would need volume mounts)

### Production

- Set environment variables via `.env` file
- Use reverse proxy for HTTPS
- Regular backups of postgres_data volume
- Monitor resource usage
- Set up log rotation

---

## Support

For issues and questions:
- Check logs: `docker-compose logs`
- Review CLAUDE.md for project structure
- Check GitHub issues

---

**Built with Claude Code** 🚀
