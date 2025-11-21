import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'
import * as scheduleService from '../../services/scheduleService'
import { mockShift, mockUser, mockWorkRole } from '../../../__tests__/utils/mock-data'

// Mock Prisma
jest.mock('../../db/connection', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

// Mock notification service
jest.mock('../../services/notificationService', () => ({
  sendShiftUpdateNotification: jest.fn(),
  sendShiftCancelledNotification: jest.fn(),
  sendSchedulePublishedNotification: jest.fn(),
}))

import prisma from '../../db/connection'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('ScheduleService', () => {
  beforeEach(() => {
    mockReset(prismaMock)
  })

  describe('createShift', () => {
    it('should create a new shift with DRAFT status', async () => {
      const shiftData = {
        userId: mockUser.id,
        roleId: mockWorkRole.id,
        startTime: new Date('2024-01-15T09:00:00'),
        endTime: new Date('2024-01-15T17:00:00'),
      }

      prismaMock.shift.create.mockResolvedValue(mockShift)

      const result = await scheduleService.createShift(shiftData)

      expect(result).toEqual(mockShift)
      expect(prismaMock.shift.create).toHaveBeenCalledWith({
        data: {
          ...shiftData,
          status: 'DRAFT',
        },
        include: {
          user: true,
          role: true,
        },
      })
    })
  })

  describe('getShiftsByWeek', () => {
    it('should return shifts within date range', async () => {
      const startDate = new Date('2024-01-15T00:00:00')
      const endDate = new Date('2024-01-21T23:59:59')

      prismaMock.shift.findMany.mockResolvedValue([mockShift])

      const result = await scheduleService.getShiftsByWeek(startDate, endDate)

      expect(result).toEqual([mockShift])
      expect(prismaMock.shift.findMany).toHaveBeenCalledWith({
        where: {
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          user: true,
          role: true,
          attendance: true,
        },
        orderBy: {
          startTime: 'asc',
        },
      })
    })
  })

  describe('deleteShift', () => {
    it('should delete shift and send notification', async () => {
      const shiftWithDetails = {
        ...mockShift,
        user: mockUser,
        role: mockWorkRole,
      }

      prismaMock.shift.findUnique.mockResolvedValue(shiftWithDetails)
      prismaMock.shift.delete.mockResolvedValue(shiftWithDetails)

      const result = await scheduleService.deleteShift(mockShift.id)

      expect(result).toEqual(shiftWithDetails)
      expect(prismaMock.shift.delete).toHaveBeenCalledWith({
        where: { id: mockShift.id },
      })
    })

    it('should throw error if shift not found', async () => {
      prismaMock.shift.findUnique.mockResolvedValue(null)

      await expect(scheduleService.deleteShift('non-existent')).rejects.toThrow(
        'Shift not found'
      )
    })
  })

  describe('updateShift', () => {
    it('should update shift and send notification', async () => {
      const updateData = {
        startTime: new Date('2024-01-15T10:00:00'),
        endTime: new Date('2024-01-15T18:00:00'),
      }

      const updatedShift = {
        ...mockShift,
        ...updateData,
      }

      prismaMock.shift.update.mockResolvedValue(updatedShift)

      const result = await scheduleService.updateShift(
        mockShift.id,
        updateData,
        mockUser.id
      )

      expect(result).toEqual(updatedShift)
      expect(prismaMock.shift.update).toHaveBeenCalled()
    })
  })
})
