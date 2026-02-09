#!/bin/bash

echo "🔧 Fixing failed migration..."

# Start postgres if not running
docker-compose up -d postgres

# Wait for postgres to be ready
echo "⏳ Waiting for PostgreSQL..."
sleep 5

# Remove failed migration record
echo "🗑️  Removing failed migration record..."
docker-compose exec -T postgres psql -U postgres -d family_finance -c "DELETE FROM _prisma_migrations WHERE migration_name LIKE '%add_income%';" 2>/dev/null || echo "Migration table might not exist yet"

# Apply all migrations
echo "📦 Applying migrations..."
docker-compose up --build backend

echo "✅ Done!"
