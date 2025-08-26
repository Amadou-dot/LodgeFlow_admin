import { formatPrice, validateEmail, capitalizeFirst } from '@/utils/testUtils'

describe('Utility Functions', () => {
  describe('formatPrice', () => {
    it('formats price correctly', () => {
      expect(formatPrice(10)).toBe('$10.00')
      expect(formatPrice(10.5)).toBe('$10.50')
      expect(formatPrice(10.99)).toBe('$10.99')
    })
  })

  describe('validateEmail', () => {
    it('validates email correctly', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
    })
  })

  describe('capitalizeFirst', () => {
    it('capitalizes first letter correctly', () => {
      expect(capitalizeFirst('hello')).toBe('Hello')
      expect(capitalizeFirst('HELLO')).toBe('Hello')
      expect(capitalizeFirst('hELLO')).toBe('Hello')
    })
  })
})
