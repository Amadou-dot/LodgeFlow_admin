import { dark } from '@clerk/themes';

// HeroUI color tokens for theming
const heroUIColors = {
  dark: {
    background: '#000000',
    foreground: '#ffffff',
    content1: '#18181b',
    content2: '#27272a',
    content3: '#3f3f46',
    content4: '#52525b',
    foreground500: '#a1a1aa',
    foreground600: '#71717a',
    primary: '#006FEE',
    primaryHover: '#0066d6',
    danger: '#f31260',
    success: '#17c964',
    warning: '#f5a524',
    divider: '#27272a',
  },
  light: {
    background: '#ffffff',
    foreground: '#11181c',
    content1: '#ffffff',
    content2: '#f4f4f5',
    content3: '#e4e4e7',
    content4: '#d4d4d8',
    foreground500: '#71717a',
    foreground600: '#52525b',
    primary: '#006FEE',
    primaryHover: '#0066d6',
    danger: '#f31260',
    success: '#17c964',
    warning: '#f5a524',
    divider: '#e4e4e7',
  },
};

// Common styling elements
const commonElements = {
  // Root container
  rootBox: {
    width: '100%',
  },

  // Header
  headerTitle: {
    fontSize: '1.875rem', // text-3xl
    fontWeight: '700', // font-bold
    marginBottom: '0.5rem',
  },

  headerSubtitle: {
    fontSize: '1rem',
    marginBottom: '2rem',
  },

  // Buttons
  formButtonPrimary: {
    borderRadius: '12px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '0.75rem 1.5rem',
    transition: 'all 0.2s ease',
    width: '100%',
    '&:hover': {
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },

  // Social buttons
  socialButtonsBlockButton: {
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '500',
    padding: '0.75rem 1rem',
    transition: 'all 0.2s ease',
    width: '100%',
    marginBottom: '0.5rem',
    border: '2px solid',
  },

  // Form elements
  formFieldInput: {
    border: '2px solid transparent',
    borderRadius: '12px',
    fontSize: '1rem',
    padding: '0.75rem 1rem',
    transition: 'all 0.2s ease',
    '&:focus': {
      outline: 'none',
    },
  },

  formFieldLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.5rem',
  },

  // Links
  footerActionLink: {
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    '&:hover': {
      textDecoration: 'underline',
    },
  },

  // Divider
  dividerLine: {
    height: '1px',
    margin: '1.5rem 0',
  },

  dividerText: {
    fontSize: '0.875rem',
    padding: '0 1rem',
  },

  // Error messages
  formFieldErrorText: {
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  },

  // User button
  userButtonAvatarBox: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    border: '2px solid',
  },

  userButtonPopoverCard: {
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '0.5rem',
    border: '1px solid',
  },

  userButtonPopoverActionButton: {
    backgroundColor: 'transparent',
    borderRadius: '8px',
    fontSize: '0.875rem',
    padding: '0.5rem 1rem',
    transition: 'all 0.2s ease',
  },
};

// Create theme variants
const createClerkTheme = (variant: 'light' | 'dark') => {
  const colors = heroUIColors[variant];
  const baseTheme = variant === 'dark' ? dark : undefined; // Use undefined for light theme (default)

  return {
    baseTheme,
    variables: {
      // Main colors
      colorPrimary: colors.primary,
      colorBackground: colors.background,
      colorInputBackground: colors.content2,
      colorInputText: colors.foreground,
      colorText: colors.foreground,
      colorTextSecondary: colors.foreground500,
      colorTextOnPrimaryBackground: variant === 'dark' ? '#ffffff' : '#ffffff',
      colorDanger: colors.danger,
      colorSuccess: colors.success,
      colorWarning: colors.warning,
      colorNeutral: colors.content2,

      // Border and radius
      borderRadius: '12px',

      // Font
      fontFamily: 'var(--font-sans)',

      // Spacing
      spacingUnit: '1rem',
    },
    elements: {
      ...commonElements,

      // Main card
      card: {
        backgroundColor: colors.content1,
        border: `1px solid ${colors.divider}`,
        borderRadius: '16px',
        boxShadow:
          variant === 'dark'
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '2rem',
      },

      // Header colors
      headerTitle: {
        ...commonElements.headerTitle,
        color: colors.foreground,
      },

      headerSubtitle: {
        ...commonElements.headerSubtitle,
        color: colors.foreground500,
      },

      // Form elements with theme colors
      formFieldInput: {
        ...commonElements.formFieldInput,
        backgroundColor: colors.content2,
        color: colors.foreground,
        '&:focus': {
          ...commonElements.formFieldInput['&:focus'],
          borderColor: colors.primary,
          backgroundColor: colors.content1,
        },
        '&:hover': {
          backgroundColor: colors.content3,
        },
      },

      formFieldLabel: {
        ...commonElements.formFieldLabel,
        color: colors.foreground,
      },

      // Button colors
      formButtonPrimary: {
        ...commonElements.formButtonPrimary,
        backgroundColor: colors.primary,
        color: '#ffffff',
        '&:hover': {
          ...commonElements.formButtonPrimary['&:hover'],
          backgroundColor: colors.primaryHover,
        },
        '&:active': {
          ...commonElements.formButtonPrimary['&:active'],
        },
      },

      // Social buttons with theme colors
      socialButtonsBlockButton: {
        ...commonElements.socialButtonsBlockButton,
        backgroundColor: colors.content2,
        borderColor: colors.content3,
        color: colors.foreground,
        '&:hover': {
          backgroundColor: colors.content3,
          borderColor: colors.content4,
        },
      },

      // Links
      footerActionLink: {
        ...commonElements.footerActionLink,
        color: colors.primary,
        '&:hover': {
          ...commonElements.footerActionLink['&:hover'],
          color: colors.primaryHover,
        },
      },

      footerActionText: {
        color: colors.foreground500,
        fontSize: '0.875rem',
      },

      // Divider
      dividerLine: {
        ...commonElements.dividerLine,
        backgroundColor: colors.divider,
      },

      dividerText: {
        ...commonElements.dividerText,
        color: colors.foreground600,
        backgroundColor: colors.content1,
      },

      // Error messages
      formFieldErrorText: {
        ...commonElements.formFieldErrorText,
        color: colors.danger,
      },

      // User button elements
      userButtonAvatarBox: {
        ...commonElements.userButtonAvatarBox,
        borderColor: colors.divider,
      },

      userButtonPopoverCard: {
        ...commonElements.userButtonPopoverCard,
        backgroundColor: colors.content1,
        borderColor: colors.divider,
      },

      userButtonPopoverActionButton: {
        ...commonElements.userButtonPopoverActionButton,
        '&:hover': {
          backgroundColor: colors.content2,
        },
      },

      userButtonPopoverActionButtonText: {
        color: colors.foreground,
      },

      userPreviewMainIdentifier: {
        color: colors.foreground,
        fontSize: '0.875rem',
        fontWeight: '500',
      },

      userPreviewSecondaryIdentifier: {
        color: colors.foreground500,
        fontSize: '0.75rem',
      },
    },
  };
};

// Export theme variants
export const clerkThemeDark = createClerkTheme('dark');
export const clerkThemeLight = createClerkTheme('light');

// Default export (dark theme as default)
export const clerkTheme = clerkThemeDark;
