import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#f4f5ff',
    100: '#dcdfff',
    200: '#c4c9ff',
    300: '#a2abff',
    400: '#8b93f8',
    500: '#6d74d1',
    600: '#555bad',
    700: '#3d4288',
    800: '#252a62',
    900: '#0f123d',
  },
  challenger: {
    50: '#ffe5e8',
    100: '#fbb8bf',
    200: '#f78c97',
    300: '#f2606f',
    400: '#ef6872',
    500: '#e63946',
    600: '#c52638',
    700: '#a1162b',
    800: '#7c071d',
    900: '#580010',
  },
  surface: {
    900: '#12141c',
    800: '#1b1f2b',
    700: '#242938',
    600: '#2d3245',
  },
};

const fonts = {
  heading: `'Outfit', sans-serif`,
  body: `'Outfit', sans-serif`,
};

const styles = {
  global: {
    body: {
      backgroundColor: 'surface.900',
      color: 'gray.100',
      fontFamily: `'Outfit', sans-serif`,
    },
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    p: { fontWeight: 400 },
    small: { fontWeight: 400 },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'full',
    },
  },
};

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  colors,
  fonts,
  styles,
  config,
});

export default theme;
