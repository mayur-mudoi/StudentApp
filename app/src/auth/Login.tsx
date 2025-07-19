import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StatusBar,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { Colors } from '../../../styles/globalStyles';
import styles from './styles';

// const { DevSettingsCheck } = NativeModules;

const LoginScreen = () => {
  console.log('Rendering LoginScreen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devBlocked, setDevBlocked] = useState(false);

  const insets = useSafeAreaInsets();
  const floatingLabelAnimEmail = useRef(new Animated.Value(0)).current;
  const floatingLabelAnimPassword = useRef(new Animated.Value(0)).current;
  const {login, authError} = useAuth();

  console.log('LoginScreen state:', { email, password, loading, authError });

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
      outputRange: [Colors.textLight, Colors.primary],
    }),
  });

  const handleLogin = async () => {
    console.log('Attempting login with:', { email, password });
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Login failed:', err.message);
      } else {
        console.error('Login failed:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authError) {
      ToastAndroid.show(authError, ToastAndroid.LONG);
    }
  }, [authError]);

  // const checkDevMode = async () => {
  //   try {
  //     const isDev = await DevSettingsCheck.isDeveloperModeEnabled();
  //     return isDev;
  //   } catch (error) {
  //     console.error('Error checking dev mode:', error);
  //     return false;
  //   }
  // };

  // useEffect(() => {
  //   const check = async () => {
  //     const isDev = await checkDevMode();
  //     if (isDev) {
  //       setDevBlocked(true); // block UI rendering

  //       Alert.alert(
  //         'Security Warning',
  //         'Developer Options are enabled. Please disable them to continue using the app.',
  //         [
  //           {
  //             text: 'Open Settings',
  //             onPress: () => {
  //               Linking.openSettings(); // Opens device settings
  //             },
  //           },
  //           {
  //             text: 'Exit App',
  //             onPress: () => BackHandler.exitApp(),
  //             style: 'destructive',
  //           },
  //         ],
  //         { cancelable: false }
  //       );
  //     }
  //   };
  //   check();
  // }, []);
  // if (devBlocked) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
  //       <Text style={{ fontSize: 16, color: 'red', textAlign: 'center', paddingHorizontal: 20 }}>
  //         This app is disabled while Developer Options are enabled.
  //       </Text>
  //     </View>
  //   );
  // }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {paddingTop: insets.top, paddingBottom: insets.bottom},
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Attender</Text>
        <Text style={styles.subtitle}>Enter your credentials to continue</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.inputContainer}>
          <Animated.Text
            style={[
              styles.floatingLabel,
              floatingLabelStyle(floatingLabelAnimEmail),
            ]}>
            Email Address
          </Animated.Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            onFocus={() => animateLabel(floatingLabelAnimEmail, true)}
            onBlur={() =>
              email.length === 0 && animateLabel(floatingLabelAnimEmail, false)
            }
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Colors.textLight}
          />
        </View>

        <View style={styles.inputContainer}>
          <Animated.Text
            style={[
              styles.floatingLabel,
              floatingLabelStyle(floatingLabelAnimPassword),
            ]}>
            Password
          </Animated.Text>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onFocus={() => animateLabel(floatingLabelAnimPassword, true)}
            onBlur={() =>
              password.length === 0 &&
              animateLabel(floatingLabelAnimPassword, false)
            }
            placeholderTextColor={Colors.textLight}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={
                showPassword
                  ? require('../../../assets/icons/eye.png')
                  : require('../../../assets/icons/eyeoff.png')
              }
              style={styles.icon}
            />
          </Pressable>
        </View>

        {authError && <Text style={styles.authError}>{authError}</Text>}

        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            (!email || !password) && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={!email || !password}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
