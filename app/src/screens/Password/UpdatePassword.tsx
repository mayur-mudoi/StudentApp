import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Keyboard, Alert, TouchableWithoutFeedback, Animated, Pressable, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from './styles';
import { account } from '../../lib/appwrite';
import { useAuth } from '../../context/AuthContext';

const UpdatePasswordScreen = ({ navigation }: any) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const floatingLabelAnimNewPassword = useRef(new Animated.Value(0)).current;
  const floatingLabelAnimConfirmPassword = useRef(new Animated.Value(0)).current;
    const [showPassword, setShowPassword] = useState(false);

    const { checkLoggedIn } = useAuth();
  const animateLabel = (animValue: Animated.Value, isActive: boolean) => {
      Animated.timing(animValue, {
        toValue: isActive ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    };

    const floatingLabelStyle = (animValue: Animated.Value) => ({
      top: animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 5],
      }),
      fontSize: animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 12],
      }),
      color: animValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#95A1C3', '#5271FF'],
      }),
    });

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter both passwords.');
      return;
    }

    if (newPassword === confirmPassword) {
      try {
        await account.updatePassword(newPassword);
        await account.updatePrefs({ passwordUpdated: true });
        Alert.alert('Success', 'Password updated successfully!');
        navigation.navigate('HomeScreen');
      } catch (error: any) {
        Alert.alert('Error', error?.message || 'Failed to update password.');
      }
    } else {
      Alert.alert('Error', 'Passwords do not match.');
    }
  };

  const handleSkip = async () => {
    try {
      await account.updatePrefs({ passwordUpdated: 'true' });
      await checkLoggedIn(); // triggers Router rerender
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to skip.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.innerContainer}>
            <Text style={styles.title}>Update Password</Text>
            <Text style={styles.subtitle}>Secure your account with a new password</Text>

            <View style={styles.card}>
              <View style={styles.inputContainer}>
              <Animated.Text style={[styles.floatingLabel, floatingLabelStyle(floatingLabelAnimNewPassword)]}>
                New Password
              </Animated.Text>
              <TextInput
                style={styles.input}
                // placeholder="New Password"
                placeholderTextColor="#95A1C3"
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                onFocus={() => animateLabel(floatingLabelAnimNewPassword, true)}
                onBlur={() => newPassword.length === 0 && animateLabel(floatingLabelAnimNewPassword, false)}
              />
            </View>

              <View style={styles.inputContainer}>
              <Animated.Text style={[styles.floatingLabel, floatingLabelStyle(floatingLabelAnimConfirmPassword)]}>
  Confirm New Password
</Animated.Text>
<TextInput
  style={styles.input}
  // placeholder="Confirm New Password"
  placeholderTextColor="#95A1C3"
  secureTextEntry={!showPassword}
  value={confirmPassword}
  onChangeText={setConfirmPassword}
  onFocus={() => animateLabel(floatingLabelAnimConfirmPassword, true)}
  onBlur={() => confirmPassword.length === 0 && animateLabel(floatingLabelAnimConfirmPassword, false)}
/>

                <Pressable onPress={() => setShowPassword(!showPassword)}>
                            <Image
                              source={showPassword ? require('../../assets/icons/eye.png') : require('../../assets/icons/eyeoff.png')}
                              style={[styles.icon]}
                            />
                          </Pressable>
              </View>

              <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePassword}>
                <LinearGradient colors={['#5271FF', '#3B4BFF']} style={styles.gradient}>
                  <Text style={styles.updateButtonText}>Update Password</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};



export default UpdatePasswordScreen;
