import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../globalStyles';
import { styles } from './styles';

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <LinearGradient
      colors={[Colors.background, Colors.white]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.Image
          source={require('../../assets/images/logo.png')}
          style={styles.image}
        />
        <Text style={styles.appName}>Attender</Text>
        <Text style={styles.tagline}>The Attendance App</Text>
      </Animated.View>
    </LinearGradient>
  );
};

export default SplashScreen;
