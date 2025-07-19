import {StyleSheet, Dimensions, PixelRatio} from 'react-native';

const {width, height} = Dimensions.get('window');

// Responsive scaling utilities
const wp = (percentage: number) => {
  const elemWidth =
    typeof percentage === 'number' ? percentage : parseFloat(percentage);
  return PixelRatio.roundToNearestPixel((width * elemWidth) / 100);
};

const hp = (percentage: number) => {
  const elemHeight =
    typeof percentage === 'number' ? percentage : parseFloat(percentage);
  return PixelRatio.roundToNearestPixel((height * elemHeight) / 100);
};

// Responsive font size
const fontSize = {
  xs: wp(3),
  sm: wp(3.5),
  md: wp(4),
  lg: wp(4.5),
  xl: wp(5),
  xxl: wp(6),
  xxxl: wp(7),
};

// Theme colors
export const Colors = {
  primary: '#000000',
  secondary: '#3E3636',
  accent: '#D72323',
  lightGray: '#F5EDED',
  gray:'gray',
  white: '#FFFFFF',
  background: '#FFFFFF',
  card: '#F5EDED',
  text: '#000000',
  textLight: '#3E3636',
  error: '#D72323',
  errorLight: '#D72453',
  success: '#34C759',
  warning: '#FF9500',
  border: '#E0E0E0',
  black: '#000000',
  gradient: {
    primary: ['#000000', '#3E3636'],
    secondary: ['#3E3636', '#D72323'],
    accent: ['#D72323', '#F5EDED'],
  },
};

// export const Colors = {
//   primary: '#2563EB',
//   secondary: '#64748B',
//   accent: '#3B82F6',
//   lightGray: '#F1F5F9',
//   white: '#FFFFFF',
//   background: '#F8FAFC',
//   card: '#FFFFFF',
//   text: '#1E293B',
//   textLight: '#64748B',
//   error: '#EF4444',
//   errorLight: '#FEE2E2',
//   success: '#22C55E',
//   warning: '#F59E0B',
//   disabled: '#94A3B8',
//   border: '#E2E8F0',
//   black: '#000000',
//   gradient: {
//     start: '#2563EB',
//     end: '#3B82F6',
//   },
// };

// Typography
export const Fonts = {
  // PFregular: 'Playfair_144pt-Regular',
  // PFblack: 'Playfair_144pt-Black',
  // PFbold: 'Playfair_144pt-Bold',
  // PFmedium: 'Playfair_144pt-PFmedium',
  PFregular: 'Arial',
  PFblack: 'Sans-serif',
  PFbold: 'Roboto',
  PFmedium: 'Roboto',
};

// Responsive spacing
export const Spacing = {
  xs: wp(1),
  s: wp(2),
  m: wp(4),
  l: wp(6),
  xl: wp(8),
  xxl: wp(10),
};

// Responsive border radius
export const BorderRadius = {
  xs: wp(1),
  sm: wp(2),
  md: wp(3),
  lg: wp(4),
  xl: wp(6),
  round: 9999,
};

// Common styles
export const CommonStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },

  // Cards
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.m,
    marginVertical: Spacing.s,
    width: '100%',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Buttons
  button: {
    height: hp(6),
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: Spacing.l,
    minWidth: wp(30),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.secondary,
  },
  buttonAccent: {
    backgroundColor: Colors.accent,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buttonText: {
    color: Colors.white,
    fontSize: fontSize.md,
    fontFamily: Fonts.PFmedium,
    fontWeight: '600',
  },
  buttonOutlineText: {
    color: Colors.primary,
  },
  buttonIcon: {
    marginRight: Spacing.s,
  },

  // Inputs
  inputContainer: {
    marginBottom: Spacing.m,
    width: '100%',
  },
  input: {
    height: hp(6),
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.m,
    backgroundColor: Colors.white,
    color: Colors.text,
    fontSize: fontSize.md,
    fontFamily: Fonts.PFregular,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputFocused: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  inputLabel: {
    marginBottom: Spacing.xs,
    color: Colors.text,
    fontSize: fontSize.sm,
    fontFamily: Fonts.PFmedium,
    fontWeight: '500',
  },

  // Headers
  header: {
    padding: Spacing.m,
    backgroundColor: Colors.white,
    width: '100%',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: Fonts.PFbold,
    color: Colors.text,
    fontWeight: '700',
  },

  // Lists
  listItem: {
    padding: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    width: '100%',
    backgroundColor: Colors.white,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.l,
    width: wp(90),
    maxHeight: hp(80),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingBottom: Spacing.s,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontFamily: Fonts.PFbold,
    color: Colors.text,
    fontWeight: '700',
  },

  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  errorMessage: {
    textAlign: 'center',
    color: Colors.error,
    marginBottom: Spacing.m,
    fontSize: fontSize.md,
    fontFamily: Fonts.PFregular,
  },
  retryButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    borderRadius: BorderRadius.sm,
    minWidth: wp(30),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: fontSize.md,
    fontFamily: Fonts.PFmedium,
    fontWeight: '600',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.m,
    marginVertical: Spacing.m,
    width: '100%',
    height: hp(6),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

// Export responsive utilities
export const Responsive = {
  wp,
  hp,
  fontSize,
  width,
  height,
  isSmallDevice: width < 375,
  isPFmediumDevice: width >= 375 && width < 414,
  isLargeDevice: width >= 414,
};
