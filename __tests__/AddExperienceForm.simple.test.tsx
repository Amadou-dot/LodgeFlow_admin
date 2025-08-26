import { render, screen } from '@testing-library/react'
import AddExperienceForm from '@/components/AddExperienceForm'

// Mock the form data and setter
const mockFormData = {}
const mockSetFormData = jest.fn()

describe('AddExperienceForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the form', () => {
    render(
      <AddExperienceForm 
        formData={mockFormData} 
        setFormData={mockSetFormData} 
      />
    )

    // Check if the form is rendered
    expect(screen.getByRole('form')).toBeDefined()
  })

  it('renders expand and collapse buttons', () => {
    render(
      <AddExperienceForm 
        formData={mockFormData} 
        setFormData={mockSetFormData} 
      />
    )

    expect(screen.getByText('Expand all')).toBeDefined()
    expect(screen.getByText('Collapse all')).toBeDefined()
  })

  it('renders all accordion sections', () => {
    render(
      <AddExperienceForm 
        formData={mockFormData} 
        setFormData={mockSetFormData} 
      />
    )

    expect(screen.getByText('Basic Information')).toBeDefined()
    expect(screen.getByText('Media & Visuals')).toBeDefined()
    expect(screen.getByText('Descriptions')).toBeDefined()
    expect(screen.getByText('Experience Details')).toBeDefined()
    expect(screen.getByText('Booking & Policies')).toBeDefined()
  })
})
