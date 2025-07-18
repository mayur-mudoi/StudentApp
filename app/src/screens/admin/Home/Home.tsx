import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import {styles } from './styles.tsx';
import { useData } from '../../../context/DataContext';

const Home = () => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const {
    latitude,
    longitude,
    setLatitude,
    setLongitude,
    hasExistingLocation,
    isLocationLoading,
    saveLocation,
    handleUpdateLocation,
  } = useData();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.name}>{user?.name ?? 'Admin'}</Text>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
        </View>
        <TouchableOpacity style={styles.avatarContainer}>
          <Image source={require('../../../assets/images/avatar.png')} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.locationContainer}>
          <Text style={styles.sectionTitle}>Location Settings</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Latitude</Text>
            <TextInput
              style={[styles.input, !hasExistingLocation && styles.inputEditable]}
              value={latitude}
              onChangeText={setLatitude}
              placeholder="Enter latitude"
              keyboardType="numeric"
              placeholderTextColor="lightgray"
              editable={!hasExistingLocation}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Longitude</Text>
            <TextInput
              style={[styles.input, !hasExistingLocation && styles.inputEditable]}
              value={longitude}
              onChangeText={setLongitude}
              placeholder="Enter longitude"
              keyboardType="numeric"
              placeholderTextColor="lightgray"
              editable={!hasExistingLocation}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.updateButton]}
              onPress={handleUpdateLocation}
              disabled={isLocationLoading}>
              {isLocationLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  {hasExistingLocation ? 'Update Location' : 'Fetch Location'}
                </Text>
              )}
            </TouchableOpacity>

            {!hasExistingLocation && (
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={saveLocation}
                disabled={isLocationLoading}>
                <Text style={styles.buttonText}>Save Location</Text>
              </TouchableOpacity>
            )}
          </View>

          {hasExistingLocation && (
            <Text style={styles.locationInfo}>
              Location is set. You can update it by clicking the Update Location button.
            </Text>
          )}
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Image
          source={require('../../../assets/icons/logout.png')}
          style={styles.logoutIcon}
        />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;
