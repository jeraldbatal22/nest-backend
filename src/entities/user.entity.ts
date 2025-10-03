import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
  GUEST = 'guest',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  @Index()
  username?: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({
    type: 'varchar',
    length: 10,
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'varchar',
    length: 20,
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  bio?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isPhoneVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  phoneVerifiedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  lastLoginIp?: string;

  @Column({ type: 'text', nullable: true })
  refreshToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpiresAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpiresAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailVerificationToken?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phoneVerificationCode?: string;

  @Column({ type: 'timestamp', nullable: true })
  phoneVerificationExpiresAt?: Date;

  @Column({ type: 'json', nullable: true })
  preferences?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Virtual fields
  get fullName(): string {
    const capitalize = (s: string) =>
      s && s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    const first = capitalize(this.firstName || '');
    const last = capitalize(this.lastName || '');
    return `${first} ${last}`.trim();
  }

  get initials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }

  // Lifecycle hooks
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password && !this.password.startsWith('$2b$')) {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  // Instance methods
  async validatePassword(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.password);
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isModerator(): boolean {
    return this.role === UserRole.MODERATOR || this.role === UserRole.ADMIN;
  }

  canAccess(resource: string): boolean {
    const permissions = {
      [UserRole.ADMIN]: ['*'], // Admin can access everything
      [UserRole.MODERATOR]: [
        'users.read',
        'users.update',
        'content.create',
        'content.update',
        'content.delete',
      ],
      [UserRole.USER]: [
        'profile.read',
        'profile.update',
        'content.create',
        'content.read',
      ],
      [UserRole.GUEST]: ['content.read'],
    };

    const userPermissions = permissions[this.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(resource);
  }

  updateLastLogin(ip?: string): void {
    this.lastLoginAt = new Date();
    this.lastLoginIp = ip;
  }

  generateRefreshToken(
    token?: string,
    ttlMs: number = 7 * 24 * 60 * 60 * 1000,
  ): void {
    // If a token is provided (e.g., a JWT), use it; otherwise fall back to a secure random token
    this.refreshToken = token ?? randomBytes(32).toString('hex');
    this.refreshTokenExpiresAt = new Date(Date.now() + ttlMs);
  }

  clearRefreshToken(): void {
    this.refreshToken = undefined;
    this.refreshTokenExpiresAt = undefined;
  }

  generatePasswordResetToken(): void {
    this.resetPasswordToken = randomBytes(32).toString('hex');
    this.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  }

  clearPasswordResetToken(): void {
    this.resetPasswordToken = undefined;
    this.resetPasswordExpiresAt = undefined;
  }

  generateEmailVerificationToken(): void {
    this.emailVerificationToken = randomBytes(32).toString('hex');
  }

  verifyEmail(): void {
    this.isEmailVerified = true;
    this.emailVerifiedAt = new Date();
    this.emailVerificationToken = undefined;
    if (this.status === UserStatus.PENDING_VERIFICATION) {
      this.status = UserStatus.ACTIVE;
    }
  }

  generatePhoneVerificationCode(): void {
    this.phoneVerificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    this.phoneVerificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  }

  verifyPhone(code: string): boolean {
    if (
      this.phoneVerificationCode === code &&
      this.phoneVerificationExpiresAt &&
      this.phoneVerificationExpiresAt > new Date()
    ) {
      this.isPhoneVerified = true;
      this.phoneVerifiedAt = new Date();
      this.phoneVerificationCode = undefined;
      this.phoneVerificationExpiresAt = undefined;
      return true;
    }
    return false;
  }

  suspend(reason?: string): void {
    this.status = UserStatus.SUSPENDED;
    this.metadata = {
      ...this.metadata,
      suspensionReason: reason,
      suspendedAt: new Date(),
    };
  }

  activate(): void {
    this.status = UserStatus.ACTIVE;
    if (this.metadata) {
      delete this.metadata.suspensionReason;
      delete this.metadata.suspendedAt;
    }
  }
}
