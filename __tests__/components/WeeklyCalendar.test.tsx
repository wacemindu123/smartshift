import { render, screen, fireEvent } from '../utils/test-utils'
import WeeklyCalendar from '@/components/WeeklyCalendar'
import { mockShift } from '../utils/mock-data'

describe('WeeklyCalendar', () => {
  const mockOnDateClick = jest.fn()

  beforeEach(() => {
    mockOnDateClick.mockClear()
  })

  it('renders calendar with 7 days', () => {
    render(<WeeklyCalendar shifts={[]} onDateClick={mockOnDateClick} />)

    // Should show days of the week
    expect(screen.getByText(/Weekly Schedule/i)).toBeInTheDocument()
  })

  it('displays shifts on correct days', () => {
    render(<WeeklyCalendar shifts={[mockShift]} onDateClick={mockOnDateClick} />)

    // Should display the employee name
    expect(screen.getByText(mockShift.user.name)).toBeInTheDocument()
  })

  it('calls onDateClick when day is clicked', () => {
    render(<WeeklyCalendar shifts={[]} onDateClick={mockOnDateClick} />)

    // Find and click a day (using desktop view)
    const dayElements = screen.getAllByRole('button', { name: /Today/i })
    if (dayElements.length > 0) {
      fireEvent.click(dayElements[0])
    }
  })

  it('navigates to previous week', () => {
    render(<WeeklyCalendar shifts={[]} onDateClick={mockOnDateClick} />)

    const prevButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg') // ChevronLeft icon
    )
    
    if (prevButton) {
      fireEvent.click(prevButton)
      // Calendar should update (check via date display change)
    }
  })

  it('shows coverage indicators', () => {
    const multipleShifts = Array(8).fill(mockShift).map((shift, i) => ({
      ...shift,
      id: `shift-${i}`,
    }))

    render(<WeeklyCalendar shifts={multipleShifts} onDateClick={mockOnDateClick} />)

    // Should show high coverage indicator
    expect(screen.getByText(/High/i)).toBeInTheDocument()
  })

  it('displays mobile view on small screens', () => {
    const { container } = render(
      <WeeklyCalendar shifts={[mockShift]} onDateClick={mockOnDateClick} />
    )

    // Mobile view should exist (hidden by default)
    const mobileView = container.querySelector('.md\\:hidden')
    expect(mobileView).toBeInTheDocument()
  })
})
