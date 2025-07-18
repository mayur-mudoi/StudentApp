import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  Alert,
  ToastAndroid,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {Calendar, DateData} from 'react-native-calendars';
import XDate from 'xdate';
import {styles} from './styles';
import AttendanceQR from '../../../components/QR/AttendanceQr';
import {useData} from '../../../context/DataContext';
import * as DocumentPicker from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
// @ts-ignore

const semesters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// Add Student interface here for typing
interface Student {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Others';
  abcId: number;
  semester: number;
  batch: number;
  year: string;
  status: 'Active' | 'Inactive';
  course: string;
}

export default function Attendance() {
  const {
    fetchAttendanceData,
    attendanceData,
    studentsDataAll,
    courseData,
    fetchStudentsDataAll,
    fetchCourseData,
    markPresent,
    unmarkPresent,
    getMarkedStudents,
    saveAttendance,
    resetManualAttendance,
    latitude,
    longitude,
    hasExistingLocation,
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [markModalVisible, setMarkModalVisible] = useState(false);
  const [markMethod, setMarkMethod] = useState('none');
  const [manualMarkingVisible, setManualMarkingVisible] = useState(false);
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [manualMarkingCourseModalVisible, setManualMarkingCourseModalVisible] =
    useState(false);
  const [selectedManualMarkingCourse, setSelectedManualMarkingCourse] =
    useState('');
  const [holidayModalVisible, setHolidayModalVisible] = useState(false);
  const [holidays, setHolidays] = useState<Record<string, string>>({});
  const [importLoading, setImportLoading] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [selectedHoliday, setSelectedHoliday] = useState<{date: string; description: string} | null>(null);

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const first = today.getDate() - today.getDay();
    const d = new Date(today);
    d.setDate(first);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const clearFilters = () => {
    setCourseFilter('');
    setBatchFilter('');
    setSemesterFilter('');
    setDateFilter(new Date());
    setSearchTerm('');
  };

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(studentsDataAll)) {
      return [];
    }
    return studentsDataAll
      .map(doc => ({
        id: doc.$id,
        name: doc.Name,
        gender: doc.Gender,
        abcId: doc.ABC_ID,
        course: doc.Course?.$id || doc.Course, // Support both relation and string
        semester: doc.Semester,
        batch: doc.Batch,
        year: doc.Year,
        status: doc.Status,
      }))
      .filter(student => {
        const matchesSearch =
          student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(student.abcId).includes(searchTerm);
        const matchesCourse = !courseFilter || student.course === courseFilter;
        const matchesBatch =
          !batchFilter || String(student.batch) === batchFilter;
        const matchesSemester =
          !semesterFilter || String(student.semester) === semesterFilter;
        return (
          matchesSearch && matchesCourse && matchesBatch && matchesSemester
        );
      });
  }, [studentsDataAll, searchTerm, courseFilter, batchFilter, semesterFilter]);

  const dateKey = `${dateFilter.getFullYear()}-${String(
    dateFilter.getMonth() + 1,
  ).padStart(2, '0')}-${String(dateFilter.getDate()).padStart(2, '0')}`;
  const attendanceToday = useMemo(() => {
    if (!Array.isArray(attendanceData)) {
      return [];
    }
    return attendanceData.filter(
      record => record.Marked_at?.slice(0, 10) === dateKey,
    );
  }, [attendanceData, dateKey]);

  useEffect(() => {
    setTimeout(() => {
      console.log('🔍 attendanceData:', attendanceData);
      console.log('🔍 dateKey:', dateKey);
      console.log('🔍 attendanceToday:', attendanceToday);
      console.log('🔍 filteredStudents:', filteredStudents);
    }, 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    attendanceData,
    attendanceToday,
    dateKey,
    fetchAttendanceData,
    fetchCourseData,
    fetchStudentsDataAll,
    filteredStudents,
  ]);

  useEffect(() => {
    console.log('attendanceData updated:', attendanceData);
    console.log('attendanceToday:', attendanceToday);
    console.log('filteredStudents:', filteredStudents);

    // Add detailed logging of attendance records
    if (Array.isArray(attendanceToday)) {
      console.log('Detailed attendance records for today:');
      attendanceToday.forEach(record => {
        console.log(
          'Student ID:',
          typeof record.Student_Id === 'object'
            ? record.Student_Id.$id
            : record.Student_Id,
        );
        console.log('Status:', record.Status);
        console.log('Marked at:', record.Marked_at);
        console.log('---');
      });
    }
  }, [attendanceData, attendanceToday, filteredStudents]);

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Info', message); // fallback for iOS
    }
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const canEditDate = () => {
    const today = new Date();
    const selected = new Date(dateFilter);
    const diffInMs = today.setHours(0, 0, 0, 0) - selected.setHours(0, 0, 0, 0);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays <= 0; // or `Infinity` if you want full editing capability
  };

  const handleMarkButtonPress = async () => {
    if (!canEditDate()) {
      ToastAndroid.show(
        'Previous Attendance is not allowed.',
        ToastAndroid.SHORT,
      );
      return;
    }
    if (!hasExistingLocation) {
      Alert.alert(
        'Location Required',
        'Please set up location in the Home screen before marking attendance.',
      );
      return;
    }
    setMarkModalVisible(true);
  };

  const handleQRGeneration = async () => {
    if (!canEditDate()) {
      ToastAndroid.show(
        'Previous Attendance is not allowed.',
        ToastAndroid.SHORT,
      );
      return;
    }
    if (!hasExistingLocation) {
      Alert.alert(
        'Location Required',
        'Please set up location in the Home screen before generating QR.',
      );
      return;
    }
    setMarkMethod('qr');
    setMarkModalVisible(false);
  };

  const getCourseName = (courseId: string) => {
    if (!courseData) {
      return '';
    }
    const courseObj = courseData.find((c: any) => c.$id === courseId);
    return courseObj ? courseObj.Programme : 'Unknown';
  };

  const renderCourseItem = ({item}: {item: any}) => {
    const courseStudents = filteredStudents.filter(
      student => student.course === item.$id,
    );
    const presentCount = attendanceToday.filter(
      record =>
        courseStudents.some(
          student =>
            (typeof record.Student_Id === 'object'
              ? record.Student_Id.$id
              : record.Student_Id) === student.id && record.Status === 'Present',
        ),
    ).length;

    return (
      <TouchableOpacity
        style={styles.courseItem}
        onPress={() => {
          setSelectedManualMarkingCourse(item.$id);
          setMarkModalVisible(true);
        }}>
        <View style={styles.courseItemContent}>
          <Text style={styles.courseName}>{item.Programme}</Text>
          <View style={styles.courseStats}>
            <Text style={styles.courseStatsText}>
              Present: {presentCount}/{courseStudents.length}
            </Text>
          </View>
        </View>
        <Image
          source={require('../../../assets/icons/right.png')}
          style={[styles.icon, styles.iconBlack]}
        />
      </TouchableOpacity>
    );
  };

  const renderManualMarkingItem = ({item}: {item: Student}) => {
    const backendMarked = attendanceToday.some(
      a =>
        (typeof a.Student_Id === 'object' ? a.Student_Id.$id : a.Student_Id) ===
          item.id && a.Status === 'Present',
    );
    const manuallyMarked = getMarkedStudents(dateKey).includes(item.id);
    const isMarked = backendMarked || manuallyMarked;

    const toggleAttendance = async () => {
      console.log('Toggling attendance for student:', item.id);
      console.log(
        'Current state - backendMarked:',
        backendMarked,
        'manuallyMarked:',
        manuallyMarked,
      );

      try {
        if (isMarked) {
          // If marked (either backend or manual), unmark it
          console.log('Unmarking attendance for student:', item.id);
          await unmarkPresent(item.id, dateKey);
          // Force refresh attendance data
          await fetchAttendanceData();
        } else {
          // If not marked, mark as present
          console.log('Marking student present:', item.id);
          markPresent(item.id, dateKey);
        }
      } catch (error) {
        console.error('Error toggling attendance:', error);
        Alert.alert('Error', 'Failed to update attendance');
      }
    };

    return (
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={toggleAttendance}>
        <Text style={styles.checkboxLabel}>
          {item.name} ({getCourseName(item.course)}, Sem: {item.semester})
        </Text>
        <View style={styles.checkbox}>
          {isMarked && <View style={styles.checkboxInner} />}
        </View>
      </TouchableOpacity>
    );
  };
  const maxDate = new Date();

  const calendarModal = showDatePicker && (
    <Modal visible={showDatePicker} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Calendar
            current={dateFilter.toISOString().split('T')[0]}
            minDate={new Date(2020, 0, 1).toISOString().split('T')[0]}
            maxDate={new Date().toISOString().split('T')[0]}
            onDayPress={(day: DateData) => {
              const selectedDate = new Date(day.timestamp);
              const dayOfWeek = selectedDate.getDay();
              if (dayOfWeek === 0 || dayOfWeek === 6) {
                return;
              }
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (selectedDate > today) {
                return;
              }

              // Check if the selected date is a holiday
              const dateKey = day.dateString;
              if (holidays[dateKey]) {
                setSelectedHoliday({date: dateKey, description: holidays[dateKey]});
                return;
              }

              setDateFilter(selectedDate);
              const newWeekStart = new Date(selectedDate);
              newWeekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
              newWeekStart.setHours(0, 0, 0, 0);
              setCurrentWeekStart(newWeekStart);
              setShowDatePicker(false);
            }}
            markedDates={{
              [dateFilter.toISOString().split('T')[0]]: {
                selected: true,
                selectedColor: '#5271FF',
              },
              [new Date().toISOString().split('T')[0]]: {
                marked: true,
                dotColor: '#5271FF',
              },
              ...Object.keys(holidays).reduce((acc, date) => ({
                ...acc,
                [date]: {
                  marked: true,
                  dotColor: '#FF6B6B',
                  customStyles: {
                    container: {
                      backgroundColor: '#FFE5E5',
                      borderRadius: 16,
                    },
                    text: {
                      color: '#FF6B6B',
                    },
                  },
                },
              }), {}),
            }}
            disableAllTouchEventsForDisabledDays={true}
            onMonthChange={month => {
              setVisibleMonth(new Date(month.year, month.month - 1, 1));
            }}
            disableArrowRight={
              visibleMonth.getMonth() === new Date().getMonth() &&
              visibleMonth.getFullYear() === new Date().getFullYear()
            }
            renderHeader={date => (
              <Text style={styles.customHeader}>
                {date ? new XDate(date).toString('MMMM yyyy') : ''}
              </Text>
            )}
            dayComponent={props => {
              const dayOfWeek = new Date(props.date?.timestamp || 0).getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isToday =
                new Date(props.date?.timestamp || 0).toDateString() ===
                new Date().toDateString();
              const isFuture =
                new Date(props.date?.timestamp || 0) > new Date();
              const isHoliday = props.date?.dateString && holidays[props.date.dateString];

              return (
                <View
                  style={[
                    styles.calendarDay,
                    isWeekend && styles.calendarDayWeekend,
                    isToday && styles.calendarDayToday,
                    isFuture && styles.calendarDayDisabled,
                    isHoliday && styles.calendarDayHoliday,
                  ]}>
                  <Text
                    style={[
                      styles.calendarDayText,
                      isWeekend && styles.calendarDayTextWeekend,
                      isToday && styles.calendarDayTextToday,
                      isFuture && styles.calendarDayTextDisabled,
                      isHoliday && styles.calendarDayTextHoliday,
                    ]}>
                    {props.date?.day}
                  </Text>
                </View>
              );
            }}
          />
          <TouchableOpacity
            style={[styles.cancelButton]}
            onPress={() => setShowDatePicker(false)}>
            <Text style={styles.cancelButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Holiday Details Modal
  const holidayDetailsModal = selectedHoliday && (
    <Modal visible={!!selectedHoliday} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Holiday Details</Text>
          <View style={styles.holidayDetailsContainer}>
            <Text style={styles.holidayDate}>
              {new Date(selectedHoliday.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.holidayDescription}>
              {selectedHoliday.description}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.cancelButton]}
            onPress={() => setSelectedHoliday(null)}>
            <Text style={styles.cancelButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Filtered students for manual marking (by selected course)
  const manualMarkingStudents = useMemo(() => {
    if (!Array.isArray(studentsDataAll)) return [];
    if (!selectedManualMarkingCourse) return [];
    return studentsDataAll
      .map(doc => ({
        id: doc.$id,
        name: doc.Name,
        gender: doc.Gender,
        abcId: doc.ABC_ID,
        course: doc.Course?.$id || doc.Course,
        semester: doc.Semester,
        batch: doc.Batch,
        year: doc.Year,
        status: doc.Status,
      }))
      .filter(student => student.course === selectedManualMarkingCourse);
  }, [studentsDataAll, selectedManualMarkingCourse]);

  // Helper to get week dates from a start date
  const getWeekDatesFromStart = (startDate: Date) => {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      d.setHours(0, 0, 0, 0);
      week.push(d);
    }
    return week;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(
      currentWeekStart.getDate() + (direction === 'next' ? 7 : -7),
    );
    setCurrentWeekStart(newWeekStart);
  };

  const handleImportHolidays = async () => {
    try {
      console.log('Starting holiday import...');
      const result = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        type: [
          'text/csv',
          'text/comma-separated-values',
          'application/csv',
          '.csv',
        ],
        allowMultiSelection: false,
      });

      const file = result[0];
      console.log('Selected file:', file);

      if (!file.name?.toLowerCase().endsWith('.csv')) {
        Alert.alert('Error', 'Please select a CSV file');
        return;
      }

      let fileContent: string;
      if (Platform.OS === 'android') {
        const fileUri = file.uri;
        console.log('File URI:', fileUri);

        if (fileUri.startsWith('content://')) {
          const destPath = `${RNFS.TemporaryDirectoryPath}/${file.name}`;
          console.log('Copying file to:', destPath);
          await RNFS.copyFile(fileUri, destPath);
          fileContent = await RNFS.readFile(destPath);
          await RNFS.unlink(destPath);
        } else {
          fileContent = await RNFS.readFile(fileUri);
        }
      } else if (Platform.OS === 'ios') {
        fileContent = await RNFS.readFile(file.uri);
      } else {
        const response = await fetch(file.uri);
        fileContent = await response.text();
      }

      console.log('File content:', fileContent);

      // Parse CSV
      const lines = fileContent.split('\n').filter(line => line.trim() !== '');
      console.log('CSV lines:', lines);

      if (lines.length < 2) {
        throw new Error(
          'CSV file must contain at least a header row and one data row',
        );
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      console.log('CSV headers:', headers);

      const requiredHeaders = ['date', 'description'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

      if (missingHeaders.length > 0) {
        throw new Error(
          `Missing required headers: ${missingHeaders.join(', ')}`,
        );
      }

      const newHolidays: Record<string, string> = {};
      let added = 0;
      let errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        console.log(`Processing row ${i}:`, values);

        if (values.length !== headers.length) {
          errors.push(`Invalid number of columns in row ${i + 1}`);
          continue;
        }

        const date = values[headers.indexOf('date')];
        const description = values[headers.indexOf('description')];

        if (!date || !description) {
          errors.push(`Row ${i + 1}: Missing date or description`);
          continue;
        }

        try {
          const dateObj = new Date(date);
          if (isNaN(dateObj.getTime())) {
            errors.push(`Row ${i + 1}: Invalid date format: ${date}`);
            continue;
          }

          const dateKey = dateObj.toISOString().split('T')[0];
          newHolidays[dateKey] = description;
          added++;
          console.log(`Added holiday: ${dateKey} - ${description}`);
        } catch (e) {
          errors.push(
            `Row ${i + 1}: ${e instanceof Error ? e.message : 'Invalid date'}`,
          );
        }
      }

      console.log('Final holidays object:', newHolidays);

      if (added > 0) {
        setHolidays(newHolidays);
        showToast(`✅ Imported ${added} holidays successfully`);
        setHolidayModalVisible(false);
      }

      if (errors.length > 0) {
        Alert.alert(
          'Import Warnings',
          `Some rows had errors:\n${errors.join('\n')}`,
        );
      }
    } catch (err) {
      console.error('Import error:', err);
      const error = err as {code?: string};
      if (error.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert(
          'Error',
          err instanceof Error ? err.message : 'Failed to import holidays',
        );
      }
    }
  };

  const downloadHolidayTemplate = async () => {
    try {
      const template = `date,description
2024-01-01,New Year
2024-12-25,Christmas`;

      const fileName = `holidays_template_${Date.now()}.csv`;
      let baseDir = '';
      if (Platform.OS === 'android') {
        baseDir = `${RNFS.DownloadDirectoryPath}/Attender/Holidays`;
      } else {
        baseDir = `${RNFS.DocumentDirectoryPath}/Attender/Holidays`;
      }

      await RNFS.mkdir(baseDir);
      const filePath = `${baseDir}/${fileName}`;
      await RNFS.writeFile(filePath, template, 'utf8');

      Alert.alert('Template Downloaded', `File saved to:\n${filePath}`);
    } catch (e) {
      Alert.alert(
        'Error',
        e instanceof Error ? e.message : 'Failed to download template',
      );
    }
  };

  const handleMarkAllAbsent = async () => {
    try {
      setSaveDisabled(true);
      console.log(
        'Marking all absent for course:',
        selectedManualMarkingCourse,
      );

      // Get all students in the course
      const courseStudents = manualMarkingStudents.map(student => student.id);
      console.log('Course student IDs:', courseStudents);

      // Get current attendance records for these students
      const courseAttendance = attendanceToday.filter(record => {
        const studentId =
          typeof record.Student_Id === 'object'
            ? record.Student_Id.$id
            : record.Student_Id;
        return courseStudents.includes(studentId);
      });
      console.log('Current attendance for course students:', courseAttendance);

      // First reset manual attendance for the date
      await resetManualAttendance(dateKey);

      // Unmark each student in the course
      for (const record of courseAttendance) {
        const studentId =
          typeof record.Student_Id === 'object'
            ? record.Student_Id.$id
            : record.Student_Id;
        console.log('Unmarking student:', studentId);
        await unmarkPresent(studentId, dateKey);
        // Add delay between operations
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Force refresh attendance data
      console.log('Fetching updated attendance data...');
      await fetchAttendanceData();
      console.log('Attendance data refreshed');

      setTimeout(() => setSaveDisabled(false), 1500);
      showToast(
        `🚫 All marked absent for ${getCourseName(
          selectedManualMarkingCourse,
        )} on ${formatDate(dateFilter)}`,
      );
    } catch (err) {
      console.error('Error marking all absent:', err);
      Alert.alert('Error', 'Failed to mark all absent.');
      setSaveDisabled(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekDates = getWeekDatesFromStart(currentWeekStart);

  // if (!attendanceData) {
  //   return (
  //     <SafeAreaView style={styles.container}>
  //       <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
  //         <ActivityIndicator size="large" color="#5271FF" />
  //         <Text>Loading attendance...</Text>
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Image
          source={require('../../../assets/icons/search.png')}
          style={[styles.icon, styles.iconBlack]}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#A0AEC0"
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}>
          <Image
            source={require('../../../assets/icons/filter.png')}
            style={[styles.icon, styles.iconWhite]}
          />
        </TouchableOpacity>
      </View>

      {/* Date Selector */}
      <View style={styles.weekViewWrapper}>
        <View style={styles.weekViewHeader}>
          <View>
            <Text style={styles.weekViewTitle}>
              {dateFilter.toLocaleDateString('en-US', {month: 'long'})}
            </Text>
            <Text style={styles.weekViewSubtitle}>
              {dateFilter.toLocaleDateString('en-US', {year: 'numeric'})}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setShowDatePicker(true)}>
            <Image
              source={require('../../../assets/icons/expand.png')}
              style={[styles.icon, styles.iconBlack]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.weekViewContent}>
          {weekDates.map(item => {
            const isSelected =
              item.toDateString() === dateFilter.toDateString();
            const isDisabled = item > today;
            return (
              <TouchableOpacity
                key={item.toDateString()}
                style={[
                  styles.weekViewDay,
                  isSelected && styles.weekViewDaySelected,
                  isDisabled && styles.weekViewDayDisabled,
                ]}
                disabled={isDisabled}
                onPress={() => {
                  if (!isDisabled) setDateFilter(new Date(item));
                }}>
                <Text
                  style={[
                    styles.weekViewDayText,
                    isSelected && styles.weekViewDaySelectedText,
                    isDisabled && styles.weekViewDayDisabledText,
                  ]}>
                  {item.toLocaleDateString('en-US', {weekday: 'short'})}
                </Text>
                <Text
                  style={[
                    styles.weekViewDayNumber,
                    isSelected && styles.weekViewDaySelectedText,
                    isDisabled && styles.weekViewDayDisabledText,
                  ]}>
                  {item.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.dateContainer}>
        {/* <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.datePickerButton}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.filterLabel}>{dateFilter.toDateString()}</Text>
        </TouchableOpacity> */}

        <View style={styles.attendanceCountContainer}>
          <Text style={styles.attendanceCountText}>Present:</Text>
          <Text style={styles.attendanceCountNumber}>
            {attendanceToday.length}/{filteredStudents.length}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.holidayButton}
          onPress={() => setHolidayModalVisible(true)}>
          <Text style={styles.holidayButtonText}>🎉 Holidays</Text>
        </TouchableOpacity>
      </View>

      {calendarModal}
      {holidayDetailsModal}

      {/* Holiday Import Modal */}
      <Modal visible={holidayModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Holidays</Text>

            <TouchableOpacity
              style={[styles.markAttendanceSection, {marginBottom: 12}]}
              onPress={handleImportHolidays}
              disabled={importLoading}>
              {importLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Import Holidays</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.markAttendanceSection, {marginBottom: 12}]}
              onPress={downloadHolidayTemplate}>
              <Text style={styles.saveButtonText}>Download Template</Text>
            </TouchableOpacity>

            {/* Display imported holidays */}
            {Object.keys(holidays).length > 0 && (
              <View style={{marginTop: 16}}>
                <Text style={[styles.filterSectionTitle, {marginBottom: 8}]}>
                  Imported Holidays:
                </Text>
                <ScrollView style={{maxHeight: 200}}>
                  {Object.entries(holidays).map(([date, description]) => (
                    <View
                      key={date}
                      style={{flexDirection: 'row', marginBottom: 4}}>
                      <Text style={{flex: 1}}>
                        {new Date(date).toLocaleDateString()}
                      </Text>
                      <Text style={{flex: 2}}>{description}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.markAttendanceSection,
                styles.cancelButtonColor,
                {marginTop: 16},
              ]}
              onPress={() => setHolidayModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Students List */}
      <FlatList
        data={courseData}
        keyExtractor={item => item.$id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<View style={{height: 100}} />}
        renderItem={renderCourseItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No courses found. Try adjusting your filters.
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Filter Students</Text>

              <Text style={styles.filterSectionTitle}>Course</Text>
              <View style={styles.filterStudents}>
                <Picker
                  selectedValue={courseFilter}
                  onValueChange={value => setCourseFilter(value)}
                  style={styles.input}>
                  <Picker.Item label="All Courses" value="" />
                  {courseData?.map(course => (
                    <Picker.Item
                      key={course.$id}
                      label={course.Programme}
                      value={course.$id}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.filterSectionTitle}>Semester</Text>
              <View style={styles.filterStudents}>
                <Picker
                  selectedValue={semesterFilter}
                  onValueChange={value => setSemesterFilter(value)}
                  style={styles.input}>
                  <Picker.Item label="All Semesters" value="" />
                  {semesters.map(sem => (
                    <Picker.Item
                      key={sem}
                      label={sem.toString()}
                      value={sem.toString()}
                    />
                  ))}
                </Picker>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setFilterModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => {
                    setFilterModalVisible(false);
                  }}>
                  <Text style={styles.saveButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={clearFilters}>
                <Text style={styles.markAllButtonText}>Clear All Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Mark Attendance Modal */}
      {canEditDate() && (
        <Modal visible={markModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Mark Attendance - {getCourseName(selectedManualMarkingCourse)}
              </Text>

              <TouchableOpacity
                style={[styles.markAttendanceSection]}
                onPress={() => {
                  setMarkModalVisible(false);
                  setManualMarkingVisible(true);
                }}>
                <Text style={styles.saveButtonText}>Mark Manually</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.markAttendanceSection]}
                onPress={handleQRGeneration}>
                <Text style={styles.saveButtonText}>Generate QR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.markAttendanceSection, styles.cancelButtonColor]}
                onPress={() => setMarkModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Manual Marking Course Selection Modal */}
      <Modal
        visible={manualMarkingCourseModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setManualMarkingCourseModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setManualMarkingCourseModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                disabled={!selectedManualMarkingCourse}
                onPress={() => {
                  setManualMarkingCourseModalVisible(false);
                  setManualMarkingVisible(true);
                }}>
                <Text style={styles.saveButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manual Marking Screen */}
      <Modal
        visible={manualMarkingVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setManualMarkingVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.manualMarkingHeader}>
              <Text style={styles.modalTitle}>Mark Attendance</Text>
              <TouchableOpacity onPress={() => setManualMarkingVisible(false)}>
                <Text style={styles.crossStyle}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={manualMarkingStudents}
              keyExtractor={item => item.id}
              renderItem={renderManualMarkingItem}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No students found for this course.
                  </Text>
                </View>
              }
            />
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.saveButton, styles.saveButtonAdd]}
                onPress={() => {
                  manualMarkingStudents.forEach(stu =>
                    markPresent(stu.id, dateKey),
                  );
                }}>
                <Text style={styles.saveButtonText}>Mark All Present</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, styles.cancelButtonAdd]}
                onPress={handleMarkAllAbsent}>
                <Text style={styles.cancelButtonText}>Mark All Absent</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { marginTop: 12, opacity: saveDisabled ? 0.5 : 1 },
                ]}
                disabled={saveDisabled}
                onPress={async () => {
                  if (saveDisabled) {
                    return;
                  }
                  try {
                    await saveAttendance(
                      dateKey,
                      selectedManualMarkingCourse,
                      `attendance_${dateKey}`,
                      latitude ? Number(latitude) : null,
                      longitude ? Number(longitude) : null,
                    );
                    await fetchAttendanceData();
                    setManualMarkingVisible(false);
                    showToast(
                      `✅ Attendance saved for ${formatDate(dateFilter)}`,
                    );
                  } catch (err) {
                    Alert.alert(
                      'Error',
                      'Failed to save attendance. Please check required fields and try again.',
                    );
                    console.error(err);
                  }
                }}>
                <Text style={styles.saveButtonText}>Save Attendance</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code Overlay */}
      <Modal
        visible={markMethod === 'qr'}
        animationType="slide"
        transparent
        onRequestClose={() => setMarkMethod('none')}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Scan this QR to mark attendance for {getCourseName(selectedManualMarkingCourse)}
            </Text>
            <AttendanceQR
              sessionId={`attendance_${dateKey}_${selectedManualMarkingCourse}`}
              selectedCourse={selectedManualMarkingCourse}
            />
            <TouchableOpacity
              onPress={() => setMarkMethod('none')}
              style={[styles.qrCloseButton, { marginTop: 24 }]}
            >
              <Text style={styles.saveButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
