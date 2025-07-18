// src/screens/admin/attendance/styles.tsx
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
      backgroundColor: Colors.white,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    greeting: {
      fontSize: fontSize.lg,
      color: Colors.textLight,
      fontFamily: Fonts.PFregular,
    },
    name: {
      fontSize: fontSize.xxl,
      color: Colors.text,
      fontFamily: Fonts.PFbold,
      marginTop: hp(0.5),
    },
    dateText: {
      fontSize: fontSize.sm,
      color: Colors.textLight,
      fontFamily: Fonts.PFregular,
      marginTop: hp(0.5),
    },
    avatarContainer: {
      width: wp(12),
      height: wp(12),
      borderRadius: BorderRadius.round,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: Colors.primary,
    },
    avatar: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: Spacing.m,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: Spacing.l,
    },
    statCard: {
      width: '48%',
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.lg,
      padding: Spacing.m,
    },
    iconContainer: {
      width: wp(15),
      height: wp(15),
      borderRadius: BorderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.m,
    },
    icon: {
      fontSize: fontSize.xl,
    },
    statValue: {
      fontSize: fontSize.xxl,
      fontFamily: Fonts.PFbold,
      color: Colors.text,
      marginBottom: hp(0.5),
    },
    statLabel: {
      fontSize: fontSize.md,
      fontFamily: Fonts.PFregular,
      color: Colors.textLight,
    },
    sectionTitleContainer: {
      paddingHorizontal: Spacing.l,
      marginTop: Spacing.m,
      marginBottom: Spacing.s,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      color: Colors.text,
      fontFamily: Fonts.PFbold,
    },
    actionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.l,
      marginBottom: Spacing.m,
    },
    actionButton: {
      width: wp(26),
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.md,
      padding: Spacing.m,
      alignItems: 'center',
    },
    actionIcon: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(5),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp(1),
    },
    actionIconText: {
      fontSize: fontSize.xl,
    },
    actionText: {
      fontSize: fontSize.sm,
      color: Colors.text,
      fontFamily: Fonts.PFmedium,
      textAlign: 'center',
    },
    activityContainer: {
      paddingHorizontal: Spacing.l,
      marginBottom: Spacing.m,
    },
    activityItem: {
      flexDirection: 'row',
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.md,
      padding: Spacing.m,
      marginBottom: Spacing.s,
    },
    activityIconContainer: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(5),
      backgroundColor: Colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.m,
    },
    activityIcon: {
      fontSize: fontSize.lg,
    },
    activityContent: {
      flex: 1,
    },
    activityDescription: {
      fontSize: fontSize.md,
      color: Colors.text,
      fontFamily: Fonts.PFmedium,
      marginBottom: hp(0.5),
    },
    activityTime: {
      fontSize: fontSize.xs,
      color: Colors.textLight,
      fontFamily: Fonts.PFregular,
    },
    loader: {
      marginVertical: Spacing.l,
    },
    footerSpace: {
      height: hp(10),
    },
    logoutButton: {
      position: 'absolute',
      bottom: hp(2.5),
      left: wp(5),
      right: wp(5),
      height: hp(6),
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      backgroundColor:Colors.errorLight,
      justifyContent:'center',
      alignItems:'center',
      flexDirection:'row',
    },
    logoutIcon: {
      width: wp(5),
      height: wp(5),
      tintColor: Colors.white,
      marginRight: Spacing.s,
    },
    logoutText: {
      fontSize: fontSize.md,
      fontFamily: Fonts.PFmedium,
      color: Colors.white,
      fontWeight: '600',
    },
    addAttendance: { backgroundColor: Colors.success + '20' },
    addCourses: { backgroundColor: Colors.accent + '20' },
    addStudents: { backgroundColor: Colors.primary + '20' },
    attendance: {
      backgroundColor: Colors.success,
    },
    students: {
      backgroundColor: Colors.primary,
    },
    courses: {
      backgroundColor: Colors.secondary,
    },
    activeStudents: {
      backgroundColor: Colors.accent,
    },
    locationContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A202C',
    backgroundColor: '#F7FAFC',
  },
  inputEditable: {
    backgroundColor: 'white',
    borderColor: '#5271FF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButton: {
    backgroundColor: '#5271FF',
  },
  saveButton: {
    backgroundColor: '#48BB78',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  locationInfo: {
    marginTop: 12,
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
