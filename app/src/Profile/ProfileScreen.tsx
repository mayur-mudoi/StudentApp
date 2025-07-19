import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {styles} from './styles';
import {useAuth} from '../../../context/AuthContext';
import {databases} from '../../../lib/appwrite';
import {Colors} from '../../../styles/globalStyles';

// interface Course {
//   Programme: string;
//   Duration: number;
// }

interface StudentData {
  Name?: string;
  ABC_ID?: string;
  Course?: string;
  Batch?: string;
  Year?: string;
  Semester?: string;
  [key: string]: any;
}

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const {user: authUser, logout} = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Logout', onPress: logout, style: 'destructive'},
    ]);
  };
  console.log('Logged in user ID:', authUser?.$id);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await databases.listDocuments(
          '6819e71f002774754561',
          '6819e983001dc900e9f9',
        );
        console.log('Response in Profile', response);

        if (response.total > 0) {
          setStudentData(response.documents[0]);
        } else {
          console.warn('No matching student found for Auth_ID:', authUser?.$id);
        }
      } catch (err) {
        console.error('Failed to fetch student profile:', err);
        Alert.alert('Error', 'Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (authUser?.$id) {
      fetchStudentData();
    }
  }, [authUser]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!studentData) {
    return (
      <View style={[styles.container, styles.loadContainer]}>
        <Text style={styles.headerTitle}>No student data found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <Image
            source={require('../assets/images/avatar.png')}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{studentData.Name || 'N/A'}</Text>
          <Text style={styles.userId}>ID: {studentData.ABC_ID || 'N/A'}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{authUser?.email}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{authUser?.phone}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Course</Text>
              <Text style={styles.infoValue}>
                {studentData.Course
                  ? `${studentData.Course.Programme} (${studentData.Course.Duration} months)`
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Batch</Text>
              <Text style={styles.infoValue}>{studentData.Batch}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Year</Text>
              <Text style={styles.infoValue}>{studentData.Year} Year</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Current Semester</Text>
              <Text style={styles.infoValue}>{studentData.Semester}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={[Colors.error, Colors.errorLight]}
            style={styles.gradient}>
            <Text style={styles.logoutText}>Log Out</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
