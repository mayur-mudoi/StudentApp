import { StyleSheet } from 'react-native';
import { Fonts } from '../../../globalStyles';

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FDFAF6',
    },
    loadContainer:{
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    scrollContent: {
      paddingBottom: 30,
      marginTop:16,
    },
    profileSection: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 16,
    },
    userName: {
      fontSize: 32,
      color: '#333',
      marginBottom: 4,
      fontFamily: Fonts.PFbold,
    },
    userId: {
      fontSize: 24,
      color: '#95A1C3',
      fontFamily: Fonts.PFmedium,
    },
    infoSection: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 24,
      color: '#333',
      marginBottom: 16,
      fontFamily: Fonts.PFbold,
    },
    infoCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
    },
    infoItem: {
      paddingVertical: 12,
    },
    infoLabel: {
      fontSize: 20,
      color: '#95A1C3',
      marginBottom: 4,
      fontFamily: Fonts.PFmedium,
    },
    infoValue: {
      fontSize: 20,
      color: '#333',
      fontFamily: Fonts.PFbold,
    },
    divider: {
      height: 1,
      backgroundColor: '#E2E8F0',
    },
    logoutButton: {
      borderRadius: 12,
      overflow: 'hidden',
      marginHorizontal: 20,
      marginBottom: 16,
    },
    gradient: {
      padding: 16,
      alignItems: 'center',
    },
    logoutText: {
      color: '#FFFFFF',
      fontSize: 32,
      fontFamily: Fonts.PFbold,
    },
  });
