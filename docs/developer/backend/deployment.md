# Backend Deployment Guide

Comprehensive deployment guide for the E-Governance Complaint Management System backend built with Node.js, Express, and Prisma.

## Table of Contents

1. [Overview](#overview)
2. [Development Environment](#development-environment)
3. [Production Deployment](#production-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)

## Overview

### Technology Stack
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js 4.18.2
- **Database ORM**: Prisma 5.7.1
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer middleware
- **Email Service**: Nodemailer with SMTP
- **API Documentation**: Swagger/OpenAPI 3.0

### Architecture
- RESTful API design
- Layered architecture (Routes → Controllers → Models)
- JWT-based stateless authentication
- Role-based access control (RBAC)
- File upload with validation
- Email notifications

## Development Environment

### Prerequisites
```bash
# Required software
- Node.js 18+ LTS
- npm 9+
- Git 2.30+
- SQLite (included in Node.js)
- Code editor (VS Code recommended)
```

### Setup Steps

#### 1. Clone and Install
```bash
# Clone repository
git clone <repository-url>
cd complaint-management-system

# Install dependencies
npm install

# Install dev dependencies
npm install --save-dev
```

#### 2. Environment Configuration
```bash
# Create environment file
cp .env.example .env

# Edit environment variables
nano .env
```

Required environment variables:
```bash
# Database
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
JWT_EXPIRE="7d"

# Server Configuration
PORT=4005
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"

# Email Configuration (for OTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@example.com"

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./uploads"

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

#### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Initialize database
npx prisma db push

# Seed database with initial data
npm run db:seed

# Optional: Open Prisma Studio
npm run db:studio
```

#### 4. Start Development Server
```bash
# Start backend only
npm run dev:server

# Start full stack (frontend + backend)
npm run dev

# Server will be available at:
# Backend API: http://localhost:4005
# API Documentation: http://localhost:4005/api-docs
```

### Development Tools

#### API Testing
```bash
# Using curl
curl -X GET http://localhost:4005/api/health

# Using httpie
http GET localhost:4005/api/health

# Access Swagger UI
open http://localhost:4005/api-docs
```

#### Database Operations
```bash
# View database
npm run db:studio

# Reset database
npm run db:reset

# Create migration
npx prisma migrate dev --name "migration-name"

# Apply migrations
npx prisma migrate deploy
```

## Production Deployment

### Server Requirements
- **OS**: Ubuntu 20.04+ LTS or CentOS 8+
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 20GB minimum SSD
- **CPU**: 2 cores minimum
- **Network**: Public IP with ports 80, 443, and 22 open

### Production Setup

#### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 process manager
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx (reverse proxy)
sudo apt install nginx -y

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

#### 2. Application Deployment
```bash
# Create application directory
sudo mkdir -p /opt/complaint-system
sudo chown $USER:$USER /opt/complaint-system

# Clone and setup application
cd /opt/complaint-system
git clone <repository-url> .
npm ci --production

# Create production environment file
nano .env.production
```

Production environment variables:
```bash
NODE_ENV=production
PORT=4005
DATABASE_URL="postgresql://complaint_user:secure_password@localhost:5432/complaint_production"
JWT_SECRET="your-production-jwt-secret-key-minimum-32-characters"
CORS_ORIGIN="https://your-domain.com"
SMTP_HOST="smtp.your-domain.com"
SMTP_USER="noreply@your-domain.com"
SMTP_PASS="production-email-password"
MAX_FILE_SIZE=10485760
UPLOAD_PATH="/opt/complaint-system/uploads"
```

#### 3. Database Configuration
```bash
# Create PostgreSQL database and user
sudo -u postgres psql << EOF
CREATE DATABASE complaint_production;
CREATE USER complaint_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE complaint_production TO complaint_user;
ALTER USER complaint_user CREATEDB;
\q
EOF

# Run database migrations
NODE_ENV=production npx prisma migrate deploy

# Generate Prisma client
NODE_ENV=production npx prisma generate

# Seed production data
NODE_ENV=production npm run db:seed
```

#### 4. PM2 Configuration
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'complaint-system-api',
    script: 'server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 4005
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4005
    },
    error_file: '/var/log/complaint-system/error.log',
    out_file: '/var/log/complaint-system/out.log',
    log_file: '/var/log/complaint-system/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

```bash
# Create log directory
sudo mkdir -p /var/log/complaint-system
sudo chown $USER:$USER /var/log/complaint-system

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

#### 5. Nginx Configuration
```bash
# Create Nginx server block
sudo nano /etc/nginx/sites-available/complaint-system
```

```nginx
upstream complaint_api {
    server 127.0.0.1:4005;
}

server {
    listen 80;
    server_name api.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # API endpoints
    location /api/ {
        proxy_pass http://complaint_api;
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

    # Health check
    location /health {
        access_log off;
        proxy_pass http://complaint_api/api/health;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/complaint-system /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Get SSL certificate
sudo certbot --nginx -d api.your-domain.com

# Restart Nginx
sudo systemctl restart nginx
```

## Docker Deployment

### Dockerfile for Backend
```dockerfile
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY server ./server/
COPY shared ./shared/

# Create uploads directory
RUN mkdir -p uploads && chown nodeuser:nodejs uploads

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 4005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4005/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/server.js"]
```

### Docker Compose for Backend
```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "4005:4005"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
    volumes:
      - uploads_data:/app/uploads
      - logs_data:/app/logs
    depends_on:
      - db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4005/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:13-alpine
    environment:
      - POSTGRES_DB=complaint_production
      - POSTGRES_USER=complaint_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U complaint_user -d complaint_production"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  uploads_data:
  logs_data:
```

### Docker Deployment Commands
```bash
# Build image
docker build -f Dockerfile.backend -t complaint-system-api .

# Run with Docker Compose
docker-compose -f docker-compose.backend.yml up -d

# View logs
docker-compose logs -f api

# Execute database migrations
docker-compose exec api npx prisma migrate deploy

# Scale API instances
docker-compose up -d --scale api=3
```

## Database Setup

### SQLite (Development)
```bash
# Initialize SQLite database
npx prisma db push

# View database file
sqlite3 dev.db ".tables"

# Backup database
cp dev.db dev.db.backup
```

### PostgreSQL (Production)

#### Installation and Configuration
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Configure PostgreSQL
sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE complaint_production;

-- Create user
CREATE USER complaint_user WITH ENCRYPTED PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE complaint_production TO complaint_user;
ALTER USER complaint_user CREATEDB;

-- Configure connection limits
ALTER USER complaint_user CONNECTION LIMIT 20;

-- Exit
\q
EOF

# Configure PostgreSQL settings
sudo nano /etc/postgresql/13/main/postgresql.conf
```

PostgreSQL configuration:
```bash
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB

# Connection settings
max_connections = 100
listen_addresses = 'localhost'

# Logging
log_statement = 'mod'
log_min_duration_statement = 1000
```

```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Enable autostart
sudo systemctl enable postgresql
```

#### Database Migrations
```bash
# Generate migration
npx prisma migrate dev --name "initial_setup"

# Apply migrations in production
NODE_ENV=production npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

#### Database Backup and Restore
```bash
# Create backup
pg_dump -h localhost -U complaint_user -d complaint_production > backup.sql

# Restore from backup
psql -h localhost -U complaint_user -d complaint_production < backup.sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/opt/backups/complaint-system"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -h localhost -U complaint_user -d complaint_production > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

## Environment Configuration

### Environment Variables Reference

#### Required Variables
```bash
# Core application settings
NODE_ENV=production|development|test
PORT=4005
DATABASE_URL=postgresql://user:pass@host:port/database

# JWT authentication
JWT_SECRET=minimum-32-character-secret-key
JWT_EXPIRE=7d

# CORS configuration
CORS_ORIGIN=https://your-domain.com

# Email service
SMTP_HOST=smtp.your-domain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=username
SMTP_PASS=password
EMAIL_FROM=noreply@your-domain.com

# File upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

#### Optional Variables
```bash
# Logging
LOG_LEVEL=info|debug|warn|error
LOG_FILE=./logs/app.log

# Monitoring
HEALTH_CHECK_ENDPOINT=/api/health
METRICS_ENDPOINT=/api/metrics

# External services
SENTRY_DSN=your-sentry-dsn
REDIS_URL=redis://localhost:6379
```

### Environment-Specific Configurations

#### Development (.env.development)
```bash
NODE_ENV=development
PORT=4005
DATABASE_URL="file:./dev.db"
JWT_SECRET="development-secret-key-32-chars"
CORS_ORIGIN="http://localhost:3000"
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="mailtrap-user"
SMTP_PASS="mailtrap-pass"
LOG_LEVEL=debug
```

#### Production (.env.production)
```bash
NODE_ENV=production
PORT=4005
DATABASE_URL="postgresql://complaint_user:${DB_PASS}@localhost:5432/complaint_production"
JWT_SECRET="${JWT_SECRET}"
CORS_ORIGIN="https://your-domain.com"
SMTP_HOST="smtp.your-domain.com"
SMTP_USER="${SMTP_USER}"
SMTP_PASS="${SMTP_PASS}"
LOG_LEVEL=info
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## Monitoring & Logging

### Application Logging
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
  defaultMeta: { service: 'complaint-system-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = logger;
```

### Health Monitoring
```javascript
// health.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'connected';
    
    // Check file system
    const fs = require('fs');
    fs.accessSync(process.env.UPLOAD_PATH || './uploads', fs.constants.W_OK);
    health.filesystem = 'writable';
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    health.memory = {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
    };
    
    res.json(health);
  } catch (error) {
    health.status = 'unhealthy';
    health.error = error.message;
    res.status(503).json(health);
  }
});

module.exports = router;
```

### Performance Monitoring
```bash
# PM2 monitoring
pm2 monit

# System monitoring
htop
iostat -x 1
df -h

# Application metrics
curl http://localhost:4005/api/health
```

### Log Management
```bash
# Log rotation with logrotate
sudo nano /etc/logrotate.d/complaint-system

/opt/complaint-system/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 nodeuser nodeuser
    postrotate
        pm2 reload complaint-system-api
    endscript
}
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U complaint_user -d complaint_production -c "SELECT 1;"

# Check connection string
echo $DATABASE_URL

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-13-main.log
```

#### 2. Permission Issues
```bash
# Fix file permissions
sudo chown -R nodeuser:nodejs /opt/complaint-system
sudo chmod -R 755 /opt/complaint-system

# Fix upload directory
sudo mkdir -p /opt/complaint-system/uploads
sudo chown nodeuser:nodejs /opt/complaint-system/uploads
sudo chmod 755 /opt/complaint-system/uploads
```

#### 3. Memory Issues
```bash
# Check memory usage
free -h
pm2 show complaint-system-api

# Restart application
pm2 restart complaint-system-api

# Increase memory limit
pm2 start ecosystem.config.js --node-args="--max-old-space-size=2048"
```

#### 4. Port Conflicts
```bash
# Check port usage
sudo netstat -tulpn | grep :4005
sudo lsof -i :4005

# Kill process on port
sudo kill -9 $(lsof -t -i:4005)
```

### Debug Commands
```bash
# View application logs
pm2 logs complaint-system-api

# Check PM2 status
pm2 status

# Restart application
pm2 restart complaint-system-api

# Reload application (zero downtime)
pm2 reload complaint-system-api

# View system resources
pm2 monit

# Database operations
npx prisma studio
npx prisma db pull
npx prisma generate
```

### Error Recovery
```bash
# Application won't start
pm2 delete complaint-system-api
pm2 start ecosystem.config.js --env production

# Database migration issues
npx prisma migrate reset
npx prisma migrate deploy

# File permission issues
sudo chown -R $USER:$USER /opt/complaint-system
sudo chmod -R 755 /opt/complaint-system
```

This comprehensive backend deployment guide covers all aspects of deploying and maintaining the complaint management system backend in both development and production environments.
