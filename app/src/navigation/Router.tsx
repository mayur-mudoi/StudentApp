import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import SplashScreen from '../screens/Splash/SplashScreen';
import UpdatePasswordScreen from '../screens/Password/UpdatePassword';
import StudentStack from './StudentStack';
import AdminStack from './AdminStack';

const Router = () => {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : user.prefs?.passwordUpdated === 'false' ? (
        <UpdatePasswordScreen />
      ) : user.prefs?.role === 'admin' ? (
        <AdminStack />
      ) : user.prefs?.role === 'student' ? (
        <StudentStack />
      ) : null}
    </NavigationContainer>
  );
};

export default Router;
