# Backend File Structure

Comprehensive guide to the backend file organization and structure of the E-Governance Complaint Management System.

## Table of Contents

1. [Overview](#overview)
2. [Root Directory Structure](#root-directory-structure)
3. [Server Directory Breakdown](#server-directory-breakdown)
4. [Shared Resources](#shared-resources)
5. [Configuration Files](#configuration-files)
6. [Database Structure](#database-structure)
7. [File Naming Conventions](#file-naming-conventions)
8. [Code Organization Patterns](#code-organization-patterns)

## Overview

The backend follows a modular, layered architecture with clear separation of concerns. The structure is designed for scalability, maintainability, and team collaboration.

### Architecture Layers
```
Application Layer (Routes)
    ↓
Business Logic Layer (Controllers)
    ↓
Data Access Layer (Models/Prisma)
    ↓
Infrastructure Layer (Database/External Services)
```

## Root Directory Structure

```
complaint-management-system/
├── 📁 server/                    # Backend application code
│   ├── 📁 controller/           # Business logic controllers
│   ├── 📁 routes/               # API route definitions
│   ├── 📁 middleware/           # Express middleware
│   ├── 📁 model/                # Data models (legacy)
│   ├── 📁 db/                   # Database configuration
│   ├── 📁 utils/                # Utility functions
│   ├── 📁 scripts/              # Database and setup scripts
│   ├── 📄 app.js                # Express application setup
│   └── 📄 server.js             # Server entry point
├── 📁 prisma/                   # Database schema and migrations
│   ├── 📄 schema.prisma         # Database schema definition
│   ├── 📄 seed.js               # Database seeding script
│   └── 📁 migrations/           # Database migration files
├── 📁 shared/                   # Shared types and utilities
│   └── 📄 api.ts                # API interface definitions
├── 📁 uploads/                  # File upload storage
│   ├── 📁 complaints/           # Complaint attachments
│   ├── 📁 profiles/             # User profile pictures
│   └── 📁 temp/                 # Temporary file storage
├── 📄 package.json              # Project dependencies and scripts
├── 📄 .env.example              # Environment variables template
├── 📄 .gitignore                # Git ignore rules
└── 📄 README.md                 # Project documentation
```

## Server Directory Breakdown

### Controllers (`server/controller/`)

Controllers contain business logic and coordinate between routes and data models.

```
server/controller/
├── 📄 authController.js         # Authentication and user management
├── 📄 complaintController.js    # Complaint CRUD operations
├── 📄 guestController.js        # Guest user operations
├── 📄 adminController.js        # Administrative functions
├── 📄 userController.js         # User profile management
├── 📄 uploadController.js       # File upload handling
├── 📄 complaintTypeController.js # Complaint type management
├── 📄 systemConfigController.js # System configuration
├── 📄 wardController.js         # Ward and area management
└── 📄 reportController.js       # Reports and analytics
```

#### Example Controller Structure
```javascript
// complaintController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ComplaintController {
  // Create new complaint
  async createComplaint(req, res, next) { /* ... */ }
  
  // Get complaints list (filtered by role)
  async getComplaints(req, res, next) { /* ... */ }
  
  // Get specific complaint by ID
  async getComplaintById(req, res, next) { /* ... */ }
  
  // Update complaint status
  async updateComplaintStatus(req, res, next) { /* ... */ }
  
  // Assign complaint to user
  async assignComplaint(req, res, next) { /* ... */ }
  
  // Add citizen feedback
  async addFeedback(req, res, next) { /* ... */ }
  
  // Get complaint statistics
  async getComplaintStats(req, res, next) { /* ... */ }
}

module.exports = new ComplaintController();
```

### Routes (`server/routes/`)

Routes define API endpoints and handle HTTP requests/responses.

```
server/routes/
├── 📄 authRoutes.js             # Authentication endpoints
├── 📄 complaintRoutes.js        # Complaint management endpoints
├── 📄 guestRoutes.js            # Public/guest endpoints
├── 📄 adminRoutes.js            # Administrative endpoints
├── 📄 userRoutes.js             # User management endpoints
├��─ 📄 uploadRoutes.js           # File upload/download endpoints
├── 📄 reportRoutes.js           # Reports and analytics endpoints
├── 📄 wardRoutes.js             # Ward and area endpoints
├── 📄 complaintTypeRoutes.js    # Complaint type endpoints
├── 📄 systemConfigRoutes.js     # System configuration endpoints
└── 📄 testRoutes.js             # Development testing endpoints
```

#### Example Route Structure
```javascript
// complaintRoutes.js
const express = require('express');
const complaintController = require('../controller/complaintController');
const { protect, authorize } = require('../middleware/auth');
const { validateComplaint } = require('../middleware/validation');
const upload = require('../middleware/fileUpload');

const router = express.Router();

// Public routes
router.get('/public/stats', complaintController.getPublicStats);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/', complaintController.getComplaints);
router.post('/', validateComplaint, complaintController.createComplaint);
router.get('/:id', complaintController.getComplaintById);

// Role-specific routes
router.put('/:id/status', 
  authorize('WARD_OFFICER', 'MAINTENANCE_TEAM', 'ADMINISTRATOR'),
  complaintController.updateComplaintStatus
);

router.put('/:id/assign',
  authorize('WARD_OFFICER', 'ADMINISTRATOR'),
  complaintController.assignComplaint
);

// Admin only routes
router.delete('/:id',
  authorize('ADMINISTRATOR'),
  complaintController.deleteComplaint
);

module.exports = router;
```

### Middleware (`server/middleware/`)

Middleware functions handle cross-cutting concerns like authentication, validation, and error handling.

```
server/middleware/
├── 📄 auth.js                   # Authentication and authorization
├── 📄 validation.js             # Request validation
├── 📄 errorHandler.js           # Global error handling
├── 📄 requestLogger.js          # Request logging
├── 📄 rateLimiter.js            # Rate limiting
├── 📄 fileUpload.js             # File upload configuration
├── 📄 cors.js                   # CORS configuration
└── 📄 security.js               # Security headers and validation
```

#### Example Middleware Structure
```javascript
// auth.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Authentication middleware
const protect = async (req, res, next) => {
  try {
    // Extract and verify JWT token
    const token = extractToken(req);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { ward: true }
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not active'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
```

### Models (`server/model/`)

Legacy model files (being phased out in favor of Prisma).

```
server/model/
├── 📄 User.js                   # User model (legacy)
├── 📄 Complaint.js              # Complaint model (legacy)
└── 📄 Notification.js           # Notification model (legacy)
```

### Database (`server/db/`)

Database connection and configuration files.

```
server/db/
├── 📄 connection.js             # Database connection setup
├── 📄 config.js                 # Database configuration
└── 📄 migrations.js             # Migration utilities (legacy)
```

#### Database Connection Example
```javascript
// connection.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Connection health check
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const disconnectDB = async () => {
  await prisma.$disconnect();
  console.log('📴 Database connection closed');
};

module.exports = { prisma, connectDB, disconnectDB };
```

### Utilities (`server/utils/`)

Utility functions and helper modules.

```
server/utils/
├── 📄 emailService.js           # Email sending utilities
├── 📄 fileUtils.js              # File handling utilities
├── 📄 logger.js                 # Logging configuration
├── 📄 validator.js              # Custom validation functions
├── 📄 helpers.js                # General helper functions
├── 📄 constants.js              # Application constants
└── 📄 responses.js              # Standardized API responses
```

#### Example Utility Structure
```javascript
// emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendOTP(email, otpCode) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'OTP for Complaint System',
      html: `<p>Your OTP code is: <strong>${otpCode}</strong></p>`
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendComplaintUpdate(email, complaint) {
    // Implementation for complaint update notification
  }
}

module.exports = new EmailService();
```

### Scripts (`server/scripts/`)

Database initialization and utility scripts.

```
server/scripts/
├── 📄 initDatabase.js           # Database initialization
├── 📄 seedData.js               # Data seeding utilities
├── 📄 migrateData.js            # Data migration scripts
└── 📄 cleanup.js                # Database cleanup utilities
```

### Application Files

#### Express App Configuration (`server/app.js`)
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const guestRoutes = require('./routes/guestRoutes');
// ... other routes

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
app.use(requestLogger);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/guest', guestRoutes);
// ... other routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
app.use(errorHandler);

module.exports = app;
```

#### Server Entry Point (`server/server.js`)
```javascript
const app = require('./app');
const { connectDB, disconnectDB } = require('./db/connection');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 4005;

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📖 API docs available at http://localhost:${PORT}/api-docs`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`📴 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        await disconnectDB();
        logger.info('✅ Server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

## Shared Resources

### Shared Types (`shared/api.ts`)

TypeScript interfaces shared between frontend and backend.

```typescript
// API response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User interfaces
export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  wardId?: string;
  isActive: boolean;
  language: string;
  joinedOn: string;
  lastLogin?: string;
  ward?: Ward;
}

export type UserRole = 'CITIZEN' | 'WARD_OFFICER' | 'MAINTENANCE_TEAM' | 'ADMINISTRATOR';

// Complaint interfaces
export interface Complaint {
  id: string;
  title: string;
  description: string;
  type: ComplaintType;
  status: ComplaintStatus;
  priority: Priority;
  submittedById: string;
  assignedToId?: string;
  wardId: string;
  submittedOn: string;
  // ... other fields
}

export type ComplaintStatus = 'REGISTERED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
export type ComplaintType = 'WATER_SUPPLY' | 'ELECTRICITY' | 'ROAD_REPAIR' | 'GARBAGE_COLLECTION' | 'STREET_LIGHTING' | 'SEWERAGE' | 'PUBLIC_HEALTH' | 'TRAFFIC' | 'OTHER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
```

## Configuration Files

### Package.json Structure
```json
{
  "name": "complaint-management-backend",
  "version": "1.0.0",
  "description": "Backend for E-Governance Complaint Management System",
  "main": "server/server.js",
  "scripts": {
    "start": "node server/server.js",
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:server": "nodemon server/server.js",
    "build": "npm run build:client && npm run build:server",
    "build:server": "echo 'Server build completed'",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:generate": "npx prisma generate",
    "db:push": "npx prisma db push",
    "db:migrate": "npx prisma migrate dev",
    "db:seed": "node prisma/seed.js",
    "db:studio": "npx prisma studio",
    "db:reset": "npx prisma migrate reset"
  },
  "dependencies": {
    "express": "^4.18.2",
    "@prisma/client": "^5.7.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5",
    "nodemailer": "^7.0.5",
    "helmet": "^8.1.0",
    "cors": "^2.8.5",
    "compression": "^1.8.1",
    "express-rate-limit": "^8.0.1",
    "express-validator": "^7.2.1",
    "zod": "^3.23.8",
    "dotenv": "^17.2.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "prisma": "^5.7.1",
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

### Environment Configuration

#### `.env.example`
```bash
# Server Configuration
NODE_ENV=development
PORT=4005
CORS_ORIGIN=http://localhost:3000

# Database Configuration
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRE=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@example.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting Configuration
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# External Services
SENTRY_DSN=your-sentry-dsn
```

## Database Structure

### Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  fullName    String
  phoneNumber String?
  password    String
  role        UserRole @default(CITIZEN)
  wardId      String?
  isActive    Boolean  @default(true)
  language    String   @default("en")
  joinedOn    DateTime @default(now())
  lastLogin   DateTime?

  // Relationships
  ward                Ward?       @relation(fields: [wardId], references: [id])
  submittedComplaints Complaint[] @relation("SubmittedComplaints")
  assignedComplaints  Complaint[] @relation("AssignedComplaints")
  statusLogs          StatusLog[]
  otpSessions         OTPSession[]

  @@map("users")
}

model Ward {
  id          String    @id @default(cuid())
  name        String
  description String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())

  // Relationships
  users       User[]
  complaints  Complaint[]
  subZones    SubZone[]

  @@map("wards")
}

model Complaint {
  id                String      @id @default(cuid())
  title             String
  description       String
  type              ComplaintType
  status            ComplaintStatus @default(REGISTERED)
  priority          Priority    @default(MEDIUM)
  submittedById     String
  assignedToId      String?
  wardId            String
  subZoneId         String?
  area              String?
  address           String
  landmark          String?
  contactPhone      String
  contactEmail      String
  coordinates       Json?
  submittedOn       DateTime    @default(now())
  assignedOn        DateTime?
  expectedResolution DateTime?
  actualResolution  DateTime?
  citizenFeedback   Json?

  // Relationships
  submittedBy User        @relation("SubmittedComplaints", fields: [submittedById], references: [id])
  assignedTo  User?       @relation("AssignedComplaints", fields: [assignedToId], references: [id])
  ward        Ward        @relation(fields: [wardId], references: [id])
  subZone     SubZone?    @relation(fields: [subZoneId], references: [id])
  attachments Attachment[]
  statusLogs  StatusLog[]

  @@map("complaints")
}

// Enums
enum UserRole {
  CITIZEN
  WARD_OFFICER
  MAINTENANCE_TEAM
  ADMINISTRATOR
}

enum ComplaintStatus {
  REGISTERED
  ASSIGNED
  IN_PROGRESS
  RESOLVED
  CLOSED
  REOPENED
}

enum ComplaintType {
  WATER_SUPPLY
  ELECTRICITY
  ROAD_REPAIR
  GARBAGE_COLLECTION
  STREET_LIGHTING
  SEWERAGE
  PUBLIC_HEALTH
  TRAFFIC
  OTHER
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

### Database Seeding (`prisma/seed.js`)

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create wards
  const ward1 = await prisma.ward.create({
    data: {
      name: 'Ward 12 - Ernakulam',
      description: 'Central Ernakulam area covering Kadavanthra, Kaloor'
    }
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@cochinsmartcity.gov.in',
      fullName: 'System Administrator',
      password: hashedPassword,
      role: 'ADMINISTRATOR',
      isActive: true
    }
  });

  // Create sample complaint types
  const complaintTypes = [
    { name: 'Water Supply Issue', slaHours: 48 },
    { name: 'Electricity Problem', slaHours: 24 },
    { name: 'Road Repair', slaHours: 168 },
    { name: 'Garbage Collection', slaHours: 24 }
  ];

  for (const type of complaintTypes) {
    await prisma.complaintType.create({ data: type });
  }

  console.log('✅ Database seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## File Naming Conventions

### Controllers
- **Format**: `{entity}Controller.js`
- **Examples**: `authController.js`, `complaintController.js`, `userController.js`
- **Naming**: camelCase, descriptive, singular entity name

### Routes
- **Format**: `{entity}Routes.js`
- **Examples**: `authRoutes.js`, `complaintRoutes.js`, `guestRoutes.js`
- **Naming**: camelCase, descriptive, plural for collections

### Middleware
- **Format**: `{purpose}.js`
- **Examples**: `auth.js`, `validation.js`, `errorHandler.js`
- **Naming**: camelCase, descriptive of purpose

### Utilities
- **Format**: `{purpose}.js` or `{purpose}Service.js`
- **Examples**: `emailService.js`, `fileUtils.js`, `logger.js`
- **Naming**: camelCase, descriptive of functionality

### Models (Prisma)
- **Format**: PascalCase in schema
- **Examples**: `User`, `Complaint`, `Ward`
- **Naming**: Singular, descriptive entity names

## Code Organization Patterns

### Controller Pattern
```javascript
// Standard controller structure
class EntityController {
  async create(req, res, next) {
    try {
      // Validation
      // Business logic
      // Database operation
      // Response
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) { /* ... */ }
  async getById(req, res, next) { /* ... */ }
  async update(req, res, next) { /* ... */ }
  async delete(req, res, next) { /* ... */ }
}

module.exports = new EntityController();
```

### Service Layer Pattern
```javascript
// Service layer for complex business logic
class ComplaintService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async createComplaint(data) {
    // Complex business logic
    // Multiple database operations
    // External service calls
    return result;
  }
}

module.exports = new ComplaintService();
```

### Middleware Pattern
```javascript
// Reusable middleware functions
const middlewareFunction = (options = {}) => {
  return (req, res, next) => {
    // Middleware logic
    next();
  };
};

module.exports = middlewareFunction;
```

### Error Handling Pattern
```javascript
// Centralized error handling
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (err.code === 'P2002') {
    error = new AppError('Duplicate field value entered', 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

module.exports = { AppError, errorHandler };
```

This comprehensive file structure documentation provides a complete understanding of how the backend code is organized, making it easier for developers to navigate, maintain, and extend the system.
