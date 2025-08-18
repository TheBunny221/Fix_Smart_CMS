# Frontend Deployment Guide

Comprehensive deployment guide for the E-Governance Complaint Management System frontend built with React, TypeScript, and Vite.

## Table of Contents

1. [Overview](#overview)
2. [Development Environment](#development-environment)
3. [Build Process](#build-process)
4. [Production Deployment](#production-deployment)
5. [Static Hosting Deployment](#static-hosting-deployment)
6. [CDN Configuration](#cdn-configuration)
7. [Environment Configuration](#environment-configuration)
8. [Performance Optimization](#performance-optimization)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Troubleshooting](#troubleshooting)

## Overview

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6.2.2 with SWC
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router 6 (SPA mode)
- **Styling**: TailwindCSS 3 with Radix UI components
- **Testing**: Vitest and Cypress

### Deployment Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        CDN (Optional)                      │
├─────────────────────────────────────────────────────────────┤
│  • Global Content Distribution                             │
│  • Static Asset Caching                                    │
│  • Image Optimization                                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    NGINX (Web Server)                      │
├─────────────────────────────────────────────────────────────┤
│  • SSL Termination                                         │
│  • Gzip Compression                                        │
│  • Static File Serving                                     │
│  • SPA Routing Support                                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                 REACT SPA APPLICATION                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   HTML      │  │    CSS      │  │ JavaScript  │       │
│  │             │  │             │  │             │       │
│  │ • Index     │  │ • Tailwind  │  │ • React     │       │
│  │ • Manifest  │  │ • Components│  │ • Redux     │       │
│  │ • Robots    │  │ • Global    │  │ • Router    │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │   Assets    │  │  Service    │                       │
│  │             │  │   Worker    │                       │
│  │ • Images    │  │ • Caching   │                       │
│  │ • Icons     │  │ • Offline   │                       │
│  │ • Fonts     │  │ • Updates   │                       │
│  └─────────────┘  └─────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## Development Environment

### Prerequisites
```bash
# Required software
- Node.js 18+ LTS
- npm 9+ (or yarn/pnpm)
- Git 2.30+
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- VS Code (recommended) with extensions:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - Auto Rename Tag
```

### Local Development Setup

#### 1. Clone and Install
```bash
# Clone repository
git clone <repository-url>
cd complaint-management-system

# Install dependencies
npm install

# Verify installation
npm run typecheck
```

#### 2. Environment Configuration
```bash
# Create environment file
cp .env.example .env.local

# Configure development variables
nano .env.local
```

Development environment variables:
```bash
# Vite configuration
VITE_API_BASE_URL=http://localhost:4005/api
VITE_APP_TITLE="E-Governance Complaint System"
VITE_APP_DESCRIPTION="Municipal Complaint Management System"

# Feature flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SERVICE_WORKER=false
VITE_ENABLE_PWA=false

# Development tools
VITE_ENABLE_REACT_DEVTOOLS=true
VITE_ENABLE_REDUX_DEVTOOLS=true
VITE_SHOW_COMPONENT_NAMES=true

# API configuration
VITE_API_TIMEOUT=30000
VITE_API_RETRY_COUNT=3

# Upload configuration
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Map configuration (if using maps)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_MAP_DEFAULT_LAT=9.9816
VITE_MAP_DEFAULT_LNG=76.2999
```

#### 3. Start Development Server
```bash
# Start frontend only
npm run dev:client

# Start full stack (frontend + backend)
npm run dev

# Development server will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:4005
```

### Development Tools

#### Hot Module Replacement (HMR)
```javascript
// vite.config.ts - HMR configuration
export default defineConfig({
  server: {
    hmr: {
      port: 3001,
      overlay: false // Disable error overlay for better UX
    },
    watch: {
      usePolling: false, // Use native file watching
      interval: 1000
    }
  }
});
```

#### TypeScript Development
```bash
# Type checking
npm run typecheck

# Watch mode for type checking
npm run typecheck:watch

# Generate type definitions
npm run types:generate
```

#### Linting and Formatting
```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Format and fix all issues
npm run format:fix
```

## Build Process

### Development Build
```bash
# Build for development with source maps
npm run build:dev

# Preview development build
npm run preview:dev
```

### Production Build
```bash
# Build for production
npm run build

# Analyze bundle size
npm run build:analyze

# Preview production build
npm run preview
```

### Build Configuration

#### Vite Build Settings
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js'
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

#### Bundle Analysis
```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Generate bundle report
npm run build:analyze

# Open bundle report
open dist/stats.html
```

#### Build Optimization
```typescript
// Optimization configuration
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['virtual:pwa-register'],
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react';
            }
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
              return 'redux';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('@radix-ui')) {
              return 'ui';
            }
            return 'vendor';
          }
          
          // Feature-based chunks
          if (id.includes('src/pages/Admin')) {
            return 'admin';
          }
          if (id.includes('src/pages/Citizen')) {
            return 'citizen';
          }
        }
      }
    }
  }
});
```

## Production Deployment

### Server Requirements
- **OS**: Linux (Ubuntu 20.04+ or CentOS 8+)
- **RAM**: 1GB minimum (2GB recommended for build process)
- **Storage**: 5GB available space
- **CPU**: 1 core minimum
- **Network**: Public IP with ports 80 and 443 open

### Static File Deployment

#### 1. Build Production Assets
```bash
# Clean previous builds
rm -rf dist

# Build for production
NODE_ENV=production npm run build

# Verify build output
ls -la dist/
```

#### 2. Nginx Configuration
```bash
# Install Nginx
sudo apt update
sudo apt install nginx -y

# Create site configuration
sudo nano /etc/nginx/sites-available/complaint-system
```

```nginx
# Nginx configuration for React SPA
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
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Document root
    root /var/www/complaint-system/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # Browser caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # API proxy (if serving API from same domain)
    location /api/ {
        proxy_pass http://localhost:4005/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache control for HTML files
        location ~* \.html$ {
            expires 0;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }
    
    # Robots.txt
    location = /robots.txt {
        allow all;
        log_not_found off;
        access_log off;
    }
    
    # Favicon
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }
    
    # Hidden files protection
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

#### 3. Deploy Files
```bash
# Create web directory
sudo mkdir -p /var/www/complaint-system
sudo chown $USER:$USER /var/www/complaint-system

# Copy build files
cp -r dist/* /var/www/complaint-system/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/complaint-system
sudo chmod -R 755 /var/www/complaint-system

# Enable site
sudo ln -s /etc/nginx/sites-available/complaint-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. SSL Certificate Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Verify certificate renewal
sudo certbot renew --dry-run

# Auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## Static Hosting Deployment

### Netlify Deployment

#### 1. Manual Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build application
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

#### 2. Continuous Deployment
```bash
# netlify.toml configuration
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  VITE_API_BASE_URL = "https://api.your-domain.com/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Vercel Deployment

#### 1. Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {},
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### 2. Environment Variables
```bash
# Vercel environment variables
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_APP_TITLE="E-Governance Complaint System"
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your-sentry-dsn
```

### AWS S3 + CloudFront Deployment

#### 1. S3 Bucket Setup
```bash
# Install AWS CLI
aws configure

# Create S3 bucket
aws s3 mb s3://complaint-system-frontend

# Enable static website hosting
aws s3 website s3://complaint-system-frontend \
  --index-document index.html \
  --error-document index.html

# Upload build files
aws s3 sync dist/ s3://complaint-system-frontend \
  --delete \
  --cache-control "max-age=31536000" \
  --exclude "*.html" \
  --exclude "service-worker.js"

# Upload HTML files with no cache
aws s3 sync dist/ s3://complaint-system-frontend \
  --delete \
  --cache-control "no-cache" \
  --include "*.html" \
  --include "service-worker.js"
```

#### 2. CloudFront Distribution
```json
{
  "DistributionConfig": {
    "CallerReference": "complaint-system-frontend",
    "Comment": "CDN for Complaint Management System",
    "Origins": [
      {
        "Id": "S3-complaint-system-frontend",
        "DomainName": "complaint-system-frontend.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ],
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-complaint-system-frontend",
      "ViewerProtocolPolicy": "redirect-to-https",
      "MinTTL": 0,
      "DefaultTTL": 86400,
      "MaxTTL": 31536000,
      "Compress": true
    },
    "CustomErrorResponses": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": 200,
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": 200,
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}
```

## CDN Configuration

### CloudFlare Setup
```bash
# DNS configuration
Type: A
Name: @
Content: your-server-ip
TTL: Auto

Type: CNAME
Name: www
Content: your-domain.com
TTL: Auto

# Page Rules
Rule: "*your-domain.com/static/*"
Settings: Cache Level = Cache Everything, Browser Cache TTL = 1 year

Rule: "*your-domain.com/*.html"
Settings: Cache Level = Bypass, Browser Cache TTL = 4 hours
```

### Cache Control Headers
```nginx
# Static assets (long-term caching)
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
}

# HTML files (no caching)
location ~* \.html$ {
    expires 0;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
}

# Service Worker (short-term caching)
location = /service-worker.js {
    expires 24h;
    add_header Cache-Control "public, max-age=86400";
}
```

## Environment Configuration

### Environment Variables by Stage

#### Development (.env.local)
```bash
VITE_API_BASE_URL=http://localhost:4005/api
VITE_APP_TITLE="Complaint System (Dev)"
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SERVICE_WORKER=false
VITE_ENABLE_REACT_DEVTOOLS=true
VITE_ENABLE_REDUX_DEVTOOLS=true
VITE_LOG_LEVEL=debug
```

#### Staging (.env.staging)
```bash
VITE_API_BASE_URL=https://api-staging.your-domain.com/api
VITE_APP_TITLE="Complaint System (Staging)"
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SERVICE_WORKER=true
VITE_ENABLE_REACT_DEVTOOLS=false
VITE_ENABLE_REDUX_DEVTOOLS=true
VITE_LOG_LEVEL=info
VITE_SENTRY_DSN=your-staging-sentry-dsn
```

#### Production (.env.production)
```bash
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_APP_TITLE="E-Governance Complaint System"
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SERVICE_WORKER=true
VITE_ENABLE_REACT_DEVTOOLS=false
VITE_ENABLE_REDUX_DEVTOOLS=false
VITE_LOG_LEVEL=error
VITE_SENTRY_DSN=your-production-sentry-dsn
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
```

### Runtime Configuration
```typescript
// src/config/environment.ts
interface AppConfig {
  apiBaseUrl: string;
  appTitle: string;
  enableAnalytics: boolean;
  enableServiceWorker: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxFileSize: number;
  allowedFileTypes: string[];
}

export const config: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4005/api',
  appTitle: import.meta.env.VITE_APP_TITLE || 'Complaint System',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableServiceWorker: import.meta.env.VITE_ENABLE_SERVICE_WORKER === 'true',
  logLevel: (import.meta.env.VITE_LOG_LEVEL as any) || 'info',
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'),
  allowedFileTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf').split(',')
};
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy loading for routes
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const CitizenDashboard = lazy(() => import('@/pages/CitizenDashboard'));

// Route configuration with suspense
<Routes>
  <Route path="/admin" element={
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboard />
    </Suspense>
  } />
  <Route path="/citizen" element={
    <Suspense fallback={<LoadingSpinner />}>
      <CitizenDashboard />
    </Suspense>
  } />
</Routes>
```

### Bundle Optimization
```typescript
// vite.config.ts - Advanced optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'react';
            if (id.includes('@reduxjs/toolkit')) return 'redux';
            if (id.includes('react-router')) return 'router';
            if (id.includes('@radix-ui')) return 'ui';
            if (id.includes('lucide-react')) return 'icons';
            return 'vendor';
          }
          
          // Feature chunks
          if (id.includes('src/pages/Admin')) return 'admin';
          if (id.includes('src/components/ui')) return 'ui-components';
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true
  },
  esbuild: {
    drop: ['console', 'debugger']
  }
});
```

### Image Optimization
```typescript
// Image loading component with optimization
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500">
          Failed to load image
        </div>
      )}
    </div>
  );
};
```

## Monitoring & Analytics

### Error Monitoring with Sentry
```typescript
// src/utils/monitoring.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        )
      })
    ],
    tracesSampleRate: 0.1,
    environment: import.meta.env.MODE
  });
}

// Error boundary with Sentry
export const ErrorBoundary = Sentry.withErrorBoundary(App, {
  fallback: ({ error, resetError }) => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
});
```

### Google Analytics Integration
```typescript
// src/utils/analytics.ts
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const initAnalytics = () => {
  if (!import.meta.env.VITE_GOOGLE_ANALYTICS_ID || !import.meta.env.PROD) {
    return;
  }

  // Load GA script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GOOGLE_ANALYTICS_ID}`;
  document.head.appendChild(script);

  // Initialize GA
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
    page_title: document.title,
    page_location: window.location.href
  });
};

export const trackEvent = (action: string, category: string, label?: string) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label
    });
  }
};

export const trackPageView = (path: string) => {
  if (window.gtag) {
    window.gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
      page_path: path
    });
  }
};
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev

# Check for TypeScript errors
npm run typecheck

# Check for dependency conflicts
npm ls --depth=0
```

#### 2. Runtime Errors
```bash
# Check browser console for errors
# Enable React DevTools
# Check Redux DevTools state
# Verify API connectivity

# Debug in development mode
NODE_ENV=development npm run build
npm run preview
```

#### 3. Performance Issues
```bash
# Analyze bundle size
npm run build:analyze

# Check for large dependencies
npx webpack-bundle-analyzer dist/stats.json

# Profile React components
# Install React DevTools Profiler
# Record performance traces
```

#### 4. Deployment Issues
```bash
# Check build output
ls -la dist/

# Verify environment variables
env | grep VITE_

# Test production build locally
npm run build && npm run preview

# Check server logs
sudo journalctl -u nginx -f
```

### Debug Commands
```bash
# Development debugging
npm run dev:debug
npm run typecheck:watch
npm run lint:fix

# Build debugging
npm run build:verbose
npm run build:analyze
npm run preview:network

# Deployment verification
curl -I https://your-domain.com
curl -I https://your-domain.com/static/js/main.js
```

### Performance Monitoring
```typescript
// Performance monitoring utility
export const measurePerformance = () => {
  if ('performance' in window) {
    const perfData = {
      navigationStart: performance.timing.navigationStart,
      domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
      firstPaint: 0,
      firstContentfulPaint: 0
    };

    // Get paint timings
    const paintTimings = performance.getEntriesByType('paint');
    paintTimings.forEach((timing) => {
      if (timing.name === 'first-paint') {
        perfData.firstPaint = timing.startTime;
      }
      if (timing.name === 'first-contentful-paint') {
        perfData.firstContentfulPaint = timing.startTime;
      }
    });

    console.log('Performance metrics:', perfData);
    
    // Send to analytics if enabled
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: 'load',
        value: perfData.loadComplete
      });
    }
  }
};
```

This comprehensive frontend deployment guide covers all aspects of building, optimizing, and deploying the React-based complaint management system frontend across various environments and hosting platforms.
