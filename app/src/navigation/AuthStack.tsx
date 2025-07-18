import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Login/LoginScreen';
import UpdatePasswordScreen from '../screens/Password/UpdatePassword';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="LoginScreen"
      component={LoginScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen
      name="UpdatePassword"
      component={UpdatePasswordScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
  </Stack.Navigator>
);

export default AuthStack;
