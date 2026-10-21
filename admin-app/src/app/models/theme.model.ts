export interface WebsiteTheme {
  id?: string;
  name: string;
  description?: string;
  
  // Core Brand Colors
  primaryColor: string;
  primaryHover: string;
  primaryDark?: string;
  primaryLight: string;
  primaryBorder: string;
  primaryGlow?: string;
  
  // Secondary & Contrast
  secondaryColor: string;
  secondaryLight?: string;
  
  // Background & Surfaces
  backgroundLight: string;
  backgroundWhite: string;
  textDark: string;
  textLight: string;
  
  // Gradient Studio
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: string; // e.g. '135deg', '90deg', '180deg'
  
  // Top Header Marquee Banner
  marqueeStart: string;
  marqueeEnd: string;
  
  isCustom?: boolean;
}

export const THEME_PRESETS: WebsiteTheme[] = [
  {
    id: 'foodybhai-signature',
    name: 'Foody Bhai Signature',
    description: 'Authentic warm saffron orange & roasted coffee espresso — perfectly matches the Foody Bhai logo.',
    primaryColor: '#f95f00',
    primaryHover: '#ea580c',
    primaryDark: '#c2410c',
    primaryLight: '#fff5ed',
    primaryBorder: '#fed7aa',
    primaryGlow: 'rgba(249, 95, 0, 0.25)',
    secondaryColor: '#241814',
    secondaryLight: '#3e2d26',
    backgroundLight: '#fbf6f2',
    backgroundWhite: '#ffffff',
    textDark: '#241814',
    textLight: '#716661',
    gradientStart: '#ff6e1a',
    gradientEnd: '#ea580c',
    gradientAngle: '135deg',
    marqueeStart: '#ea580c',
    marqueeEnd: '#f97316'
  },
  {
    id: 'royal-maharaja',
    name: 'Royal Maharaja Gold',
    description: 'Regal golden amber & charcoal — luxurious, premium Indian restaurant dining look.',
    primaryColor: '#d97706',
    primaryHover: '#b45309',
    primaryDark: '#92400e',
    primaryLight: '#fffbeb',
    primaryBorder: '#fde68a',
    primaryGlow: 'rgba(217, 119, 6, 0.25)',
    secondaryColor: '#1c1917',
    secondaryLight: '#292524',
    backgroundLight: '#fcf9f2',
    backgroundWhite: '#ffffff',
    textDark: '#1c1917',
    textLight: '#685f58',
    gradientStart: '#f59e0b',
    gradientEnd: '#b45309',
    gradientAngle: '135deg',
    marqueeStart: '#b45309',
    marqueeEnd: '#f59e0b'
  },
  {
    id: 'delhi-darbar',
    name: 'Delhi Darbar Crimson',
    description: 'Vibrant ruby red & rich burgundy — energetic, appetizing Mughlai feast vibes.',
    primaryColor: '#e11d48',
    primaryHover: '#be123c',
    primaryDark: '#9f1239',
    primaryLight: '#fff1f2',
    primaryBorder: '#fecdd3',
    primaryGlow: 'rgba(225, 29, 72, 0.25)',
    secondaryColor: '#1e1014',
    secondaryLight: '#331c22',
    backgroundLight: '#fdf6f7',
    backgroundWhite: '#ffffff',
    textDark: '#1e1014',
    textLight: '#785b62',
    gradientStart: '#f43f5e',
    gradientEnd: '#be123c',
    gradientAngle: '135deg',
    marqueeStart: '#be123c',
    marqueeEnd: '#fb7185'
  },
  {
    id: 'tandoori-flame',
    name: 'Tandoori Flame & Charcoal',
    description: 'Fiery tandoori red-orange with sleek dark coal accents — high appetite appeal.',
    primaryColor: '#ea580c',
    primaryHover: '#c2410c',
    primaryDark: '#9a3412',
    primaryLight: '#fff7ed',
    primaryBorder: '#ffedd5',
    primaryGlow: 'rgba(234, 88, 12, 0.25)',
    secondaryColor: '#18181b',
    secondaryLight: '#27272a',
    backgroundLight: '#faf5f0',
    backgroundWhite: '#ffffff',
    textDark: '#18181b',
    textLight: '#696460',
    gradientStart: '#ff5400',
    gradientEnd: '#c2410c',
    gradientAngle: '135deg',
    marqueeStart: '#c2410c',
    marqueeEnd: '#ea580c'
  },
  {
    id: 'green-bistro',
    name: 'Fresh Herb & Green Bistro',
    description: 'Fresh mint emerald & basil green — crisp, organic, farm-fresh vegetarian feel.',
    primaryColor: '#059669',
    primaryHover: '#047857',
    primaryDark: '#065f46',
    primaryLight: '#f0fdf4',
    primaryBorder: '#bbf7d0',
    primaryGlow: 'rgba(5, 150, 105, 0.25)',
    secondaryColor: '#0f1f17',
    secondaryLight: '#1c3528',
    backgroundLight: '#f4faf6',
    backgroundWhite: '#ffffff',
    textDark: '#0f1f17',
    textLight: '#55685e',
    gradientStart: '#10b981',
    gradientEnd: '#047857',
    gradientAngle: '135deg',
    marqueeStart: '#047857',
    marqueeEnd: '#10b981'
  },
  {
    id: 'bollywood-sunset',
    name: 'Bollywood Sunset Duo',
    description: 'Vibrant sunset fusion of coral berry and golden mango gradient.',
    primaryColor: '#f04438',
    primaryHover: '#d92d20',
    primaryDark: '#b42318',
    primaryLight: '#fff4ed',
    primaryBorder: '#fecdca',
    primaryGlow: 'rgba(240, 68, 56, 0.25)',
    secondaryColor: '#1d1917',
    secondaryLight: '#2e2623',
    backgroundLight: '#fdf8f6',
    backgroundWhite: '#ffffff',
    textDark: '#1d1917',
    textLight: '#6b615c',
    gradientStart: '#f04438',
    gradientEnd: '#f79009',
    gradientAngle: '135deg',
    marqueeStart: '#d92d20',
    marqueeEnd: '#f79009'
  },
  {
    id: 'midnight-gourmet',
    name: 'Midnight Gourmet Gold',
    description: 'Luxury obsidian black with honey gold buttons and dark mood elegance.',
    primaryColor: '#f59e0b',
    primaryHover: '#d97706',
    primaryDark: '#b45309',
    primaryLight: '#fffbeb',
    primaryBorder: '#fde68a',
    primaryGlow: 'rgba(245, 158, 11, 0.25)',
    secondaryColor: '#09090b',
    secondaryLight: '#18181b',
    backgroundLight: '#faf8f5',
    backgroundWhite: '#ffffff',
    textDark: '#09090b',
    textLight: '#595551',
    gradientStart: '#fbbf24',
    gradientEnd: '#d97706',
    gradientAngle: '135deg',
    marqueeStart: '#18181b',
    marqueeEnd: '#27272a'
  }
];
