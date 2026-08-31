'use client';

import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Oswald } from 'next/font/google';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

// Palette: white/grey/red — a Canadian-league scoreboard, not a marketing site.
// Red is a deeper "maple" red rather than pure #FF0000 so it reads as a team
// colour instead of a warning colour.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#C8102E',
      dark: '#96001F',
      light: '#E2445C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1C1E21',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1E21',
      secondary: '#6B7280',
    },
    divider: '#E2E4E8',
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    h1: { fontFamily: oswald.style.fontFamily, fontWeight: 600 },
    h2: { fontFamily: oswald.style.fontFamily, fontWeight: 600 },
    h3: { fontFamily: oswald.style.fontFamily, fontWeight: 600 },
    h4: { fontFamily: oswald.style.fontFamily, fontWeight: 600, letterSpacing: 0.2 },
    h5: { fontFamily: oswald.style.fontFamily, fontWeight: 600 },
    h6: { fontFamily: oswald.style.fontFamily, fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #E2E4E8',
          backgroundImage: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: '0.8rem',
          color: '#6B7280',
          borderBottom: '2px solid #1C1E21',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
  },
});

export const headlineFontClass = oswald.className;

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
