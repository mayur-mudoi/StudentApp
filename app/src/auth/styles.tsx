import { StyleSheet } from 'react-native';
import {
    BorderRadius,
    Colors,
    Fonts,
    Responsive,
    Spacing,
} from '../../../styles/globalStyles';

const {wp, hp, fontSize} = Responsive;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    marginTop: hp(5),
    marginBottom: hp(4),
  },
  logo: {
    width: wp(60),
    height: wp(24),
    resizeMode: 'cover',
    marginBottom: Spacing.m,
  },
  title: {
    fontSize: fontSize.xxl * 1.2,
    color: Colors.text,
    fontFamily: Fonts.PFbold,
    marginBottom: Spacing.s,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: Colors.textLight,
    fontFamily: Fonts.PFregular,
    opacity: 0.8,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    // marginHorizontal: Spacing.l,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.m,
    marginBottom: Spacing.m,
    height: hp(7),
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  icon: {
    width: wp(5),
    height: wp(5),
    tintColor: Colors.textLight,
    marginRight: Spacing.s,
  },
  authError: {
    color: Colors.error,
    marginTop: Spacing.s,
    marginBottom: Spacing.xs,
    textAlign: 'center',
    fontSize: fontSize.md,
    fontFamily: Fonts.PFmedium,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: Colors.text,
    fontFamily: Fonts.PFmedium,
    paddingVertical: Spacing.s,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: Spacing.l,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: fontSize.md,
    fontFamily: Fonts.PFmedium,
  },
  button: {
    borderRadius: BorderRadius.lg,
    height: hp(7),
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: fontSize.lg,
    fontFamily: Fonts.PFbold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  floatingLabel: {
    position: 'absolute',
    left: Spacing.m,
    fontFamily: Fonts.PFmedium,
    color: Colors.textLight,
  },
});

export default styles;
