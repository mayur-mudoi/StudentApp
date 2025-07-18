import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../globalStyles';

export const styles = StyleSheet.create({
    tabContainer: {
      flexDirection: 'row',
      height: 65,
      borderTopWidth: 1,
      borderColor: Colors.lightGray,
      backgroundColor: Colors.white,
      paddingBottom: Spacing.xs,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.xs,
    },
    icon: {
      width: 24,
      height: 24,
      marginBottom: 4,
      resizeMode: 'contain',
    },
    activeIndicator: {
      position: 'absolute',
      bottom: 0,
      width: 4,
      height: 4,
      borderRadius: BorderRadius.round,
      backgroundColor: Colors.accent,
    },
  });
