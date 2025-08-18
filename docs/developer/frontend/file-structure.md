# Frontend File Structure

Comprehensive guide to the frontend file organization and structure of the E-Governance Complaint Management System built with React, TypeScript, and Vite.

## Table of Contents

1. [Overview](#overview)
2. [Root Directory Structure](#root-directory-structure)
3. [Client Directory Breakdown](#client-directory-breakdown)
4. [Component Organization](#component-organization)
5. [State Management Structure](#state-management-structure)
6. [Routing Structure](#routing-structure)
7. [Asset Organization](#asset-organization)
8. [Configuration Files](#configuration-files)
9. [File Naming Conventions](#file-naming-conventions)
10. [Code Organization Patterns](#code-organization-patterns)

## Overview

The frontend follows a feature-based architecture with clear separation of concerns. The structure is designed for scalability, maintainability, and developer experience.

### Architecture Principles
- **Feature-Based Organization**: Code organized by features rather than technical layers
- **Atomic Design**: UI components built from atoms to organisms
- **Separation of Concerns**: Clear boundaries between presentation, logic, and data
- **Type Safety**: Full TypeScript coverage with strict type checking

## Root Directory Structure

```
complaint-management-system/
├── 📁 client/                   # Frontend application source code
│   ├── 📁 components/          # Reusable UI components
│   ├── 📁 pages/               # Route components (screens)
│   ├── 📁 store/               # Redux state management
│   ├── 📁 hooks/               # Custom React hooks
│   ├── 📁 lib/                 # Utility libraries
│   ├── 📁 utils/               # Utility functions
│   ├── 📁 contexts/            # React contexts
│   ├── 📁 assets/              # Static assets
│   ├── 📁 styles/              # Global styles
│   ├── 📁 types/               # TypeScript type definitions
│   ├── 📁 __tests__/           # Test files
│   ├── 📄 App.tsx              # Main application component
│   ├── 📄 main.tsx             # Application entry point
│   ├��─ 📄 global.css           # Global CSS and Tailwind imports
│   └── 📄 vite-env.d.ts        # Vite environment types
├── 📁 public/                  # Static public assets
│   ├── 📄 index.html           # HTML template
│   ├── 📄 favicon.ico          # Application favicon
│   ├── 📄 robots.txt           # SEO robots file
│   └── 📄 manifest.json        # PWA manifest
├── 📁 shared/                  # Shared types between client/server
│   └── 📄 api.ts               # API interface definitions
├── 📄 package.json             # Project dependencies and scripts
├── 📄 tsconfig.json            # TypeScript configuration
├── 📄 tailwind.config.ts       # TailwindCSS configuration
├── 📄 vite.config.ts           # Vite build configuration
├── 📄 vitest.config.ts         # Vitest testing configuration
└── 📄 components.json          # Shadcn/UI components registry
```

## Client Directory Breakdown

### Components (`client/components/`)

The components directory follows atomic design principles with clear hierarchical organization.

```
client/components/
├── 📁 ui/                      # Atomic components (Design System)
│   ├── 📄 button.tsx          # Base button component
│   ├── 📄 input.tsx           # Form input component
│   ├── 📄 card.tsx            # Container component
│   ├── 📄 dialog.tsx          # Modal component
│   ├── 📄 dropdown-menu.tsx   # Dropdown menu component
│   ├── 📄 form.tsx            # Form wrapper components
│   ├── 📄 label.tsx           # Form label component
│   ├── 📄 select.tsx          # Select dropdown component
│   ├── 📄 table.tsx           # Data table component
│   ├── 📄 tabs.tsx            # Tab navigation component
│   ├── 📄 toast.tsx           # Notification toast
│   ├── 📄 tooltip.tsx         # Tooltip component
│   └── 📄 ... (30+ UI components)
├── 📁 forms/                  # Form-specific components
│   ├── 📄 ComplaintForm.tsx   # Complaint submission form
│   ├── 📄 LoginForm.tsx       # User login form
│   ├── 📄 RegisterForm.tsx    # User registration form
│   ├── 📄 ProfileForm.tsx     # Profile editing form
│   ├── 📄 GuestForm.tsx       # Guest complaint form
│   ├── 📄 FilterForm.tsx      # Complaint filtering form
│   └── 📄 FormField.tsx       # Reusable form field wrapper
├── 📁 layout/                 # Layout components
│   ├── 📄 AppLayout.tsx       # Main application layout
│   ├── 📄 AuthLayout.tsx      # Authentication pages layout
│   ├── 📄 DashboardLayout.tsx # Dashboard layout with sidebar
│   ├── 📄 Navigation.tsx      # Top navigation bar
│   ├── 📄 Sidebar.tsx         # Dashboard sidebar
│   ├── 📄 Header.tsx          # Page header component
│   └── 📄 Footer.tsx          # Page footer component
├── 📁 features/               # Feature-specific components
│   ├── 📁 complaints/         # Complaint-related components
│   │   ├── 📄 ComplaintCard.tsx      # Individual complaint card
│   │   ├── 📄 ComplaintsList.tsx     # List of complaints
│   │   ├── 📄 ComplaintDetails.tsx   # Detailed complaint view
│   │   ├── 📄 ComplaintFilters.tsx   # Filtering controls
│   │   ├── 📄 ComplaintStats.tsx     # Statistics widgets
│   │   ├── 📄 StatusBadge.tsx        # Status indicator
│   │   └── 📄 PriorityIndicator.tsx  # Priority visual indicator
│   ├── 📁 auth/               # Authentication components
│   │   ├── 📄 LoginCard.tsx          # Login form container
│   │   ├── 📄 RegisterCard.tsx       # Registration form container
│   │   ├── 📄 OTPVerification.tsx    # OTP input and verification
│   │   ├── 📄 PasswordReset.tsx      # Password reset flow
│   │   └── 📄 UserAvatar.tsx         # User profile picture
│   ├── 📁 dashboard/          # Dashboard components
│   │   ├── 📄 MetricsCard.tsx        # Dashboard metric cards
│   │   ├── 📄 RecentActivity.tsx     # Recent activity feed
│   │   ├── 📄 QuickActions.tsx       # Quick action buttons
│   │   ├── 📄 StatisticsWidget.tsx   # Statistics display
│   │   └── 📄 ProgressChart.tsx      # Progress visualization
│   ├── 📁 admin/              # Admin-specific components
│   │   ├── 📄 UserManagement.tsx     # User management interface
│   │   ├── 📄 SystemConfig.tsx       # System configuration
│   │   ├── 📄 Analytics.tsx          # Analytics dashboard
│   │   ├── 📄 ReportsGenerator.tsx   # Report generation
│   │   └── 📄 BulkActions.tsx        # Bulk operation controls
│   └── 📁 guest/              # Guest user components
│       ├── 📄 GuestComplaintForm.tsx # Anonymous complaint form
│       ├── 📄 TrackingInterface.tsx  # Complaint tracking
│       ├── 📄 OTPDialog.tsx          # OTP verification modal
│       └── 📄 GuestDashboard.tsx     # Guest user interface
├── 📁 guards/                 # Route protection components
│   ├── 📄 AuthGuard.tsx       # Authentication requirement guard
│   ├── 📄 RoleGuard.tsx       # Role-based access guard
│   ├── 📄 PermissionGuard.tsx # Permission-based access guard
│   └── 📄 GuestGuard.tsx      # Guest-only access guard
├── 📁 providers/              # Context providers
│   ├── 📄 ThemeProvider.tsx   # Theme context provider
│   ├── 📄 AuthProvider.tsx    # Authentication context provider
│   ├── 📄 LanguageProvider.tsx # Language/i18n provider
│   └── 📄 ErrorProvider.tsx   # Error boundary provider
├── 📁 common/                 # Common/shared components
│   ├── 📄 LoadingSpinner.tsx  # Loading state indicator
│   ├── 📄 ErrorBoundary.tsx   # Error boundary component
│   ├── 📄 ErrorMessage.tsx    # Error display component
│   ├── 📄 EmptyState.tsx      # Empty state placeholder
│   ├── 📄 ConfirmDialog.tsx   # Confirmation modal
│   ├── 📄 ImageUpload.tsx     # File upload component
│   ├── 📄 DatePicker.tsx      # Date selection component
│   ├── 📄 SearchInput.tsx     # Search input with debouncing
│   ├── 📄 Pagination.tsx      # Pagination controls
│   ├── 📄 BackButton.tsx      # Navigation back button
│   └── 📄 ThemeToggle.tsx     # Dark/light theme toggle
└── 📁 accessibility/          # Accessibility components
    ├── 📄 SkipToContent.tsx   # Skip navigation link
    ├── 📄 ScreenReaderOnly.tsx # Screen reader only content
    ├── 📄 FocusTrap.tsx       # Focus management
    └── 📄 Announcer.tsx       # Live region announcements
```

#### Component File Structure Example
```typescript
// client/components/features/complaints/ComplaintCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { Complaint } from '@shared/api';

interface ComplaintCardProps {
  complaint: Complaint;
  onSelect?: (complaint: Complaint) => void;
  onStatusChange?: (id: string, status: string) => void;
  showActions?: boolean;
  className?: string;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onSelect,
  onStatusChange,
  showActions = true,
  className
}) => {
  // Component implementation
  return (
    <Card className={className}>
      {/* Card content */}
    </Card>
  );
};

// Export default for easier imports
export default ComplaintCard;

// Named export for specific use cases
export { ComplaintCard };

// Type exports for consuming components
export type { ComplaintCardProps };
```

### Pages (`client/pages/`)

Pages represent route components and main application screens.

```
client/pages/
├── 📄 Index.tsx               # Home page (/)
├── 📄 Login.tsx               # Login page (/login)
├── 📄 Register.tsx            # Registration page (/register)
├── 📄 ForgotPassword.tsx      # Password reset page
├── 📄 NotFound.tsx            # 404 error page
├── 📄 Unauthorized.tsx        # 403 access denied page
├── 📄 ServerError.tsx         # 500 server error page
├── 📁 dashboard/              # Dashboard pages
│   ├── 📄 CitizenDashboard.tsx        # Citizen role dashboard
│   ├── 📄 WardOfficerDashboard.tsx    # Ward officer dashboard
│   ├── 📄 MaintenanceDashboard.tsx    # Maintenance team dashboard
│   └── 📄 AdminDashboard.tsx          # Administrator dashboard
├── 📁 complaints/             # Complaint management pages
│   ├── 📄 ComplaintsList.tsx          # List all complaints
│   ├── 📄 ComplaintDetails.tsx        # Individual complaint view
│   ├── 📄 CreateComplaint.tsx         # New complaint form
│   ├── 📄 EditComplaint.tsx           # Edit complaint form
│   └── 📄 ComplaintTracking.tsx       # Complaint tracking page
├── 📁 profile/                # User profile pages
│   ├── 📄 ProfileView.tsx             # View profile
│   ├── 📄 ProfileEdit.tsx             # Edit profile
│   ├── 📄 ChangePassword.tsx          # Change password
│   └── 📄 ProfileSettings.tsx         # Profile settings
├── 📁 admin/                  # Administrative pages
│   ├── 📄 AdminUsers.tsx              # User management
│   ├── 📄 AdminAnalytics.tsx          # System analytics
│   ├── 📄 AdminReports.tsx            # Reports generation
│   ├── 📄 AdminConfig.tsx             # System configuration
│   ├── 📄 AdminLanguages.tsx          # Language management
│   └── 📄 AdminLogs.tsx               # System logs
├── 📁 guest/                  # Guest user pages
│   ├── 📄 GuestComplaintForm.tsx      # Anonymous complaint submission
│   ├── 📄 GuestTracking.tsx           # Track complaints
│   └── 📄 GuestRegister.tsx           # Guest to user conversion
└── 📁 __tests__/              # Page component tests
    ├── 📄 Login.test.tsx
    ├── 📄 Register.test.tsx
    └── 📄 ComplaintsList.test.tsx
```

#### Page Component Structure
```typescript
// client/pages/complaints/ComplaintsList.tsx
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ComplaintCard } from '@/components/features/complaints/ComplaintCard';
import { ComplaintFilters } from '@/components/features/complaints/ComplaintFilters';
import { Pagination } from '@/components/common/Pagination';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useComplaints } from '@/hooks/useComplaints';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const ComplaintsList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { complaints, isLoading, error, filters, pagination, updateFilters } = useComplaints();

  useDocumentTitle('Complaints List');

  useEffect(() => {
    // Sync URL params with filters
    const urlFilters = Object.fromEntries(searchParams);
    updateFilters(urlFilters);
  }, [searchParams, updateFilters]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Complaints</h1>
        <Button asChild>
          <Link to="/complaints/create">New Complaint</Link>
        </Button>
      </div>

      <ComplaintFilters 
        filters={filters}
        onFiltersChange={updateFilters}
      />

      <div className="grid gap-4">
        {complaints.map(complaint => (
          <ComplaintCard 
            key={complaint.id} 
            complaint={complaint}
            onSelect={(complaint) => navigate(`/complaints/${complaint.id}`)}
          />
        ))}
      </div>

      <Pagination 
        {...pagination}
        onPageChange={(page) => updatePagination({ page })}
      />
    </div>
  );
};

export default ComplaintsList;
```

### Store (`client/store/`)

Redux state management with RTK Query for server state.

```
client/store/
├── 📁 slices/                 # Redux Toolkit slices
│   ├── 📄 authSlice.ts               # Authentication state
│   ├── 📄 complaintsSlice.ts         # Complaints local state
│   ├── 📄 guestSlice.ts              # Guest user state
│   ├── 📄 uiSlice.ts                 # UI state (theme, language)
│   ├── 📄 dataSlice.ts               # General data state
│   └── 📄 languageSlice.ts           # Language/i18n state
├── 📁 api/                    # RTK Query API endpoints
│   ├── 📄 baseApi.ts                 # Base API configuration
│   ├── 📄 authApi.ts                 # Authentication endpoints
│   ├── 📄 complaintsApi.ts           # Complaints CRUD endpoints
│   ├── 📄 guestApi.ts                # Guest operations endpoints
│   ├── 📄 adminApi.ts                # Admin operations endpoints
│   ├── 📄 serviceRequestsApi.ts      # Service requests endpoints
│   └── 📄 uploadsApi.ts              # File upload endpoints
├── 📁 resources/              # Static data and translations
│   ├── 📄 translations.ts            # i18n translation resources
│   ├── 📄 constants.ts               # Application constants
│   ├── 📄 mockData.ts                # Mock data for development
│   └── 📄 enums.ts                   # Application enums
├── 📁 middleware/             # Custom Redux middleware
│   ├── 📄 authMiddleware.ts          # Authentication middleware
│   ├── 📄 errorMiddleware.ts         # Error handling middleware
│   └── 📄 loggerMiddleware.ts        # Development logging
├── 📁 selectors/              # Reselect selectors
│   ├── 📄 authSelectors.ts           # Authentication selectors
│   ├── 📄 complaintsSelectors.ts     # Complaints data selectors
│   └── 📄 uiSelectors.ts             # UI state selectors
├── 📄 index.ts                # Store configuration and setup
├── 📄 hooks.ts                # Typed Redux hooks
└── 📄 types.ts                # Store-related type definitions
```

#### Store Configuration Example
```typescript
// client/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Slice imports
import authSlice from './slices/authSlice';
import complaintsSlice from './slices/complaintsSlice';
import guestSlice from './slices/guestSlice';
import uiSlice from './slices/uiSlice';

// API imports
import { baseApi } from './api/baseApi';
import { authApi } from './api/authApi';
import { complaintsApi } from './api/complaintsApi';

// Middleware imports
import { authMiddleware } from './middleware/authMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';

export const store = configureStore({
  reducer: {
    // Slice reducers
    auth: authSlice,
    complaints: complaintsSlice,
    guest: guestSlice,
    ui: uiSlice,
    
    // API reducers
    [baseApi.reducerPath]: baseApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [complaintsApi.reducerPath]: complaintsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat([
      // API middleware
      baseApi.middleware,
      authApi.middleware,
      complaintsApi.middleware,
      
      // Custom middleware
      authMiddleware,
      errorMiddleware,
    ]),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store
export default store;
```

### Hooks (`client/hooks/`)

Custom React hooks for reusable business logic.

```
client/hooks/
├── 📄 useAuth.ts              # Authentication state and operations
├── 📄 useComplaints.ts        # Complaints data and operations
├── 📄 useGuest.ts             # Guest user operations
├── 📄 usePermissions.ts       # User permissions checking
├── 📄 useLocalStorage.ts      # Local storage state management
├── 📄 useSessionStorage.ts    # Session storage state management
├── 📄 useDebounce.ts          # Debounced value hook
├── 📄 useToggle.ts            # Boolean state toggle hook
├── 📄 usePrevious.ts          # Previous value tracking
├── 📄 useDocumentTitle.ts     # Document title management
├── 📄 useEventListener.ts     # Event listener management
├── 📄 useClickOutside.ts      # Click outside detection
├── 📄 useKeyboardShortcut.ts  # Keyboard shortcut handling
├── 📄 useFormValidation.ts    # Form validation logic
├── 📄 usePagination.ts        # Pagination state management
├── 📄 useFilters.ts           # Filtering logic
├── 📄 useSort.ts              # Sorting operations
├── 📄 useSearch.ts            # Search functionality
├── 📄 useUpload.ts            # File upload operations
├── 📄 useNotifications.ts     # Toast notifications
├── 📄 useTheme.ts             # Theme management
├── 📄 useLanguage.ts          # Language/i18n management
├── 📄 useApiErrorHandler.ts   # API error handling
├── 📄 usePerformance.ts       # Performance monitoring
├── 📄 useAccessibility.ts     # Accessibility features
├── 📄 useCustomRegister.ts    # Custom form registration
├── 📄 useDataManager.ts       # Data management operations
└── 📄 use-mobile.tsx          # Mobile device detection
```

#### Custom Hook Example
```typescript
// client/hooks/useComplaints.ts
import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useGetComplaintsQuery } from '@/store/api/complaintsApi';
import { complaintsSlice } from '@/store/slices/complaintsSlice';
import type { ComplaintFilters, PaginationParams } from '@shared/api';

export const useComplaints = () => {
  const dispatch = useAppDispatch();
  const { filters, pagination, selectedComplaint } = useAppSelector(
    state => state.complaints
  );

  // Build query parameters
  const queryParams = useMemo(() => ({
    ...filters,
    ...pagination,
  }), [filters, pagination]);

  // Fetch complaints with RTK Query
  const {
    data: complaintsData,
    isLoading,
    error,
    refetch
  } = useGetComplaintsQuery(queryParams);

  // Action creators
  const updateFilters = useCallback((newFilters: Partial<ComplaintFilters>) => {
    dispatch(complaintsSlice.actions.updateFilters(newFilters));
  }, [dispatch]);

  const updatePagination = useCallback((newPagination: Partial<PaginationParams>) => {
    dispatch(complaintsSlice.actions.updatePagination(newPagination));
  }, [dispatch]);

  const setSelectedComplaint = useCallback((complaint: Complaint | null) => {
    dispatch(complaintsSlice.actions.setSelectedComplaint(complaint));
  }, [dispatch]);

  const clearFilters = useCallback(() => {
    dispatch(complaintsSlice.actions.clearFilters());
  }, [dispatch]);

  // Computed values
  const complaints = useMemo(() => 
    complaintsData?.complaints || [], 
    [complaintsData]
  );

  const paginationInfo = useMemo(() => 
    complaintsData?.pagination || pagination,
    [complaintsData, pagination]
  );

  return {
    // Data
    complaints,
    selectedComplaint,
    pagination: paginationInfo,
    filters,
    
    // Loading states
    isLoading,
    error,
    
    // Actions
    updateFilters,
    updatePagination,
    setSelectedComplaint,
    clearFilters,
    refetch,
    
    // Computed values
    hasComplaints: complaints.length > 0,
    totalComplaints: paginationInfo?.total || 0,
    hasNextPage: paginationInfo?.hasNext || false,
    hasPrevPage: paginationInfo?.hasPrev || false,
  };
};
```

### Utilities (`client/lib/` and `client/utils/`)

Utility functions and helper libraries.

```
client/lib/
├── 📄 utils.ts                # General utility functions
├── 📄 validations.ts          # Validation schemas (Zod)
├── 📄 constants.ts            # Application constants
├── 📄 api.ts                  # API client configuration
├── 📄 auth.ts                 # Authentication utilities
├── 📄 storage.ts              # Storage utilities
├── 📄 format.ts               # Data formatting utilities
├── 📄 date.ts                 # Date manipulation utilities
├── 📄 permissions.ts          # Permission checking utilities
└── 📄 complaintUtils.ts       # Complaint-specific utilities

client/utils/
├── 📄 analytics.ts            # Analytics tracking utilities
├── 📄 accessibility.ts        # Accessibility helper functions
├── 📄 performance.ts          # Performance monitoring utilities
├── 📄 errorHandling.ts        # Error handling utilities
├── 📄 guestFormValidation.ts  # Guest form validation
└── 📄 permissions.ts          # Permission utilities
```

#### Utility Function Examples
```typescript
// client/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a human-readable string
 */
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Safely parses JSON with error handling
 */
export function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Generates a random ID
 */
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 5);
  return `${prefix}${timestamp}${randomPart}`;
}
```

### Types (`client/types/` and `shared/`)

TypeScript type definitions.

```
client/types/
├── 📄 index.ts                # Main type exports
├── 📄 auth.ts                 # Authentication types
├── 📄 complaint.ts            # Complaint-related types
├── 📄 user.ts                 # User types
├── 📄 api.ts                  # API response types
├── 📄 form.ts                 # Form-related types
├── 📄 ui.ts                   # UI component types
└── 📄 global.ts               # Global type definitions

shared/
└── 📄 api.ts                  # Shared API types between client/server
```

#### Type Definition Examples
```typescript
// shared/api.ts - Shared types
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
  subZoneId?: string;
  area?: string;
  address: string;
  landmark?: string;
  contactPhone: string;
  contactEmail: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  submittedOn: string;
  assignedOn?: string;
  expectedResolution?: string;
  actualResolution?: string;
  citizenFeedback?: {
    rating: number;
    comment: string;
    submittedAt: string;
  };
  submittedBy: Pick<User, 'id' | 'fullName' | 'role'>;
  assignedTo?: Pick<User, 'id' | 'fullName' | 'role'>;
  ward: Ward;
  subZone?: SubZone;
  attachments: Attachment[];
  statusLogs: StatusLog[];
}

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
```

## Asset Organization

### Static Assets (`public/`)

```
public/
├── 📄 index.html              # HTML template
├── 📄 favicon.ico             # Application favicon
├── 📄 robots.txt              # SEO robots file
├── 📄 manifest.json           # PWA manifest
├── 📄 service-worker.js       # Service worker for PWA
├── 📁 icons/                  # App icons for different sizes
│   ├── 📄 icon-192x192.png
│   ├── 📄 icon-512x512.png
│   └── 📄 apple-touch-icon.png
├── 📁 images/                 # Static images
│   ├── 📄 logo.svg
│   ├── 📄 hero-bg.jpg
│   └── 📄 placeholder.png
└── 📁 locales/                # Internationalization files
    ├── 📄 en.json
    ├── 📄 hi.json
    └── 📄 ml.json
```

### Dynamic Assets (`client/assets/`)

```
client/assets/
├── 📁 images/                 # Bundled images
│   ├── 📄 logo.svg
│   ├── 📄 hero.jpg
│   └── 📄 illustrations/
├── 📁 icons/                  # Custom icons
│   ├── 📄 complaint-icon.svg
│   └── 📄 status-icons/
├── 📁 fonts/                  # Custom fonts
│   ├── 📄 inter-regular.woff2
│   └── 📄 inter-bold.woff2
└── 📁 animations/             # Animation files
    ├── 📄 loading.json        # Lottie animations
    └── 📄 success.json
```

## Configuration Files

### Build Configuration

#### Vite Configuration (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4005',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

#### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["client", "shared"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### TailwindCSS Configuration (`tailwind.config.ts`)
```typescript
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./client/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        // ... other color definitions
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```

## File Naming Conventions

### Components
- **Format**: PascalCase
- **Examples**: `ComplaintCard.tsx`, `UserAvatar.tsx`, `NavigationMenu.tsx`
- **Pattern**: `{Feature}{ComponentType}.tsx`

### Pages
- **Format**: PascalCase
- **Examples**: `ComplaintsList.tsx`, `AdminDashboard.tsx`, `UserProfile.tsx`
- **Pattern**: `{Feature}{PageType}.tsx`

### Hooks
- **Format**: camelCase starting with 'use'
- **Examples**: `useAuth.ts`, `useComplaints.ts`, `useLocalStorage.ts`
- **Pattern**: `use{FeatureOrPurpose}.ts`

### Utilities
- **Format**: camelCase
- **Examples**: `dateUtils.ts`, `apiClient.ts`, `validationSchemas.ts`
- **Pattern**: `{purpose}Utils.ts` or `{feature}.ts`

### Types
- **Format**: camelCase for files, PascalCase for interfaces
- **Examples**: `userTypes.ts`, `interface User`, `type UserRole`
- **Pattern**: `{feature}Types.ts`

### Constants
- **Format**: SCREAMING_SNAKE_CASE for values, camelCase for files
- **Examples**: `API_ENDPOINTS`, `DEFAULT_PAGE_SIZE`, `USER_ROLES`
- **Pattern**: `{feature}Constants.ts`

## Code Organization Patterns

### Feature-Based Organization
```typescript
// Group related functionality together
features/
├── complaints/
│   ├── components/
│   │   ├── ComplaintCard.tsx
│   │   ├── ComplaintForm.tsx
│   │   └── ComplaintFilters.tsx
│   ├── hooks/
│   │   ├── useComplaints.ts
│   │   └── useComplaintForm.ts
│   ├── types/
│   │   └── complaint.ts
│   └── utils/
│       └── complaintUtils.ts
```

### Barrel Exports
```typescript
// components/ui/index.ts - Barrel export file
export { Button } from './button';
export { Input } from './input';
export { Card, CardContent, CardHeader } from './card';
export { Dialog, DialogContent, DialogHeader } from './dialog';

// Usage in consuming components
import { Button, Input, Card } from '@/components/ui';
```

### Consistent Import Structure
```typescript
// Import order convention
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// 2. Internal components (UI first, then features)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ComplaintCard } from '@/components/features/complaints/ComplaintCard';

// 3. Hooks and utilities
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';

// 4. Types (shared first, then local)
import type { User, Complaint } from '@shared/api';
import type { ComponentProps } from './types';
```

### Component Organization Pattern
```typescript
// Standard component file structure
import React from 'react';
// ... other imports

// Types and interfaces
interface ComponentProps {
  // prop definitions
}

// Component implementation
export const Component: React.FC<ComponentProps> = ({
  // destructured props
}) => {
  // Hooks
  const [state, setState] = useState();
  
  // Event handlers
  const handleClick = () => {
    // handler logic
  };
  
  // Render logic
  return (
    // JSX
  );
};

// Default export
export default Component;

// Named exports for types
export type { ComponentProps };
```

### Hook Organization Pattern
```typescript
// Custom hook structure
import { useState, useEffect, useCallback } from 'react';
// ... other imports

export const useFeature = (params?: FeatureParams) => {
  // State
  const [state, setState] = useState(initialState);
  
  // Effects
  useEffect(() => {
    // effect logic
  }, [dependencies]);
  
  // Memoized functions
  const memoizedFunction = useCallback(() => {
    // function logic
  }, [dependencies]);
  
  // Return object
  return {
    // state
    // computed values
    // functions
  };
};
```

This comprehensive frontend file structure documentation provides a complete understanding of how the React-based complaint management system frontend is organized, making it easier for developers to navigate, maintain, and extend the application.
