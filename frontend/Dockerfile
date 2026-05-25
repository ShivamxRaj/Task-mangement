# frontend/Dockerfile
# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy configuration and source files
COPY . .

# Set environment variables for build (disable telemetry and build-time env)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compile application
RUN npm run build

# Stage 2: Runner stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set runner environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Copy compiled resources and dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "run", "start"]
