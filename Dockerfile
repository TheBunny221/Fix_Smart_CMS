# Multi-stage build Dockerfile for E-Governance Complaint Management System
# This Dockerfile builds both frontend and backend in a single container

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy frontend source code
COPY client/ ./client/
COPY shared/ ./shared/
COPY public/ ./public/
COPY *.config.* ./
COPY *.json ./

# Build frontend for production
RUN npm run build:client

# Stage 2: Backend dependencies and build
FROM node:18-alpine AS backend-builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy backend source code
COPY server/ ./server/
COPY shared/ ./shared/
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Stage 3: Production image
FROM node:18-alpine AS production

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    sqlite \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Set working directory
WORKDIR /app

# Copy production dependencies from backend-builder
COPY --from=backend-builder --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=backend-builder --chown=nodeuser:nodejs /app/package*.json ./

# Copy backend application
COPY --from=backend-builder --chown=nodeuser:nodejs /app/server ./server
COPY --from=backend-builder --chown=nodeuser:nodejs /app/shared ./shared
COPY --from=backend-builder --chown=nodeuser:nodejs /app/prisma ./prisma

# Copy built frontend from frontend-builder
COPY --from=frontend-builder --chown=nodeuser:nodejs /app/dist ./dist

# Create necessary directories with proper permissions
RUN mkdir -p /app/uploads /app/logs /app/data && \
    chown -R nodeuser:nodejs /app/uploads /app/logs /app/data

# Create database directory for SQLite
RUN mkdir -p /app/data && chown nodeuser:nodejs /app/data

# Copy startup script
COPY --chown=nodeuser:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_URL="file:/app/data/prod.db" \
    UPLOAD_PATH="/app/uploads" \
    LOG_PATH="/app/logs"

# Create .env file with default values (will be overridden by docker-compose)
RUN echo "NODE_ENV=production" > .env && \
    echo "PORT=3000" >> .env && \
    echo "DATABASE_URL=file:/app/data/prod.db" >> .env && \
    chown nodeuser:nodejs .env

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Switch to non-root user
USER nodeuser

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["./docker-entrypoint.sh"]
