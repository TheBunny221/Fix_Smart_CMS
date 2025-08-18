# Backend Architecture

Comprehensive architectural overview of the E-Governance Complaint Management System backend built with Node.js, Express, and Prisma.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Technology Stack](#technology-stack)
4. [System Components](#system-components)
5. [Data Architecture](#data-architecture)
6. [API Design](#api-design)
7. [Security Architecture](#security-architecture)
8. [Performance & Scalability](#performance--scalability)
9. [Integration Patterns](#integration-patterns)

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                     │
├─���───────────────────────────────────────────────────────────┤
│  React SPA  │  Mobile App  │  Admin Panel  │  Public API   │
└─────────────────┬───────────────┬───────────────┬───────────┘
                  │               │               │
                  ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                     NGINX (Reverse Proxy)                  │
├─────────────────────────────────────────────────────────────┤
│  • Load Balancing                                          │
│  • SSL Termination                                         │
│  • Static File Serving                                     │
│  • Rate Limiting                                           │
└───────────────���─┬───────────────┬───────────────┬───────────┘
                  │               │               │
                  ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS API SERVER                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Routes    │  │ Controllers │  │ Middleware  │       │
│  │             │  │             │  │             │       │
│  │ • Auth      │  │ • Business  │  │ • Auth      │       │
│  │ • CRUD      │  │   Logic     │  │ • Validation│       │
│  │ • Upload    │  │ • Data      │  │ • Error     │       │
│  │ • Public    │  │   Transform │  │   Handling  │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────┬───────────────┬───────────────┬───────────┘
                  │               │               │
                  ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Prisma    │  │ File System │  │ Email SMTP  │       │
│  │     ORM     │  │  (Uploads)  │  │   Service   │       │
│  └─────────────┘  └─────────────┘  └───��─────────┘       │
│  ┌─────────────┐                                          │
│  │ PostgreSQL  │                                          │
│  │  Database   │                                          │
│  └─────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

### System Boundaries

The backend system operates within these boundaries:

- **Internal Services**: Express API, Database, File Storage
- **External Services**: SMTP Email, Third-party Integrations
- **Client Interfaces**: REST API endpoints, File upload/download
- **Administrative Interfaces**: Database admin, Logging, Monitoring

## Architecture Principles

### 1. Separation of Concerns
- **Presentation Layer**: Route handlers and response formatting
- **Business Logic Layer**: Controllers and domain logic
- **Data Access Layer**: Prisma ORM and database operations
- **Infrastructure Layer**: External services and utilities

### 2. Single Responsibility Principle
Each component has a single, well-defined responsibility:
- Routes handle HTTP requests/responses
- Controllers contain business logic
- Models define data structure
- Middleware handles cross-cutting concerns

### 3. Dependency Inversion
- High-level modules don't depend on low-level modules
- Abstractions don't depend on details
- Interfaces define contracts

### 4. Stateless Design
- No server-side session storage
- JWT tokens for authentication
- Horizontal scalability support

### 5. Fail-Fast Principle
- Early validation and error detection
- Comprehensive error handling
- Graceful degradation

## Technology Stack

### Core Technologies

#### Runtime & Framework
```
Node.js 18+ LTS
├── Express.js 4.18.2 (Web Framework)
├── TypeScript 5.5.3 (Type Safety)
└── ES Modules (Modern JavaScript)
```

#### Database & ORM
```
Prisma ORM 5.7.1
├── PostgreSQL 13+ (Production)
├── SQLite (Development)
└── Connection Pooling
```

#### Authentication & Security
```
Security Stack
├── JSON Web Tokens (JWT)
├── bcryptjs (Password Hashing)
├── Helmet (Security Headers)
├── CORS (Cross-Origin Resource Sharing)
├── Express Rate Limit
└── Express Validator
```

#### File & Communication
```
External Services
├── Multer (File Upload)
├── Nodemailer (Email Service)
├── SMTP (Email Protocol)
└── File System (Local Storage)
```

#### Development & Documentation
```
Development Tools
├── Nodemon (Auto-restart)
├── Swagger/OpenAPI 3.0 (API Docs)
├── Winston (Logging)
└── Jest/Vitest (Testing)
```

### Dependency Management

#### Production Dependencies
```json
{
  "express": "^4.18.2",
  "@prisma/client": "^5.7.1",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "multer": "^1.4.5",
  "nodemailer": "^7.0.5",
  "helmet": "^8.1.0",
  "cors": "^2.8.5",
  "express-rate-limit": "^8.0.1",
  "express-validator": "^7.2.1",
  "zod": "^3.23.8",
  "compression": "^1.8.1",
  "dotenv": "^17.2.0"
}
```

#### Development Dependencies
```json
{
  "prisma": "^5.7.1",
  "nodemon": "^3.0.2",
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.1",
  "@types/node": "^22.5.5",
  "@types/express": "^4.17.21",
  "vitest": "^3.1.4"
}
```

## System Components

### 1. Route Layer (`server/routes/`)

Routes define API endpoints and delegate to controllers:

```javascript
// authRoutes.js
const express = require('express');
const authController = require('../controller/authController');
const { protect } = require('../middleware/auth');
const { validateLogin } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/login', validateLogin, authController.login);
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);

// Protected routes
router.get('/me', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
```

#### Route Organization
```
Routes Structure
├── authRoutes.js      (Authentication & User Management)
├── complaintRoutes.js (Complaint CRUD Operations)
├── guestRoutes.js     (Public/Guest Operations)
├── adminRoutes.js     (Administrative Functions)
├── uploadRoutes.js    (File Upload/Download)
├── reportRoutes.js    (Reports & Analytics)
└── testRoutes.js      (Development Testing)
```

### 2. Controller Layer (`server/controller/`)

Controllers contain business logic and coordinate between routes and data:

```javascript
// complaintController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ComplaintController {
  async createComplaint(req, res, next) {
    try {
      const { title, description, type, wardId } = req.body;
      const userId = req.user.id;

      // Business logic
      const complaint = await prisma.complaint.create({
        data: {
          title,
          description,
          type,
          status: 'REGISTERED',
          submittedById: userId,
          wardId,
          submittedOn: new Date()
        },
        include: {
          submittedBy: {
            select: { id: true, fullName: true }
          },
          ward: true
        }
      });

      // Auto-assignment logic
      await this.autoAssignComplaint(complaint.id, wardId);

      res.status(201).json({
        success: true,
        message: 'Complaint submitted successfully',
        data: { complaint }
      });
    } catch (error) {
      next(error);
    }
  }

  async autoAssignComplaint(complaintId, wardId) {
    // Business logic for auto-assignment
    const wardOfficer = await prisma.user.findFirst({
      where: {
        role: 'WARD_OFFICER',
        wardId: wardId,
        isActive: true
      }
    });

    if (wardOfficer) {
      await prisma.complaint.update({
        where: { id: complaintId },
        data: {
          assignedToId: wardOfficer.id,
          status: 'ASSIGNED',
          assignedOn: new Date()
        }
      });
    }
  }
}

module.exports = new ComplaintController();
```

#### Controller Organization
```
Controllers Structure
├── authController.js      (Authentication Logic)
├── complaintController.js (Complaint Management)
├── guestController.js     (Guest Operations)
├── adminController.js     (Administrative Functions)
├── userController.js      (User Management)
├── uploadController.js    (File Operations)
└── systemConfigController.js (System Configuration)
```

### 3. Middleware Layer (`server/middleware/`)

Middleware handles cross-cutting concerns:

```javascript
// auth.js - Authentication Middleware
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { ward: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not active.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

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

#### Middleware Types
```
Middleware Organization
├── auth.js           (Authentication & Authorization)
├── validation.js     (Input Validation)
├── errorHandler.js   (Error Processing)
├── requestLogger.js  (Request Logging)
├── rateLimiter.js    (Rate Limiting)
└── fileUpload.js     (File Upload Handling)
```

### 4. Data Models (`prisma/schema.prisma`)

Prisma schema defines data structure and relationships:

```prisma
// User model
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
  ward              Ward?       @relation(fields: [wardId], references: [id])
  submittedComplaints Complaint[] @relation("SubmittedComplaints")
  assignedComplaints  Complaint[] @relation("AssignedComplaints")
  statusLogs         StatusLog[]
  otpSessions        OTPSession[]

  @@map("users")
}

// Complaint model
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
```

## Data Architecture

### Database Design Principles

#### 1. Normalization
- **Third Normal Form (3NF)** compliance
- Elimination of data redundancy
- Referential integrity maintenance

#### 2. Indexing Strategy
```sql
-- Performance indexes
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_ward ON complaints(ward_id);
CREATE INDEX idx_complaints_submitted_date ON complaints(submitted_on);
CREATE INDEX idx_complaints_type ON complaints(type);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Composite indexes
CREATE INDEX idx_complaints_ward_status ON complaints(ward_id, status);
CREATE INDEX idx_complaints_assigned_user ON complaints(assigned_to_id, status);
```

#### 3. Data Relationships

```
Entity Relationship Diagram

User (1) ←→ (n) Complaint
    ↓           ↓
Ward (1) ←→ (n) SubZone
    ↑           ↑
    └─ (n) ←→ (1) ┘

Complaint (1) ←→ (n) Attachment
Complaint (1) ←→ (n) StatusLog
User (1) ←→ (n) OTPSession
```

### Data Access Patterns

#### 1. Repository Pattern
```javascript
// complaintRepository.js
class ComplaintRepository {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async findComplaintsByWard(wardId, filters = {}) {
    const where = {
      wardId,
      ...this.buildFilterClause(filters)
    };

    return await this.prisma.complaint.findMany({
      where,
      include: {
        submittedBy: {
          select: { id: true, fullName: true }
        },
        assignedTo: {
          select: { id: true, fullName: true }
        },
        ward: true,
        attachments: true
      },
      orderBy: { submittedOn: 'desc' }
    });
  }

  buildFilterClause(filters) {
    const clause = {};
    
    if (filters.status) clause.status = filters.status;
    if (filters.type) clause.type = filters.type;
    if (filters.priority) clause.priority = filters.priority;
    
    return clause;
  }
}
```

#### 2. Query Optimization
```javascript
// Optimized queries with selective inclusion
const getComplaintsList = async (filters) => {
  return await prisma.complaint.findMany({
    where: buildWhereClause(filters),
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      submittedOn: true,
      submittedBy: {
        select: { fullName: true }
      },
      ward: {
        select: { name: true }
      }
    },
    take: filters.limit || 10,
    skip: (filters.page - 1) * (filters.limit || 10),
    orderBy: { submittedOn: 'desc' }
  });
};
```

## API Design

### RESTful Principles

#### 1. Resource-Based URLs
```
Resource Organization:
├── /api/auth          (Authentication)
├── /api/complaints    (Complaints)
├── /api/users         (User Management)
├── /api/wards         (Ward Information)
├── /api/uploads       (File Operations)
├── /api/reports       (Analytics)
└── /api/admin         (Administrative)
```

#### 2. HTTP Methods Usage
```
POST   /api/complaints      # Create complaint
GET    /api/complaints      # List complaints
GET    /api/complaints/:id  # Get specific complaint
PUT    /api/complaints/:id  # Update complaint
DELETE /api/complaints/:id  # Delete complaint (admin only)

POST   /api/complaints/:id/assign     # Assign complaint
PUT    /api/complaints/:id/status     # Update status
POST   /api/complaints/:id/feedback   # Add feedback
```

#### 3. Consistent Response Format
```javascript
// Success response
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}

// Error response
{
  "success": false,
  "message": "Error description",
  "data": null,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### 4. Status Code Usage
```javascript
// Success codes
200 - OK (GET, PUT)
201 - Created (POST)
204 - No Content (DELETE)

// Client error codes
400 - Bad Request (Validation errors)
401 - Unauthorized (Authentication required)
403 - Forbidden (Permission denied)
404 - Not Found (Resource not found)
409 - Conflict (Duplicate data)
422 - Unprocessable Entity (Business logic error)

// Server error codes
500 - Internal Server Error
503 - Service Unavailable
```

### API Documentation

#### Swagger/OpenAPI Integration
```javascript
// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Complaint Management System API',
      version: '1.0.0',
      description: 'API for E-Governance Complaint Management System'
    },
    servers: [
      {
        url: 'http://localhost:4005/api',
        description: 'Development server'
      },
      {
        url: 'https://api.your-domain.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js', './controller/*.js']
};

module.exports = swaggerJSDoc(options);
```

## Security Architecture

### Authentication & Authorization

#### 1. JWT Token Structure
```javascript
// Token payload
{
  "userId": "user_123",
  "email": "user@example.com",
  "role": "CITIZEN",
  "wardId": "ward_456",
  "iat": 1642684800,
  "exp": 1643289600
}

// Token generation
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      wardId: user.wardId
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};
```

#### 2. Role-Based Access Control
```javascript
// Permission matrix
const permissions = {
  CITIZEN: ['read:own-complaints', 'create:complaints', 'update:own-profile'],
  WARD_OFFICER: ['read:ward-complaints', 'update:complaint-status', 'assign:complaints'],
  MAINTENANCE_TEAM: ['read:assigned-complaints', 'update:task-status'],
  ADMINISTRATOR: ['read:all', 'write:all', 'delete:all', 'manage:users']
};

const checkPermission = (userRole, action, resource) => {
  const userPermissions = permissions[userRole] || [];
  return userPermissions.includes(`${action}:${resource}`) || 
         userPermissions.includes(`${action}:all`) ||
         userPermissions.includes('manage:all');
};
```

#### 3. Input Validation
```javascript
// Validation schemas using Zod
const complaintSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(20).max(2000),
  type: z.enum(['WATER_SUPPLY', 'ELECTRICITY', 'ROAD_REPAIR']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  wardId: z.string().cuid(),
  contactPhone: z.string().regex(/^\+91[0-9]{10}$/)
});

const validateComplaint = (req, res, next) => {
  try {
    complaintSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.errors
    });
  }
};
```

### Security Measures

#### 1. Password Security
```javascript
// Password hashing
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
```

#### 2. File Upload Security
```javascript
// Secure file upload configuration
const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  dest: process.env.UPLOAD_PATH || './uploads',
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter
});
```

#### 3. Rate Limiting
```javascript
// Rate limiting configuration
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit login attempts
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});
```

## Performance & Scalability

### Performance Optimizations

#### 1. Database Optimization
```javascript
// Connection pooling
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});

// Query optimization
const getComplaintsOptimized = async (filters) => {
  return await prisma.complaint.findMany({
    where: buildFilterClause(filters),
    select: {
      // Only select needed fields
      id: true,
      title: true,
      status: true,
      submittedBy: {
        select: { fullName: true }
      }
    },
    take: filters.limit,
    skip: filters.offset
  });
};
```

#### 2. Caching Strategy
```javascript
// In-memory caching for static data
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

const getCachedWards = async () => {
  const cacheKey = 'wards:all';
  let wards = cache.get(cacheKey);
  
  if (!wards) {
    wards = await prisma.ward.findMany({
      where: { isActive: true },
      include: { subZones: true }
    });
    cache.set(cacheKey, wards);
  }
  
  return wards;
};
```

#### 3. Async Processing
```javascript
// Background job processing
const processEmailNotification = async (complaintId) => {
  setImmediate(async () => {
    try {
      const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId },
        include: { submittedBy: true }
      });
      
      await sendEmailNotification(complaint);
    } catch (error) {
      console.error('Email notification failed:', error);
    }
  });
};
```

### Scalability Considerations

#### 1. Horizontal Scaling
```javascript
// Stateless design for horizontal scaling
const app = express();

// No server-side sessions
// JWT tokens for authentication
// Database connection pooling
// Load balancer ready
```

#### 2. Database Scaling
```sql
-- Read replicas configuration
-- Master-slave setup for read/write splitting

-- Partitioning strategy for large tables
CREATE TABLE complaints_2024 PARTITION OF complaints
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Index optimization for query performance
CREATE INDEX CONCURRENTLY idx_complaints_status_date 
ON complaints(status, submitted_on) 
WHERE status IN ('REGISTERED', 'ASSIGNED', 'IN_PROGRESS');
```

## Integration Patterns

### External Service Integration

#### 1. Email Service Integration
```javascript
// Email service abstraction
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

  async sendComplaintConfirmation(complaint, user) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Complaint Registered - ${complaint.id}`,
      template: 'complaint-confirmation',
      context: {
        userName: user.fullName,
        complaintId: complaint.id,
        complaintTitle: complaint.title
      }
    };

    return await this.transporter.sendMail(mailOptions);
  }
}
```

#### 2. File Storage Integration
```javascript
// File storage abstraction
class FileStorageService {
  constructor() {
    this.uploadPath = process.env.UPLOAD_PATH || './uploads';
  }

  async saveFile(file, category) {
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(this.uploadPath, category, filename);
    
    await fs.ensureDir(path.dirname(filepath));
    await fs.move(file.path, filepath);
    
    return {
      filename,
      filepath,
      url: `/api/uploads/${category}/${filename}`
    };
  }

  async deleteFile(filepath) {
    await fs.remove(filepath);
  }
}
```

### API Integration Patterns

#### 1. Service Layer Pattern
```javascript
// Service layer for business logic
class ComplaintService {
  constructor() {
    this.prisma = new PrismaClient();
    this.emailService = new EmailService();
    this.fileService = new FileStorageService();
  }

  async createComplaint(data, files) {
    const transaction = await this.prisma.$transaction(async (tx) => {
      // Create complaint
      const complaint = await tx.complaint.create({ data });
      
      // Handle file uploads
      if (files?.length > 0) {
        const attachments = await Promise.all(
          files.map(file => this.fileService.saveFile(file, 'complaints'))
        );
        
        await tx.attachment.createMany({
          data: attachments.map(att => ({
            complaintId: complaint.id,
            filename: att.filename,
            filepath: att.filepath,
            url: att.url
          }))
        });
      }
      
      return complaint;
    });

    // Send notification asynchronously
    await this.emailService.sendComplaintConfirmation(complaint, data.user);
    
    return complaint;
  }
}
```

This comprehensive backend architecture documentation provides a complete understanding of the system's design, implementation patterns, and best practices for maintenance and scaling.
