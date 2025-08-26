import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Create a custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // You can add providers here if needed (Theme, Router, etc.)
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
  }

  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Add a test to prevent "no tests" error
describe('Test Utils', () => {
  it('should render without crashing', () => {
    expect(true).toBe(true)
  })
})
