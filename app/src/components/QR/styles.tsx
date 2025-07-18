import { StyleSheet } from 'react-native';
import { Colors, Fonts, Responsive, BorderRadius, Spacing } from '../../globalStyles';

const { wp, fontSize } = Responsive;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.l,
  },
  qrContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.l,
  },
  qr: {
    width: wp(60),
    height: wp(60),
  },
  timestamp: {
    marginTop: Spacing.m,
    fontSize: fontSize.md,
    color: Colors.textLight,
    fontFamily: Fonts.PFregular,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.error,
    fontSize: fontSize.md,
    fontFamily: Fonts.PFmedium,
    marginTop: Spacing.m,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: Colors.textLight,
    fontFamily: Fonts.PFregular,
    marginTop: Spacing.m,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.l,
  },
  permissionText: {
    fontSize: fontSize.md,
    color: Colors.text,
    fontFamily: Fonts.PFmedium,
    textAlign: 'center',
    marginBottom: Spacing.m,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.m,
  },
  buttonText: {
    color: Colors.white,
    fontSize: fontSize.md,
    fontFamily: Fonts.PFbold,
  },
});

export default styles;
