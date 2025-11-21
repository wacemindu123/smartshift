import { getWeekStart, getWeekEnd, formatDate } from '@/shared/utils'

describe('Utility Functions', () => {
  describe('getWeekStart', () => {
    it('returns Sunday of the current week', () => {
      const wednesday = new Date('2024-01-17') // Wednesday
      const weekStart = getWeekStart(wednesday)

      expect(weekStart.getDay()).toBe(0) // Sunday
      expect(weekStart.getDate()).toBe(14) // Jan 14, 2024 is Sunday
    })

    it('returns same date if already Sunday', () => {
      const sunday = new Date('2024-01-14') // Sunday
      const weekStart = getWeekStart(sunday)

      expect(weekStart.getDay()).toBe(0)
      expect(weekStart.getDate()).toBe(14)
    })

    it('sets time to start of day', () => {
      const date = new Date('2024-01-17T15:30:00')
      const weekStart = getWeekStart(date)

      expect(weekStart.getHours()).toBe(0)
      expect(weekStart.getMinutes()).toBe(0)
      expect(weekStart.getSeconds()).toBe(0)
    })
  })

  describe('getWeekEnd', () => {
    it('returns Saturday of the current week', () => {
      const wednesday = new Date('2024-01-17') // Wednesday
      const weekEnd = getWeekEnd(wednesday)

      expect(weekEnd.getDay()).toBe(6) // Saturday
      expect(weekEnd.getDate()).toBe(20) // Jan 20, 2024 is Saturday
    })

    it('sets time to end of day', () => {
      const date = new Date('2024-01-17T15:30:00')
      const weekEnd = getWeekEnd(date)

      expect(weekEnd.getHours()).toBe(23)
      expect(weekEnd.getMinutes()).toBe(59)
      expect(weekEnd.getSeconds()).toBe(59)
    })
  })

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T14:30:00')

    it('formats date as YYYY-MM-DD', () => {
      const formatted = formatDate(testDate, 'YYYY-MM-DD')
      expect(formatted).toBe('2024-01-15')
    })

    it('formats date as ddd (short weekday)', () => {
      const formatted = formatDate(testDate, 'ddd')
      expect(formatted).toMatch(/Mon/i)
    })

    it('formats date as MMM D (short month and day)', () => {
      const formatted = formatDate(testDate, 'MMM D')
      expect(formatted).toMatch(/Jan 15/i)
    })

    it('handles string dates', () => {
      const formatted = formatDate('2024-01-15', 'YYYY-MM-DD')
      expect(formatted).toBe('2024-01-15')
    })
  })
})
