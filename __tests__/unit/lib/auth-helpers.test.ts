import { hasAuthorizedRole, AUTHORIZED_ROLES } from '@/lib/auth-helpers';

describe('auth-helpers', () => {
  describe('hasAuthorizedRole', () => {
    it('returns true for org:admin role', () => {
      const has = jest.fn(({ role }: { role: string }) => role === 'org:admin');
      expect(hasAuthorizedRole(has)).toBe(true);
    });

    it('returns false for org:customer role', () => {
      const has = jest.fn(({ role }: { role: string }) => role === 'org:customer');
      expect(hasAuthorizedRole(has)).toBe(false);
    });

    it('returns false when has is undefined', () => {
      expect(hasAuthorizedRole(undefined)).toBe(false);
    });

    it('returns false when has always returns false', () => {
      const has = jest.fn(() => false);
      expect(hasAuthorizedRole(has)).toBe(false);
    });

    it('calls has with org:admin role', () => {
      const has = jest.fn(() => true);
      hasAuthorizedRole(has);
      expect(has).toHaveBeenCalledWith({ role: 'org:admin' });
    });
  });

  describe('AUTHORIZED_ROLES', () => {
    it('has ADMIN constant', () => {
      expect(AUTHORIZED_ROLES.ADMIN).toBe('org:admin');
    });

    it('has CUSTOMER constant', () => {
      expect(AUTHORIZED_ROLES.CUSTOMER).toBe('org:customer');
    });
  });
});
