# BlueReserve - Comprehensive NestJS Booking System

A comprehensive reservation management system built with NestJS, implementing Clean Architecture principles, CQRS pattern, and Domain-Driven Design. This system enables users to create, manage, and track reservations for various resources including meeting rooms, hotel rooms, event tickets, conference halls, workspaces, and vehicles.

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture](#️-architecture-overview)
3. [Features](#-features)
4. [Technology Stack](#️-technology-stack)
5. [Quick Start](#-quick-start)
6. [API Documentation](#-api-documentation)
7. [Testing Guide](#-testing-guide)
8. [Database Schema](#-database-schema)
9. [Configuration](#-configuration)
10. [Deployment](#-deployment)
11. [Development Workflow](#-development-workflow)
12. [Performance & Security](#-performance--security)
13. [Troubleshooting](#-troubleshooting)
14. [Contributing](#-contributing)

---

## 🎯 Project Overview

### What is BlueReserve?

BlueReserve is a sophisticated reservation management system that demonstrates enterprise-level Node.js development practices. It showcases Clean Architecture, CQRS pattern implementation, and comprehensive domain modeling for a real-world booking scenario.

### Primary Use Cases

- **Resource Booking**: Create reservations for various types of resources
- **Conflict Prevention**: Prevent overlapping reservations for the same resource
- **Status Management**: Track reservation lifecycle (pending → confirmed → completed/cancelled)
- **Audit Trail**: Complete history tracking of all reservation changes
- **Availability Checking**: Query available resources for specific time slots

### Target Users

- **End Users**: Individuals or organizations needing to book resources
- **Administrators**: System administrators managing resources and reservations
- **Developers**: Teams extending or maintaining the reservation system

---

## 🏗️ Architecture Overview

### High-Level Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   Controllers    │  │      DTOs       │                 │
│  │                 │  │                 │                 │
│  └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │    Commands      │  │     Queries      │                 │
│  │   (CQRS)        │  │    (CQRS)       │                 │
│  └─────────────────┘  └─────────────────┘                 │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   Handlers      │  │ Event Handlers │                 │
│  └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │    Entities      │  │  Value Objects  │                 │
│  │                 │  │                 │                 │
│  └─────────────────┘  └─────────────────┘                 │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │     Events      │  │   Repositories  │                 │
│  │                 │  │   (Interfaces)  │                 │
│  └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   Persistence   │  │   Database      │                 │
│  │   (TypeORM)     │  │  (PostgreSQL)   │                 │
│  └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── domain/                    # Domain Layer (Business Logic)
│   ├── entities/              # Core business entities
│   │   ├── booking.entity.ts
│   │   ├── user.entity.ts
│   │   ├── resource.entity.ts
│   │   └── booking-history.entity.ts
│   ├── value-objects/         # Immutable value objects
│   │   ├── booking-id.value-object.ts
│   │   └── time-slot.value-object.ts
│   ├── enums/                 # Domain enumerations
│   │   ├── booking-status.enum.ts
│   │   └── resource-type.enum.ts
│   ├── events/                # Domain events
│   │   ├── booking-created.event.ts
│   │   ├── booking-confirmed.event.ts
│   │   └── booking-cancelled.event.ts
│   └── repositories/          # Repository interfaces
│       ├── booking.repository.interface.ts
│       ├── user.repository.interface.ts
│       ├── resource.repository.interface.ts
│       └── booking-history.repository.interface.ts
├── application/                # Application Layer (Use Cases)
│   ├── commands/              # CQRS Commands
│   │   ├── create-booking.command.ts
│   │   ├── confirm-booking.command.ts
│   │   ├── cancel-booking.command.ts
│   │   └── handlers/
│   │       ├── create-booking.handler.ts
│   │       ├── confirm-booking.handler.ts
│   │       └── cancel-booking.handler.ts
│   ├── queries/               # CQRS Queries
│   │   ├── get-booking.query.ts
│   │   ├── get-user-bookings.query.ts
│   │   ├── get-available-resources.query.ts
│   │   └── handlers/
│   │       ├── get-booking.handler.ts
│   │       ├── get-user-bookings.handler.ts
│   │       └── get-available-resources.handler.ts
│   └── event-handlers/        # Domain event handlers
│       └── booking-history.handler.ts
├── infrastructure/            # Infrastructure Layer
│   ├── database/
│   │   └── database.module.ts
│   └── persistence/
│       └── typeorm/
│           ├── booking.repository.ts
│           ├── user.repository.ts
│           ├── resource.repository.ts
│           └── booking-history.repository.ts
├── presentation/              # Presentation Layer (API)
│   ├── controllers/
│   │   ├── reservation.controller.ts
│   │   └── health.controller.ts
│   └── dto/
│       ├── create-booking.dto.ts
│       ├── confirm-booking.dto.ts
│       ├── cancel-booking.dto.ts
│       ├── booking-response.dto.ts
│       └── resource-response.dto.ts
├── modules/
│   └── booking.module.ts
├── app.module.ts
└── main.ts
```

### Design Patterns & Principles

#### 1. Clean Architecture

- **Domain Layer**: Pure business logic, no external dependencies
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: Database, external services
- **Presentation Layer**: Controllers, DTOs

#### 2. CQRS (Command Query Responsibility Segregation)

- **Commands**: Modify state (Create, Update, Delete)
- **Queries**: Read data (Get, List, Search)
- **Handlers**: Process commands and queries
- **Event Bus**: Publish domain events

#### 3. Domain-Driven Design (DDD)

- **Entities**: Reservation, User, Resource
- **Value Objects**: ReservationId, TimeSlot
- **Domain Events**: ReservationCreated, ReservationConfirmed, ReservationCancelled
- **Repositories**: Abstract data access

#### 4. SOLID Principles

- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes are substitutable
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

---

## 🚀 Features

### Core Functionality

- ✅ **Create Reservation**: Create new reservations with conflict prevention
- ✅ **View Reservation Details**: Retrieve reservation information by ID
- ✅ **Cancel Reservation**: Cancel existing reservations with reason tracking
- ✅ **Confirm Reservation**: Confirm pending reservations (payment/approval simulation)
- ✅ **Resource Availability**: Check available resources for time slots
- ✅ **User Reservations**: Retrieve all reservations for a specific user

### Advanced Features

- ✅ **CQRS Pattern**: Command Query Responsibility Segregation
- ✅ **Domain Events**: Event-driven architecture with audit trail
- ✅ **Clean Architecture**: SOLID principles and dependency inversion
- ✅ **Conflict Prevention**: Overlapping reservation detection
- ✅ **Audit Trail**: Complete reservation history tracking
- ✅ **Pagination System**: Efficient data retrieval with pagination support
- ✅ **Swagger Documentation**: Interactive API documentation
- ✅ **Comprehensive Testing**: Unit and integration tests
- ✅ **Auto Database Setup**: Automatic table creation and data seeding
- ✅ **Zero Configuration**: No manual database setup required

### Domain Events & Audit Trail

The system implements a comprehensive audit trail using domain events:

- **ReservationCreated**: When a new reservation is created
- **ReservationConfirmed**: When a reservation is confirmed
- **ReservationCancelled**: When a reservation is cancelled

Each event is stored in the `booking_history` table with:

- Previous and new status
- Timestamp
- Reason (for cancellations)
- Metadata

### Conflict Prevention

The system prevents overlapping reservations through:

1. **Time Slot Validation**: Ensures start time < end time
2. **Overlap Detection**: Checks for conflicting reservations
3. **Resource Availability**: Validates resource capacity
4. **Business Rules**: Enforces domain constraints

### Pagination System

The system implements a comprehensive pagination system for efficient data retrieval:

#### Pagination Features

- **Page-based Navigation**: Navigate through large datasets efficiently
- **Configurable Page Size**: Control number of items per page (max 100)
- **Sorting Support**: Sort by any field in ascending or descending order
- **Backward Compatibility**: Non-paginated requests still work as before
- **Performance Optimization**: Reduces memory usage and improves response times

#### Pagination Parameters

| Parameter   | Type   | Default | Description                 |
| ----------- | ------ | ------- | --------------------------- |
| `page`      | number | 1       | Page number (starts from 1) |
| `limit`     | number | 10      | Items per page (max 100)    |
| `sortBy`    | string | varies  | Field to sort by            |
| `sortOrder` | string | varies  | Sort direction (ASC/DESC)   |

#### Pagination Response Format

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Supported Endpoints

- **User Reservations**: `GET /api/v1/reservations/user/:userId?page=1&limit=5`
- **Available Resources**: `GET /api/v1/reservations/available-resources?startTime=...&endTime=...&page=1&limit=3`

---

## 🛠️ Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Architecture**: Clean Architecture + CQRS
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Patterns**: Repository, Command Query, Domain Events

### Dependencies

#### Production Dependencies

| Package                  | Version | Used In           | Purpose                     |
| ------------------------ | ------- | ----------------- | --------------------------- |
| @nestjs/common           | ^11.1.6 | Throughout        | Core NestJS functionality   |
| @nestjs/core             | ^11.1.6 | main.ts, modules  | NestJS application core     |
| @nestjs/platform-express | ^11.1.6 | main.ts           | Express adapter             |
| @nestjs/cqrs             | ^11.0.3 | Application layer | CQRS pattern implementation |
| @nestjs/typeorm          | ^11.0.0 | Infrastructure    | TypeORM integration         |
| @nestjs/config           | ^4.0.2  | app.module.ts     | Configuration management    |
| @nestjs/swagger          | ^11.2.0 | Controllers       | API documentation           |
| @nestjs/throttler        | ^6.4.0  | main.ts           | Rate limiting               |
| typeorm                  | ^0.3.27 | Repositories      | Database ORM                |
| pg                       | ^8.16.3 | TypeORM           | PostgreSQL driver           |
| class-validator          | ^0.14.2 | DTOs              | Input validation            |
| class-transformer        | ^0.5.1  | DTOs              | Object transformation       |
| uuid                     | ^13.0.0 | Domain            | UUID generation             |
| helmet                   | ^8.1.0  | main.ts           | Security headers            |
| compression              | ^1.8.1  | main.ts           | Response compression        |
| morgan                   | ^1.10.1 | main.ts           | HTTP logging                |
| express-rate-limit       | ^8.1.0  | main.ts           | Rate limiting               |

#### Development Dependencies

| Package         | Version  | Used In    | Purpose                |
| --------------- | -------- | ---------- | ---------------------- |
| @nestjs/cli     | ^11.0.10 | Scripts    | NestJS CLI             |
| @nestjs/testing | ^11.1.6  | Tests      | Testing utilities      |
| jest            | ^30.2.0  | Tests      | Testing framework      |
| ts-jest         | ^29.4.4  | Tests      | TypeScript Jest preset |
| supertest       | ^7.1.4   | Tests      | HTTP testing           |
| typescript      | ^5.9.3   | Throughout | TypeScript compiler    |
| ts-node         | ^10.9.2  | Scripts    | TypeScript execution   |

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Purpose             |
| ----------- | ------- | ------------------- |
| Node.js     | v18+    | Runtime environment |
| PostgreSQL  | v12+    | Primary database    |
| npm/yarn    | Latest  | Package management  |
| Git         | Latest  | Version control     |

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd BlueReserve

# 2. Install dependencies
npm install

# 3. Environment setup
cp env.example .env

# 4. Start the application (Database will be auto-initialized)
npm run start:dev

```

### 🚀 Automatic Database Initialization

BlueReserve features **automatic database setup** that eliminates manual configuration:

- **✅ Auto Table Creation**: TypeORM automatically creates all required tables
- **✅ Auto Seeding**: Sample data is automatically created on first run
- **✅ Smart Detection**: Only seeds if database is empty (prevents duplicates)
- **✅ Zero Configuration**: No manual database setup required

**Sample Data Created Automatically:**

- **3 Users**: john.doe@example.com, jane.smith@example.com, bob.johnson@example.com
- **5 Resources**: Conference Room A & B, Hotel Room 101, Event Hall, Workspace Desk 1

### Environment Variables

| Variable      | Default     | Required | Description       |
| ------------- | ----------- | -------- | ----------------- |
| `DB_HOST`     | localhost   | Yes      | PostgreSQL host   |
| `DB_PORT`     | 5432        | Yes      | PostgreSQL port   |
| `DB_USERNAME` | postgres    | Yes      | Database username |
| `DB_PASSWORD` | password    | Yes      | Database password |
| `DB_DATABASE` | blu_reserve | Yes      | Database name     |
| `NODE_ENV`    | development | No       | Environment mode  |
| `PORT`        | 3000        | No       | Application port  |
| `LOG_LEVEL`   | debug       | No       | Logging level     |

### Run Commands

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start

# Testing
npm test
npm run test:watch
npm run test:cov

# Debugging
npm run start:debug
```

### Docker Setup (Recommended)

```bash
# Build and start with Docker Compose (includes automatic database initialization)
docker-compose up -d

# View logs to see automatic database setup
docker-compose logs -f blu-reserve
```

**Docker Benefits:**

- **✅ One Command Setup**: Single command starts everything
- **✅ Automatic Database**: PostgreSQL container with auto-initialization
- **✅ Environment Ready**: All environment variables pre-configured
- **✅ Production Ready**: Same setup for development and production

# The API will be available at http://localhost:3000

# Swagger documentation at http://localhost:3000/api-docs

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Reservation Endpoints

| Method | Endpoint                            | Description              |
| ------ | ----------------------------------- | ------------------------ |
| POST   | `/reservations`                     | Create a new reservation |
| GET    | `/reservations/:id`                 | Get reservation by ID    |
| GET    | `/reservations/user/:userId`        | Get user's reservations  |
| PUT    | `/reservations/:id/confirm`         | Confirm a reservation    |
| DELETE | `/reservations/:id`                 | Cancel a reservation     |
| GET    | `/reservations/available-resources` | Get available resources  |

### Pagination Endpoints

| Method | Endpoint                            | Pagination Support | Description                         |
| ------ | ----------------------------------- | ------------------ | ----------------------------------- |
| GET    | `/reservations/user/:userId`        | ✅ Yes             | Get user's reservations (paginated) |
| GET    | `/reservations/available-resources` | ✅ Yes             | Get available resources (paginated) |

### API Examples

#### Create Reservation

**Request:**

```bash
curl -X POST http://localhost:3000/api/v1/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "a3db9897-93d3-46c1-8939-02d33b029950",
    "resourceId": "a3db9897-93d3-46c1-8939-02d33b029953",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T12:00:00Z",
    "notes": "Team meeting"
  }'
```

**Response:** `201 Created`

```json
{
  "id": "generated-uuid",
  "userId": "a3db9897-93d3-46c1-8939-02d33b029950",
  "resourceId": "a3db9897-93d3-46c1-8939-02d33b029953",
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": "2024-01-15T12:00:00.000Z",
  "status": "pending",
  "notes": "Team meeting",
  "createdAt": "2024-01-15T09:00:00.000Z",
  "updatedAt": "2024-01-15T09:00:00.000Z"
}
```

#### Get Available Resources

**Request:**

```bash
curl "http://localhost:3000/api/v1/reservations/available-resources?startTime=2024-01-15T10:00:00Z&endTime=2024-01-15T12:00:00Z"
```

**Response:** `200 OK`

```json
[
  {
    "id": "resource-uuid",
    "name": "Conference Room A",
    "type": "meeting_room",
    "capacity": 20,
    "isActive": true
  }
]
```

#### Get User Reservations with Pagination

**Request:**

```bash
curl "http://localhost:3000/api/v1/reservations/user/a3db9897-93d3-46c1-8939-02d33b029950?page=1&limit=5&sortBy=createdAt&sortOrder=DESC"
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "booking-uuid",
      "userId": "a3db9897-93d3-46c1-8939-02d33b029950",
      "resourceId": "resource-uuid",
      "startTime": "2024-01-15T10:00:00.000Z",
      "endTime": "2024-01-15T12:00:00.000Z",
      "status": "pending",
      "notes": "Team meeting",
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-15T09:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 12,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Available Resources with Pagination

**Request:**

```bash
curl "http://localhost:3000/api/v1/reservations/available-resources?startTime=2024-01-15T10:00:00Z&endTime=2024-01-15T12:00:00Z&page=1&limit=3&sortBy=name&sortOrder=ASC"
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "resource-uuid-1",
      "name": "Conference Room A",
      "type": "meeting_room",
      "capacity": 20,
      "isActive": true
    },
    {
      "id": "resource-uuid-2",
      "name": "Conference Room B",
      "type": "meeting_room",
      "capacity": 10,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 3,
    "total": 8,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Confirm Reservation

**Request:**

```bash
curl -X PUT http://localhost:3000/api/v1/reservations/{reservation-id}/confirm
```

#### Cancel Reservation

**Request:**

```bash
curl -X DELETE http://localhost:3000/api/v1/reservations/{reservation-id} \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Change of plans"
  }'
```

### Error Responses

| Status Code | Description       | Example Response                                                                          |
| ----------- | ----------------- | ----------------------------------------------------------------------------------------- |
| 400         | Bad Request       | `{"statusCode": 400, "message": "Start time must be before end time"}`                    |
| 404         | Not Found         | `{"statusCode": 404, "message": "User with ID xxx not found"}`                            |
| 409         | Conflict          | `{"statusCode": 409, "message": "Resource is not available for the requested time slot"}` |
| 429         | Too Many Requests | `{"statusCode": 429, "message": "Too many requests, please try again later"}`             |

### Swagger Documentation

Interactive API documentation is available at:

- **Development**: `http://localhost:3000/api-docs`
- **Production**: `http://your-domain.com/api-docs`

---

## 🧪 Testing Guide

### Quick Start Testing

#### 1. Start the Application

```bash
# Install dependencies
npm install

# Start the application
npm run start:dev
```

The API will be available at `http://localhost:3000`

#### 2. Access Swagger Documentation

Open your browser and navigate to: `http://localhost:3000/api-docs`

### Manual Testing Scenarios

#### Scenario 1: Create a Reservation

**Request:**

```bash
curl -X POST http://localhost:3000/api/v1/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "a3db9897-93d3-46c1-8939-02d33b029950",
    "resourceId": "a3db9897-93d3-46c1-8939-02d33b029953",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T12:00:00Z",
    "notes": "Team standup meeting"
  }'
```

**Expected Response:**

```json
{
  "id": "generated-reservation-id",
  "userId": "a3db9897-93d3-46c1-8939-02d33b029950",
  "resourceId": "a3db9897-93d3-46c1-8939-02d33b029953",
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": "2024-01-15T12:00:00.000Z",
  "status": "pending",
  "notes": "Team standup meeting",
  "createdAt": "2024-01-15T09:00:00.000Z",
  "updatedAt": "2024-01-15T09:00:00.000Z"
}
```

#### Scenario 2: Test Pagination

**Step 1:** Get user reservations with pagination

```bash
curl "http://localhost:3000/api/v1/reservations/user/a3db9897-93d3-46c1-8939-02d33b029950?page=1&limit=3&sortBy=createdAt&sortOrder=DESC"
```

**Expected Response:**

```json
{
  "data": [
    {
      "id": "booking-uuid-1",
      "userId": "a3db9897-93d3-46c1-8939-02d33b029950",
      "resourceId": "resource-uuid",
      "startTime": "2024-01-15T10:00:00.000Z",
      "endTime": "2024-01-15T12:00:00.000Z",
      "status": "pending",
      "createdAt": "2024-01-15T09:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 3,
    "total": 8,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Step 2:** Get next page

```bash
curl "http://localhost:3000/api/v1/reservations/user/a3db9897-93d3-46c1-8939-02d33b029950?page=2&limit=3&sortBy=createdAt&sortOrder=DESC"
```

#### Scenario 3: Test Conflict Prevention

**Step 1:** Create first reservation

```bash
curl -X POST http://localhost:3000/api/v1/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "a3db9897-93d3-46c1-8939-02d33b029950",
    "resourceId": "a3db9897-93d3-46c1-8939-02d33b029953",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T12:00:00Z"
  }'
```

**Step 2:** Try to create overlapping reservation

```bash
curl -X POST http://localhost:3000/api/v1/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "a3db9897-93d3-46c1-8939-02d33b029951",
    "resourceId": "a3db9897-93d3-46c1-8939-02d33b029953",
    "startTime": "2024-01-15T11:00:00Z",
    "endTime": "2024-01-15T13:00:00Z"
  }'
```

**Expected Response:**

```json
{
  "statusCode": 409,
  "message": "Resource is not available for the requested time slot. Found 1 overlapping reservations.",
  "error": "Conflict"
}
```

### Automated Testing

#### Run Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

#### Test Coverage

The test suite covers:

- ✅ Domain entities (Booking, User, Resource)
- ✅ Value objects (BookingId, TimeSlot)
- ✅ Command handlers (Create, Confirm, Cancel)
- ✅ Query handlers (Get, List, Search)
- ✅ Controllers (API endpoints)
- ✅ Repository implementations

**Current Coverage**: 81.19% statement coverage with 375 tests passing

#### Test Types

1. **Unit Tests**

   - Domain entities and business logic validation
   - Value objects immutability and validation
   - Command/query handlers processing
   - Repository data access methods

2. **Integration Tests**

   - API endpoints end-to-end
   - Database operations
   - Domain event processing

3. **E2E Tests**
   - Complete user workflows
   - Cross-service integration

### Test Cases

#### Reservation Creation Tests

| Test Case               | Input                           | Expected Result |
| ----------------------- | ------------------------------- | --------------- |
| Valid reservation       | Valid user, resource, time slot | 201 Created     |
| Invalid user            | Non-existent user ID            | 404 Not Found   |
| Invalid resource        | Non-existent resource ID        | 404 Not Found   |
| Past time slot          | Start time in the past          | 400 Bad Request |
| Invalid time slot       | Start time >= end time          | 400 Bad Request |
| Overlapping reservation | Conflicting time slot           | 409 Conflict    |

#### Resource Availability Tests

| Test Case              | Input                  | Expected Result                |
| ---------------------- | ---------------------- | ------------------------------ |
| Available resources    | Valid time slot        | 200 OK with resources          |
| Filter by type         | Valid time slot + type | 200 OK with filtered resources |
| No available resources | Fully booked time slot | 200 OK with empty array        |

#### Pagination Tests

| Test Case           | Input                            | Expected Result              |
| ------------------- | -------------------------------- | ---------------------------- |
| Valid pagination    | page=1, limit=10                 | 200 OK with paginated data   |
| Invalid page number | page=0, limit=10                 | 400 Bad Request              |
| Invalid limit       | page=1, limit=101                | 400 Bad Request              |
| Empty results       | page=1, limit=10 (no data)       | 200 OK with empty data array |
| Sorting by field    | sortBy=createdAt, sortOrder=DESC | 200 OK with sorted data      |
| Invalid sort field  | sortBy=invalidField              | 200 OK with default sorting  |

#### Reservation Management Tests

| Test Case                       | Input                         | Expected Result           |
| ------------------------------- | ----------------------------- | ------------------------- |
| Confirm pending reservation     | Valid reservation ID          | 200 OK, status: confirmed |
| Confirm non-pending reservation | Already confirmed reservation | 400 Bad Request           |
| Cancel reservation              | Valid reservation ID          | 204 No Content            |
| Cancel already cancelled        | Already cancelled reservation | 400 Bad Request           |

---

## 📊 Database Schema

### Core Tables

#### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    phone VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Resources Table

```sql
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT,
    type VARCHAR NOT NULL CHECK (type IN ('hotel_room', 'meeting_room', 'event_ticket', 'conference_hall', 'workspace', 'vehicle')),
    capacity INTEGER DEFAULT 1,
    price_per_hour DECIMAL(10,2),
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Bookings Table

```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    resource_id UUID NOT NULL REFERENCES resources(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Booking History Table

```sql
CREATE TABLE booking_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    user_id UUID NOT NULL REFERENCES users(id),
    resource_id UUID NOT NULL REFERENCES users(id),
    previous_status VARCHAR NOT NULL,
    new_status VARCHAR NOT NULL,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Relationships

- **User → Bookings**: One-to-Many (one user can have multiple bookings)
- **Resource → Bookings**: One-to-Many (one resource can have multiple bookings)
- **Booking → BookingHistory**: One-to-Many (one booking can have multiple history records)

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_resource_id ON bookings(resource_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_time_range ON bookings(start_time, end_time);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_active ON resources(is_active);
CREATE INDEX idx_booking_history_booking_id ON booking_history(booking_id);
```

---

## 🔧 Configuration

### Environment Configuration

The application uses `@nestjs/config` for configuration management:

```typescript
// app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: ".env",
});
```

### Configuration Variables

| Variable      | Default     | Required | Description       | Production Notes                |
| ------------- | ----------- | -------- | ----------------- | ------------------------------- |
| `DB_HOST`     | localhost   | Yes      | PostgreSQL host   | Use managed database service    |
| `DB_PORT`     | 5432        | Yes      | PostgreSQL port   | Standard PostgreSQL port        |
| `DB_USERNAME` | postgres    | Yes      | Database username | Use dedicated service account   |
| `DB_PASSWORD` | password    | Yes      | Database password | Use strong, unique password     |
| `DB_DATABASE` | blu_reserve | Yes      | Database name     | Environment-specific naming     |
| `NODE_ENV`    | development | No       | Environment mode  | Set to 'production' in prod     |
| `PORT`        | 3000        | No       | Application port  | Use environment-specific port   |
| `LOG_LEVEL`   | debug       | No       | Logging verbosity | Set to 'info' or 'warn' in prod |

### Security Configuration

#### Current Security Implementation

| Security Feature | Status          | Implementation                  |
| ---------------- | --------------- | ------------------------------- |
| SQL Injection    | Protected       | TypeORM parameterized queries   |
| XSS              | Protected       | Helmet + input validation       |
| Rate Limiting    | Implemented     | 10 requests/minute              |
| Input Validation | Implemented     | class-validator                 |
| Authentication   | Not implemented | No auth system present          |
| Authorization    | Not implemented | No authorization system present |
| CSRF Protection  | Not implemented | No CSRF tokens                  |

#### Security Measures

1. **HTTP Security Headers (Helmet)**

   - XSS protection
   - Content Security Policy
   - Frame options
   - HSTS headers

2. **Rate Limiting**

   ```typescript
   app.use(
     rateLimit({
       windowMs: 60 * 1000, // 1 minute
       max: 10, // 10 requests per window
       standardHeaders: true,
       legacyHeaders: false,
     })
   );
   ```

3. **Input Validation**

   ```typescript
   @IsNotEmpty()
   @IsUUID()
   userId: string;

   @IsDateString()
   startTime: string;
   ```

---

## 🚀 Deployment

### Docker Configuration

#### Dockerfile

```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci --only=production=false && npm cache clean --force
COPY src/ ./src/
RUN npm run build

FROM node:22-alpine AS production
RUN apk add --no-cache dumb-init
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/dist ./dist
RUN chown -R nestjs:nodejs /app
USER nestjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

#### Docker Compose

```yaml
version: "3.8"
services:
  postgres:
    image: bitnami/postgresql:17.6.0-debian-12-r4
    container_name: blu-reserve-db-postgresql
    environment:
      POSTGRES_DB: blu_reserve
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  blu-reserve:
    build:
      context: .
      dockerfile: Dockerfile
    image: blu-reserve:latest
    container_name: blu-reserve-api
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: password
      DB_DATABASE: blu_reserve
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test:
        [
          "CMD",
          "node",
          "-e",
          "require('http').get('http://localhost:3000/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  postgres_data:
```

### Build Process

#### Local Build

```bash
# Build application
npm run build

# Build Docker image
docker build -t blu-reserve:latest .

# Run with Docker Compose
docker-compose up -d
```

#### Production Build

```bash
# Install dependencies
npm ci --only=production

# Build application
npm run build

# Start application
npm run start
```

### Production Considerations

1. **Database**: Use managed PostgreSQL service
2. **Environment**: Set `NODE_ENV=production`
3. **Logging**: Configure structured logging
4. **Monitoring**: Add health checks and metrics
5. **Security**: Implement authentication/authorization

---

## 🔄 Development Workflow

### Branching Strategy

#### Git Flow

```
main (production)
├── develop (integration)
├── feature/booking-confirmation
├── feature/payment-integration
├── hotfix/critical-bug-fix
└── release/v1.1.0
```

#### Branch Naming Convention

- `feature/description`: New features
- `bugfix/description`: Bug fixes
- `hotfix/description`: Critical fixes
- `chore/description`: Maintenance tasks
- `docs/description`: Documentation updates

### Commit Message Style

#### Conventional Commits

```
type(scope): description

feat(booking): add confirmation endpoint
fix(auth): resolve JWT token validation
docs(api): update endpoint documentation
test(booking): add unit tests for handlers
refactor(domain): extract booking validation logic
```

#### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

### Adding New Features

#### Step-by-Step Guide

1. **Create Feature Branch**:

   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Implement Domain Logic**:

   - Create/update entities in `src/domain/entities/`
   - Add value objects in `src/domain/value-objects/`
   - Define events in `src/domain/events/`

3. **Implement Application Layer**:

   - Create commands/queries in `src/application/commands/` or `src/application/queries/`
   - Implement handlers in respective `handlers/` directories
   - Add event handlers if needed

4. **Implement Infrastructure**:

   - Update repositories in `src/infrastructure/persistence/typeorm/`
   - Add database migrations if needed

5. **Implement Presentation Layer**:

   - Create DTOs in `src/presentation/dto/`
   - Add controller endpoints in `src/presentation/controllers/`
   - Update Swagger documentation

6. **Add Tests**:

   - Unit tests for domain logic
   - Integration tests for handlers
   - E2E tests for API endpoints

7. **Update Documentation**:
   - Update API documentation
   - Add examples to README
   - Update this documentation

---

## ⚡ Performance & Security

### Performance Characteristics

#### Database Performance

- **Connection Pooling**: TypeORM default configuration
- **Query Optimization**: Basic indexing on primary keys
- **Transaction Management**: ACID compliance maintained

#### Application Performance

- **Response Compression**: Enabled via compression middleware
- **Rate Limiting**: 10 requests per minute per IP
- **Memory Usage**: Standard Node.js heap management

### Performance Targets

| Metric              | Target       | Current Status | Status            |
| ------------------- | ------------ | -------------- | ----------------- |
| API Response Time   | < 200ms      | Not measured   | Needs measurement |
| Database Query Time | < 100ms      | Not measured   | Needs measurement |
| Memory Usage        | < 512MB      | Not monitored  | Needs monitoring  |
| CPU Usage           | < 70%        | Not monitored  | Needs monitoring  |
| Throughput          | 1000 req/min | Not measured   | Needs measurement |

### Security Status

#### Current Security Implementation

- **Authentication**: Not implemented
- **Authorization**: Not implemented
- **Input Validation**: Basic implementation
- **Rate Limiting**: Basic implementation
- **Security Headers**: Implemented via Helmet
- **SQL Injection**: Protected via TypeORM
- **XSS Protection**: Basic implementation

#### Recommended Security Improvements

1. **Authentication System** (Not Implemented)

   - Implement JWT tokens
   - Add refresh token mechanism
   - Implement password hashing
   - Add account lockout

2. **Authorization Framework** (Not Implemented)
   - Implement role-based access control
   - Add permission-based authorization
   - Implement resource-level permissions
   - Add admin-only endpoints

---

## 🐛 Troubleshooting

### Common Errors and Solutions

#### 1. Database Connection Issues

**Error**: `Connection terminated unexpectedly`

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
pg_isready -h localhost -p 5432

# Verify credentials
psql -h localhost -U postgres -d blu_reserve
```

**Solution**:

```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Check firewall
sudo ufw status

# Verify environment variables
echo $DB_HOST $DB_PORT $DB_USERNAME $DB_DATABASE
```

#### 2. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

```bash
# Find process using port
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run start:dev
```

#### 3. TypeORM Synchronization Issues

**Error**: `relation "users" does not exist`

```bash
# Enable synchronization in development
NODE_ENV=development npm run start:dev

# Or run migrations manually
npm run typeorm migration:run
```

#### 4. Memory Issues

**Error**: `JavaScript heap out of memory`

```bash
# Increase heap size
node --max-old-space-size=4096 dist/main.js

# Or use environment variable
NODE_OPTIONS="--max-old-space-size=4096" npm run start
```

### Debugging Guide

#### 1. Enable Debug Logging

```bash
# Set debug level
export LOG_LEVEL=debug

# Start application
npm run start:dev
```

#### 2. Database Debugging

```typescript
// Enable TypeORM logging
TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    // ... existing config
    logging: configService.get<string>("NODE_ENV") === "development",
  }),
});
```

#### 3. API Debugging

```bash
# Test endpoints with verbose output
curl -v http://localhost:3000/api/v1/reservations

# Check Swagger documentation
open http://localhost:3000/api-docs
```

### FAQ

#### Q: How do I reset the database?

A: With automatic database initialization, you have several options:

**Option 1: Docker (Recommended)**

```bash
# Stop containers and remove volumes (this deletes all data)
docker-compose down -v
docker-compose up -d
```

**Option 2: Manual Database Reset**

```bash
# Drop and recreate database
dropdb blu_reserve
createdb blu_reserve
# Restart application - it will auto-seed
npm run start:dev
```

**Option 3: Clear Specific Tables**

```bash
# Connect to database and clear tables
psql -d blu_reserve -c "TRUNCATE users, resources, bookings, booking_history CASCADE;"
# Restart application - it will auto-seed
npm run start:dev
```

#### Q: How does automatic database initialization work?

A: The system automatically:

1. **Creates Tables**: TypeORM synchronizes your entities to create all required tables
2. **Checks for Data**: On startup, it checks if the database has any users
3. **Auto-Seeds**: If empty, it creates sample users and resources automatically
4. **Smart Detection**: Only seeds once - won't duplicate data on subsequent starts

**What gets created automatically:**

- 3 sample users with realistic data
- 5 sample resources (meeting rooms, hotel room, event hall, workspace)
- All necessary database tables and relationships

#### Q: How do I run tests?

A:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run specific test
npm test -- create-booking.handler.spec.ts
```

#### Q: How do I add a new resource type?

A:

1. Add enum value to `ResourceType` enum
2. Update database schema
3. Add validation in DTOs
4. Update tests

#### Q: How do I handle timezone issues?

A:

```typescript
// Use UTC for all timestamps
const startTime = new Date("2024-01-15T10:00:00Z");

// Convert to local time for display
const localTime = new Date(startTime.toLocaleString());
```

---

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Pull Request Checklist

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Security considerations addressed

### Code Quality Standards

#### TypeScript Best Practices

- Use strict typing
- Avoid `any` type
- Use interfaces for object shapes
- Use enums for constants
- Use generics for reusable code

#### NestJS Best Practices

- Use dependency injection
- Follow module structure
- Use guards for authorization
- Use interceptors for cross-cutting concerns
- Use pipes for validation

#### Clean Architecture Principles

- Domain layer has no external dependencies
- Application layer orchestrates use cases
- Infrastructure layer implements interfaces
- Presentation layer handles HTTP concerns

---

## 🎯 Future Enhancements

### Planned Features

- [x] **Pagination System**: Efficient data retrieval with pagination support ✅
- [ ] **Authentication & Authorization**: JWT-based auth with role-based access control
- [ ] **Payment Integration**: Stripe/PayPal integration for booking payments
- [ ] **Email Notifications**: Automated email notifications for booking events
- [ ] **Real-time Updates**: WebSocket support for live booking updates
- [ ] **Advanced Reporting**: Analytics and reporting dashboard
- [ ] **Multi-tenancy Support**: Support for multiple organizations
- [ ] **Caching Layer**: Redis caching for improved performance
- [ ] **Message Queue**: RabbitMQ/Kafka for event processing
- [ ] **API Versioning**: Support for multiple API versions
- [ ] **Monitoring**: Prometheus/Grafana integration
- [ ] **Microservices**: Break down into smaller services
- [ ] **Event Sourcing**: Complete event sourcing implementation

### Version Roadmap

#### Version 1.1.0 (Estimated: 1 month)

- Authentication and authorization
- Enhanced error handling
- Improved validation
- Additional API endpoints

#### Version 1.2.0 (Estimated: 2 months)

- Caching layer implementation (Redis)
- Performance optimizations
- Enhanced monitoring (Prometheus/Grafana)
- Additional testing coverage

#### Version 2.0.0 (Estimated: 3 months)

- Microservices architecture
- Event sourcing
- Advanced analytics
- Mobile API support

---

## 📝 License

This project is licensed under the MIT License.

---

## 📞 Support

For questions or support, please contact the development team or create an issue in the repository.

---

**Built with ❤️ using NestJS, TypeScript, and Clean Architecture principles for BlueReserve**

**Documentation Version**: 1.0.0  
**Last Updated**: January 2024  
**Maintained By**: Development Team

For questions or contributions to this documentation, please create an issue in the repository or contact the development team.
