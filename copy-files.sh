#!/bin/bash

# Create directories if they don't exist
mkdir -p public
mkdir -p src
mkdir -p tmp

# Copy files
cp -R ../visaai/public/* ./public/
cp -R ../visaai/src/* ./src/
cp ../visaai/.cursorignore .
cp ../visaai/.env .
cp ../visaai/.env.local .
cp ../visaai/.eslintrc.json .
cp ../visaai/.gitignore .
cp ../visaai/BUGFIX.md .
cp ../visaai/next-env.d.ts .
cp ../visaai/package-lock.json .
cp ../visaai/package.json .
cp ../visaai/postcss.config.js .
cp ../visaai/README.md .
cp ../visaai/supabase-setup.sql .
cp ../visaai/tailwind.config.js .
cp ../visaai/TASKMANAGEMENT.md .
cp ../visaai/tsconfig.json .
cp ../visaai/vercel.json .

# Note: Not copying the following as they're in .gitignore
# - .next directory
# - .vercel directory
# - node_modules directory
# - *.traineddata files
# - tmp directory contents 