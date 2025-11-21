// Shared types used across frontend and backend

export type UserRole = 'OPERATOR' | 'EMPLOYEE';

export type ShiftStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';

export type AttendanceStatus = 'PENDING' | 'ON_SHIFT' | 'COMPLETED' | 'MISSED';

export type NotificationType = 
  | 'PUBLISH' 
  | 'UPDATE' 
  | 'CANCEL' 
  | 'REMINDER' 
  | 'CALLOUT' 
  | 'MISSED_CLOCKIN';

export interface User {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  role: UserRole;
  workRoleId?: string;
  availability?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkRole {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shift {
  id: string;
  userId: string;
  roleId: string;
  startTime: Date;
  endTime: Date;
  status: ShiftStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  role?: WorkRole;
  attendance?: Attendance;
}

export interface Attendance {
  id: string;
  shiftId: string;
  clockIn?: Date;
  clockOut?: Date;
  status: AttendanceStatus;
  location?: any;
}

export interface Callout {
  id: string;
  userId: string;
  shiftId: string;
  reason: string;
  createdAt: Date;
  user?: User;
  shift?: Shift;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  sentAt: Date;
  read: boolean;
}

export interface CreateShiftInput {
  userId: string;
  roleId: string;
  startTime: Date;
  endTime: Date;
}

export interface UpdateShiftInput {
  userId?: string;
  roleId?: string;
  startTime?: Date;
  endTime?: Date;
  status?: ShiftStatus;
}

export interface ClockInInput {
  shiftId: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ClockOutInput {
  shiftId: string;
}

export interface CalloutInput {
  shiftId: string;
  reason: string;
}
