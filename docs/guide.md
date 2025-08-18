# CI/CD Pipeline Setup Guide

Complete guide for setting up Continuous Integration/Continuous Deployment pipeline for the E-Governance Complaint Management System using GitHub Actions and Docker for Linux environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker Setup](#docker-setup)
3. [GitHub Actions Configuration](#github-actions-configuration)
4. [Environment Variables & Secrets](#environment-variables--secrets)
5. [Deployment Pipeline](#deployment-pipeline)
6. [Production Deployment](#production-deployment)
7. [Monitoring & Rollback](#monitoring--rollback)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **Node.js**: v18+ LTS
- **Docker**: v20.10+
- **Docker Compose**: v2.0+
- **Git**: v2.30+
- **Minimum RAM**: 2GB (4GB recommended)
- **Storage**: 10GB available space

### Service Accounts

- **GitHub Repository**: With Actions enabled
- **DockerHub Account**: For container registry
- **Production Server**: SSH access with sudo privileges
- **Domain/SSL**: Valid SSL certificate (Let's Encrypt recommended)

## Docker Setup

### Dockerfile

Create a production-ready Dockerfile in the project root:

```dockerfile
# Multi-stage build for optimal image size
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine as production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads && chown nextjs:nodejs uploads

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

### Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./data/prod.db
      - JWT_SECRET=${JWT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
    volumes:
      - app_data:/app/data
      - uploads_data:/app/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  app_data:
  uploads_data:
```

### Docker Compose (Production)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    image: your-dockerhub/complaint-system:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - FRONTEND_URL=${FRONTEND_URL}
    volumes:
      - /opt/complaint-system/uploads:/app/uploads
      - /opt/complaint-system/data:/app/data
    restart: always
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/www/html:/var/www/html
    depends_on:
      - app
    restart: always

volumes:
  data:
  uploads:
```

## GitHub Actions Configuration

### Main CI/CD Workflow

Create `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: docker.io
  IMAGE_NAME: your-dockerhub/complaint-system

jobs:
  # Test Stage
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type checking
        run: npm run typecheck

      - name: Run unit tests
        run: npm run test:unit

      - name: Run build test
        run: npm run build

      - name: Archive test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results
          path: coverage/

  # Security Scan
  security:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

  # Build and Push Docker Image
  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Deploy to Staging
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging

    steps:
      - name: Deploy to staging server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/complaint-system-staging
            docker-compose pull
            docker-compose up -d
            docker system prune -f

  # Deploy to Production
  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to production server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /opt/complaint-system
            
            # Backup current version
            docker tag your-dockerhub/complaint-system:latest your-dockerhub/complaint-system:backup-$(date +%Y%m%d_%H%M%S)
            
            # Pull latest image
            docker-compose -f docker-compose.prod.yml pull
            
            # Run database migrations
            docker-compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy
            
            # Deploy with zero downtime
            docker-compose -f docker-compose.prod.yml up -d
            
            # Health check
            sleep 30
            curl -f http://localhost:3000/api/health || exit 1
            
            # Cleanup old images
            docker image prune -f

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        if: always()
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### E2E Testing Workflow

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: complaint_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup database
        run: |
          npm run db:generate
          npm run db:push
          npm run db:seed
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/complaint_test

      - name: Start application
        run: |
          npm run build
          npm start &
          sleep 10
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/complaint_test
          JWT_SECRET: test-secret

      - name: Run Cypress tests
        uses: cypress-io/github-action@v6
        with:
          wait-on: 'http://localhost:3000'
          wait-on-timeout: 120
          browser: chrome
          record: true
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots

      - name: Upload test videos
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: cypress-videos
          path: cypress/videos
```

## Environment Variables & Secrets

### GitHub Secrets Setup

Configure these secrets in your GitHub repository:

#### Docker Registry Secrets
- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Docker Hub access token

#### Server SSH Secrets
- `PRODUCTION_HOST`: Production server IP/domain
- `PRODUCTION_USER`: SSH username for production
- `PRODUCTION_SSH_KEY`: Private SSH key for production
- `STAGING_HOST`: Staging server IP/domain
- `STAGING_USER`: SSH username for staging
- `STAGING_SSH_KEY`: Private SSH key for staging

#### Application Secrets
- `JWT_SECRET`: JWT signing secret (production)
- `DATABASE_URL`: Production database connection string
- `SMTP_HOST`: Email server host
- `SMTP_USER`: Email username
- `SMTP_PASS`: Email password

#### Monitoring & Notification
- `SLACK_WEBHOOK`: Slack webhook for deployment notifications
- `CYPRESS_RECORD_KEY`: Cypress dashboard recording key

### Environment Files

Create environment files for different stages:

#### `.env.production`
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/complaint_prod
JWT_SECRET=your-super-secret-production-key
CORS_ORIGIN=https://your-domain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@your-domain.com
SMTP_PASS=your-email-password
FRONTEND_URL=https://your-domain.com
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

#### `.env.staging`
```bash
NODE_ENV=staging
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/complaint_staging
JWT_SECRET=staging-secret-key
CORS_ORIGIN=https://staging.your-domain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=staging@your-domain.com
SMTP_PASS=staging-email-password
FRONTEND_URL=https://staging.your-domain.com
```

## Deployment Pipeline

### Pipeline Stages

1. **Code Quality Checks**
   - TypeScript compilation
   - Linting and formatting
   - Unit tests
   - Security scanning

2. **Build & Test**
   - Docker image build
   - Integration tests
   - E2E tests (optional)

3. **Staging Deployment**
   - Deploy to staging environment
   - Smoke tests
   - Performance tests

4. **Production Deployment**
   - Blue-green deployment
   - Database migrations
   - Health checks
   - Rollback capability

### Deployment Strategy

#### Blue-Green Deployment

```bash
#!/bin/bash
# deploy.sh - Blue-green deployment script

set -e

CURRENT_COLOR=$(docker ps --format "table {{.Names}}" | grep complaint-system | head -1 | cut -d'-' -f3)
NEW_COLOR="blue"

if [ "$CURRENT_COLOR" = "blue" ]; then
    NEW_COLOR="green"
fi

echo "Current deployment: $CURRENT_COLOR"
echo "New deployment: $NEW_COLOR"

# Pull latest image
docker pull your-dockerhub/complaint-system:latest

# Start new deployment
docker-compose -f docker-compose.$NEW_COLOR.yml up -d

# Wait for health check
echo "Waiting for health check..."
for i in {1..30}; do
    if curl -f http://localhost:300$([[ $NEW_COLOR == "blue" ]] && echo "1" || echo "2")/api/health; then
        echo "Health check passed"
        break
    fi
    sleep 10
done

# Switch traffic (update load balancer)
echo "Switching traffic to $NEW_COLOR"
cp nginx.$NEW_COLOR.conf /etc/nginx/nginx.conf
nginx -s reload

# Stop old deployment
if [ ! -z "$CURRENT_COLOR" ]; then
    docker-compose -f docker-compose.$CURRENT_COLOR.yml down
fi

echo "Deployment completed successfully"
```

## Production Deployment

### Server Setup

#### 1. Initial Server Configuration

```bash
#!/bin/bash
# server-setup.sh

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx -y

# Setup UFW firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create application directory
sudo mkdir -p /opt/complaint-system
sudo chown $USER:$USER /opt/complaint-system

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

#### 2. Nginx Configuration

```nginx
# /etc/nginx/sites-available/complaint-system
upstream app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Main application
    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # File uploads
    client_max_body_size 10M;

    # Static files caching
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://app;
    }

    # Health check
    location /health {
        access_log off;
        proxy_pass http://app/api/health;
    }
}
```

### Database Setup

#### PostgreSQL Production Setup

```bash
#!/bin/bash
# postgres-setup.sh

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE complaint_production;
CREATE USER complaint_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE complaint_production TO complaint_user;
ALTER USER complaint_user CREATEDB;
\q
EOF

# Configure PostgreSQL
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf
sudo systemctl restart postgresql

# Run migrations
cd /opt/complaint-system
npx prisma migrate deploy
```

## Monitoring & Rollback

### Health Monitoring

#### Health Check Endpoint
```javascript
// server/routes/health.js
const express = require('express');
const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check file system
    const fs = require('fs');
    fs.accessSync('./uploads', fs.constants.W_OK);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version,
      environment: process.env.NODE_ENV,
      database: 'connected',
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;
```

#### Monitoring Script

```bash
#!/bin/bash
# monitor.sh - Basic monitoring script

HEALTH_URL="https://your-domain.com/api/health"
SLACK_WEBHOOK="your-slack-webhook-url"

check_health() {
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
    
    if [ $HTTP_CODE -eq 200 ]; then
        echo "✅ Application is healthy"
        return 0
    else
        echo "❌ Application is unhealthy (HTTP $HTTP_CODE)"
        
        # Send Slack notification
        curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"🚨 Complaint System is down! HTTP Code: '$HTTP_CODE'"}' \
            $SLACK_WEBHOOK
        
        return 1
    fi
}

# Run health check
check_health
```

### Rollback Procedures

#### Automatic Rollback Script

```bash
#!/bin/bash
# rollback.sh

set -e

BACKUP_TAG=${1:-"backup-$(date +%Y%m%d_%H%M%S)"}

echo "Rolling back to: $BACKUP_TAG"

# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Restore from backup
docker tag your-dockerhub/complaint-system:$BACKUP_TAG your-dockerhub/complaint-system:latest

# Start with backup version
docker-compose -f docker-compose.prod.yml up -d

# Wait for health check
sleep 30
if curl -f http://localhost:3000/api/health; then
    echo "✅ Rollback successful"
else
    echo "❌ Rollback failed"
    exit 1
fi
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs
docker logs complaint-system-app

# Rebuild without cache
docker build --no-cache -t your-dockerhub/complaint-system:latest .

# Check disk space
df -h
```

#### 2. Database Connection Issues
```bash
# Check database status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U complaint_user -d complaint_production -c "SELECT 1;"

# Check connection string
echo $DATABASE_URL
```

#### 3. Performance Issues
```bash
# Monitor resources
docker stats

# Check application logs
docker logs -f complaint-system-app

# Monitor disk I/O
iostat -x 1
```

#### 4. SSL Certificate Issues
```bash
# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout | grep "Not After"

# Renew certificate
sudo certbot renew --dry-run
```

### Logging Configuration

#### Application Logging
```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'complaint-system' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

#### Log Rotation
```bash
# /etc/logrotate.d/complaint-system
/opt/complaint-system/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 node node
    postrotate
        docker kill -s USR1 complaint-system-app || true
    endscript
}
```

This comprehensive CI/CD guide provides everything needed to set up automated deployment pipelines for the complaint management system with proper testing, monitoring, and rollback capabilities.
