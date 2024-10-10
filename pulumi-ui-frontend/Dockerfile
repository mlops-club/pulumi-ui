FROM --platform=linux/amd64 node:22-bookworm-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json, pnpm-lock.yaml, and vite.config.ts
COPY package.json pnpm-lock.yaml vite.config.ts ./

# Install dependencies using the lockfile
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm run build

# The built static files will be in /app/dist
