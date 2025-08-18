# Testing Strategy

Comprehensive testing strategy and guidelines for the E-Governance Complaint Management System, covering manual testing, automated testing, and quality assurance processes.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Testing Pyramid](#testing-pyramid)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Manual Testing](#manual-testing)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)
9. [Accessibility Testing](#accessibility-testing)
10. [Test Environment Setup](#test-environment-setup)
11. [CI/CD Integration](#cicd-integration)
12. [Bug Reporting Process](#bug-reporting-process)

## Testing Overview

### Quality Assurance Goals
- **Functionality**: Ensure all features work as designed
- **Reliability**: System performs consistently under various conditions
- **Usability**: User experience meets accessibility and usability standards
- **Performance**: Application meets speed and scalability requirements
- **Security**: Data protection and secure access controls
- **Compatibility**: Works across different browsers, devices, and operating systems

### Testing Principles
- **Shift-Left Testing**: Test early and often in the development cycle
- **Risk-Based Testing**: Focus on high-risk areas and critical user journeys
- **Automated Testing**: Maximize automation for repetitive tests
- **Exploratory Testing**: Manual testing to discover edge cases
- **User-Centric Testing**: Test from the user's perspective

## Testing Pyramid

```
                    ┌─────────────────┐
                    │   Manual Tests  │ (5-10%)
                    │   • Exploratory │
                    │   • Usability   │
                    │   • UAT         │
                    └─────────────────┘
                ┌─────────────────────────┐
                │    End-to-End Tests     │ (10-20%)
                │  • User Journeys       │
                │  • Integration Flows   │
                │  • Browser Testing     │
                └─────────────────────────┘
        ┌─────────────────────────────────────┐
        │        Integration Tests            │ (20-30%)
        │      • API Testing                 │
        │      • Component Integration       │
        │      • Database Testing            │
        └─────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│                Unit Tests                       │ (60-70%)
│              • Functions                       │
│              • Components                      │
│              • Business Logic                  │
└─────────────────────────────────────────────────┘
```

## Unit Testing

### Frontend Unit Tests (Vitest + React Testing Library)

#### Component Testing
```typescript
// ComplaintCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ComplaintCard } from '@/components/features/complaints/ComplaintCard';
import { mockComplaint } from '@/test/mocks/complaints';

describe('ComplaintCard', () => {
  const mockOnSelect = vi.fn();
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders complaint information correctly', () => {
    render(
      <ComplaintCard 
        complaint={mockComplaint}
        onSelect={mockOnSelect}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText(mockComplaint.title)).toBeInTheDocument();
    expect(screen.getByText(mockComplaint.description)).toBeInTheDocument();
    expect(screen.getByText(mockComplaint.status)).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    render(
      <ComplaintCard 
        complaint={mockComplaint}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /view details/i }));
    expect(mockOnSelect).toHaveBeenCalledWith(mockComplaint);
  });

  it('displays status badge with correct variant', () => {
    const registeredComplaint = { ...mockComplaint, status: 'REGISTERED' };
    render(<ComplaintCard complaint={registeredComplaint} />);

    const statusBadge = screen.getByText('REGISTERED');
    expect(statusBadge).toHaveClass('bg-blue-100');
  });

  it('shows action buttons for authorized users', () => {
    render(
      <ComplaintCard 
        complaint={mockComplaint}
        showActions={true}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByRole('button', { name: /update status/i })).toBeInTheDocument();
  });

  it('handles missing optional props gracefully', () => {
    render(<ComplaintCard complaint={mockComplaint} />);
    
    // Should render without crashing
    expect(screen.getByText(mockComplaint.title)).toBeInTheDocument();
  });
});
```

#### Hook Testing
```typescript
// useComplaints.test.ts
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useComplaints } from '@/hooks/useComplaints';
import { createTestWrapper } from '@/test/utils';

// Mock API responses
vi.mock('@/store/api/complaintsApi', () => ({
  useGetComplaintsQuery: vi.fn(),
  useCreateComplaintMutation: vi.fn(),
}));

describe('useComplaints', () => {
  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useComplaints(), {
      wrapper: createTestWrapper()
    });

    expect(result.current.complaints).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('updates filters correctly', () => {
    const { result } = renderHook(() => useComplaints(), {
      wrapper: createTestWrapper()
    });

    act(() => {
      result.current.updateFilters({ status: 'REGISTERED' });
    });

    expect(result.current.filters.status).toBe('REGISTERED');
  });

  it('clears filters correctly', () => {
    const { result } = renderHook(() => useComplaints(), {
      wrapper: createTestWrapper()
    });

    act(() => {
      result.current.updateFilters({ status: 'REGISTERED', type: 'WATER_SUPPLY' });
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters.status).toBe('');
    expect(result.current.filters.type).toBe('');
  });
});
```

#### Utility Function Testing
```typescript
// utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, debounce, cn } from '@/lib/utils';

describe('formatDate', () => {
  it('formats date correctly with short format', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    expect(formatDate(date, 'short')).toBe('Jan 15, 2024');
  });

  it('formats date correctly with long format', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    expect(formatDate(date, 'long')).toBe('January 15, 2024 at 10:30 AM');
  });

  it('handles string input', () => {
    expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
  });
});

describe('debounce', () => {
  it('delays function execution', async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('test');
    expect(mockFn).not.toHaveBeenCalled();

    await new Promise(resolve => setTimeout(resolve, 150));
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('cancels previous calls', async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('first');
    debouncedFn('second');
    debouncedFn('third');

    await new Promise(resolve => setTimeout(resolve, 150));
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('third');
  });
});

describe('cn (className utility)', () => {
  it('combines classes correctly', () => {
    expect(cn('px-4', 'py-2', 'bg-blue-500')).toBe('px-4 py-2 bg-blue-500');
  });

  it('handles conditional classes', () => {
    expect(cn('base-class', { 'active': true, 'disabled': false }))
      .toBe('base-class active');
  });

  it('merges Tailwind classes correctly', () => {
    expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6');
  });
});
```

### Backend Unit Tests (Jest/Vitest)

#### Controller Testing
```javascript
// complaintController.test.js
const request = require('supertest');
const app = require('../../app');
const { PrismaClient } = require('@prisma/client');

// Mock Prisma
jest.mock('@prisma/client');
const mockPrisma = {
  complaint: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  }
};

describe('Complaint Controller', () => {
  let authToken;

  beforeEach(() => {
    jest.clearAllMocks();
    authToken = generateTestToken({ userId: 'user_123', role: 'CITIZEN' });
  });

  describe('GET /api/complaints', () => {
    it('returns complaints for authenticated user', async () => {
      const mockComplaints = [
        { id: 'complaint_1', title: 'Test Complaint 1' },
        { id: 'complaint_2', title: 'Test Complaint 2' }
      ];

      mockPrisma.complaint.findMany.mockResolvedValue(mockComplaints);

      const response = await request(app)
        .get('/api/complaints')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.complaints).toEqual(mockComplaints);
    });

    it('returns 401 for unauthenticated requests', async () => {
      await request(app)
        .get('/api/complaints')
        .expect(401);
    });

    it('filters complaints by status', async () => {
      const filteredComplaints = [
        { id: 'complaint_1', title: 'Test Complaint', status: 'REGISTERED' }
      ];

      mockPrisma.complaint.findMany.mockResolvedValue(filteredComplaints);

      await request(app)
        .get('/api/complaints?status=REGISTERED')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'REGISTERED'
          })
        })
      );
    });
  });

  describe('POST /api/complaints', () => {
    const validComplaintData = {
      title: 'Test Complaint',
      description: 'Test description that is long enough',
      type: 'WATER_SUPPLY',
      wardId: 'ward_123',
      address: 'Test Address',
      contactPhone: '+91-9876543210',
      contactEmail: 'test@example.com'
    };

    it('creates complaint with valid data', async () => {
      const createdComplaint = { id: 'complaint_123', ...validComplaintData };
      mockPrisma.complaint.create.mockResolvedValue(createdComplaint);

      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validComplaintData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.complaint).toEqual(createdComplaint);
    });

    it('validates required fields', async () => {
      const invalidData = { title: 'Short' }; // Missing required fields

      await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('sanitizes input data', async () => {
      const dataWithScript = {
        ...validComplaintData,
        title: 'Test <script>alert("xss")</script> Title',
        description: 'Clean description'
      };

      mockPrisma.complaint.create.mockResolvedValue({ id: 'complaint_123' });

      await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dataWithScript);

      expect(mockPrisma.complaint.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: expect.not.stringContaining('<script>')
          })
        })
      );
    });
  });
});
```

#### Service Layer Testing
```javascript
// emailService.test.js
const EmailService = require('../../utils/emailService');
const nodemailer = require('nodemailer');

jest.mock('nodemailer');

describe('EmailService', () => {
  let emailService;
  let mockTransporter;

  beforeEach(() => {
    mockTransporter = {
      sendMail: jest.fn()
    };
    nodemailer.createTransporter.mockReturnValue(mockTransporter);
    emailService = new EmailService();
  });

  describe('sendOTP', () => {
    it('sends OTP email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await emailService.sendOTP('test@example.com', '123456');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_FROM,
        to: 'test@example.com',
        subject: 'OTP for Complaint System',
        html: expect.stringContaining('123456')
      });
      expect(result.messageId).toBe('test-id');
    });

    it('handles email sending errors', async () => {
      const error = new Error('SMTP Error');
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(emailService.sendOTP('test@example.com', '123456'))
        .rejects.toThrow('SMTP Error');
    });
  });

  describe('sendComplaintUpdate', () => {
    const mockComplaint = {
      id: 'complaint_123',
      title: 'Test Complaint',
      status: 'IN_PROGRESS'
    };

    it('sends status update email', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await emailService.sendComplaintUpdate('user@example.com', mockComplaint);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Complaint Update'),
          html: expect.stringContaining(mockComplaint.title)
        })
      );
    });
  });
});
```

## Integration Testing

### API Integration Tests
```javascript
// complaints.integration.test.js
const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../../app');

const prisma = new PrismaClient();

describe('Complaints API Integration', () => {
  let testUser, testWard, authToken;

  beforeAll(async () => {
    // Setup test data
    testWard = await prisma.ward.create({
      data: { name: 'Test Ward', description: 'Test ward for integration tests' }
    });

    testUser = await prisma.user.create({
      data: {
        email: 'integration@test.com',
        fullName: 'Integration Test User',
        password: await bcrypt.hash('password123', 12),
        role: 'CITIZEN',
        wardId: testWard.id
      }
    });

    authToken = generateTestToken({ userId: testUser.id, role: 'CITIZEN' });
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.complaint.deleteMany({ where: { submittedById: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.ward.delete({ where: { id: testWard.id } });
    await prisma.$disconnect();
  });

  describe('Complete Complaint Flow', () => {
    it('creates, retrieves, and updates complaint', async () => {
      // Step 1: Create complaint
      const complaintData = {
        title: 'Integration Test Complaint',
        description: 'This is a test complaint for integration testing',
        type: 'WATER_SUPPLY',
        wardId: testWard.id,
        address: 'Test Address, Test City',
        contactPhone: '+91-9876543210',
        contactEmail: testUser.email
      };

      const createResponse = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${authToken}`)
        .send(complaintData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      const createdComplaint = createResponse.body.data.complaint;
      expect(createdComplaint.title).toBe(complaintData.title);
      expect(createdComplaint.status).toBe('REGISTERED');

      // Step 2: Retrieve complaint
      const getResponse = await request(app)
        .get(`/api/complaints/${createdComplaint.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.data.complaint.id).toBe(createdComplaint.id);

      // Step 3: Update complaint status (requires ward officer role)
      const wardOfficerToken = generateTestToken({ 
        userId: 'officer_123', 
        role: 'WARD_OFFICER',
        wardId: testWard.id 
      });

      const updateResponse = await request(app)
        .put(`/api/complaints/${createdComplaint.id}/status`)
        .set('Authorization', `Bearer ${wardOfficerToken}`)
        .send({ 
          status: 'ASSIGNED', 
          comment: 'Assigned to maintenance team' 
        })
        .expect(200);

      expect(updateResponse.body.data.complaint.status).toBe('ASSIGNED');

      // Step 4: Verify status history
      const historyResponse = await request(app)
        .get(`/api/complaints/${createdComplaint.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const statusLogs = historyResponse.body.data.complaint.statusLogs;
      expect(statusLogs).toHaveLength(2); // REGISTERED and ASSIGNED
      expect(statusLogs[1].toStatus).toBe('ASSIGNED');
    });
  });

  describe('Role-based Access Control', () => {
    let citizenComplaint;

    beforeEach(async () => {
      // Create a test complaint
      citizenComplaint = await prisma.complaint.create({
        data: {
          title: 'Citizen Test Complaint',
          description: 'Test complaint description',
          type: 'ELECTRICITY',
          status: 'REGISTERED',
          submittedById: testUser.id,
          wardId: testWard.id,
          address: 'Test Address',
          contactPhone: '+91-9876543210',
          contactEmail: testUser.email
        }
      });
    });

    afterEach(async () => {
      await prisma.complaint.delete({ where: { id: citizenComplaint.id } });
    });

    it('allows citizens to view their own complaints', async () => {
      await request(app)
        .get(`/api/complaints/${citizenComplaint.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('prevents citizens from updating complaint status', async () => {
      await request(app)
        .put(`/api/complaints/${citizenComplaint.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'IN_PROGRESS' })
        .expect(403);
    });

    it('allows ward officers to update complaints in their ward', async () => {
      const wardOfficerToken = generateTestToken({ 
        userId: 'officer_123', 
        role: 'WARD_OFFICER',
        wardId: testWard.id 
      });

      await request(app)
        .put(`/api/complaints/${citizenComplaint.id}/status`)
        .set('Authorization', `Bearer ${wardOfficerToken}`)
        .send({ status: 'IN_PROGRESS' })
        .expect(200);
    });

    it('prevents ward officers from updating complaints in other wards', async () => {
      const otherWardOfficerToken = generateTestToken({ 
        userId: 'officer_456', 
        role: 'WARD_OFFICER',
        wardId: 'other_ward_id' 
      });

      await request(app)
        .put(`/api/complaints/${citizenComplaint.id}/status`)
        .set('Authorization', `Bearer ${otherWardOfficerToken}`)
        .send({ status: 'IN_PROGRESS' })
        .expect(403);
    });
  });
});
```

### Database Integration Tests
```javascript
// database.integration.test.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Database Integration', () => {
  describe('User Model', () => {
    it('creates user with required fields', async () => {
      const userData = {
        email: 'dbtest@example.com',
        fullName: 'Database Test User',
        password: 'hashedpassword123',
        role: 'CITIZEN'
      };

      const user = await prisma.user.create({ data: userData });

      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.isActive).toBe(true);
      expect(user.language).toBe('en'); // default value

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('enforces unique email constraint', async () => {
      const userData = {
        email: 'unique@example.com',
        fullName: 'Test User',
        password: 'password123',
        role: 'CITIZEN'
      };

      const user1 = await prisma.user.create({ data: userData });

      await expect(
        prisma.user.create({ data: userData })
      ).rejects.toThrow(/Unique constraint/);

      // Cleanup
      await prisma.user.delete({ where: { id: user1.id } });
    });
  });

  describe('Complaint Model', () => {
    let testUser, testWard;

    beforeEach(async () => {
      testWard = await prisma.ward.create({
        data: { name: 'Test Ward DB', description: 'Test ward' }
      });

      testUser = await prisma.user.create({
        data: {
          email: 'complainant@test.com',
          fullName: 'Test Complainant',
          password: 'password123',
          role: 'CITIZEN',
          wardId: testWard.id
        }
      });
    });

    afterEach(async () => {
      await prisma.complaint.deleteMany({ where: { submittedById: testUser.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
      await prisma.ward.delete({ where: { id: testWard.id } });
    });

    it('creates complaint with all relationships', async () => {
      const complaintData = {
        title: 'Test Complaint',
        description: 'Test complaint description',
        type: 'WATER_SUPPLY',
        status: 'REGISTERED',
        submittedById: testUser.id,
        wardId: testWard.id,
        address: 'Test Address',
        contactPhone: '+91-9876543210',
        contactEmail: testUser.email
      };

      const complaint = await prisma.complaint.create({
        data: complaintData,
        include: {
          submittedBy: true,
          ward: true
        }
      });

      expect(complaint.id).toBeDefined();
      expect(complaint.submittedBy.id).toBe(testUser.id);
      expect(complaint.ward.id).toBe(testWard.id);
      expect(complaint.status).toBe('REGISTERED');
    });

    it('updates complaint status and creates status log', async () => {
      const complaint = await prisma.complaint.create({
        data: {
          title: 'Status Test Complaint',
          description: 'Test status update',
          type: 'ELECTRICITY',
          status: 'REGISTERED',
          submittedById: testUser.id,
          wardId: testWard.id,
          address: 'Test Address',
          contactPhone: '+91-9876543210',
          contactEmail: testUser.email
        }
      });

      // Update status
      await prisma.complaint.update({
        where: { id: complaint.id },
        data: { status: 'ASSIGNED' }
      });

      // Create status log
      await prisma.statusLog.create({
        data: {
          complaintId: complaint.id,
          fromStatus: 'REGISTERED',
          toStatus: 'ASSIGNED',
          comment: 'Assigned to maintenance team',
          changedById: testUser.id
        }
      });

      // Verify status log creation
      const statusLogs = await prisma.statusLog.findMany({
        where: { complaintId: complaint.id }
      });

      expect(statusLogs).toHaveLength(1);
      expect(statusLogs[0].toStatus).toBe('ASSIGNED');
    });
  });
});
```

## End-to-End Testing

### Cypress E2E Tests

#### User Authentication Flow
```typescript
// cypress/e2e/auth-flow.cy.ts
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('User Login', () => {
    it('allows valid user to login', () => {
      cy.get('[data-testid="login-button"]').click();
      
      cy.get('[data-testid="email-input"]')
        .type('citizen@example.com');
      
      cy.get('[data-testid="password-input"]')
        .type('citizen123');
      
      cy.get('[data-testid="submit-login"]').click();
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard/citizen');
      
      // Should display user name
      cy.get('[data-testid="user-menu"]')
        .should('contain', 'Test Citizen');
      
      // Should show navigation menu
      cy.get('[data-testid="main-nav"]')
        .should('be.visible');
    });

    it('shows error for invalid credentials', () => {
      cy.get('[data-testid="login-button"]').click();
      
      cy.get('[data-testid="email-input"]')
        .type('invalid@example.com');
      
      cy.get('[data-testid="password-input"]')
        .type('wrongpassword');
      
      cy.get('[data-testid="submit-login"]').click();
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Invalid credentials');
      
      // Should remain on login page
      cy.url().should('include', '/login');
    });

    it('validates required fields', () => {
      cy.get('[data-testid="login-button"]').click();
      
      cy.get('[data-testid="submit-login"]').click();
      
      cy.get('[data-testid="email-error"]')
        .should('contain', 'Email is required');
      
      cy.get('[data-testid="password-error"]')
        .should('contain', 'Password is required');
    });
  });

  describe('User Registration', () => {
    it('allows new user registration', () => {
      cy.get('[data-testid="register-button"]').click();
      
      const timestamp = Date.now();
      const testEmail = `newuser${timestamp}@example.com`;
      
      cy.get('[data-testid="fullname-input"]')
        .type('New Test User');
      
      cy.get('[data-testid="email-input"]')
        .type(testEmail);
      
      cy.get('[data-testid="phone-input"]')
        .type('+91-9876543210');
      
      cy.get('[data-testid="password-input"]')
        .type('NewUser123!');
      
      cy.get('[data-testid="confirm-password-input"]')
        .type('NewUser123!');
      
      cy.get('[data-testid="ward-select"]')
        .select('Ward 12 - Ernakulam');
      
      cy.get('[data-testid="submit-registration"]').click();
      
      // Should show success message
      cy.get('[data-testid="success-message"]')
        .should('contain', 'Registration successful');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('validates password requirements', () => {
      cy.get('[data-testid="register-button"]').click();
      
      cy.get('[data-testid="password-input"]')
        .type('weak');
      
      cy.get('[data-testid="password-error"]')
        .should('contain', 'Password must be at least 8 characters');
      
      cy.get('[data-testid="password-input"]')
        .clear()
        .type('NoSpecialChar123');
      
      cy.get('[data-testid="password-error"]')
        .should('contain', 'Password must contain special character');
    });
  });

  describe('OTP Verification', () => {
    it('handles OTP login flow', () => {
      cy.get('[data-testid="login-button"]').click();
      
      cy.get('[data-testid="otp-login-tab"]').click();
      
      cy.get('[data-testid="email-input"]')
        .type('citizen@example.com');
      
      cy.get('[data-testid="send-otp-button"]').click();
      
      cy.get('[data-testid="otp-input"]')
        .should('be.visible');
      
      // Mock OTP (in real test, would need to handle actual OTP)
      cy.get('[data-testid="otp-input"]')
        .type('123456');
      
      cy.get('[data-testid="verify-otp-button"]').click();
      
      // Should redirect to dashboard on success
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Logout', () => {
    it('logs out user and redirects to home', () => {
      // Login first
      cy.login('citizen@example.com', 'citizen123');
      
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();
      
      // Should redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Should not show authenticated elements
      cy.get('[data-testid="user-menu"]')
        .should('not.exist');
      
      // Should show login button
      cy.get('[data-testid="login-button"]')
        .should('be.visible');
    });
  });
});
```

#### Complaint Management Flow
```typescript
// cypress/e2e/complaint-flow.cy.ts
describe('Complaint Management Flow', () => {
  beforeEach(() => {
    cy.login('citizen@example.com', 'citizen123');
  });

  describe('Create Complaint', () => {
    it('creates a new complaint successfully', () => {
      cy.visit('/complaints/create');
      
      // Fill complaint form
      cy.get('[data-testid="complaint-title"]')
        .type('Water supply issue in my area');
      
      cy.get('[data-testid="complaint-description"]')
        .type('There has been no water supply for the past 3 days in our building. This is causing significant inconvenience to all residents.');
      
      cy.get('[data-testid="complaint-type"]')
        .select('WATER_SUPPLY');
      
      cy.get('[data-testid="priority-select"]')
        .select('HIGH');
      
      cy.get('[data-testid="ward-select"]')
        .select('Ward 12 - Ernakulam');
      
      cy.get('[data-testid="area-input"]')
        .type('Kadavanthra');
      
      cy.get('[data-testid="address-input"]')
        .type('Building A, Krishna Nagar, Near State Bank');
      
      cy.get('[data-testid="landmark-input"]')
        .type('Opposite to State Bank ATM');
      
      cy.get('[data-testid="contact-phone"]')
        .type('+91-9876543210');
      
      cy.get('[data-testid="contact-email"]')
        .type('citizen@example.com');
      
      // Upload attachment
      cy.get('[data-testid="file-upload"]')
        .selectFile('cypress/fixtures/images/sample1.jpg');
      
      // Submit complaint
      cy.get('[data-testid="submit-complaint"]').click();
      
      // Should show success message
      cy.get('[data-testid="success-toast"]')
        .should('contain', 'Complaint submitted successfully');
      
      // Should redirect to complaint details
      cy.url().should('include', '/complaints/');
      
      // Should display complaint information
      cy.get('[data-testid="complaint-title"]')
        .should('contain', 'Water supply issue in my area');
      
      cy.get('[data-testid="complaint-status"]')
        .should('contain', 'REGISTERED');
    });

    it('validates required fields', () => {
      cy.visit('/complaints/create');
      
      cy.get('[data-testid="submit-complaint"]').click();
      
      // Should show validation errors
      cy.get('[data-testid="title-error"]')
        .should('contain', 'Title is required');
      
      cy.get('[data-testid="description-error"]')
        .should('contain', 'Description is required');
      
      cy.get('[data-testid="type-error"]')
        .should('contain', 'Complaint type is required');
    });

    it('handles file upload validation', () => {
      cy.visit('/complaints/create');
      
      // Try to upload invalid file type
      cy.get('[data-testid="file-upload"]')
        .selectFile('cypress/fixtures/invalid-file.txt');
      
      cy.get('[data-testid="file-error"]')
        .should('contain', 'Invalid file type');
      
      // Try to upload oversized file
      cy.get('[data-testid="file-upload"]')
        .selectFile('cypress/fixtures/large-file.jpg');
      
      cy.get('[data-testid="file-error"]')
        .should('contain', 'File size too large');
    });
  });

  describe('View Complaints', () => {
    it('displays complaints list', () => {
      cy.visit('/complaints');
      
      // Should display complaints
      cy.get('[data-testid="complaints-list"]')
        .should('be.visible');
      
      // Should display complaint cards
      cy.get('[data-testid="complaint-card"]')
        .should('have.length.greaterThan', 0);
      
      // Should display filters
      cy.get('[data-testid="status-filter"]')
        .should('be.visible');
      
      cy.get('[data-testid="type-filter"]')
        .should('be.visible');
    });

    it('filters complaints by status', () => {
      cy.visit('/complaints');
      
      // Apply status filter
      cy.get('[data-testid="status-filter"]')
        .select('REGISTERED');
      
      // Should update URL
      cy.url().should('include', 'status=REGISTERED');
      
      // Should filter complaints
      cy.get('[data-testid="complaint-card"]')
        .each(($card) => {
          cy.wrap($card)
            .find('[data-testid="complaint-status"]')
            .should('contain', 'REGISTERED');
        });
    });

    it('searches complaints by text', () => {
      cy.visit('/complaints');
      
      cy.get('[data-testid="search-input"]')
        .type('water supply');
      
      // Should update URL
      cy.url().should('include', 'search=water%20supply');
      
      // Should filter results
      cy.get('[data-testid="complaint-card"]')
        .should('contain.text', 'water supply');
    });
  });

  describe('Complaint Details', () => {
    it('displays complaint details', () => {
      // Navigate to specific complaint
      cy.visit('/complaints');
      
      cy.get('[data-testid="complaint-card"]')
        .first()
        .click();
      
      // Should display detailed information
      cy.get('[data-testid="complaint-title"]')
        .should('be.visible');
      
      cy.get('[data-testid="complaint-description"]')
        .should('be.visible');
      
      cy.get('[data-testid="complaint-status"]')
        .should('be.visible');
      
      cy.get('[data-testid="submitted-date"]')
        .should('be.visible');
      
      cy.get('[data-testid="contact-info"]')
        .should('be.visible');
      
      // Should show status history
      cy.get('[data-testid="status-history"]')
        .should('be.visible');
    });

    it('displays attachments', () => {
      cy.visit('/complaints/complaint-with-attachments');
      
      cy.get('[data-testid="attachments-section"]')
        .should('be.visible');
      
      cy.get('[data-testid="attachment-item"]')
        .should('have.length.greaterThan', 0);
      
      // Should allow downloading attachments
      cy.get('[data-testid="download-attachment"]')
        .first()
        .should('have.attr', 'href');
    });
  });

  describe('Feedback Submission', () => {
    it('allows feedback on resolved complaints', () => {
      cy.visit('/complaints/resolved-complaint');
      
      // Should show feedback form for resolved complaints
      cy.get('[data-testid="feedback-section"]')
        .should('be.visible');
      
      // Submit feedback
      cy.get('[data-testid="rating-5"]').click();
      
      cy.get('[data-testid="feedback-comment"]')
        .type('Excellent service! The issue was resolved quickly and professionally.');
      
      cy.get('[data-testid="submit-feedback"]').click();
      
      // Should show success message
      cy.get('[data-testid="success-toast"]')
        .should('contain', 'Feedback submitted successfully');
      
      // Should display submitted feedback
      cy.get('[data-testid="submitted-feedback"]')
        .should('be.visible')
        .and('contain', 'Excellent service!');
    });
  });
});
```

#### Guest User Flow
```typescript
// cypress/e2e/guest-complaint-flow.cy.ts
describe('Guest Complaint Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Guest Complaint Submission', () => {
    it('allows anonymous complaint submission', () => {
      // Navigate to guest complaint form
      cy.get('[data-testid="submit-complaint-guest"]').click();
      
      // Fill personal information
      cy.get('[data-testid="guest-name"]')
        .type('Anonymous User');
      
      cy.get('[data-testid="guest-email"]')
        .type('anonymous@example.com');
      
      cy.get('[data-testid="guest-phone"]')
        .type('+91-9876543210');
      
      // Fill complaint details
      cy.get('[data-testid="complaint-type"]')
        .select('GARBAGE_COLLECTION');
      
      cy.get('[data-testid="complaint-description"]')
        .type('Garbage has not been collected for the past 5 days in our street. This is creating unhygienic conditions.');
      
      cy.get('[data-testid="priority-select"]')
        .select('HIGH');
      
      // Location details
      cy.get('[data-testid="ward-select"]')
        .select('Ward 12 - Ernakulam');
      
      cy.get('[data-testid="area-input"]')
        .type('Kaloor');
      
      cy.get('[data-testid="address-input"]')
        .type('Main Road, near Community Center');
      
      // Submit complaint
      cy.get('[data-testid="submit-guest-complaint"]').click();
      
      // Should show OTP verification modal
      cy.get('[data-testid="otp-modal"]')
        .should('be.visible');
      
      cy.get('[data-testid="otp-sent-message"]')
        .should('contain', 'OTP sent to anonymous@example.com');
      
      // Enter OTP (mock)
      cy.get('[data-testid="otp-input"]')
        .type('123456');
      
      cy.get('[data-testid="verify-otp-button"]').click();
      
      // Should show success with tracking number
      cy.get('[data-testid="success-modal"]')
        .should('be.visible');
      
      cy.get('[data-testid="tracking-number"]')
        .should('match', /CSC\d{13}/);
      
      // Should offer account creation
      cy.get('[data-testid="create-account-offer"]')
        .should('be.visible');
    });

    it('handles OTP resend functionality', () => {
      // Submit guest complaint first
      cy.submitGuestComplaint();
      
      // Should show resend option after timeout
      cy.wait(30000); // Wait for resend timeout
      
      cy.get('[data-testid="resend-otp-button"]')
        .should('be.enabled')
        .click();
      
      cy.get('[data-testid="otp-resent-message"]')
        .should('contain', 'OTP resent successfully');
    });
  });

  describe('Complaint Tracking', () => {
    it('allows tracking complaint with tracking number', () => {
      cy.visit('/track');
      
      cy.get('[data-testid="tracking-number-input"]')
        .type('CSC2024011501234');
      
      cy.get('[data-testid="email-input"]')
        .type('anonymous@example.com');
      
      cy.get('[data-testid="track-complaint-button"]').click();
      
      // Should display complaint details
      cy.get('[data-testid="complaint-details"]')
        .should('be.visible');
      
      cy.get('[data-testid="complaint-status"]')
        .should('be.visible');
      
      // Should show status history
      cy.get('[data-testid="status-timeline"]')
        .should('be.visible');
      
      cy.get('[data-testid="status-step"]')
        .should('have.length.greaterThan', 0);
    });

    it('handles invalid tracking number', () => {
      cy.visit('/track');
      
      cy.get('[data-testid="tracking-number-input"]')
        .type('INVALID123');
      
      cy.get('[data-testid="email-input"]')
        .type('test@example.com');
      
      cy.get('[data-testid="track-complaint-button"]').click();
      
      cy.get('[data-testid="error-message"]')
        .should('contain', 'Complaint not found');
    });
  });

  describe('Guest to User Conversion', () => {
    it('converts guest to registered user', () => {
      // Submit guest complaint first
      cy.submitGuestComplaint();
      
      // Click create account option
      cy.get('[data-testid="create-account-button"]').click();
      
      // Should pre-fill information
      cy.get('[data-testid="email-input"]')
        .should('have.value', 'anonymous@example.com');
      
      cy.get('[data-testid="fullname-input"]')
        .should('have.value', 'Anonymous User');
      
      // Add password
      cy.get('[data-testid="password-input"]')
        .type('NewUser123!');
      
      cy.get('[data-testid="confirm-password-input"]')
        .type('NewUser123!');
      
      cy.get('[data-testid="create-account-submit"]').click();
      
      // Should create account and login
      cy.get('[data-testid="success-message"]')
        .should('contain', 'Account created successfully');
      
      // Should redirect to citizen dashboard
      cy.url().should('include', '/dashboard/citizen');
      
      // Should show converted complaint in dashboard
      cy.get('[data-testid="recent-complaints"]')
        .should('contain', 'Garbage has not been collected');
    });
  });
});
```

## Manual Testing

### Manual Test Cases

#### Authentication Test Cases

**TC-AUTH-001: User Login with Valid Credentials**
- **Objective**: Verify user can login with valid email and password
- **Pre-conditions**: User account exists in system
- **Steps**:
  1. Navigate to login page
  2. Enter valid email address
  3. Enter valid password
  4. Click "Login" button
- **Expected Result**: User is redirected to appropriate dashboard based on role
- **Test Data**: 
  - Email: citizen@example.com
  - Password: citizen123

**TC-AUTH-002: Login with Invalid Credentials**
- **Objective**: Verify system handles invalid login attempts
- **Steps**:
  1. Navigate to login page
  2. Enter invalid email/password combination
  3. Click "Login" button
- **Expected Result**: Error message displayed, user remains on login page
- **Test Data**: 
  - Email: invalid@example.com
  - Password: wrongpassword

**TC-AUTH-003: OTP Login Flow**
- **Objective**: Verify OTP-based authentication works correctly
- **Steps**:
  1. Navigate to login page
  2. Switch to "OTP Login" tab
  3. Enter valid email address
  4. Click "Send OTP" button
  5. Check email for OTP code
  6. Enter OTP code
  7. Click "Verify" button
- **Expected Result**: User is logged in and redirected to dashboard

#### Complaint Management Test Cases

**TC-COMP-001: Create New Complaint**
- **Objective**: Verify authenticated user can create a new complaint
- **Pre-conditions**: User is logged in as citizen
- **Steps**:
  1. Navigate to "Create Complaint" page
  2. Fill all required fields:
     - Title: "Street light not working"
     - Description: "The street light near my house has been non-functional for 3 days"
     - Type: "STREET_LIGHTING"
     - Ward: Select appropriate ward
     - Address: Complete address
     - Contact information
  3. Upload supporting image/document
  4. Click "Submit Complaint"
- **Expected Result**: 
  - Complaint is created successfully
  - Unique complaint ID is generated
  - User is redirected to complaint details page
  - Email notification is sent

**TC-COMP-002: Guest Complaint Submission**
- **Objective**: Verify anonymous users can submit complaints
- **Steps**:
  1. Navigate to guest complaint form
  2. Fill personal information
  3. Fill complaint details
  4. Submit complaint
  5. Verify email OTP
  6. Complete submission
- **Expected Result**: 
  - Complaint is submitted
  - Tracking number is provided
  - Option to create account is offered

**TC-COMP-003: Complaint Status Update**
- **Objective**: Verify authorized users can update complaint status
- **Pre-conditions**: User is logged in as ward officer or admin
- **Steps**:
  1. Navigate to complaint details
  2. Click "Update Status" button
  3. Select new status from dropdown
  4. Add status comment
  5. Click "Update" button
- **Expected Result**: 
  - Status is updated
  - Status history is recorded
  - Notification is sent to complaint submitter

#### Admin Functions Test Cases

**TC-ADMIN-001: User Management**
- **Objective**: Verify admin can manage user accounts
- **Pre-conditions**: User is logged in as administrator
- **Steps**:
  1. Navigate to "User Management" section
  2. Click "Add New User" button
  3. Fill user details:
     - Full Name: "Test Ward Officer"
     - Email: "wardofficer@test.com"
     - Role: "WARD_OFFICER"
     - Ward: Select ward
  4. Click "Create User" button
- **Expected Result**: 
  - User account is created
  - Password setup email is sent
  - User appears in users list

**TC-ADMIN-002: System Analytics**
- **Objective**: Verify admin can view system analytics
- **Steps**:
  1. Navigate to "Analytics" section
  2. Select date range
  3. Apply filters for specific data
  4. Export report
- **Expected Result**: 
  - Analytics data is displayed correctly
  - Charts and graphs are rendered
  - Export functionality works

### Exploratory Testing Guidelines

#### Focus Areas for Exploratory Testing

**User Interface Testing**
- Test responsive design across different screen sizes
- Verify color contrast and accessibility features
- Test keyboard navigation functionality
- Check for broken links or images
- Validate form behavior with edge cases

**Data Validation Testing**
- Test input fields with boundary values
- Try SQL injection and XSS attempts
- Test file upload with various file types and sizes
- Verify date/time handling across time zones
- Test special characters in text fields

**Integration Points Testing**
- Test email delivery and templates
- Verify file upload and download functionality
- Test API error handling
- Check session timeout behavior
- Verify concurrent user scenarios

#### Exploratory Test Charters

**Charter 1: Mobile Responsiveness**
- **Mission**: Explore the application's behavior on mobile devices
- **Duration**: 2 hours
- **Focus Areas**:
  - Touch interactions
  - Screen orientation changes
  - Mobile-specific features
  - Performance on mobile networks

**Charter 2: Edge Case Scenarios**
- **Mission**: Test unusual or extreme use cases
- **Duration**: 3 hours
- **Focus Areas**:
  - Very long text inputs
  - Special characters and unicode
  - Network interruptions
  - Concurrent operations

**Charter 3: User Workflow Validation**
- **Mission**: Test complete user journeys end-to-end
- **Duration**: 4 hours
- **Focus Areas**:
  - Guest to registered user conversion
  - Complaint lifecycle from creation to closure
  - Multi-role interactions
  - Cross-browser compatibility

## Performance Testing

### Load Testing Strategy

#### Test Scenarios
1. **Normal Load**: 50 concurrent users
2. **Peak Load**: 200 concurrent users
3. **Stress Load**: 500 concurrent users
4. **Spike Load**: Sudden increase to 1000 users

#### Key Performance Metrics
- **Response Time**: < 2 seconds for 95% of requests
- **Throughput**: 1000 requests per minute minimum
- **CPU Usage**: < 80% under normal load
- **Memory Usage**: < 1GB under normal load
- **Database Connections**: < 50% of pool size

#### Load Testing Tools
- **Artillery.js**: API load testing
- **Lighthouse**: Frontend performance auditing
- **K6**: Comprehensive load testing

### Performance Test Cases

**PT-001: API Endpoint Load Test**
```javascript
// artillery-config.yml
config:
  target: 'http://localhost:4005'
  phases:
    - duration: 60
      arrivalRate: 5
    - duration: 120
      arrivalRate: 10
    - duration: 60
      arrivalRate: 20
scenarios:
  - name: "Complaint API Load Test"
    requests:
      - get:
          url: "/api/complaints"
          headers:
            Authorization: "Bearer {{token}}"
      - post:
          url: "/api/complaints"
          headers:
            Authorization: "Bearer {{token}}"
          json:
            title: "Load Test Complaint"
            description: "This is a load test complaint"
            type: "WATER_SUPPLY"
```

**PT-002: Frontend Performance Test**
```javascript
// lighthouse-performance.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {logLevel: 'info', output: 'html', port: chrome.port};
  
  const runnerResult = await lighthouse('http://localhost:3000', options);
  
  // Performance thresholds
  const thresholds = {
    'first-contentful-paint': 1500,
    'largest-contentful-paint': 2500,
    'interactive': 3000,
    'cumulative-layout-shift': 0.1,
  };
  
  // Verify performance metrics
  Object.entries(thresholds).forEach(([metric, threshold]) => {
    const value = runnerResult.lhr.audits[metric].numericValue;
    console.log(`${metric}: ${value} (threshold: ${threshold})`);
  });
  
  await chrome.kill();
}
```

## Security Testing

### Security Test Categories

#### Authentication & Authorization
- Password strength validation
- Session management security
- JWT token security
- Role-based access control
- Multi-factor authentication

#### Input Validation
- SQL injection prevention
- XSS attack prevention
- CSRF protection
- File upload security
- Input sanitization

#### Data Protection
- Sensitive data encryption
- PII protection
- Database security
- API security
- Communication security

### Security Test Cases

**ST-001: SQL Injection Test**
- **Objective**: Verify application is protected against SQL injection
- **Test Data**: 
  ```sql
  ' OR '1'='1' --
  '; DROP TABLE users; --
  ' UNION SELECT * FROM users --
  ```
- **Test Steps**:
  1. Enter malicious SQL in form fields
  2. Submit form
  3. Verify application doesn't execute SQL
- **Expected Result**: Input is sanitized, no SQL execution

**ST-002: XSS Protection Test**
- **Objective**: Verify protection against cross-site scripting
- **Test Data**: 
  ```html
  <script>alert('XSS')</script>
  <img src="x" onerror="alert('XSS')">
  javascript:alert('XSS')
  ```
- **Test Steps**:
  1. Enter XSS payloads in text fields
  2. Submit and view rendered content
  3. Verify scripts don't execute
- **Expected Result**: Malicious scripts are sanitized or encoded

**ST-003: Authentication Security Test**
- **Objective**: Verify authentication mechanism security
- **Test Steps**:
  1. Test password brute force protection
  2. Verify session timeout
  3. Test concurrent session handling
  4. Check password reset security
- **Expected Result**: Strong authentication security measures are in place

## Accessibility Testing

### WCAG 2.1 Compliance Testing

#### Level A Requirements
- Images have alt text
- Form elements have labels
- Heading structure is logical
- Color is not the only way to convey information

#### Level AA Requirements
- Color contrast ratio ≥ 4.5:1 for normal text
- Color contrast ratio ≥ 3:1 for large text
- Text can be resized up to 200% without assistive technology
- All functionality is available via keyboard

### Accessibility Test Cases

**AT-001: Keyboard Navigation**
- **Objective**: Verify all functionality is accessible via keyboard
- **Test Steps**:
  1. Navigate page using only Tab, Shift+Tab, Enter, Space, Arrow keys
  2. Verify all interactive elements are reachable
  3. Check focus indicators are visible
  4. Test modal and dropdown navigation
- **Expected Result**: Complete functionality available via keyboard

**AT-002: Screen Reader Compatibility**
- **Objective**: Verify compatibility with screen readers
- **Tools**: NVDA, JAWS, VoiceOver
- **Test Steps**:
  1. Navigate page with screen reader
  2. Verify all content is announced
  3. Check ARIA labels and descriptions
  4. Test form field associations
- **Expected Result**: All content is accessible to screen readers

**AT-003: Color Contrast Validation**
- **Objective**: Verify sufficient color contrast
- **Tools**: WebAIM Contrast Checker, axe DevTools
- **Test Steps**:
  1. Check all text/background color combinations
  2. Verify interactive element contrast
  3. Test focus and hover states
- **Expected Result**: All color combinations meet WCAG standards

## Test Environment Setup

### Development Environment
```bash
# Setup test database
npm run db:setup:test

# Install test dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration
```

### Staging Environment
```bash
# Deploy to staging
npm run deploy:staging

# Run E2E tests against staging
npm run test:e2e:staging

# Performance testing
npm run test:performance:staging
```

### Test Data Management
```javascript
// test-data-factory.js
const createTestUser = (overrides = {}) => ({
  id: 'test_user_123',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'CITIZEN',
  isActive: true,
  ...overrides
});

const createTestComplaint = (overrides = {}) => ({
  id: 'test_complaint_123',
  title: 'Test Complaint',
  description: 'Test complaint description',
  type: 'WATER_SUPPLY',
  status: 'REGISTERED',
  submittedById: 'test_user_123',
  wardId: 'test_ward_123',
  ...overrides
});
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
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
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/complaint_test
      
      - name: Start application
        run: |
          npm run build
          npm start &
          sleep 10
      
      - name: Run E2E tests
        uses: cypress-io/github-action@v6
        with:
          wait-on: 'http://localhost:3000'
          wait-on-timeout: 120
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results
          path: |
            cypress/screenshots/
            cypress/videos/
            coverage/
```

### Test Coverage Requirements
- **Unit Tests**: Minimum 80% code coverage
- **Integration Tests**: Cover all API endpoints
- **E2E Tests**: Cover critical user journeys
- **Manual Tests**: Cover edge cases and exploratory scenarios

## Bug Reporting Process

### Bug Report Template
```markdown
## Bug Report

**Title**: [Brief description of the issue]

**Environment**:
- Browser: [Chrome 120.0, Firefox 119.0, etc.]
- OS: [Windows 11, macOS 14, Ubuntu 22.04]
- Device: [Desktop, Mobile, Tablet]
- Screen Resolution: [1920x1080, etc.]

**User Role**: [Guest, Citizen, Ward Officer, Maintenance Team, Admin]

**Severity**: [Critical, High, Medium, Low]
- Critical: System crash, data loss, security vulnerability
- High: Major functionality broken, blocking user workflow
- Medium: Minor functionality issue, workaround available
- Low: Cosmetic issue, enhancement request

**Priority**: [P1, P2, P3, P4]

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Result**: 
[What should happen]

**Actual Result**: 
[What actually happened]

**Screenshots/Videos**: 
[Attach relevant media]

**Additional Information**:
- Console errors: [Browser console output]
- Network requests: [Failed API calls]
- User account used: [test@example.com]

**Workaround**: 
[If available]
```

### Bug Triage Process
1. **Initial Review**: QA team reviews and categorizes bug
2. **Severity Assessment**: Determine impact and priority
3. **Assignment**: Assign to appropriate developer
4. **Development**: Fix implementation and testing
5. **Verification**: QA verifies fix in staging environment
6. **Closure**: Mark as resolved when deployed to production

### Bug Tracking Metrics
- **Discovery Rate**: Bugs found per testing hour
- **Escape Rate**: Bugs found in production vs. pre-release
- **Resolution Time**: Average time from report to fix
- **Reopen Rate**: Percentage of bugs that reopen after fix

This comprehensive testing strategy ensures high-quality software delivery through a combination of automated and manual testing approaches, covering functionality, performance, security, and accessibility requirements.
