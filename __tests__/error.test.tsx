import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Error from '@/app/error';

// Mock window.location.href
delete (window as any).location;
window.location = { href: '' } as any;

describe('Error Component', () => {
  const mockReset = jest.fn();
  const mockError = {
    name: 'Error',
    message: 'Test error message',
    stack: 'Error stack trace',
  } as Error;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  it('renders error component with correct content', () => {
    render(<Error error={mockError} reset={mockReset} />);

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an unexpected error/)
    ).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('calls reset function when Try Again button is clicked', () => {
    render(<Error error={mockError} reset={mockReset} />);

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('navigates to home when Go Home button is clicked', () => {
    render(<Error error={mockError} reset={mockReset} />);

    const goHomeButton = screen.getByText('Go Home');
    fireEvent.click(goHomeButton);

    expect(window.location.href).toBe('/');
  });

  it('logs error to console', () => {
    render(<Error error={mockError} reset={mockReset} />);

    expect(console.error).toHaveBeenCalledWith('Application Error:', mockError);
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });

    render(<Error error={mockError} reset={mockReset} />);

    expect(
      screen.getByText('Error Details (Development Only)')
    ).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });

  it('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
    });

    render(<Error error={mockError} reset={mockReset} />);

    expect(
      screen.queryByText('Error Details (Development Only)')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Test error message')).not.toBeInTheDocument();

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });

  it('displays error ID', () => {
    render(<Error error={mockError} reset={mockReset} />);

    expect(screen.getByText(/Error ID:/)).toBeInTheDocument();
  });

  it('renders all icon components', () => {
    render(<Error error={mockError} reset={mockReset} />);

    // Check that SVG icons are rendered
    const svgElements = screen.getAllByRole('img', { hidden: true });
    expect(svgElements.length).toBeGreaterThan(0);
  });
});
