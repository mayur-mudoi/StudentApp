import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { account, databases, functions } from '../lib/appwrite';
import { ID, Models, Permission, Role, Query, AppwriteException } from 'appwrite';
import Geolocation from '@react-native-community/geolocation';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import { Platform, Alert } from 'react-native';

interface DataContextType {
  studentData: Models.Document | null;
  setStudentData: React.Dispatch<React.SetStateAction<Models.Document | null>>;
  fetchStudentData: () => Promise<void>;

  courseData: Models.Document[] | null;
  setCourseData: React.Dispatch<React.SetStateAction<Models.Document[] | null>>;
  fetchCourseData: () => Promise<void>;

  addCourse: (name: string, duration: number, status: 'Active' | 'Inactive') => Promise<void>;
  updateCourse: (id: string, name: string, duration: number, status: 'Active' | 'Inactive') => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;

  studentsDataAll: Models.Document[] | null;
  setStudentsDataAll: React.Dispatch<React.SetStateAction<Models.Document[] | null>>;
  fetchStudentsDataAll: () => Promise<void>;
  getBackendMarkedAttendanceByDate: (date: string) => Promise<Models.Document[]>;

  addStudent: (
    name: string,
    email: string,
    gender: 'Male' | 'Female' | 'Others',
    abc_id: number,
    semester: number,
    batch: number,
    year: 'First' | 'Second' | 'Third' | 'Fourth' | 'Fifth',
    status: 'Active' | 'Inactive',
    courseId: string
  ) => Promise<void>;

  bulkAddStudents: (fileContent: string, fileType: 'csv' | 'json') => Promise<void>;

  updateStudent: (
    id: string,
    name: string,
    email: string,
    gender: 'Male' | 'Female' | 'Others',
    abc_id: number,
    semester: number,
    batch: number,
    year: 'First' | 'Second' | 'Third' | 'Fourth' | 'Fifth',
    status: 'Active' | 'Inactive',
    courseId: string
  ) => Promise<void>;

  deleteStudent: (id: string) => Promise<void>;

  attendanceData: Models.Document[] | null;
  setAttendanceData: React.Dispatch<React.SetStateAction<Models.Document[] | null>>;
  fetchAttendanceData: () => Promise<void>;

  markPresent: (studentId: string, date: string) => void;
  unmarkPresent: (studentId: string, date: string) => void;
  getMarkedStudents: (date: string) => string[];
  saveAttendance: (date: string, courseId: string, sessionId: string, latitude: number | null, longitude: number | null) => Promise<void>;
  markPresentByQR: (studentId: string, date: string) => void;
  resetManualAttendance: (date: string) => void;

  selectedCourse: string | null;
  setSelectedCourse: React.Dispatch<React.SetStateAction<string | null>>;

  latitude: string;
  longitude: string;
  locationId: string | null;
  hasExistingLocation: boolean;
  isLocationLoading: boolean;
  setLatitude: React.Dispatch<React.SetStateAction<string>>;
  setLongitude: React.Dispatch<React.SetStateAction<string>>;
  fetchLocation: () => Promise<void>;
  saveLocation: () => Promise<void>;
  handleUpdateLocation: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
const DB_ID = '6819e71f002774754561';
const STUDENT_COLLECTION_ID = '6819e983001dc900e9f9';
const COURSE_COLLECTION_ID = '6819e836002f8c03c689';
const ATTENDANCE_COLLECTION_ID = '6819e8e100130bc54117';
const CREATE_USER_FUNCTION_ID = '683aac1c003b413d2502';
const DELETE_USER_FUNCTION_ID = '683b6aee0021ec3b47d2';
const GET_USER_ID_FUNCTION_ID = '683b696c001e971bfc8f';
const LOCATION_COLLECTION_ID = '6839818e00303c1ed20e';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [studentData, setStudentData] = useState<Models.Document | null>(null);
  const [courseData, setCourseData] = useState<Models.Document[] | null>(null);
  const [studentsDataAll, setStudentsDataAll] = useState<Models.Document[] | null>(null);
  const [attendanceData, setAttendanceData] = useState<Models.Document[] | null>(null);
  const [manualAttendance, setManualAttendance] = useState<{ [date: string]: string[] }>({});
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [locationId, setLocationId] = useState<string | null>(null);
  const [hasExistingLocation, setHasExistingLocation] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const getUserIdByEmail = async (email: string): Promise<string | null> => {
    try {
      const execution = await functions.createExecution(
        GET_USER_ID_FUNCTION_ID,
        JSON.stringify({ email }),
        false
      );

      if (!execution.responseBody) {
        throw new Error('Function returned an empty response');
      }

      const response = JSON.parse(execution.responseBody);
      if (!response.success) {
        console.warn('⚠️ User not found for email:', email);
        return null;
      }

      return response.userId;
    } catch (err) {
      console.error('❌ Failed to fetch userId by email:', err);
      return null;
    }
  };

  const deleteUserByEmail = async (email: string): Promise<void> => {
    try {
        if (!email || typeof email !== 'string') {
            console.warn('⚠️ Invalid email provided for deletion:', email);
            return;
        }
        console.log('Sending delete request for email:', email);
        const payload = JSON.stringify({ email });
        console.log('Payload sent to deleteUserByEmail:', payload);
        console.log('Function ID:', DELETE_USER_FUNCTION_ID);
        const execution = await functions.createExecution(
            DELETE_USER_FUNCTION_ID,
            payload,
            false
        );

        console.log('Execution response:', execution);
        if (!execution.responseBody) {
            console.error('❌ Empty response from deleteUserByEmail function');
            console.log('Execution details:', JSON.stringify(execution, null, 2));
            throw new Error('Function returned an empty response');
        }

        const response = JSON.parse(execution.responseBody);
        console.log('Delete function response:', response);
        if (!response.success) {
            console.warn('⚠️ Failed to delete user:', response.error);
        } else {
            console.log('✅ User deleted via function:', email);
        }
    } catch (err) {
        console.error('❌ Failed to delete user by email:', err);
    }
};
  const fetchStudentData = async () => {
    try {
      const currentUser = await account.get();
      const response = await databases.listDocuments(
        DB_ID,
        STUDENT_COLLECTION_ID,
      );

      if (response.total > 0) {
        console.log('✅ Student Data:', response.documents[0]);
        setStudentData(response.documents[0]);
      } else {
        console.warn('⚠️ No student found for:', currentUser.$id);
        setStudentData(null);
      }
    } catch (err) {
      console.error('❌ Failed to fetch student data:', err);
      setStudentData(null);
    }
  };

  const fetchCourseData = async () => {
    try {
      const response = await databases.listDocuments(
        DB_ID,
        COURSE_COLLECTION_ID,
      );
      console.log('Course Response', response);
      setCourseData(response.documents);
    } catch (err) {
      console.error('❌ Failed to fetch course data:', err);
      setCourseData(null);
    }
  };

  const addCourse = async (name: string, duration: number, status: 'Active' | 'Inactive') => {
    try {
      await databases.createDocument(
        DB_ID,
        COURSE_COLLECTION_ID,
        ID.unique(),
        {
          Programme: name,
          Duration: duration,
          Status: status,
        }
      );
      await fetchCourseData();
    } catch (err) {
      console.error('❌ Failed to add course:', err);
    }
  };

  const updateCourse = async (id: string, name: string, duration: number, status: 'Active' | 'Inactive') => {
    try {
      await databases.updateDocument(
        DB_ID,
        COURSE_COLLECTION_ID,
        id,
        {
          Programme: name,
          Duration: duration,
          Status: status,
        }
      );
      await fetchCourseData();
    } catch (err) {
      console.error('❌ Failed to update course:', err);
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      await databases.deleteDocument(
        DB_ID,
        COURSE_COLLECTION_ID,
        id
      );
      await fetchCourseData();
    } catch (err) {
      console.error('❌ Failed to delete course:', err);
    }
  };

  const fetchStudentsDataAll = async () => {
    try {
      const response = await databases.listDocuments(
        DB_ID,
        STUDENT_COLLECTION_ID,
      );
      console.log('Student Response', response);
      setStudentsDataAll(response.documents);
    } catch (err) {
      console.error('❌ Failed to fetch Students data:', err);
      setStudentsDataAll(null);
    }
  };

  const checkStudentExists = async (email: string, abc_id: number): Promise<boolean> => {
    try {
      const [emailCheck, abcIdCheck] = await Promise.all([
        databases.listDocuments(DB_ID, STUDENT_COLLECTION_ID, [Query.equal('Email', email)]),
        databases.listDocuments(DB_ID, STUDENT_COLLECTION_ID, [Query.equal('ABC_ID', abc_id)]),
      ]);
      return emailCheck.total > 0 || abcIdCheck.total > 0;
    } catch (err) {
      console.error('❌ Failed to check student existence:', err);
      return false;
    }
  };

  const createUserForStudent = async (name: string, email: string): Promise<string> => {
    const defaultPassword = 'student123';
    const userId = ID.unique();
    try {
      const payload = {
        email,
        name,
        password: defaultPassword,
        userId,
      };
      console.log('Sending payload to function:', payload);

      const execution = await functions.createExecution(
        CREATE_USER_FUNCTION_ID,
        JSON.stringify(payload),
        false
      );

      console.log('Function execution response:', execution);

      if (!execution.responseBody) {
        throw new Error('Function returned an empty response');
      }

      let response;
      try {
        response = JSON.parse(execution.responseBody);
      } catch (parseError) {
        console.error('Failed to parse function response:', execution.responseBody);
        throw new Error('Invalid response from function: ' + (parseError instanceof Error ? parseError.message : 'Unknown parse error'));
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to create user via function');
      }

      console.log('✅ User created via function:', response.user);
      return response.user.userId;
    } catch (err) {
      const errorMessage = err instanceof AppwriteException ? err.message : err.message || 'Unknown error';
      console.error('❌ Failed to create user for student:', err);
      throw new Error('Failed to create user: ' + errorMessage);
    }
  };

  const addStudent = async (
    name: string,
    email: string,
    gender: 'Male' | 'Female' | 'Others',
    abc_id: number,
    semester: number,
    batch: number,
    year: 'First' | 'Second' | 'Third' | 'Fourth' | 'Fifth',
    status: 'Active' | 'Inactive',
    courseId: string
  ) => {
    try {
      // Check if a student with the same email, ABC ID, and course ID exists
      const studentExists = await checkStudentExists(email, abc_id);
      if (studentExists) {
        console.warn(`⚠️ Skipping student with email: ${email}, ABC ID: ${abc_id}, Course ID: ${courseId} - already exists.`);
        throw new Error('A student with this email, ABC ID, and course already exists.');
      }

      // Add student to the student collection first
      const studentDoc = await databases.createDocument(
        DB_ID,
        STUDENT_COLLECTION_ID,
        ID.unique(),
        {
          Name: name,
          Email: email,
          Gender: gender,
          ABC_ID: abc_id,
          Semester: semester,
          Batch: batch,
          Year: year,
          Status: status,
          Course: courseId,
          Address: null,
          uUID: null,
        },
        [
          Permission.read(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ]
      );

      console.log('✅ Student added to collection:', studentDoc);

      // Attempt to create user in Appwrite Users service
      try {
        const userId = await createUserForStudent(name, email);
        // Update the student document with the userId if needed
        await databases.updateDocument(
          DB_ID,
          STUDENT_COLLECTION_ID,
          studentDoc.$id,
          {
            userId: userId, // Optionally store the userId in the student document
          }
        );
        console.log('✅ User created and linked to student:', userId);
      } catch (userErr) {
        console.warn('⚠️ User creation failed, but student data is stored:', userErr);
        // No need to throw here; student data is already saved
      }

      await fetchStudentsDataAll();
    } catch (err) {
      console.error('❌ Failed to add student:', err);
      throw err;
    }
  };

  const bulkAddStudents = async (fileContent: string, fileType: 'csv' | 'json') => {
    try {
      let students: any[] = [];
      let skippedStudents: string[] = [];
      let addedStudents: string[] = [];

      if (fileType === 'csv') {
        const rows = fileContent.trim().split('\n');
        const headers = rows[0].split(',').map((header: string) => header.trim());
        students = rows.slice(1).map((row: string) => {
          const values = row.split(',').map((value: string) => value.trim());
          return headers.reduce((obj: any, header: string, index: number) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
      } else if (fileType === 'json') {
        students = JSON.parse(fileContent);
        if (!Array.isArray(students)) {
          throw new Error('JSON file must contain an array of students.');
        }
      }

      for (const student of students) {
        const {
          Name: name,
          Email: email,
          Gender: gender,
          ABC_ID: abc_id,
          Semester: semester,
          Batch: batch,
          Year: year,
          Status: status,
          Course: courseId,
        } = student;

        if (!name || !email || !gender || !abc_id || !semester || !batch || !year || !status || !courseId) {
          console.warn('⚠️ Skipping invalid student entry:', student);
          skippedStudents.push(name || email || 'Unknown');
          continue;
        }

        const validGenders = ['Male', 'Female', 'Others'];
        const validYears = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
        const validStatuses = ['Active', 'Inactive'];

        if (!validGenders.includes(gender) || !validYears.includes(year) || !validStatuses.includes(status)) {
          console.warn('⚠️ Skipping student with invalid values:', student);
          skippedStudents.push(name || email || 'Unknown');
          continue;
        }

        const studentExists = await checkStudentExists(email, parseInt(abc_id));
        if (studentExists) {
          console.warn(`⚠️ Skipping student with email: ${email}, ABC ID: ${abc_id}, Course ID: ${courseId} - already exists.`);
          skippedStudents.push(name || email);
          continue;
        }

        try {
          await addStudent(
            name,
            email,
            gender,
            parseInt(abc_id),
            parseInt(semester),
            parseInt(batch),
            year,
            status,
            courseId
          );
          addedStudents.push(name || email);
        } catch (err) {
          console.warn(`⚠️ Failed to add student ${name || email}, but data may be stored:`, err);
          // Note: If addStudent partially succeeded (student added to collection but user creation failed), it's already handled
          skippedStudents.push(name || email);
        }
      }

      await fetchStudentsDataAll();
      console.log('✅ Bulk student import completed');
      console.log('✅ Added students:', addedStudents);
      console.log('⚠️ Skipped students:', skippedStudents);

      // Provide feedback to the user
      if (skippedStudents.length > 0) {
        throw new Error(
          `Imported ${addedStudents.length} students. Skipped ${skippedStudents.length} students due to duplicates or errors: ${skippedStudents.join(', ')}`
        );
      }
    } catch (err) {
      console.error('❌ Failed to bulk import students:', err);
      throw err;
    }
  };

  const updateStudent = async (
    id: string,
    name: string,
    email: string,
    gender: 'Male' | 'Female' | 'Others',
    abc_id: number,
    semester: number,
    batch: number,
    year: 'First' | 'Second' | 'Third' | 'Fourth' | 'Fifth',
    status: 'Active' | 'Inactive',
    courseId: string,
  ) => {
    try {
      const currentStudent = await databases.getDocument(DB_ID, STUDENT_COLLECTION_ID, id);
      const studentExists = await checkStudentExists(email, abc_id);
      if (studentExists && (currentStudent.Email !== email || currentStudent.ABC_ID !== abc_id || currentStudent.Course.$id !== courseId)) {
        throw new Error('A student with this email, ABC ID, and course already exists.');
      }

      const newUserId = await getUserIdByEmail(email);
      const permissions = newUserId
        ? [
            Permission.read(Role.user(newUserId)),
            Permission.update(Role.user(newUserId)),
            Permission.delete(Role.user(newUserId)),
            Permission.read(Role.label('admin')),
            Permission.update(Role.label('admin')),
            Permission.delete(Role.label('admin')),
          ]
        : [
            Permission.read(Role.label('admin')),
            Permission.update(Role.label('admin')),
            Permission.delete(Role.label('admin')),
          ];
      await databases.updateDocument(
        DB_ID,
        STUDENT_COLLECTION_ID,
        id,
        {
          Name: name,
          Email: email,
          Gender: gender,
          ABC_ID: abc_id,
          Semester: semester,
          Batch: batch,
          Year: year,
          Status: status,
          Course: courseId,
          Address: null,
          uUID: null,
        },permissions
      );

      await fetchStudentsDataAll();
      console.log('🚀 updateStudent payload:', {
        Name: name,
        Email: email,
        Gender: gender,
        ABC_ID: abc_id,
        Semester: semester,
        Batch: batch,
        Year: year,
        Status: status,
      });
    } catch (err) {
      console.error('❌ Failed to update Student:', err);
      throw err;
    }
  };

const deleteStudent = async (id: string) => {
    try {
      // Retrieve the student document to get the Email
      const studentDoc = await databases.getDocument(DB_ID, STUDENT_COLLECTION_ID, id);
      const email = studentDoc.Email;

      // Delete the user from authentication service if email exists
      if (email) {
        await deleteUserByEmail(email);
      } else {
        console.warn('⚠️ No email found for student document:', id);
      }

      // Delete the student document
      await databases.deleteDocument(DB_ID, STUDENT_COLLECTION_ID, id);
      console.log('✅ Student document deleted:', id);

      await fetchStudentsDataAll();
    } catch (err) {
      console.error('❌ Failed to delete student:', err);
      throw err;
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const response = await databases.listDocuments(
        DB_ID,
        ATTENDANCE_COLLECTION_ID,
      );
      console.log('Attendance Response', response);
      setAttendanceData(response.documents);
    } catch (err) {
      console.error('❌ Failed to fetch Attendance record:', err);
    }
  };

  const markPresent = (studentId: string, date: string) => {
    setManualAttendance(prev => ({
      ...prev,
      [date]: Array.from(new Set([...(prev[date] || []), studentId])),
    }));
  };

  const unmarkPresent = async (studentId: string, date: string) => {
    setManualAttendance(prev => ({
      ...prev,
      [date]: (prev[date] || []).filter(id => id !== studentId),
    }));

    try {
      const response = await databases.listDocuments(DB_ID, ATTENDANCE_COLLECTION_ID);
      const target = response.documents.find(
        doc => {
          const docStudentId = typeof doc.Student_Id === 'object' ? doc.Student_Id.$id : doc.Student_Id;
          return docStudentId === studentId && doc.Marked_at?.slice(0, 10) === date;
        }
      );
      if (target) {
        await databases.deleteDocument(DB_ID, ATTENDANCE_COLLECTION_ID, target.$id);
        await fetchAttendanceData();
      }
    } catch (err) {
      console.error('❌ Failed to delete attendance record:', err);
    }
  };

  const getMarkedStudents = (date: string) => {
    return manualAttendance[date] || [];
  };

  const getBackendMarkedAttendanceByDate = async (date: string) => {
    const formattedDate = date;
    try {
      const response = await databases.listDocuments(DB_ID, ATTENDANCE_COLLECTION_ID);
      return response.documents.filter(
        (doc) => doc.Marked_at?.slice(0, 10) === formattedDate
      );
    } catch (err) {
      console.error('❌ Failed to get backend marked attendance:', err);
      return [];
    }
  };

  const resetManualAttendance = async (date: string) => {
    try {
      const backendMarked = await getBackendMarkedAttendanceByDate(date);
      if (!backendMarked.length) {
        setManualAttendance(prev => ({
          ...prev,
          [date]: [],
        }));
        return;
      }
      for (const doc of backendMarked) {
        await databases.deleteDocument(DB_ID, ATTENDANCE_COLLECTION_ID, doc.$id);
      }
      setManualAttendance(prev => ({
        ...prev,
        [date]: [],
      }));
      await fetchAttendanceData();
    } catch (err) {
      console.error('❌ Error during resetManualAttendance:', err);
    }
  };

  const saveAttendance = async (date: string, courseId: string, sessionId: string, latitude: number | null, longitude: number | null) => {
    const currentUser = await account.get();
    const students = manualAttendance[date] || [];
    try {
      const existingRecords = await getBackendMarkedAttendanceByDate(date);
      const existingStudentIds = new Set(
        existingRecords.map(doc => doc.Student_Id?.$id || doc.Student_Id)
      );
      for (let studentId of students) {
        if (!existingStudentIds.has(studentId)) {
          await databases.createDocument(
            DB_ID,
            ATTENDANCE_COLLECTION_ID,
            ID.unique(),
            {
              Marked_at: date,
              Status: 'Present',
              Student_Id: studentId,
              Session_Id: sessionId,
              Marked_By: currentUser.name,
              Course_Id: courseId,
              Latitude: latitude,
              Longitude: longitude,
            }
          );
        }
      }
      await fetchAttendanceData();
    } catch (err) {
      console.error('❌ Failed to save attendance:', err);
      throw err;
    }
  };

  const markPresentByQR = (studentId: string, date: string) => {
    markPresent(studentId, date);
  };

  // Fetch location from DB
  const fetchLocation = async () => {
    try {
      const response = await databases.listDocuments(
        DB_ID,
        LOCATION_COLLECTION_ID,
      );
      if (response.documents && response.documents.length > 0) {
        const location = response.documents[0];
        setLatitude(location.Latitude?.toString() ?? '');
        setLongitude(location.Longitude?.toString() ?? '');
        setLocationId(location.$id);
        setHasExistingLocation(true);
      } else {
        setHasExistingLocation(false);
        setLatitude('');
        setLongitude('');
        setLocationId(null);
      }
    } catch (error) {
      setHasExistingLocation(false);
      setLatitude('');
      setLongitude('');
      setLocationId(null);
    }
  };

  // Save or update location in DB
  const saveLocation = async () => {
    if (!latitude || !longitude) {
      Alert.alert('Error', 'Please enter or fetch location coordinates.');
      return;
    }
    setIsLocationLoading(true);
    try {
      const locationData = {
        Latitude: latitude,
        Longitude: longitude,
        updated_at: new Date().toISOString(),
      };
      if (locationId) {
        await databases.updateDocument(
          DB_ID,
          LOCATION_COLLECTION_ID,
          locationId,
          locationData,
        );
      } else {
        const response = await databases.createDocument(
          DB_ID,
          LOCATION_COLLECTION_ID,
          ID.unique(),
          locationData,
        );
        setLocationId(response.$id);
      }
      setHasExistingLocation(true);
      Alert.alert('Success', 'Location saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save location.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Get device location
  const getCurrentLocation = () => {
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    });
  };

  // Request permission and update location from device
  const handleUpdateLocation = async () => {
    const permission = Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    });
    const result = await check(permission as Permission);
    if (result !== RESULTS.GRANTED) {
      const requestResult = await request(permission as Permission);
      if (requestResult !== RESULTS.GRANTED) {
        Alert.alert(
          'Location Permission Required',
          'Please grant location permission to update location.',
        );
        return;
      }
    }
    setIsLocationLoading(true);
    try {
      const location = await getCurrentLocation();
      setLatitude(location.latitude.toString());
      setLongitude(location.longitude.toString());
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <DataContext.Provider value={{
      studentData,
      setStudentData,
      fetchStudentData,

      courseData,
      setCourseData,
      fetchCourseData,
      addCourse,
      updateCourse,
      deleteCourse,

      studentsDataAll,
      setStudentsDataAll,
      fetchStudentsDataAll,
      addStudent,
      bulkAddStudents,
      updateStudent,
      deleteStudent,

      attendanceData,
      setAttendanceData,
      fetchAttendanceData,

      markPresent,
      unmarkPresent,
      getMarkedStudents,
      saveAttendance,
      markPresentByQR,
      resetManualAttendance,
      getBackendMarkedAttendanceByDate,

      selectedCourse,
      setSelectedCourse,

      latitude,
      longitude,
      locationId,
      hasExistingLocation,
      isLocationLoading,
      setLatitude,
      setLongitude,
      fetchLocation,
      saveLocation,
      handleUpdateLocation,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within an DataProvider');
  }
  return context;
};
