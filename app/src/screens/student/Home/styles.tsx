import { StyleSheet } from 'react-native';
import { Colors, Fonts, Responsive, BorderRadius, Spacing } from '../../../globalStyles';

const { wp, hp, fontSize } = Responsive;

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.l,
      paddingVertical: Spacing.m,
    },
    greeting: {
      fontSize: fontSize.xl,
      color: Colors.text,
      fontFamily: Fonts.PFmedium,
    },
    name: {
      fontSize: fontSize.xxl,
      color: Colors.text,
      fontFamily: Fonts.PFblack,
    },
    avatarContainer: {
      width: wp(12),
      height: wp(12),
      borderRadius: BorderRadius.round,
      backgroundColor: Colors.lightGray,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatar: {
      width: wp(12),
      height: wp(12),
    },
    scrollContent: {
      paddingHorizontal: Spacing.l,
      paddingBottom: Spacing.xl,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: Spacing.l,
    },
    statCard: {
      flex: 1,
      backgroundColor: Colors.background,
      padding: Spacing.m,
      marginHorizontal: Spacing.xs,
      alignItems: 'center',
      borderWidth: 0.8,
      borderColor: Colors.gray,
      borderRadius: BorderRadius.lg,
    },
    statValue: {
      fontSize: fontSize.xxl,
      color: Colors.text,
      marginBottom: Spacing.xs,
      fontFamily: Fonts.PFbold,
    },
    statLabel: {
      fontSize: fontSize.lg,
      color: Colors.textLight,
      fontFamily: Fonts.PFmedium,
      textAlign: 'center',
    },
    scanButton: {
      position: 'absolute',
      bottom: Spacing.l,
      alignSelf: 'center',
      width: wp(18),
      height: wp(18),
      borderRadius: BorderRadius.round,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: Spacing.s,
    },
    gradient: {
      flex: 1,
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.round,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanIcon: {
      width: wp(8),
      height: wp(8),
      tintColor: Colors.white,
    },
    scanButtonText: {
      fontSize: 32,
      color: '#FFFFFF',
      fontFamily: Fonts.PFblack,
    },
  });
