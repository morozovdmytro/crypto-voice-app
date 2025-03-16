import { colord } from 'colord';

export function hexToHSL(hex: string) {
  const { h, s, l } = colord(hex).toHsl();
  return `${h} ${s}% ${l}%`;
}

export const THEME_CONFIG = {
  name: 'codefunded',
  colors: {
    light: {
      // theme
      accentMain: '#FE4A2A',
      accentSecondary: '#FCA292',
      accentTertiary: '#FBD7D0',
      bgLow: '#EFEFF4',
      bgMid: '#F9F9FE',
      bgHigh: '#FFFFFF',
      textAccent: '#FFFFFF',
      textMain: '#1C1E1D',
      textSecondary: '#3B3B3B',
      textTertiary: '#A6A6A6',
      border: '#DDDDDD',
      // functional
      successMain: '#50AF95',
      successSecondary: '#DCEDEA',
      warningMain: '#F7A401',
      warningSecondary: '#FDEACC',
      errorMain: '#DB1E40',
      errorSecondary: '#FADBE2',
      infoMain: '#5989E6',
      infoSecondary: '#DEE5FA',
    },
    dark: {
      // theme
      accentMain: '#FE4A2A',
      accentSecondary: '#923828',
      accentTertiary: '#502C26',
      bgLow: '#1C1E1D',
      bgMid: '#303237',
      bgHigh: '#44464B',
      textAccent: '#FFFFFF',
      textMain: '#EEEEEE',
      textSecondary: '#B4B4B4',
      textTertiary: '#797979',
      border: '#4A4A4A',
      // functional
      successMain: '#50AF95',
      successSecondary: '#2E413B',
      warningMain: '#F7A401',
      warningSecondary: '#4F3E1E',
      errorMain: '#DB1E40',
      errorSecondary: '#402429',
      infoMain: '#5989E6',
      infoSecondary: '#2F394C',
    },
  },
  roundness: {
    inner: 2,
    normal: 2,
    outer: 2,
  },
};

export const getCssVariables = () => {
  const { roundness, colors } = THEME_CONFIG;

  return {
    // light
    '--cdfd-theme-accent-main-light': colors['light'].accentMain,
    '--cdfd-theme-accent-secondary-light': colors['light'].accentSecondary,
    '--cdfd-theme-accent-tertiary-light': colors['light'].accentTertiary,

    '--cdfd-theme-bg-low-light': colors['light'].bgLow,
    '--cdfd-theme-bg-mid-light': colors['light'].bgMid,
    '--cdfd-theme-bg-high-light': colors['light'].bgHigh,

    '--cdfd-theme-text-accent-light': colors['light'].textAccent,
    '--cdfd-theme-text-main-light': colors['light'].textMain,
    '--cdfd-theme-text-secondary-light': colors['light'].textSecondary,
    '--cdfd-theme-text-tertiary-light': colors['light'].textTertiary,

    '--cdfd-theme-success-main-light': colors['light'].successMain,
    '--cdfd-theme-success-secondary-light': colors['light'].successSecondary,

    '--cdfd-theme-warning-main-light': colors['light'].warningMain,
    '--cdfd-theme-warning-secondary-light': colors['light'].warningSecondary,

    '--cdfd-theme-error-main-light': colors['light'].errorMain,
    '--cdfd-theme-error-secondary-light': colors['light'].errorSecondary,

    '--cdfd-theme-info-main-light': colors['light'].infoMain,
    '--cdfd-theme-info-secondary-light': colors['light'].infoSecondary,

    '--cdfd-theme-border-light': colors['light'].border,

    '--background-light': hexToHSL(colors['light'].bgLow),
    '--foreground-light': hexToHSL(colors['light'].textMain),
    '--card-light': hexToHSL(colors['light'].bgHigh),
    '--card-foreground-light': hexToHSL(colors['light'].textMain),
    '--popover-light': hexToHSL(colors['light'].bgHigh),
    '--popover-foreground-light': hexToHSL(colors['light'].textMain),
    '--primary-light': hexToHSL(colors['light'].accentMain),
    '--primary-foreground-light': hexToHSL(colors['light'].textAccent),
    '--secondary-light': hexToHSL(colors['light'].bgHigh),
    '--secondary-foreground-light': hexToHSL(colors['light'].textMain),
    '--muted-light': hexToHSL(colors['light'].bgHigh),
    '--muted-foreground-light': hexToHSL(colors['light'].textMain),
    '--accent-light': hexToHSL(colors['light'].accentMain),
    '--accent-foreground-light': hexToHSL(colors['light'].textAccent),
    '--destructive-light': hexToHSL(colors['light'].errorMain),
    '--destructive-foreground-light': hexToHSL(colors['light'].textAccent),
    '--border-light': hexToHSL(colors['light'].border),
    '--input-light': hexToHSL(colors['light'].bgHigh),
    '--ring-light': hexToHSL(colors['light'].border),

    // dark
    '--cdfd-theme-accent-main-dark': colors['dark'].accentMain,
    '--cdfd-theme-accent-secondary-dark': colors['dark'].accentSecondary,
    '--cdfd-theme-accent-tertiary-dark': colors['dark'].accentTertiary,

    '--cdfd-theme-bg-low-dark': colors['dark'].bgLow,
    '--cdfd-theme-bg-mid-dark': colors['dark'].bgMid,
    '--cdfd-theme-bg-high-dark': colors['dark'].bgHigh,

    '--cdfd-theme-text-accent-dark': colors['dark'].textAccent,
    '--cdfd-theme-text-main-dark': colors['dark'].textMain,
    '--cdfd-theme-text-secondary-dark': colors['dark'].textSecondary,
    '--cdfd-theme-text-tertiary-dark': colors['dark'].textTertiary,

    '--cdfd-theme-success-main-dark': colors['dark'].successMain,
    '--cdfd-theme-success-secondary-dark': colors['dark'].successSecondary,

    '--cdfd-theme-warning-main-dark': colors['dark'].warningMain,
    '--cdfd-theme-warning-secondary-dark': colors['dark'].warningSecondary,

    '--cdfd-theme-error-main-dark': colors['dark'].errorMain,
    '--cdfd-theme-error-secondary-dark': colors['dark'].errorSecondary,

    '--cdfd-theme-info-main-dark': colors['dark'].infoMain,
    '--cdfd-theme-info-secondary-dark': colors['dark'].infoSecondary,

    '--cdfd-theme-border-dark': colors['dark'].border,

    '--background-dark': hexToHSL(colors['dark'].bgLow),
    '--foreground-dark': hexToHSL(colors['dark'].textMain),
    '--card-dark': hexToHSL(colors['dark'].bgHigh),
    '--card-foreground-dark': hexToHSL(colors['dark'].textMain),
    '--popover-dark': hexToHSL(colors['dark'].bgHigh),
    '--popover-foreground-dark': hexToHSL(colors['dark'].textMain),
    '--primary-dark': hexToHSL(colors['dark'].accentMain),
    '--primary-foreground-dark': hexToHSL(colors['dark'].textAccent),
    '--secondary-dark': hexToHSL(colors['dark'].bgHigh),
    '--secondary-foreground-dark': hexToHSL(colors['dark'].textMain),
    '--muted-dark': hexToHSL(colors['dark'].bgHigh),
    '--muted-foreground-dark': hexToHSL(colors['dark'].textMain),
    '--accent-dark': hexToHSL(colors['dark'].accentMain),
    '--accent-foreground-dark': hexToHSL(colors['dark'].textAccent),
    '--destructive-dark': hexToHSL(colors['dark'].errorMain),
    '--destructive-foreground-dark': hexToHSL(colors['dark'].textAccent),
    '--border-dark': hexToHSL(colors['dark'].border),
    '--input-dark': hexToHSL(colors['dark'].bgHigh),
    '--ring-dark': hexToHSL(colors['dark'].border),

    // radius
    '--cdfd-theme-radius-inner': roundness.inner + 'px',
    '--cdfd-theme-radius-normal': roundness.normal + 'px',
    '--cdfd-theme-radius-outer': roundness.outer + 'px',
    '--radius': roundness.normal + 'px',
  };
};

export const getCssVariableValue = (variable: string): string => {
  if (!globalThis.getComputedStyle) {
    return '';
  }
  // this might not work, you have to compute property values
  // return document.documentElement.style.getPropertyValue(variable);
  const styles = getComputedStyle(document.documentElement);

  return styles.getPropertyValue(variable);
};
