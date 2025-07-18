import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useCameraPermission } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './styles';
import { useFocusEffect } from '@react-navigation/native';
import { ID, Query } from 'appwrite';
import { databases } from '../../../lib/appwrite';
import { useData } from '../../../context/DataContext';
import Geolocation from '@react-native-community/geolocation';
import { Colors } from '../../../globalStyles';

const QrScreen = ({ navigation }: any) => {
  const device = useCameraDevice('back');
  const { hasPermission } = useCameraPermission();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [torchActive, setTorchActive] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationFetched, setLocationFetched] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const insets = useSafeAreaInsets();
  const { studentData, fetchStudentData } = useData();

  const resetCamera = useCallback(() => {
    setScannedData(null);
    setIsProcessing(false);
    setLocationFetched(false);
    setIsCameraActive(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetCamera();
      return () => {
        // Cleanup when screen loses focus
        setIsCameraActive(false);
      };
    }, [resetCamera])
  );

  const getCurrentPosition = useCallback(async (retryCount = 0, maxRetries = 2): Promise<void> => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationFetched(true);
        console.log('✅ Location fetched:', position.coords);
      },
      (error: any) => {
        if (error.code === 2) {
          Alert.alert(
            'Location Services Disabled',
            'Please enable location services to proceed with attendance marking.',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
          setLatitude(null);
          setLongitude(null);
          setLocationFetched(false);
        } else if (error.code === 3 && retryCount < maxRetries) {
          console.warn(`⏳ Location fetch timed out, retrying (${retryCount + 1}/${maxRetries})...`);
          Geolocation.getCurrentPosition(
            (position) => {
              setLatitude(position.coords.latitude);
              setLongitude(position.coords.longitude);
              setLocationFetched(true);
              console.log('✅ Location fetched on retry:', position.coords);
            },
            (retryError) => {
              if (retryCount + 1 < maxRetries) {
                getCurrentPosition(retryCount + 1, maxRetries);
              } else {
                Alert.alert('Error', 'Failed to fetch location after retries. Please try again.');
                setLatitude(null);
                setLongitude(null);
                setLocationFetched(false);
              }
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 10000 }
          );
        } else {
          Alert.alert('Error', 'Failed to fetch location. Please try again.');
          setLatitude(null);
          setLongitude(null);
          setLocationFetched(false);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, [navigation]);

  useEffect(() => {
    if (!studentData) {
      fetchStudentData();
    }
    getCurrentPosition();
  }, [studentData, fetchStudentData, getCurrentPosition]);

  let scanTriggered = false;

  const handleScanError = useCallback((message: string) => {
    Alert.alert('Error', message, [
      {
        text: 'Try Again',
        onPress: resetCamera,
      },
      {
        text: 'Go Back',
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [resetCamera, navigation]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: async (codes) => {
      if (
        codes.length > 0 &&
        codes[0].value &&
        !scannedData &&
        !isProcessing &&
        !scanTriggered
      ) {
        if (latitude === null || longitude === null) {
  handleScanError('Fetching your location. Please wait a moment.');
  return;
}

        scanTriggered = true;
        const qrString = codes[0].value;
        const scanTime = new Date().toLocaleDateString('sv-SE', {
          timeZone: 'Asia/Kolkata',
        });
        const timeStamp = new Date()
          .toLocaleString('sv-SE', { hour12: false, timeZone: 'Asia/Kolkata' })
          .replace(' ', 'T') + '+05:30';

        setScannedData(qrString);
        setIsProcessing(true);

        let qrData;
        try {
          qrData = JSON.parse(qrString);
        } catch (error) {
          handleScanError('Invalid QR code format.');
          return;
        }

        const { expiresAt, courseId, latitude: adminLatitude, longitude: adminLongitude } = qrData;


        {/*//if (!expiresAt || !courseId || adminLatitude == null || adminLongitude == null) {
  handleScanError('Invalid or incomplete QR code.');
  return;
}

const now = new Date();
const expiryDate = new Date(expiresAt);
if (isNaN(expiryDate.getTime()) || now > expiryDate) {
  handleScanError('This QR code has expired.');
  return;
}*/}
        // if (!expiresAt || !courseId) {
        //   handleScanError('Invalid QR code data.');
        //   return;
        // }
                if (!expiresAt || !courseId || adminLatitude == null || adminLongitude == null) {
  handleScanError('Invalid or incomplete QR code.');
  return;
}

        if (!studentData?.$id) {
          handleScanError('Student data not loaded');
          return;
        }

        const studentCourseId = studentData.Course.$id;
        if (studentCourseId !== courseId) {
          handleScanError('You are not enrolled in this course.');
          return;
        }

       const now = new Date();
const expiryDate = new Date(expiresAt);
if (isNaN(expiryDate.getTime()) || now > expiryDate) {
  handleScanError('This QR code has expired.');
  return;
}

console.log('Now', now);
console.log('expiryDate', expiryDate);
console.log('expiresAt', expiresAt);
console.log('expiryDate.getTime()', expiryDate.getTime());


        const existingAttendance = await databases.listDocuments(
          '6819e71f002774754561',
          '6819e8e100130bc54117',
          [
            Query.equal('Student_Id', studentData?.$id),
            Query.equal('Course_Id', courseId),
            Query.equal('Status', 'Present'),
            Query.greaterThanEqual('Marked_at', now.toISOString().split('T')[0] + 'T00:00:00Z'),
            Query.lessThanEqual('Marked_at', now.toISOString().split('T')[0] + 'T23:59:59Z'),
          ]
        );

        if (existingAttendance.total > 0) {
          Alert.alert('Already Marked', 'You have already marked attendance for this course today.', [
            {
              text: 'OK',
              onPress: () => {
                setIsProcessing(false);
                navigation.goBack();
              },
            },
          ]);
          return;
        }

        if (latitude !== null && longitude !== null && adminLatitude !== null && adminLongitude !== null) {
          const distance = calculateDistance(
            latitude,
            longitude,
            adminLatitude,
            adminLongitude
          );
          if (distance > 100) {
            handleScanError('You are not within 100 meters of the session location.');
            return;
          }
        } else {
          handleScanError('Location data is missing. Unable to verify proximity.');
          return;
        }

        try {
          await databases.createDocument(
            '6819e71f002774754561',
            '6819e8e100130bc54117',
            ID.unique(),
            {
              Student_Id: studentData.$id,
              Course_Id: courseId,
              Status: 'Present',
              Marked_at: timeStamp,
              Marked_By: studentData.Name, // or studentData.Email if more reliable
              Session_Id: ID.unique(), // if you're using session tracking
              Latitude: latitude,
              Longitude: longitude,
            }
          );


          Alert.alert('Success', 'Attendance marked successfully!', [
            {
              text: 'OK',
              onPress: () => {
                setIsProcessing(false);
                navigation.goBack();
              },
            },
          ]);
        } catch (error) {
          console.error('Error marking attendance:', error);
          handleScanError('Failed to mark attendance. Please try again.');
        }
      }
    },
  });

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  if (!hasPermission) {
    return (
      <View style={[styles.permissionContainer, { paddingTop: insets.top }]}>
        <Image
          source={require('../../../assets/icons/camera.png')}
          style={styles.permissionIcon}
        />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to scan QR codes for attendance marking.
          Please enable it in your device settings.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.headerTitle}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.permissionContainer, { paddingTop: insets.top }]}>
        <Text style={styles.permissionTitle}>Camera Not Available</Text>
        <Text style={styles.permissionText}>
          Unable to access the camera. Please make sure your device has a working camera.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.headerTitle}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isCameraActive && (
        <Camera
          style={styles.camera}
          device={device}
          isActive={isCameraActive}
          codeScanner={codeScanner}
          torch={torchActive ? 'on' : 'off'}
        />
      )}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image
            source={require('../../../assets/icons/back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <TouchableOpacity
          style={styles.torchButton}
          onPress={() => setTorchActive(!torchActive)}>
          <Image
            source={require('../../../assets/icons/flash.png')}
            style={[
              styles.torchIcon,
              { tintColor: torchActive ? Colors.primary : Colors.white },
            ]}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.overlay}>
        <View style={styles.scanArea}>
          <View style={[styles.corner, styles.topLeftCorner]} />
          <View style={[styles.corner, styles.topRightCorner]} />
          <View style={[styles.corner, styles.bottomLeftCorner]} />
          <View style={[styles.corner, styles.bottomRightCorner]} />
        </View>
        <Text style={styles.instructionText}>
          Position the QR code within the frame to scan
        </Text>
      </View>

      {isProcessing && (
        <View style={styles.processingContainer}>
          <View style={styles.processingIndicator}>
            <ActivityIndicator color={Colors.white} size="large" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default QrScreen;
