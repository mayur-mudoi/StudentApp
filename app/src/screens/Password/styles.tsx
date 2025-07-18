import { StyleSheet } from 'react-native';
import { Fonts } from '../../globalStyles';

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FDFAF6',
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    innerContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    title: {
      fontSize: 40,
      color: '#000',
      fontFamily:Fonts.PFbold,
      marginBottom: 8,
      textAlign:'center',
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: 40,
      fontSize: 20,
      color: '#95A1C3',
      fontFamily:Fonts.PFregular,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 24,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F5F8FF',
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 16,
      height: 56,
    },
    floatingLabel: {
      position: 'absolute',
      left: 16,
      fontFamily: Fonts.PFmedium,
      fontSize:24,
    },
    icon: {
      width: 20,
      height: 20,
      tintColor: '#95A1C3',
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 20,
      color: '#333',
      fontFamily: Fonts.PFmedium,
    },
    updateButton: {
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 20,
    },
    gradient: {
      padding: 16,
      alignItems: 'center',
    },
    updateButtonText: {
      color: '#FFFFFF',
      fontSize: 32,
      fontFamily: Fonts.PFbold,
    },
    skipButton: {
      marginTop: 20,
      alignItems: 'center',
    },
    skipButtonText: {
      fontSize: 20,
      color: '#5271FF',
      fontWeight: '600',
      textDecorationLine: 'underline',
      fontFamily: Fonts.PFmedium,
    },
  });
