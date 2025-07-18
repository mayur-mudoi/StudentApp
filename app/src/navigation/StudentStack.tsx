import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/student/Home/HomeScreen';
import QrScreen from '../screens/student/Qr/QrScreen';
import ProfileScreen from '../screens/student/Profile/ProfileScreen';

const Stack = createNativeStackNavigator();

const StudentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ animation: 'none' }} />
    <Stack.Screen name="QrScreen" component={QrScreen} options={{ animation: 'slide_from_bottom' }} />
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ animation: 'ios_from_right' }} />
  </Stack.Navigator>
);

export default StudentStack;
