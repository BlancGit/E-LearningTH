# E-Learning Platform - replit.md

## Overview

This is a full-stack e-learning platform built with React, Express.js, and PostgreSQL. The application features user authentication, course management, and is designed with Thai language support throughout the interface. The platform uses a modern tech stack with TypeScript, Tailwind CSS, and shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for client-side routing
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Thai font (Sarabun)
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: JWT tokens with bcrypt for password hashing
- **API Design**: RESTful endpoints with proper error handling
- **Development**: Hot reloading with Vite integration

### Database Architecture
- **Database**: PostgreSQL 
- **ORM**: Prisma ORM with schema-first approach
- **Migrations**: Prisma Migrate for database schema management
- **Connection**: Prisma Client with connection pooling

## Key Components

### Authentication System
- JWT-based authentication with localStorage persistence
- Password hashing using bcrypt
- Role-based access control (STUDENT/TEACHER roles)
- Protected routes and middleware
- Forms with client-side validation using Zod schemas

### User Management
- User registration with email validation
- Profile management with role selection
- Session management with token refresh capabilities

### Course System
- Course display with card-based layout
- Course enrollment functionality
- Course metadata (title, description, duration)
- Image support for course thumbnails

### UI Components
- Responsive design with mobile-first approach
- Sidebar navigation with hamburger menu
- Header with search functionality
- Toast notifications for user feedback
- Form components with proper validation states

## Data Flow

1. **Authentication Flow**:
   - User submits credentials → Server validates → JWT token generated → Client stores token → Subsequent requests include token in headers

2. **Course Management Flow**:
   - Course data fetched from database → Rendered in cards → User interaction triggers enrollment → Authentication check → Database update

3. **Navigation Flow**:
   - Client-side routing with Wouter → Component rendering → Data fetching with TanStack Query → UI updates

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS processing
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts (Sarabun) for Thai language support
- **HTTP Client**: Fetch API with custom wrapper functions

### Backend Dependencies
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT and bcrypt for secure authentication
- **Validation**: Zod for runtime type validation
- **Development**: tsx for TypeScript execution

### Build Tools
- **Bundler**: Vite for fast development and production builds
- **TypeScript**: Full TypeScript support with strict configuration
- **ESBuild**: For server-side bundling in production

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with hot module replacement
- tsx for running TypeScript server with auto-reload
- Shared schema between frontend and backend for type safety

### Production Build
- Frontend built with Vite to static assets
- Backend bundled with ESBuild to single Node.js executable
- Database migrations managed through Prisma Migrate
- Environment variables for database connections and JWT secrets

### Database Management
- Schema defined in shared TypeScript file
- Migrations generated and applied using Prisma Migrate
- Connection pooling for production performance
- Environment-based configuration for different deployment stages

### Key Architectural Decisions

1. **Monorepo Structure**: Single repository with shared types and schemas between frontend and backend for consistency and type safety

2. **TypeScript First**: Full TypeScript implementation across the stack for better developer experience and runtime safety

3. **Component-Based UI**: shadcn/ui components for consistent design system and accessibility

4. **Schema Validation**: Zod schemas shared between client and server for runtime validation and type inference

5. **Serverless Database**: Neon PostgreSQL for scalable, managed database solution

6. **JWT Authentication**: Stateless authentication suitable for API-first architecture

7. **Thai Language Support**: Complete Thai localization with proper font selection and cultural considerations