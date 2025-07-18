import {StyleSheet} from 'react-native';
import {Colors, Fonts, Responsive, Spacing} from '../../globalStyles';

const {wp, fontSize} = Responsive;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    transform: [{scale: 1.1}],
  },
  image: {
    width: wp(60),
    height: wp(24),
    resizeMode: 'cover',
    marginBottom: Spacing.m,
  },
  appName: {
    fontSize: fontSize.xxl * 1.5,
    color: Colors.text,
    fontFamily: Fonts.PFbold,
    marginBottom: Spacing.s,
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: fontSize.lg,
    color: Colors.textLight,
    fontFamily: Fonts.PFmedium,
    textAlign: 'center',
    opacity: 0.8,
  },
});
