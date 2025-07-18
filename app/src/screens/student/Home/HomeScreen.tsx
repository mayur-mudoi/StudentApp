import React from 'react';
import { View, Text, TouchableOpacity, Alert, Image, Linking, Platform } from 'react-native';
import { useCameraPermission } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CalendarComponent from '../../../components/Calendar/CalendarComponent';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../../globalStyles';
import { styles } from './styles';
import { useAuth } from '../../../context/AuthContext';
import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';

const HomeScreen = ({ navigation }: any) => {
  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } = useCameraPermission();
  const insets = useSafeAreaInsets();
  const { user, attendanceLogs } = useAuth();

  // Process attendance logs into the format required by CalendarComponent
  const dailyAttendanceData = attendanceLogs?.reduce<Record<string, string>>(
    (acc, log) => {
      const date = log.Marked_at.split('T')[0]; // Extract date part (e.g., "2025-05-10")
      acc[date] = log.Status; // "Present" or "Absent"
      return acc;
    },
    {}
  ) || {};

  // Calculate attendance stats
  const totalDays = Object.keys(dailyAttendanceData).length;
  const presentDays = Object.values(dailyAttendanceData).filter(status => status === 'Present').length;
  const absentDays = totalDays - presentDays;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const requestLocationPermission = async () => {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      });

      const result = await check(permission as Permission);
      if (result === RESULTS.GRANTED) {
        return true;
      }

      const requestResult = await request(permission as Permission);
      if (requestResult === RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Location Permission Denied',
          'We need location access to verify your location for attendance. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }
    } catch (error) {
      console.warn('❌ Location Permission Error:', error);
      Alert.alert('Error', 'Unable to request location permission. Please try again.');
      return false;
    }
  };

  const checkLocationServicesEnabled = async () => {
    return new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);

      Geolocation.getCurrentPosition(
        () => {
          clearTimeout(timeout);
          resolve(true);
        },
        (error) => {
          clearTimeout(timeout);
          if (error.code === 2) {
            resolve(false);
          } else {
            resolve(true);
          }
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
      );
    });
  };

  const handleScanPress = async () => {
    let cameraPermissionGranted = hasCameraPermission;
    if (!hasCameraPermission) {
      cameraPermissionGranted = await requestCameraPermission();
      if (!cameraPermissionGranted) {
        Alert.alert(
          'Camera Access Required',
          'We need camera access to scan QR codes for attendance. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }

    const locationPermissionGranted = await requestLocationPermission();
    if (!locationPermissionGranted) {
      return;
    }

    const locationServicesEnabled = await checkLocationServicesEnabled();
    if (!locationServicesEnabled) {
      Alert.alert(
        'Location Services Disabled',
        'Please enable location services to proceed with attendance marking.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    navigation.navigate('QrScreen');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.name}>{user?.name ?? 'Student'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')} style={styles.avatarContainer}>
          <Image source={require('../../../assets/images/avatar.png')} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      <View style={styles.scrollContent}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{attendancePercentage}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{presentDays}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{absentDays}</Text>
            <Text style={styles.statLabel}>Absences</Text>
          </View>
        </View>

        <CalendarComponent attendanceData={dailyAttendanceData} />
      </View>

      <TouchableOpacity style={styles.scanButton} onPress={handleScanPress}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Image source={require('../../../assets/icons/qr.png')} style={styles.scanIcon} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
