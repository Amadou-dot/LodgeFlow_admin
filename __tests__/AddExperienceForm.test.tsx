import { render, screen, fireEvent, waitFor } from './test-utils';
import userEvent from '@testing-library/user-event';
import AddExperienceForm from '@/components/AddExperienceForm';

// Mock the form data and setter
const mockFormData = {};
const mockSetFormData = jest.fn();

describe('AddExperienceForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form sections', () => {
    render(
      <AddExperienceForm
        formData={mockFormData}
        setFormData={mockSetFormData}
      />
    );

    // Check if all accordion sections are present
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Media & Visuals')).toBeInTheDocument();
    expect(screen.getByText('Descriptions')).toBeInTheDocument();
    expect(screen.getByText('Experience Details')).toBeInTheDocument();
    expect(screen.getByText('Booking & Policies')).toBeInTheDocument();
  });

  it('renders expand/collapse buttons', () => {
    render(
      <AddExperienceForm
        formData={mockFormData}
        setFormData={mockSetFormData}
      />
    );

    expect(screen.getByText('Expand all')).toBeInTheDocument();
    expect(screen.getByText('Collapse all')).toBeInTheDocument();
  });

  it('calls setFormData when input values change', async () => {
    const user = userEvent.setup();

    render(
      <AddExperienceForm
        formData={mockFormData}
        setFormData={mockSetFormData}
      />
    );

    // Find and interact with the title input
    const titleInput = screen.getByLabelText('Experience Title');
    await user.type(titleInput, 'Test Experience');

    await waitFor(() => {
      expect(mockSetFormData).toHaveBeenCalled();
    });
  });

  it('renders difficulty select with correct options', () => {
    render(
      <AddExperienceForm
        formData={mockFormData}
        setFormData={mockSetFormData}
      />
    );

    // The select might be inside an accordion that needs to be expanded
    // You may need to click on the Basic Information section first
    const basicInfoSection = screen.getByText('Basic Information');
    fireEvent.click(basicInfoSection);

    // Then check for difficulty select
    expect(screen.getByLabelText('Difficulty Level')).toBeInTheDocument();
  });

  it('renders seasonal availability multi-select', () => {
    render(
      <AddExperienceForm
        formData={mockFormData}
        setFormData={mockSetFormData}
      />
    );

    const basicInfoSection = screen.getByText('Basic Information');
    fireEvent.click(basicInfoSection);

    expect(screen.getByLabelText('Seasonal Availability')).toBeInTheDocument();
  });

  it('displays form data when provided', () => {
    const formDataWithValues = {
      title: 'Mountain Hiking',
      price: 100,
      category: 'Adventure',
    };

    render(
      <AddExperienceForm
        formData={formDataWithValues}
        setFormData={mockSetFormData}
      />
    );

    // Expand the basic information section
    const basicInfoSection = screen.getByText('Basic Information');
    fireEvent.click(basicInfoSection);

    // Check if the values are displayed
    expect(screen.getByDisplayValue('Mountain Hiking')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Adventure')).toBeInTheDocument();
  });
});
