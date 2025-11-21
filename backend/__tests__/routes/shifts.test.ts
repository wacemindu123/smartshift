import request from 'supertest'
import express from 'express'
import shiftsRouter from '../../routes/shifts'
import { mockShift, mockUser } from '../../../__tests__/utils/mock-data'

// Mock the schedule service
jest.mock('../../services/scheduleService', () => ({
  createShift: jest.fn(),
  getShiftsByWeek: jest.fn(),
  updateShift: jest.fn(),
  deleteShift: jest.fn(),
  publishShifts: jest.fn(),
}))

// Mock auth middleware
jest.mock('../../middleware/auth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.userId = 'test-user-id'
    req.userRole = 'OPERATOR'
    next()
  },
  requireOperator: (req: any, res: any, next: any) => next(),
}))

import * as scheduleService from '../../services/scheduleService'

const app = express()
app.use(express.json())
app.use('/shifts', shiftsRouter)

describe('Shifts API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /shifts', () => {
    it('returns shifts for date range', async () => {
      const mockShifts = [mockShift]
      ;(scheduleService.getShiftsByWeek as jest.Mock).mockResolvedValue(mockShifts)

      const response = await request(app)
        .get('/shifts')
        .query({
          startDate: '2024-01-15T00:00:00.000Z',
          endDate: '2024-01-21T23:59:59.999Z',
        })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockShifts)
      expect(scheduleService.getShiftsByWeek).toHaveBeenCalled()
    })

    it('returns 400 if date range is missing', async () => {
      const response = await request(app).get('/shifts')

      expect(response.status).toBe(400)
      expect(response.body.error).toBeDefined()
    })
  })

  describe('POST /shifts', () => {
    it('creates a new shift', async () => {
      ;(scheduleService.createShift as jest.Mock).mockResolvedValue(mockShift)

      const shiftData = {
        userId: mockUser.id,
        roleId: 'role-1',
        startTime: '2024-01-15T09:00:00.000Z',
        endTime: '2024-01-15T17:00:00.000Z',
      }

      const response = await request(app)
        .post('/shifts')
        .send(shiftData)

      expect(response.status).toBe(201)
      expect(response.body).toEqual(mockShift)
      expect(scheduleService.createShift).toHaveBeenCalled()
    })

    it('returns 400 for invalid data', async () => {
      const response = await request(app)
        .post('/shifts')
        .send({ invalid: 'data' })

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /shifts/:id', () => {
    it('deletes a shift', async () => {
      ;(scheduleService.deleteShift as jest.Mock).mockResolvedValue(mockShift)

      const response = await request(app)
        .delete(`/shifts/${mockShift.id}`)

      expect(response.status).toBe(204)
      expect(scheduleService.deleteShift).toHaveBeenCalledWith(mockShift.id)
    })

    it('returns 500 if deletion fails', async () => {
      ;(scheduleService.deleteShift as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      )

      const response = await request(app)
        .delete('/shifts/invalid-id')

      expect(response.status).toBe(500)
    })
  })

  describe('POST /shifts/publish', () => {
    it('publishes multiple shifts', async () => {
      const shiftIds = ['shift-1', 'shift-2']
      ;(scheduleService.publishShifts as jest.Mock).mockResolvedValue({
        published: shiftIds.length,
      })

      const response = await request(app)
        .post('/shifts/publish')
        .send({ shiftIds })

      expect(response.status).toBe(200)
      expect(scheduleService.publishShifts).toHaveBeenCalledWith(shiftIds)
    })
  })
})
