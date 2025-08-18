# Frontend Architecture

Comprehensive architectural overview of the E-Governance Complaint Management System frontend built with React, TypeScript, and Redux Toolkit.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Technology Stack](#technology-stack)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Routing & Navigation](#routing--navigation)
7. [Data Flow](#data-flow)
8. [UI/UX Architecture](#uiux-architecture)
9. [Performance Architecture](#performance-architecture)
10. [Security Architecture](#security-architecture)

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                      │
├─────────────────────────────────────────────────────────────┤
│  Browser (Chrome, Firefox, Safari, Edge)                  │
│  Mobile WebView (iOS Safari, Android Chrome)              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    REACT APPLICATION                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │PRESENTATION │  │  BUSINESS   │  │    DATA     │       │
│  │   LAYER     │  │    LOGIC    ��  │   LAYER     │       │
│  │             │  │   LAYER     │  │             │       │
│  │ • Pages     │  │ • Hooks     │  │ • RTK Query │       │
│  │ • Components│  │ • Utils     │  │ • Redux     │       │
│  │ • UI Kit    │  │ • Validation│  │ • Local St. │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  ROUTING    │  │   STYLING   │  │   TOOLS     │       │
│  │             │  │             │  │             │       │
│  │ • React     │  │ • Tailwind  │  │ • TypeScript│       │
│  │   Router    │  │ • Radix UI  │  │ • Vite      │       │
│  │ • Guards    │  │ • CSS Vars  │  │ • ESLint    │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└────────────��────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API                           │
├─────────────────────────────────────────────────────────────┤
│  REST API Endpoints • WebSocket (Future) • File Upload     │
└─────────────────────────────────────────────────────────────┘
```

### Application Architecture Layers

```
┌─────────────────────────────────────────┐
│            UI Components                │  ← Presentation Layer
├─────────────────────────────────────────┤
│               Pages                     │  �� Route Components
├─────────────────────────────────────────┤
│            Custom Hooks                 │  ← Business Logic
├─────────────────────────────────────────┤
│          Redux Store                    │  ← State Management
├─────────────────────────────────────────┤
│           RTK Query                     │  ← Data Fetching
├─────────────────────────────────────────┤
│          HTTP Client                    │  ← Network Layer
├─────────────────────────────────────────┤
│           Backend API                   │  ← External Services
└─────────────────────────────────────────┘
```

## Architecture Principles

### 1. Component-Based Architecture
- **Atomic Design**: Building UI from smallest components up
- **Composition over Inheritance**: Favor component composition
- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Components designed for multiple use cases

### 2. Unidirectional Data Flow
- **Top-Down Data Flow**: Props flow down, events bubble up
- **Predictable State Updates**: Redux ensures predictable state changes
- **Immutable State**: State updates create new state objects
- **Time-Travel Debugging**: Redux DevTools for debugging

### 3. Separation of Concerns
- **View Logic**: Components handle rendering and user interaction
- **Business Logic**: Custom hooks contain reusable business logic
- **Data Logic**: RTK Query handles API calls and caching
- **State Logic**: Redux slices manage application state

### 4. Progressive Enhancement
- **Mobile-First**: Responsive design starting from mobile
- **Accessibility-First**: WCAG 2.1 AA compliance
- **Performance-First**: Optimized for speed and efficiency
- **Offline-Ready**: Service worker for offline capabilities

### 5. Type Safety
- **TypeScript**: Compile-time type checking
- **Strong Typing**: Interfaces for all data structures
- **Runtime Validation**: Zod schemas for API responses
- **Error Prevention**: Catch errors at compile time

## Technology Stack

### Core Technologies

#### Frontend Framework
```
React 18.3.1
├── React DOM (Client rendering)
├── React Router 6 (SPA routing)
├── React Hook Form (Form management)
└── React Query (Data fetching - via RTK Query)
```

#### State Management
```
Redux Toolkit 2.8.2
├── RTK Query (API state management)
├── Redux DevTools (Development debugging)
├── Immer (Immutable updates)
└── Reselect (Memoized selectors)
```

#### Type System
```
TypeScript 5.5.3
├── Strict mode enabled
├── Path mapping (@/ aliases)
├── Shared types (client/server)
└── Generated types (Prisma)
```

#### Build Tools
```
Vite 6.2.2
├── SWC (Fast compilation)
├── Hot Module Replacement
├── Tree shaking
├── Code splitting
└── Bundle optimization
```

#### UI Framework
```
TailwindCSS 3.4.11
├── Radix UI (Headless components)
├── Lucide React (Icons)
├── Framer Motion (Animations)
├── CSS Variables (Theming)
└── PostCSS (Processing)
```

### Development Tools

#### Code Quality
```
Development Toolchain
├── ESLint (Linting)
├── Prettier (Formatting)
├── Husky (Git hooks)
├── Lint-staged (Pre-commit)
└── TypeScript (Type checking)
```

#### Testing
```
Testing Framework
├── Vitest (Unit testing)
├── React Testing Library (Component testing)
├── Cypress (E2E testing)
├── MSW (API mocking)
└── Jest DOM (DOM matchers)
```

## Component Architecture

### Component Hierarchy

```
App
├── Providers
│   ├── Redux Provider
│   ├── Router Provider
│   ├── Theme Provider
│   └── Error Boundary
├── Layout
│   ├── Navigation
│   ├── Sidebar
│   ├── Header
│   └── Footer
├── Routes
│   ├── Public Routes
│   │   ├── Home
│   │   ├── Login
│   │   └── Register
│   └── Protected Routes
│       ├── Dashboard (Role-based)
│       ├── Complaints
│       ├── Profile
│       └── Admin
└── Global Components
    ├── Modals
    ├── Toasts
    └── Loading States
```

### Component Design Patterns

#### 1. Atomic Design Structure
```
src/components/
├── ui/                     # Atomic components (Design System)
│   ├── button.tsx         # Basic button component
│   ├── input.tsx          # Form input component
│   ├── card.tsx           # Container component
│   └── dialog.tsx         # Modal component
├── forms/                 # Molecular components
│   ├── LoginForm.tsx      # Login form composition
│   ├── ComplaintForm.tsx  # Complaint submission form
│   └── ProfileForm.tsx    # Profile editing form
├── features/              # Organism components
│   ├── ComplaintsList.tsx # Complete complaints list
│   ├── Dashboard.tsx      # Dashboard widget
│   └── Navigation.tsx     # Navigation system
└── layout/                # Template components
    ├── AppLayout.tsx      # Main application layout
    ├── AuthLayout.tsx     # Authentication layout
    └── DashboardLayout.tsx # Dashboard layout
```

#### 2. Component Composition Pattern
```typescript
// Example: Composable Card component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

// Base card component
export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn("rounded-lg border bg-card p-6", className)}>
    {children}
  </div>
);

// Compound components
Card.Header = ({ children, className }: CardHeaderProps) => (
  <div className={cn("mb-4", className)}>{children}</div>
);

Card.Content = ({ children, className }: CardContentProps) => (
  <div className={cn("", className)}>{children}</div>
);

// Usage
<Card>
  <Card.Header>
    <h2>Complaint Details</h2>
  </Card.Header>
  <Card.Content>
    <p>Complaint description...</p>
  </Card.Content>
</Card>
```

#### 3. Higher-Order Component Pattern
```typescript
// Role-based access HOC
interface WithAuthProps {
  allowedRoles?: UserRole[];
  fallback?: React.ComponentType;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthProps = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isAuthenticated } = useAuth();
    const { allowedRoles, fallback: Fallback } = options;

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return Fallback ? <Fallback /> : <AccessDenied />;
    }

    return <Component {...props} />;
  };
}

// Usage
export default withAuth(AdminDashboard, {
  allowedRoles: ['ADMINISTRATOR'],
  fallback: UnauthorizedPage
});
```

#### 4. Render Props Pattern
```typescript
// Data fetcher component
interface DataFetcherProps<T> {
  url: string;
  children: (state: {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  }) => React.ReactNode;
}

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [url],
    queryFn: () => fetchData<T>(url)
  });

  return (
    <>
      {children({
        data: data || null,
        loading: isLoading,
        error: error?.message || null,
        refetch
      })}
    </>
  );
}

// Usage
<DataFetcher<Complaint[]> url="/api/complaints">
  {({ data, loading, error, refetch }) => (
    <div>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={refetch} />}
      {data && <ComplaintsList complaints={data} />}
    </div>
  )}
</DataFetcher>
```

### Component Communication

#### 1. Props Down, Events Up
```typescript
// Parent component
const ComplaintManagement: React.FC = () => {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleComplaintSelect = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  const handleComplaintUpdate = (updatedComplaint: Complaint) => {
    // Update local state or trigger refetch
    setIsModalOpen(false);
  };

  return (
    <>
      <ComplaintsList 
        onComplaintSelect={handleComplaintSelect}
      />
      <ComplaintModal
        complaint={selectedComplaint}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleComplaintUpdate}
      />
    </>
  );
};
```

#### 2. Context for Deep Prop Drilling
```typescript
// Theme context
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

#### 3. Global State for Complex State
```typescript
// Redux for global application state
const complaintsSlice = createSlice({
  name: 'complaints',
  initialState: {
    selectedComplaint: null as Complaint | null,
    filters: {
      status: '',
      type: '',
      wardId: ''
    },
    pagination: {
      page: 1,
      limit: 10
    }
  },
  reducers: {
    setSelectedComplaint: (state, action) => {
      state.selectedComplaint = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updatePagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  }
});
```

## State Management

### Redux Store Architecture

```
Redux Store
├── auth/                   # Authentication state
│   ├── user               # Current user data
│   ├── token              # JWT token
│   ├── isAuthenticated    # Auth status
│   └── permissions        # User permissions
├── complaints/            # Complaints management
│   ├── list              # Complaints list
│   ├── current           # Selected complaint
│   ├── filters           # Applied filters
│   └── pagination        # Pagination state
├── ui/                   # UI state
│   ├── theme             # Theme preference
│   ├── language          # Selected language
│   ├── sidebarOpen       # Sidebar state
│   └── modals            # Modal states
├── guest/                # Guest user state
│   ├── complaintData     # Guest complaint draft
│   ├── otpSession        # OTP verification
│   └── trackingData      # Complaint tracking
└── api/                  # RTK Query cache
    ├── complaints        # Complaints API cache
    ├── users             # Users API cache
    └── wards             # Wards API cache
```

### State Management Patterns

#### 1. Slice Pattern (Redux Toolkit)
```typescript
// complaints slice
interface ComplaintsState {
  list: Complaint[];
  currentComplaint: Complaint | null;
  filters: ComplaintFilters;
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
}

const initialState: ComplaintsState = {
  list: [],
  currentComplaint: null,
  filters: {
    status: '',
    type: '',
    wardId: '',
    dateFrom: '',
    dateTo: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  loading: false,
  error: null
};

export const complaintsSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    setComplaints: (state, action: PayloadAction<Complaint[]>) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentComplaint: (state, action: PayloadAction<Complaint | null>) => {
      state.currentComplaint = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<ComplaintFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page
    },
    updatePagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});
```

#### 2. RTK Query for Server State
```typescript
// API slice for complaints
export const complaintsApi = createApi({
  reducerPath: 'complaintsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/complaints',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Complaint', 'ComplaintStats'],
  endpoints: (builder) => ({
    getComplaints: builder.query<{
      complaints: Complaint[];
      pagination: PaginationResponse;
    }, ComplaintFilters & PaginationParams>({
      query: (params) => ({
        url: '',
        params: cleanParams(params)
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.complaints.map(({ id }) => ({ type: 'Complaint' as const, id })),
              { type: 'Complaint', id: 'LIST' }
            ]
          : [{ type: 'Complaint', id: 'LIST' }]
    }),
    getComplaintById: builder.query<Complaint, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Complaint', id }]
    }),
    createComplaint: builder.mutation<Complaint, CreateComplaintRequest>({
      query: (complaint) => ({
        url: '',
        method: 'POST',
        body: complaint
      }),
      invalidatesTags: [{ type: 'Complaint', id: 'LIST' }, 'ComplaintStats']
    }),
    updateComplaintStatus: builder.mutation<Complaint, {
      id: string;
      status: ComplaintStatus;
      comment?: string;
    }>({
      query: ({ id, ...data }) => ({
        url: `/${id}/status`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Complaint', id },
        { type: 'Complaint', id: 'LIST' },
        'ComplaintStats'
      ]
    })
  })
});

export const {
  useGetComplaintsQuery,
  useGetComplaintByIdQuery,
  useCreateComplaintMutation,
  useUpdateComplaintStatusMutation
} = complaintsApi;
```

#### 3. Custom Hooks for Business Logic
```typescript
// useComplaints hook - encapsulates complaints logic
export const useComplaints = () => {
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector(state => state.complaints);
  
  const {
    data: complaintsData,
    isLoading,
    error
  } = useGetComplaintsQuery({ ...filters, ...pagination });

  const updateFilters = useCallback((newFilters: Partial<ComplaintFilters>) => {
    dispatch(complaintsSlice.actions.updateFilters(newFilters));
  }, [dispatch]);

  const updatePagination = useCallback((newPagination: Partial<PaginationState>) => {
    dispatch(complaintsSlice.actions.updatePagination(newPagination));
  }, [dispatch]);

  const clearFilters = useCallback(() => {
    dispatch(complaintsSlice.actions.updateFilters({
      status: '',
      type: '',
      wardId: '',
      dateFrom: '',
      dateTo: ''
    }));
  }, [dispatch]);

  return {
    complaints: complaintsData?.complaints || [],
    pagination: complaintsData?.pagination,
    filters,
    isLoading,
    error,
    updateFilters,
    updatePagination,
    clearFilters
  };
};
```

## Routing & Navigation

### Route Structure

```
Routes Hierarchy
├── / (Public)
│   ├── /login
│   ├── /register
│   ├── /guest-complaint
│   └── /track/:trackingNumber
├── /dashboard (Protected)
│   ├── /citizen
│   ├── /ward-officer
│   ├── /maintenance
│   └── /admin
├── /complaints (Protected)
│   ├── /
│   ├── /create
│   ├── /:id
│   └── /:id/edit
├── /profile (Protected)
│   ├── /
│   ├── /edit
│   └── /settings
└── /admin (Admin Only)
    ├── /users
    ├── /analytics
    ├── /system-config
    └── /reports
```

### Route Configuration

#### 1. App Router Setup
```typescript
// App.tsx - Main routing configuration
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      // Public routes
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      },
      {
        path: 'guest-complaint',
        element: <GuestComplaintPage />
      },
      {
        path: 'track/:trackingNumber',
        element: <TrackComplaintPage />
      },
      
      // Protected routes
      {
        path: 'dashboard',
        element: <AuthGuard><DashboardLayout /></AuthGuard>,
        children: [
          {
            path: 'citizen',
            element: <RoleGuard allowedRoles={['CITIZEN']}><CitizenDashboard /></RoleGuard>
          },
          {
            path: 'ward-officer',
            element: <RoleGuard allowedRoles={['WARD_OFFICER']}><WardOfficerDashboard /></RoleGuard>
          },
          {
            path: 'maintenance',
            element: <RoleGuard allowedRoles={['MAINTENANCE_TEAM']}><MaintenanceDashboard /></RoleGuard>
          },
          {
            path: 'admin',
            element: <RoleGuard allowedRoles={['ADMINISTRATOR']}><AdminDashboard /></RoleGuard>
          }
        ]
      },
      
      // Complaints routes
      {
        path: 'complaints',
        element: <AuthGuard><ComplaintsLayout /></AuthGuard>,
        children: [
          {
            index: true,
            element: <ComplaintsList />
          },
          {
            path: 'create',
            element: <CreateComplaint />
          },
          {
            path: ':id',
            element: <ComplaintDetails />
          },
          {
            path: ':id/edit',
            element: <EditComplaint />
          }
        ]
      },
      
      // Admin routes
      {
        path: 'admin',
        element: (
          <AuthGuard>
            <RoleGuard allowedRoles={['ADMINISTRATOR']}>
              <AdminLayout />
            </RoleGuard>
          </AuthGuard>
        ),
        children: [
          {
            path: 'users',
            element: <UserManagement />
          },
          {
            path: 'analytics',
            element: <AnalyticsDashboard />
          },
          {
            path: 'system-config',
            element: <SystemConfiguration />
          },
          {
            path: 'reports',
            element: <ReportsPage />
          }
        ]
      }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

#### 2. Route Guards
```typescript
// AuthGuard component
interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// RoleGuard component
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ComponentType;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback: Fallback = AccessDenied 
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Fallback />;
  }

  return <>{children}</>;
};
```

#### 3. Dynamic Navigation
```typescript
// Navigation component with role-based menu
export const Navigation: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavigationItems = (role: UserRole): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        label: 'Dashboard',
        href: `/dashboard/${role.toLowerCase().replace('_', '-')}`,
        icon: <HomeIcon />
      },
      {
        label: 'Complaints',
        href: '/complaints',
        icon: <FileTextIcon />
      },
      {
        label: 'Profile',
        href: '/profile',
        icon: <UserIcon />
      }
    ];

    const roleSpecificItems: Record<UserRole, NavigationItem[]> = {
      CITIZEN: [],
      WARD_OFFICER: [
        {
          label: 'Ward Management',
          href: '/ward',
          icon: <MapIcon />
        }
      ],
      MAINTENANCE_TEAM: [
        {
          label: 'Task Queue',
          href: '/tasks',
          icon: <ClipboardIcon />
        }
      ],
      ADMINISTRATOR: [
        {
          label: 'User Management',
          href: '/admin/users',
          icon: <UsersIcon />
        },
        {
          label: 'Analytics',
          href: '/admin/analytics',
          icon: <BarChartIcon />
        },
        {
          label: 'System Config',
          href: '/admin/system-config',
          icon: <SettingsIcon />
        }
      ]
    };

    return [...baseItems, ...roleSpecificItems[role]];
  };

  const navigationItems = user ? getNavigationItems(user.role) : [];

  return (
    <nav className="space-y-2">
      {navigationItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
```

## Data Flow

### Unidirectional Data Flow

```
User Action
    ↓
Event Handler
    ↓
Action Creator
    ↓
Redux Reducer / RTK Query
    ↓
State Update
    ↓
Component Re-render
    ↓
UI Update
```

### Data Flow Patterns

#### 1. Simple State Update Flow
```typescript
// User clicks button → Event handler → State update → UI update
const ComplaintCard: React.FC<{ complaint: Complaint }> = ({ complaint }) => {
  const dispatch = useAppDispatch();
  
  const handleSelect = () => {
    // User action
    dispatch(complaintsSlice.actions.setCurrentComplaint(complaint));
  };

  return (
    <Card onClick={handleSelect}>
      <Card.Header>
        <h3>{complaint.title}</h3>
      </Card.Header>
      <Card.Content>
        <p>{complaint.description}</p>
      </Card.Content>
    </Card>
  );
};
```

#### 2. Async Data Flow with RTK Query
```typescript
// Component → Hook → API Call → Cache Update → UI Update
const ComplaintsList: React.FC = () => {
  const { complaints, isLoading, error } = useComplaints();
  const [updateStatus] = useUpdateComplaintStatusMutation();

  const handleStatusUpdate = async (id: string, status: ComplaintStatus) => {
    try {
      // User action triggers async operation
      await updateStatus({ id, status }).unwrap();
      // RTK Query automatically updates cache and triggers re-render
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <ComplaintCard
          key={complaint.id}
          complaint={complaint}
          onStatusUpdate={handleStatusUpdate}
        />
      ))}
    </div>
  );
};
```

#### 3. Form Data Flow
```typescript
// Form submission flow with validation
const ComplaintForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema)
  });

  const [createComplaint] = useCreateComplaintMutation();
  const navigate = useNavigate();

  const onSubmit = async (data: ComplaintFormData) => {
    try {
      // Form validation passes → API call → Success handling
      const result = await createComplaint(data).unwrap();
      toast.success('Complaint submitted successfully');
      navigate(`/complaints/${result.id}`);
    } catch (error) {
      // Error handling ��� User feedback
      toast.error('Failed to submit complaint');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          {...register('title')}
          id="title"
          placeholder="Enter complaint title"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
      </Button>
    </form>
  );
};
```

## UI/UX Architecture

### Design System Architecture

```
Design System
├── Tokens/                 # Design tokens (colors, spacing, typography)
├── Primitives/            # Base components (Button, Input, Card)
├── Patterns/              # Composite components (Forms, Lists, Modals)
├── Templates/             # Page layouts
└── Guidelines/            # Usage documentation
```

#### 1. Design Tokens
```typescript
// Design tokens implementation
export const tokens = {
  colors: {
    primary: {
      50: 'hsl(173, 77%, 95%)',
      100: 'hsl(173, 77%, 90%)',
      // ... other shades
      900: 'hsl(173, 77%, 10%)'
    },
    semantic: {
      success: 'hsl(142, 76%, 36%)',
      warning: 'hsl(25, 95%, 53%)',
      error: 'hsl(0, 84%, 60%)',
      info: 'hsl(217, 91%, 60%)'
    }
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem'    // 48px
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem'
    }
  }
};
```

#### 2. Component Variants
```typescript
// Button component with variants
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant, 
  size, 
  ...props 
}) => (
  <button
    className={cn(buttonVariants({ variant, size, className }))}
    {...props}
  />
);
```

### Responsive Design

#### 1. Mobile-First Approach
```css
/* Tailwind mobile-first breakpoints */
/* Default styles apply to mobile (0px and up) */
.container {
  @apply px-4;
}

/* Small tablets and landscape phones (640px and up) */
@screen sm {
  .container {
    @apply px-6;
  }
}

/* Tablets (768px and up) */
@screen md {
  .container {
    @apply px-8;
  }
}

/* Laptops (1024px and up) */
@screen lg {
  .container {
    @apply px-12;
  }
}

/* Desktops (1280px and up) */
@screen xl {
  .container {
    @apply px-16;
  }
}
```

#### 2. Responsive Components
```typescript
// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { default: 1, md: 2, lg: 3 },
  gap = 'gap-6'
}) => {
  const gridClasses = cn(
    'grid',
    gap,
    `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`
  );

  return <div className={gridClasses}>{children}</div>;
};

// Usage
<ResponsiveGrid columns={{ default: 1, md: 2, lg: 3 }}>
  {complaints.map(complaint => (
    <ComplaintCard key={complaint.id} complaint={complaint} />
  ))}
</ResponsiveGrid>
```

### Accessibility Architecture

#### 1. ARIA Implementation
```typescript
// Accessible modal component
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (isOpen) {
      // Trap focus within modal
      const previouslyFocusedElement = document.activeElement;
      return () => {
        (previouslyFocusedElement as HTMLElement)?.focus();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon size={20} />
          </button>
        </div>
        <div id={descriptionId}>
          {children}
        </div>
      </div>
    </div>
  );
};
```

#### 2. Keyboard Navigation
```typescript
// Keyboard navigation hook
export const useKeyboardNavigation = (
  items: HTMLElement[],
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
  } = {}
) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { loop = true, orientation = 'vertical' } = options;

  const handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;
    
    let nextIndex = currentIndex;
    
    if ((orientation === 'vertical' && key === 'ArrowDown') ||
        (orientation === 'horizontal' && key === 'ArrowRight')) {
      nextIndex = currentIndex + 1;
    } else if ((orientation === 'vertical' && key === 'ArrowUp') ||
               (orientation === 'horizontal' && key === 'ArrowLeft')) {
      nextIndex = currentIndex - 1;
    } else if (key === 'Home') {
      nextIndex = 0;
    } else if (key === 'End') {
      nextIndex = items.length - 1;
    }

    if (loop) {
      nextIndex = (nextIndex + items.length) % items.length;
    } else {
      nextIndex = Math.max(0, Math.min(items.length - 1, nextIndex));
    }

    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex);
      items[nextIndex]?.focus();
      event.preventDefault();
    }
  };

  return { currentIndex, handleKeyDown };
};
```

## Performance Architecture

### Optimization Strategies

#### 1. Code Splitting & Lazy Loading
```typescript
// Route-based code splitting
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const CitizenDashboard = lazy(() => import('@/pages/CitizenDashboard'));

// Component-based code splitting
const DataVisualization = lazy(() => import('@/components/DataVisualization'));

// Usage with Suspense
<Suspense fallback={<PageSkeleton />}>
  <AdminDashboard />
</Suspense>

// Dynamic imports for features
const loadChartLibrary = () => import('chart.js').then(module => module.default);
```

#### 2. Memoization
```typescript
// React.memo for component memoization
const ComplaintCard = React.memo<ComplaintCardProps>(({ complaint, onSelect }) => {
  return (
    <Card onClick={() => onSelect(complaint.id)}>
      <Card.Header>
        <h3>{complaint.title}</h3>
      </Card.Header>
      <Card.Content>
        <p>{complaint.description}</p>
      </Card.Content>
    </Card>
  );
});

// useMemo for expensive calculations
const ComplaintsList: React.FC = () => {
  const { complaints, filters } = useComplaints();
  
  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      if (filters.status && complaint.status !== filters.status) return false;
      if (filters.type && complaint.type !== filters.type) return false;
      if (filters.wardId && complaint.wardId !== filters.wardId) return false;
      return true;
    });
  }, [complaints, filters]);

  const complaintStats = useMemo(() => {
    return {
      total: filteredComplaints.length,
      byStatus: groupBy(filteredComplaints, 'status'),
      byType: groupBy(filteredComplaints, 'type')
    };
  }, [filteredComplaints]);

  return (
    <div>
      <ComplaintStats stats={complaintStats} />
      <div className="grid gap-4">
        {filteredComplaints.map(complaint => (
          <ComplaintCard key={complaint.id} complaint={complaint} />
        ))}
      </div>
    </div>
  );
};

// useCallback for event handlers
const ComplaintForm: React.FC = () => {
  const [formData, setFormData] = useState<ComplaintFormData>({});
  
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (data: ComplaintFormData) => {
    // Submission logic
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

#### 3. Virtual Scrolling
```typescript
// Virtual list component for large datasets
import { FixedSizeList as List } from 'react-window';

interface VirtualComplaintsListProps {
  complaints: Complaint[];
  height: number;
  itemHeight: number;
}

const VirtualComplaintsList: React.FC<VirtualComplaintsListProps> = ({
  complaints,
  height,
  itemHeight
}) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ComplaintCard complaint={complaints[index]} />
    </div>
  );

  return (
    <List
      height={height}
      itemCount={complaints.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### Bundle Optimization

#### 1. Tree Shaking Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        manualChunks: {
          vendor: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['date-fns', 'lodash-es']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@vite/client', '@vite/env']
  }
});
```

#### 2. Dynamic Imports
```typescript
// Conditional loading of heavy components
const AdminAnalytics = () => {
  const [showAdvancedCharts, setShowAdvancedCharts] = useState(false);
  const [ChartComponent, setChartComponent] = useState<React.ComponentType | null>(null);

  const loadAdvancedCharts = async () => {
    if (!ChartComponent) {
      const { AdvancedChartsComponent } = await import('@/components/charts/AdvancedCharts');
      setChartComponent(() => AdvancedChartsComponent);
    }
    setShowAdvancedCharts(true);
  };

  return (
    <div>
      <BasicMetrics />
      <Button onClick={loadAdvancedCharts}>
        Load Advanced Analytics
      </Button>
      {showAdvancedCharts && ChartComponent && <ChartComponent />}
    </div>
  );
};
```

## Security Architecture

### Client-Side Security

#### 1. XSS Prevention
```typescript
// Input sanitization
import DOMPurify from 'dompurify';

const SafeHTML: React.FC<{ content: string; className?: string }> = ({ 
  content, 
  className 
}) => {
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

// Form validation with XSS protection
const complaintSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must not exceed 200 characters')
    .refine(value => !/<script|javascript:|on\w+=/i.test(value), {
      message: 'Title contains invalid characters'
    }),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .transform(value => DOMPurify.sanitize(value))
});
```

#### 2. Authentication Security
```typescript
// Secure token handling
class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_KEY = 'refresh_token';

  static setTokens(accessToken: string, refreshToken: string) {
    // Store in memory for access token (shorter lived)
    sessionStorage.setItem(this.TOKEN_KEY, accessToken);
    
    // Store refresh token in httpOnly cookie (more secure)
    // This would be handled by the server setting the cookie
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
  }

  static getAccessToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  static clearTokens() {
    sessionStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}

// API interceptor for token refresh
const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = TokenManager.getAccessToken();
      if (token && !TokenManager.isTokenExpired(token)) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  // ... rest of API configuration
});
```

#### 3. Content Security Policy
```typescript
// CSP configuration for production
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://apis.google.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://api.your-domain.com'],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

// Meta tag for CSP (in index.html)
<meta 
  http-equiv="Content-Security-Policy" 
  content={Object.entries(cspDirectives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')}
/>
```

This comprehensive frontend architecture documentation provides a complete understanding of the React-based complaint management system's design, implementation patterns, and best practices for building scalable, maintainable, and secure frontend applications.
