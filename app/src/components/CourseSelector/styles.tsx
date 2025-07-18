import { StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius, Responsive } from '../../globalStyles';

const styles = StyleSheet.create({
  container: {
    margin: Spacing.m,
    padding: Spacing.m,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
  },
  label: {
    fontSize: Responsive.fontSize.md,
    fontFamily: Fonts.PFbold,
    color: Colors.text,
    marginBottom: Spacing.s,
    fontWeight: '600',
  },
  picker: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.white,
    color: Colors.text,
  },
  loadingContainer: {
    padding: Spacing.m,
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textLight,
    fontSize: Responsive.fontSize.sm,
    fontFamily: Fonts.PFregular,
    marginTop: Spacing.s,
  },
});

export default styles;
