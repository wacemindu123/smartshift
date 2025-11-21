// Mock data for testing

export const mockUser = {
  id: 'user-1',
  clerkId: 'clerk-user-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'EMPLOYEE' as const,
  workRoleId: 'role-1',
  phoneNumber: '+1234567890',
  smsEnabled: true,
  availability: {
    MONDAY: { day: 'MONDAY', startTime: '09:00', endTime: '17:00', available: true },
    TUESDAY: { day: 'TUESDAY', startTime: '09:00', endTime: '17:00', available: true },
    WEDNESDAY: { day: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', available: true },
    THURSDAY: { day: 'THURSDAY', startTime: '09:00', endTime: '17:00', available: true },
    FRIDAY: { day: 'FRIDAY', startTime: '09:00', endTime: '17:00', available: true },
    SATURDAY: { day: 'SATURDAY', startTime: '09:00', endTime: '17:00', available: false },
    SUNDAY: { day: 'SUNDAY', startTime: '09:00', endTime: '17:00', available: false },
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const mockOperator = {
  ...mockUser,
  id: 'operator-1',
  clerkId: 'clerk-operator-1',
  name: 'Jane Manager',
  email: 'jane@example.com',
  role: 'OPERATOR' as const,
}

export const mockWorkRole = {
  id: 'role-1',
  name: 'Server',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const mockShift = {
  id: 'shift-1',
  userId: 'user-1',
  roleId: 'role-1',
  startTime: new Date('2024-01-15T09:00:00'),
  endTime: new Date('2024-01-15T17:00:00'),
  status: 'DRAFT' as const,
  publishedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  user: mockUser,
  role: mockWorkRole,
}

export const mockPublishedShift = {
  ...mockShift,
  id: 'shift-2',
  status: 'PUBLISHED' as const,
  publishedAt: new Date('2024-01-10'),
}

export const mockAvailabilityChangeRequest = {
  id: 'request-1',
  userId: 'user-1',
  requestedChanges: {
    MONDAY: { day: 'MONDAY', startTime: '10:00', endTime: '18:00', available: true },
    TUESDAY: { day: 'TUESDAY', startTime: '10:00', endTime: '18:00', available: true },
    WEDNESDAY: { day: 'WEDNESDAY', startTime: '10:00', endTime: '18:00', available: true },
    THURSDAY: { day: 'THURSDAY', startTime: '10:00', endTime: '18:00', available: true },
    FRIDAY: { day: 'FRIDAY', startTime: '10:00', endTime: '18:00', available: true },
    SATURDAY: { day: 'SATURDAY', startTime: '10:00', endTime: '18:00', available: false },
    SUNDAY: { day: 'SUNDAY', startTime: '10:00', endTime: '18:00', available: false },
  },
  reason: 'Need to adjust for school schedule',
  status: 'PENDING' as const,
  reviewedBy: null,
  reviewedAt: null,
  denialReason: null,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  user: mockUser,
  reviewer: null,
}

export const mockTimeOffRequest = {
  id: 'timeoff-1',
  userId: 'user-1',
  startDate: new Date('2024-02-01'),
  endDate: new Date('2024-02-05'),
  reason: 'Vacation',
  status: 'PENDING' as const,
  reviewedBy: null,
  reviewedAt: null,
  denialReason: null,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  user: mockUser,
  reviewer: null,
}

export const mockNotification = {
  id: 'notif-1',
  userId: 'user-1',
  type: 'SHIFT_ASSIGNED' as const,
  title: 'New Shift Assigned',
  message: 'You have been assigned a new shift',
  read: false,
  createdAt: new Date('2024-01-10'),
  user: mockUser,
}
