#!/bin/bash

# Replace YOUR_PASSWORD_HERE with your actual Supabase password
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD_HERE@db.kjnckpznqcugdwhsre.supabase.co:5432/postgres"

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Seeding database with initial user..."
npx prisma db seed

echo "Done! Your database is ready."
