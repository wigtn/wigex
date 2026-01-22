// Travel Helper v2.0 - Color System
// Coral (Primary) + Sky Blue (Secondary) 기반

export const lightColors = {
  // Base
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceElevated: '#FFFFFF',

  // Text
  text: '#191F28',
  textSecondary: '#6B7684',
  textTertiary: '#ADB5BD',
  textInverse: '#FFFFFF',

  // Primary (Coral - 따뜻함, 설렘)
  primary: '#FF6B6B',
  primaryLight: '#FFE8E8',
  primaryDark: '#E85555',

  // Secondary (Sky Blue - 하늘, 여행)
  secondary: '#4DABF7',
  secondaryLight: '#E7F5FF',
  secondaryDark: '#339AF0',

  // Accent (Orange - CTA, 강조)
  accent: '#FF922B',
  accentLight: '#FFF4E6',

  // Semantic
  success: '#20C997',
  error: '#F03E3E',
  warning: '#FCC419',
  info: '#4DABF7',

  // Border & Divider
  border: '#E5E8EB',
  borderLight: '#F1F3F5',
  divider: '#E5E8EB',

  // Category Colors
  categoryFood: '#FF6B6B',
  categoryTransport: '#4DABF7',
  categoryShopping: '#A78BFA',
  categoryLodging: '#FF922B',
  categoryActivity: '#20C997',
  categoryEtc: '#6B7684',
};

export const darkColors = {
  // Base
  background: '#0D1117',
  surface: '#161B22',
  surfaceElevated: '#21262D',

  // Text
  text: '#F0F6FC',
  textSecondary: '#8B949E',
  textTertiary: '#484F58',
  textInverse: '#0D1117',

  // Primary (Coral - 밝게)
  primary: '#FF8787',
  primaryLight: '#3D2020',
  primaryDark: '#FFA8A8',

  // Secondary (Sky Blue - 밝게)
  secondary: '#74C0FC',
  secondaryLight: '#1A3A52',
  secondaryDark: '#A5D8FF',

  // Accent
  accent: '#FFA94D',
  accentLight: '#3D2A1A',

  // Semantic
  success: '#3FB950',
  error: '#F85149',
  warning: '#D29922',
  info: '#74C0FC',

  // Border & Divider
  border: '#30363D',
  borderLight: '#21262D',
  divider: '#30363D',

  // Category Colors (밝게 조정)
  categoryFood: '#FF8787',
  categoryTransport: '#74C0FC',
  categoryShopping: '#B197FC',
  categoryLodging: '#FFA94D',
  categoryActivity: '#38D9A9',
  categoryEtc: '#8B949E',
};

export const chartColors = {
  light: [
    '#FF6B6B',
    '#4DABF7',
    '#A78BFA',
    '#20C997',
    '#FF922B',
    '#868E96',
  ],
  dark: [
    '#FF8787',
    '#74C0FC',
    '#B197FC',
    '#38D9A9',
    '#FFA94D',
    '#ADB5BD',
  ],
};

export type Colors = typeof lightColors;
