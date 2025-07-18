// App.tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Router from './navigation/Router';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <DataProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
      </DataProvider>
    </SafeAreaProvider>
  );
};

export default App;
