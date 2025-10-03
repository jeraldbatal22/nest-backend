# Comprehensive User Entity Guide

This document explains the comprehensive User entity that's commonly used in large-scale applications. The entity includes all essential features for user management, authentication, authorization, and user lifecycle management.

## Features Overview

### 🔐 Authentication & Security
- **Password hashing** with bcrypt (12 salt rounds)
- **JWT refresh token** management
- **Password reset** functionality
- **Email verification** system
- **Phone verification** with SMS codes

### 👤 User Profile
- **Basic info**: firstName, lastName, email, username
- **Contact**: phone number with verification
- **Profile**: avatar, bio, location, website
- **Personal**: date of birth

### 🛡️ Authorization & Roles
- **Role-based access control** (Admin, Moderator, User, Guest)
- **User status management** (Active, Inactive, Suspended, Pending)
- **Permission system** with resource-based access control

### 📊 User Management
- **Soft delete** functionality
- **Audit trails** with timestamps
- **Last login tracking** with IP addresses
- **User preferences** and metadata storage

## Database Schema

### Table: `users`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `firstName` | VARCHAR(50) | User's first name |
| `lastName` | VARCHAR(50) | User's last name |
| `email` | VARCHAR(100) | Unique email address |
| `username` | VARCHAR(20) | Unique username (optional) |
| `password` | VARCHAR(255) | Hashed password |
| `phone` | VARCHAR(20) | Phone number (optional) |
| `dateOfBirth` | DATE | Date of birth (optional) |
| `role` | ENUM | User role (admin/user/moderator/guest) |
| `status` | ENUM | User status (active/inactive/suspended/pending_verification) |
| `avatar` | VARCHAR(255) | Avatar URL (optional) |
| `bio` | VARCHAR(500) | User biography (optional) |
| `location` | VARCHAR(100) | User location (optional) |
| `website` | VARCHAR(255) | Website URL (optional) |
| `isEmailVerified` | BOOLEAN | Email verification status |
| `isPhoneVerified` | BOOLEAN | Phone verification status |
| `emailVerifiedAt` | TIMESTAMP | Email verification timestamp |
| `phoneVerifiedAt` | TIMESTAMP | Phone verification timestamp |
| `lastLoginAt` | TIMESTAMP | Last login timestamp |
| `lastLoginIp` | VARCHAR(45) | Last login IP address |
| `refreshToken` | VARCHAR(255) | JWT refresh token |
| `refreshTokenExpiresAt` | TIMESTAMP | Refresh token expiration |
| `resetPasswordToken` | VARCHAR(255) | Password reset token |
| `resetPasswordExpiresAt` | TIMESTAMP | Reset token expiration |
| `emailVerificationToken` | VARCHAR(255) | Email verification token |
| `phoneVerificationCode` | VARCHAR(255) | SMS verification code |
| `phoneVerificationExpiresAt` | TIMESTAMP | SMS code expiration |
| `preferences` | JSON | User preferences |
| `metadata` | JSON | Additional metadata |
| `createdAt` | TIMESTAMP | Creation timestamp |
| `updatedAt` | TIMESTAMP | Last update timestamp |
| `deletedAt` | TIMESTAMP | Soft delete timestamp |

## Usage Examples

### Creating a New User

```typescript
import { User, UserRole, UserStatus } from './entities/user.entity';

const newUser = new User();
newUser.firstName = 'John';
newUser.lastName = 'Doe';
newUser.email = 'john.doe@example.com';
newUser.username = 'johndoe';
newUser.password = 'securePassword123';
newUser.role = UserRole.USER;
newUser.status = UserStatus.PENDING_VERIFICATION;

// Password will be automatically hashed before saving
await userRepository.save(newUser);
```

### Authentication

```typescript
// Find user by email
const user = await userRepository.findOne({ where: { email: 'john.doe@example.com' } });

// Validate password
const isValid = await user.validatePassword('plainTextPassword');
if (isValid) {
  // Generate refresh token
  user.generateRefreshToken();
  user.updateLastLogin('192.168.1.1');
  await userRepository.save(user);
}
```

### Email Verification

```typescript
// Generate verification token
user.generateEmailVerificationToken();
await userRepository.save(user);

// Send verification email with user.emailVerificationToken

// Verify email
user.verifyEmail();
await userRepository.save(user);
```

### Phone Verification

```typescript
// Generate verification code
user.generatePhoneVerificationCode();
await userRepository.save(user);

// Send SMS with user.phoneVerificationCode

// Verify phone
const isValidCode = user.verifyPhone('123456');
if (isValidCode) {
  await userRepository.save(user);
}
```

### Password Reset

```typescript
// Generate reset token
user.generatePasswordResetToken();
await userRepository.save(user);

// Send reset email with user.resetPasswordToken

// Reset password (after token validation)
user.password = 'newSecurePassword';
user.clearPasswordResetToken();
await userRepository.save(user);
```

### User Management

```typescript
// Check user permissions
if (user.canAccess('users.read')) {
  // Allow access to users.read resource
}

// Suspend user
user.suspend('Violation of terms of service');
await userRepository.save(user);

// Activate user
user.activate();
await userRepository.save(user);

// Check user status
if (user.isActive()) {
  // User is active
}

if (user.isAdmin()) {
  // User is admin
}

if (user.isModerator()) {
  // User is moderator or admin
}
```

### Virtual Properties

```typescript
// Get full name
const fullName = user.fullName; // "John Doe"

// Get initials
const initials = user.initials; // "JD"
```

## Role-Based Access Control

### Roles and Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | All permissions (`*`) |
| **Moderator** | users.read, users.update, content.create, content.update, content.delete |
| **User** | profile.read, profile.update, content.create, content.read |
| **Guest** | content.read |

### Checking Permissions

```typescript
// Check specific permission
if (user.canAccess('users.read')) {
  // Allow access
}

// Check role
if (user.isAdmin()) {
  // Admin-only functionality
}
```

## User Statuses

### Status Flow

```
PENDING_VERIFICATION → ACTIVE
    ↓
SUSPENDED ← ACTIVE → INACTIVE
    ↓
ACTIVE (after reactivation)
```

### Status Management

```typescript
// Check status
if (user.status === UserStatus.ACTIVE) {
  // User is active and can use the system
}

// Suspend user
user.suspend('Reason for suspension');

// Activate user
user.activate();
```

## Security Best Practices

### Password Security
- Passwords are automatically hashed with bcrypt (12 salt rounds)
- Never store plain text passwords
- Use the `validatePassword()` method for authentication

### Token Management
- Refresh tokens expire after 7 days
- Password reset tokens expire after 1 hour
- Phone verification codes expire after 10 minutes
- Always clear tokens after use

### Data Protection
- Password field is excluded from serialization using `@Exclude()`
- Use soft deletes to maintain data integrity
- Store sensitive metadata in the `metadata` field

## Integration with NestJS

### Repository Usage

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
}
```

### DTOs for API

```typescript
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```

## Dependencies

Make sure you have the following dependencies installed:

```bash
pnpm install bcrypt
pnpm install -D @types/bcrypt
```

## Migration

When you're ready to create the database migration:

```bash
# Generate migration
npm run typeorm:migration:generate -- -n CreateUsersTable

# Run migration
npm run typeorm:migration:run
```

This comprehensive user entity provides all the essential features needed for a production-ready user management system in large-scale applications.
