# Copilot Instructions for Ascencio Tax Inc. API

## Architecture Overview

This is a **NestJS + PostgreSQL + TypeORM** appointment management system with extensive third-party integrations. The system orchestrates business operations for a tax consulting firm through:

- **Core domains**: appointments, users, services, staff, schedules
- **Integrations**: Google Calendar, Zoom, Cloudinary, OpenAI, MailerSend
- **Business logic**: timezone-aware scheduling, automated meeting creation, email notifications

## Key Development Patterns

### Module Structure
Each feature follows NestJS module pattern with clear boundaries:
```
src/appointment/
├── appointments.{controller,service,module}.ts
├── dto/                 # Input validation
├── entities/           # TypeORM entities
├── helpers/           # Business logic utilities
└── utils/            # Pure functions
```

### Authentication & Authorization
- JWT-based auth with `@Auth()` decorator for protection
- `@GetUser()` decorator extracts current user from request
- Role-based guards in `src/auth/guards/`
- Auth patterns: `@Auth()` → `@GetUser() user: User` in controllers

### Entity Patterns
All entities use:
- UUID primary keys: `@PrimaryGeneratedColumn('uuid')`
- Timezone-aware timestamps: `@Column('timestamp with time zone')`
- Soft deletes with `deletedAt: Date`
- Clear enum types for status fields

### Validation Strategy
- DTOs with class-validator decorators (`@IsUUID()`, `@IsISO8601()`, etc.)
- Global validation pipe with whitelist in `main.ts`
- Business validation in service layer, not DTOs

## Critical Business Logic

### Appointment Flow
The appointment system is **timezone-centric**:
1. Validate input timezone (IANA format)
2. Convert user local times to business timezone (`America/Toronto`)
3. Check staff schedule and conflicts
4. Create Zoom meeting + Google Calendar event
5. Send notifications via MailerSend/Nodemailer

**Key files**: `src/appointment/helpers/`, `docs/appointment-flow.md`

### External Service Integration
Services are initialized in `onModuleInit()` with proper error handling:
- **CalendarService**: Google Service Account auth, event CRUD
- **ZoomService**: JWT token auth, meeting management  
- **NotificationService**: Dual email providers (MailerSend + Nodemailer)

### Database & Environment
- Development: Docker Compose PostgreSQL (`docker-compose up -d`)
- Environment variables: Extensive `.env` configuration (see `.env.example`)
- Migrations: TypeORM auto-sync in dev, manual in production
- Seeding: `/api/seed` endpoint for test data

## Development Workflow

### Essential Commands
```bash
yarn start:dev          # Hot reload development
docker-compose up -d     # Start PostgreSQL
yarn build && yarn start:prod  # Production mode
curl localhost:3000/api/seed    # Load test data
```

### Code Generation
Follow existing patterns when creating features:
- Use NestJS CLI: `nest g resource feature-name`
- Copy from `src/appointment/` for complex business logic
- Use `src/auth/` patterns for authentication features

### Testing & Debugging
- Jest configuration in `package.json`
- Debug mode: `yarn start:debug`
- Logs: All services use NestJS Logger with contextual info

## Integration Guidelines

### Google Calendar
- Service account authentication (not OAuth)
- All times stored as UTC, converted via `luxon.DateTime`
- Event lifecycle tied to appointment status

### Email Notifications
- Dual provider setup: MailerSend (primary) + Nodemailer (fallback)
- Templates handled in `src/notification/`
- Business emails vs customer notifications

### File Management
- Cloudinary for storage via `src/files/`
- OCR processing with Tesseract.js in `src/ocr/`
- PDF generation using PDFMake

## Common Pitfalls

1. **Timezone handling**: Always specify timezone when working with dates
2. **Circular dependencies**: Use `forwardRef()` in modules (see AuthModule)
3. **Environment variables**: Validate required vars in service constructors
4. **TypeORM relations**: Load relations explicitly with `{ relations: ['user', 'service'] }`
5. **Error handling**: Services throw HTTP exceptions, not generic errors

## Quick Reference

- **Global prefix**: `/api` (set in `main.ts`)
- **Database**: PostgreSQL with TypeORM, auto-sync in dev
- **Auth flow**: JWT token → AuthGuard → User injection
- **Validation**: DTOs + class-validator + global pipe
- **Timezone**: Business operates in `America/Toronto`
- **Node version**: 20.x (specified in `package.json`)

When implementing new features, prioritize integration patterns and timezone handling over complex abstractions.