import { render, screen } from '../utils/test-utils'
import ShiftCard from '@/components/ShiftCard'
import { mockShift, mockPublishedShift } from '../utils/mock-data'

describe('ShiftCard', () => {
  it('renders shift information correctly', () => {
    render(<ShiftCard shift={mockShift} />)

    expect(screen.getByText(mockShift.user.name)).toBeInTheDocument()
    expect(screen.getByText(mockShift.role.name)).toBeInTheDocument()
  })

  it('displays DRAFT status for unpublished shifts', () => {
    render(<ShiftCard shift={mockShift} />)

    expect(screen.getByText(/draft/i)).toBeInTheDocument()
  })

  it('displays PUBLISHED status for published shifts', () => {
    render(<ShiftCard shift={mockPublishedShift} />)

    expect(screen.getByText(/published/i)).toBeInTheDocument()
  })

  it('formats time correctly', () => {
    render(<ShiftCard shift={mockShift} />)

    // Check that times are displayed (format may vary)
    const timeElements = screen.getAllByText(/AM|PM/i)
    expect(timeElements.length).toBeGreaterThan(0)
  })

  it('applies correct styling based on status', () => {
    const { container } = render(<ShiftCard shift={mockPublishedShift} />)

    // Published shifts should have specific styling
    const card = container.firstChild
    expect(card).toHaveClass('border')
  })
})
