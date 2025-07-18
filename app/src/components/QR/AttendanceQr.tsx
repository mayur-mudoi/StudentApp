import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../globalStyles';
import styles from './styles';

interface AttendanceQRProps {
  sessionId: string;
  selectedCourse: string;
}

export default function AttendanceQR({  selectedCourse }: AttendanceQRProps) {
  const [qrData, setQrData] = useState('');
  const { latitude, longitude } = useData();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const isLocationValid =
    latitude !== undefined &&
    longitude !== undefined &&
    latitude !== null &&
    longitude !== null &&
    latitude !== '' &&
    longitude !== '';

  useEffect(() => {
    const updateQR = () => {
      setIsLoading(true);
      console.log('QR latitude:', latitude, 'longitude:', longitude);
      if (!user || !selectedCourse) {
        setQrData('');
        setIsLoading(false);
        return;
      }
      if (!isLocationValid) {
        setQrData('');
        setIsLoading(false);
        return;
      }
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
      const qrPayload = {
        expiresAt: expiresAt.toISOString(),
        courseId: selectedCourse,
        latitude: Number(latitude),
        longitude: Number(longitude),
      };
      const qrString = JSON.stringify(qrPayload);
      setQrData(qrString);
      setIsLoading(false);
      console.log('✅ QR code generated with payload:', qrString);
    };
    updateQR();
    const interval = setInterval(updateQR, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [user, selectedCourse, latitude, longitude]);

  return (
    <View style={styles.container}>
      <View style={styles.qrContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.loadingText}>Generating QR Code...</Text>
          </View>
        ) : qrData ? (
          <QRCode
            value={qrData}
            size={250}
            backgroundColor={Colors.white}
            color={Colors.primary}
          />
        ) : (
          <Text style={styles.errorText}>
            Please set location in Home screen to generate QR code...
          </Text>
        )}
      </View>
      <Text style={styles.timestamp}>
        Updated: {new Date().toLocaleTimeString()}
      </Text>
    </View>
  );
}
