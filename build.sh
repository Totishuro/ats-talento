#!/bin/bash
# Build script for Vercel
echo "Running Prisma generate..."
npx prisma generate

echo "Running Next.js build..."
npx next build
