import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { account, databases } from '../lib/appwrite';
import { ID, Models, Permission, Query, Role } from 'appwrite';
import { DataProvider, useData } from './DataContext';
import DeviceInfo from 'react-native-device-info';

interface AppContextType {
  user: Models.User<Models.Preferences> | null;
  authLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<Models.User<Models.Preferences>>;
  logout: () => Promise<void>;
  checkLoggedIn: () => Promise<void>;
  attendanceLogs: Models.Document[] | null; // Add attendance logs to context
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<Models.Document[] | null>(null); // State for attendance logs

  const {fetchCourseData, fetchStudentsDataAll, fetchAttendanceData} = useData();

  const login = async (email: string, password: string): Promise<Models.User<Models.Preferences>> => {
    try {
      setAuthError(null);
      try {
        await account.deleteSession('current');
      } catch (error: any) {
        console.log('⚠️ No session to delete:', error.message);
      }

      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      console.log('✅ Login successful:', currentUser);

      if (currentUser.prefs.role !== 'student' && currentUser.prefs.role !== 'admin') {
        await account.deleteSession('current');
        throw new Error('Access denied. You are not authorized to use this app.');
      }

      if (currentUser.prefs.role === 'student') {
        const deviceUUID = await DeviceInfo.getUniqueId();
        console.log('📱 Device UUID:', deviceUUID);
        const DB_ID = '6819e71f002774754561';
        const UUID_COLLECTION_ID = '6819e7f0000f2c60c7cd';
        const STUDENT_COLLECTION_ID = '6819e983001dc900e9f9';
        const ATTENDANCE_COLLECTION_ID = '6819e8e100130bc54117';
        const allUUID = await databases.listDocuments(DB_ID, UUID_COLLECTION_ID, [
          Query.equal('DeviceUUID', deviceUUID),
        ]);
        const matchedUUID = allUUID.documents[0];
        console.log('📦 Matched UUID Data:', matchedUUID);
        const studentDocs = await databases.listDocuments(DB_ID, STUDENT_COLLECTION_ID, []);

        const attendanceDocs = await databases.listDocuments(DB_ID, ATTENDANCE_COLLECTION_ID);
        console.log('Attendance Logs', attendanceDocs);
        setAttendanceLogs(attendanceDocs.documents);

        const studentDoc = studentDocs.documents[0];
        const studentUUID = studentDoc?.uUID;
        console.log('📦 Student Record:', studentDoc);
        console.log('🔗 Student UUID Data:', studentUUID);
        // Case 1: Device already linked to a different student
        if (matchedUUID && !studentUUID) {
          await account.deleteSession('current');
          throw new Error('This device is already linked to a different student account.');
        }
        // Case 2: UUID exists but doesn't match
        if (
          matchedUUID &&
          studentUUID &&
          matchedUUID.$id !== studentUUID.$id
        ) {
          await account.deleteSession('current');
          throw new Error('This device is linked to a different student account.');
        }
        // Case 3: UUID matches
        if (
          matchedUUID &&
          studentUUID &&
          matchedUUID.$id === studentUUID.$id
        ) {
          console.log('✅ Device UUID matches student record.');
        }
        // New Case: matchedUUID exists, but studentUUID is not set
        else if (matchedUUID && !studentUUID) {
          await databases.updateDocument(DB_ID, STUDENT_COLLECTION_ID, studentDoc.$id, {
            uUID: matchedUUID.$id,
          });
          console.log('✅ Updated student record with existing UUID.');
        }
        // Case 4: Neither UUID exists
        else if (!matchedUUID && !studentUUID) {
          const newUUIDDoc = await databases.createDocument(DB_ID, UUID_COLLECTION_ID, ID.unique(), {
            DeviceUUID: deviceUUID,
            email: currentUser.email,
          }, [
            Permission.read(Role.user(currentUser.$id)),
            Permission.update(Role.user(currentUser.$id)),
          ]);

          try {
            await databases.updateDocument(DB_ID, STUDENT_COLLECTION_ID, studentDoc.$id, {
              uUID: newUUIDDoc.$id,
            });
            console.log('✅ Device UUID assigned to new student.');
          } catch (err) {
            console.error('❌ Failed to update student with UUID:', err);
            throw err;
          }
        }
        // Case 5: Account linked to a different device
        else if (!matchedUUID && studentUUID) {
          await account.deleteSession('current');
          throw new Error('This account is already linked to a different device.');
        }
      }

      if(currentUser.prefs.role === 'admin'){
        await fetchCourseData();
        await fetchStudentsDataAll();
        await fetchAttendanceData();
        console.log('Admin has logged in');
      }

      setUser(currentUser);
      return currentUser;
    } catch (err: any) {
      console.error('❌ Login failed:', err.message);
      setAuthError(err.message);
      throw err;
    }
  };


  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await account.deleteSession('current');
      setUser(null);
      setAttendanceLogs(null); // Clear attendance logs on logout
      console.log('✅ Logout successful');
    } catch (err: any) {
      console.error('❌ Logout failed:', err.message);
    }
  };

  const checkLoggedIn = useCallback(async () => {
    try {
      console.log('🕵️‍♂️ Checking user session...');
      const currentUser = await account.get();
      console.log('✅ User is logged in:', currentUser.email);
      setUser(currentUser);
    } catch (err: any) {
      console.warn('⚠️ No active session:', err.message);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkLoggedIn();
  }, [checkLoggedIn]);

  return (
    <AppContext.Provider value={{ user, authLoading, login, logout, authError,checkLoggedIn, attendanceLogs}}>
    {user ? (
      <DataProvider>
        {children}
      </DataProvider>
    ) : (
      children
    )}
    </AppContext.Provider>
  );
};

export const useAuth = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
