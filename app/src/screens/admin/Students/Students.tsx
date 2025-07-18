import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import * as DocumentPicker from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import {styles} from './styles';
import {Picker} from '@react-native-picker/picker';
import {useData} from '../../../context/DataContext';
import Share from 'react-native-share';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {Colors} from '../../../globalStyles';

interface Student {
  id: string;
  email:string;
  name: string;
  gender: 'Male' | 'Female' | 'Others';
  abcId: number;
  semester: number;
  batch: number;
  year: string;
  status: 'Active' | 'Inactive';
  course: string;
}

interface StudentImport {
  [key: string]: string | null;
}

interface IconMap {
  [key: string]: any;
}

export default function Students() {
  const {
    studentsDataAll,
    fetchStudentsDataAll,
    addStudent,
    updateStudent,
    deleteStudent,
    courseData,
    fetchCourseData,
  } = useData();

  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'Active' | 'Inactive'
  >('all');
  const [batchFilter, setBatchFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  const [editId, setEditId] = useState<string | null>(null);

  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Others'>('Male');
  const [abcId, setAbcId] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [batch, setBatch] = useState('');
  const [year, setYear] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const [addMethodModalVisible, setAddMethodModalVisible] = useState(false);

  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportStatusFilter, setExportStatusFilter] = useState<
    'all' | 'Active' | 'Inactive'
  >('all');
  const [exportCourseFilter, setExportCourseFilter] = useState('');
  const [exportBatchFilter, setExportBatchFilter] = useState('');
  const [exportSemesterFilter, setExportSemesterFilter] = useState('');

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const currentYear = new Date().getFullYear();
  const batchYears = useMemo(() => {
    return Array.from(
      {length: currentYear + 6 - 1950 + 1},
      (_, i) => currentYear + 6 - i,
    );
  }, []);

  useEffect(() => {
    console.log('📞 Fetching student data in Student.tsx');
    fetchStudentsDataAll();
    // console.log('📞 Fetching course data in Student.tsx');
    fetchCourseData();
  }, []);

  const activeCourses =
    courseData?.filter(course => course.Status === 'Active') || [];
  console.log('Active Courses:', activeCourses);

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(studentsDataAll)) {
      return [];
    }
    return studentsDataAll
      .map(doc => ({
        id: doc.$id,
        name: doc.Name ?? '',
        email: doc.Email,
        gender: doc.Gender,
        abcId: doc.ABC_ID,
        course: doc.Course?.$id ?? '',
        semester: doc.Semester,
        batch: doc.Batch,
        year: doc.Year,
        status: doc.Status,
      }))
      .filter(student => {
        const matchesSearch = student.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === 'all' || student.status === statusFilter;
        const matchesBatch =
          !batchFilter || student.batch.toString() === batchFilter;
        const matchesCourse = !courseFilter || student.course === courseFilter;
        return matchesSearch && matchesStatus && matchesCourse && matchesBatch;
      });
  }, [studentsDataAll, searchTerm, statusFilter, batchFilter, courseFilter]);

  const resetForm = () => {
    setStudentName('');
    setStudentEmail('');
    setGender('Male');
    setAbcId('');
    setSemester('');
    setBatch('');
    setYear('');
    setStatus('Active');
    setEditId(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setBatchFilter('');
    setCourseFilter('');
  };

  const handleSubmit = async () => {
    const abcIdNum = parseInt(abcId, 10);
    const semesterNum = parseInt(semester, 10);
    const batchNum = parseInt(batch, 10);
    const yearStr = year;

    if (
      !studentName ||
      !abcId ||
      !semester ||
      !batch ||
      !year ||
      !selectedCourse
    ) {
      Alert.alert('Missing fields', 'Please fill all required fields.');
      return;
    }

    if (editId) {
      await updateStudent(
        editId,
        studentName,
        studentEmail,
        gender,
        abcIdNum,
        semesterNum,
        batchNum,
        yearStr as any,
        status,
        selectedCourse,
      );
    } else {
      await addStudent(
        studentName,
        studentEmail,
        gender,
        abcIdNum,
        semesterNum,
        batchNum,
        yearStr as any,
        status,
        selectedCourse,
      );
    }

    console.log('🧪 Submitting Student Update:', {
      id: editId,
      name: studentName,
      email: studentEmail,
      gender,
      abcIdNum,
      semesterNum,
      batchNum,
      yearStr,
      status,
    });

    resetForm();
    setModalVisible(false);
  };
  const handleSync = async () => {
    try {
      await syncManualStudents();
      Alert.alert('Success', 'Student synchronization completed.');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleEdit = (student: Student) => {
    setEditId(student.id);
    setStudentName(student.name);
    setStudentEmail(student.email);
    setGender(student.gender);
    setAbcId(student.abcId?.toString() ?? '');
    setSemester(student.semester?.toString() ?? '');
    setBatch(student.batch?.toString() ?? '');
    setSelectedCourse(student.course ?? '');
    // Only accept valid year enum
    const validYears = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
    const validYear = validYears.includes(student.year)
      ? student.year
      : 'First';
    setYear(validYear);

    setStatus(student.status);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Student',
      'Are you sure you want to delete this student?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteStudent(id);
            resetForm();
          },
        },
      ],
    );
  };

  // iconMap.js or inside the component
  const iconMap: IconMap = {
    csv: require('../../../assets/icons/csv.png'),
    pdf: require('../../../assets/icons/pdf.png'),
  };

  const renderStudentItem = ({item}: {item: Student}) => {
    const course = courseData?.find(c => c.$id === item.course);
    const courseName = course?.Programme || 'Unknown';
    const isCourseInactive = course?.Status === 'Inactive';
    const initials = item.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();

    const getStatusColor = () => {
      if (isCourseInactive) return Colors.warning;
      return item.status === 'Active' ? Colors.success : Colors.error;
    };

    return (
      <TouchableOpacity
        style={[
          styles.studentItem,
          (item.status === 'Inactive' || isCourseInactive) &&
            styles.disabledItem,
        ]}
        onPress={() => {
          if (!isCourseInactive) {
            setSelectedStudent(item);
            setDetailsModalVisible(true);
          }
        }}
        disabled={isCourseInactive}>
        <View style={styles.studentItemContent}>
          <View style={styles.studentAvatar}>
            <Text style={styles.studentAvatarText}>{initials}</Text>
          </View>
          <View style={styles.studentMainInfo}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.studentName}>{item.name}</Text>
              {isCourseInactive && (
                <Text style={[styles.courseStatus, {color: Colors.warning}]}>
                  {' '}
                  (Course Inactive)
                </Text>
              )}
            </View>
            <Text style={styles.studentCourse}>{courseName}</Text>
          </View>
          <View
            style={[
              styles.statusIndicator,
              {backgroundColor: getStatusColor()},
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  console.log('Filtered Students', filteredStudents);

  // File upload handler (logic to be implemented next)
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        type: [
          'application/json',
          'text/csv',
          'text/comma-separated-values',
          'application/csv',
          '.csv',
          '.json',
        ],
        allowMultiSelection: false,
      });
      const file = result[0];
      if (
        !file.name?.toLowerCase().endsWith('.json') &&
        !file.name?.toLowerCase().endsWith('.csv')
      ) {
        Alert.alert('Error', 'Please select a JSON or CSV file');
        return;
      }
      let fileContent = '';
      if (Platform.OS === 'android') {
        const fileUri = file.uri;
        if (fileUri.startsWith('content://')) {
          const destPath = `${RNFS.TemporaryDirectoryPath}/${file.name}`;
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

      let students = [];
      if (file.name.toLowerCase().endsWith('.json')) {
        try {
          students = JSON.parse(fileContent);
        } catch (e) {
          Alert.alert('Error', 'Invalid JSON format');
          return;
        }
      } else {
        // Parse CSV
        const lines = fileContent
          .split('\n')
          .filter(line => line.trim() !== '');
        if (lines.length < 2) {
          Alert.alert(
            'Error',
            'CSV file must contain at least a header row and one data row',
          );
          return;
        }
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = [
          'name',
          'email',
          'gender',
          'abc_id',
          'semester',
          'batch',
          'year',
          'status',
          'course',
        ];
        const missingHeaders = requiredHeaders.filter(
          h => !headers.includes(h),
        );
        if (missingHeaders.length > 0) {
          Alert.alert(
            'Error',
            `Missing required headers: ${missingHeaders.join(', ')}`,
          );
          return;
        }
        students = lines.slice(1).map((line, idx) => {
          const values = line.split(',').map(v => v.trim());
          if (values.length < headers.length) {
            throw new Error(`Invalid number of columns in row ${idx + 2}`);
          }
          const student: StudentImport = {};
          headers.forEach((header, i) => {
            student[header] = values[i] === '' ? null : values[i];
          });
          return student;
        });
      }
      if (!Array.isArray(students) || students.length === 0) {
        Alert.alert('Error', 'No valid students found in the file');
        return;
      }
      // Validation and import
      const validGenders = ['Male', 'Female', 'Others'];
      const validStatuses = ['Active', 'Inactive'];
      const validYears = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
      // Map course names (case-insensitive) to IDs
      const courseNameToId: {[key: string]: string} = {};
      courseData?.forEach((c: any) => {
        courseNameToId[(c.Programme || '').toLowerCase()] = c.$id;
      });
      let added = 0,
        skipped = 0,
        errors = [];
      for (let i = 0; i < students.length; i++) {
        const s: any = students[i];
        // Normalize keys for JSON
        const name = s.name || s.Name;
        const email = s.email || s.Email;
        const gender = s.gender || s.Gender;
        const abc_id = s.abc_id || s.ABC_ID;
        const semester = s.semester || s.Semester;
        const batch = s.batch || s.Batch;
        const year = s.year || s.Year;
        const status = s.status || s.Status;
        let course = (s.course || s.Course) as string;
        const uuid = s.uuid || s.uUID || null;
        // Validate required fields
        if (
          !name ||
          !email ||
          !gender ||
          !abc_id ||
          !semester ||
          !batch ||
          !year ||
          !status ||
          !course
        ) {
          errors.push(`Row ${i + 2}: Missing required fields`);
          skipped++;
          continue;
        }
        // Validate enums
        if (!validGenders.includes(gender)) {
          errors.push(`Row ${i + 2}: Invalid gender: ${gender}`);
          skipped++;
          continue;
        }
        if (!validStatuses.includes(status)) {
          errors.push(`Row ${i + 2}: Invalid status: ${status}`);
          skipped++;
          continue;
        }
        if (!validYears.includes(year)) {
          errors.push(`Row ${i + 2}: Invalid year: ${year}`);
          skipped++;
          continue;
        }
        // Validate numbers
        const abcIdNum = parseInt(abc_id, 10);
        const semesterNum = parseInt(semester, 10);
        const batchNum = parseInt(batch, 10);
        if (isNaN(abcIdNum) || isNaN(semesterNum) || isNaN(batchNum)) {
          errors.push(
            `Row ${i + 2}: Invalid number in abc_id, semester, or batch`,
          );
          skipped++;
          continue;
        }
        // Map course name to ID (case-insensitive)
        const courseId = courseNameToId[course.trim().toLowerCase()];
        if (!courseId) {
          errors.push(
            `Row ${i + 2}: Course name does not exist in DB: ${course}`,
          );
          skipped++;
          continue;
        }
        // Check for duplicates (same name, abc_id, course)
        const isDuplicate = studentsDataAll?.some(
          (stu: any) =>
            (stu.Name === name || stu.name === name) &&
            (stu.ABC_ID == abcIdNum || stu.abcId == abcIdNum) &&
            (stu.Course?.$id === courseId || stu.course === courseId),
        );
        if (isDuplicate) {
          errors.push(
            `Row ${i + 2}: Duplicate student: ${name}, ${abcIdNum}, ${course}`,
          );
          skipped++;
          continue;
        }
        // Add student
        try {
          await addStudent(
            name,
            email,
            gender,
            abcIdNum,
            semesterNum,
            batchNum,
            year,
            status,
            courseId,
          );
          added++;
        } catch (e) {
          errors.push(`Row ${i + 2}: Failed to add student: ${name}`);
          skipped++;
        }
      }
      setAddMethodModalVisible(false);
      fetchStudentsDataAll();
      syncManualStudents();
      Alert.alert(
        'Import Complete',
        `Added: ${added}\nSkipped: ${skipped}\n${
          errors.length ? 'Errors:\n' + errors.join('\n') : ''
        }`,
      );
    } catch (err) {
      const error = err as {code?: string};
      if (error.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Failed to read file');
      }
    }
  };

  // Helper to get course name from ID
  function getCourseName(courseId: string) {
    const course = courseData?.find((c: any) => c.$id === courseId);
    return course ? course.Programme : courseId;
  }

  const exportImmediately = async (
    format: 'csv' | 'pdf',
    action: 'download' | 'share',
  ) => {
    try {
      // Filter students based on export filters
      let exportStudents = studentsDataAll || [];
      if (exportStatusFilter !== 'all') {
        exportStudents = exportStudents.filter(
          (doc: any) =>
            (doc.Status || doc.status || '').toLowerCase().trim() ===
            exportStatusFilter.toLowerCase().trim(),
        );
      }
      if (exportCourseFilter) {
        exportStudents = exportStudents.filter(
          (doc: any) =>
            (doc.Course?.$id || doc.course || '').toString().trim() ===
            exportCourseFilter.trim(),
        );
      }
      if (exportBatchFilter) {
        exportStudents = exportStudents.filter(
          (doc: any) =>
            String(doc.Batch || doc.batch || '').trim() ===
            exportBatchFilter.trim(),
        );
      }
      if (exportSemesterFilter) {
        exportStudents = exportStudents.filter(
          (doc: any) =>
            String(doc.Semester || doc.semester || '').trim() ===
            exportSemesterFilter.trim(),
        );
      }
      if (!exportStudents.length) {
        let filterSummary = [];
        if (exportStatusFilter !== 'all') {
          filterSummary.push(`Status: ${exportStatusFilter}`);
        }
        if (exportCourseFilter) {
          filterSummary.push(`Course: ${getCourseName(exportCourseFilter)}`);
        }
        if (exportBatchFilter) {
          filterSummary.push(`Batch: ${exportBatchFilter}`);
        }
        if (exportSemesterFilter) {
          filterSummary.push(`Semester: ${exportSemesterFilter}`);
        }
        const filterMsg = filterSummary.length
          ? `\n\nCurrent filters:\n${filterSummary.join('\n')}`
          : '';
        Alert.alert(
          'No students to export',
          `No students match the selected filters.${filterMsg}\n\nPlease adjust your filters and try again.`,
        );
        setExportModalVisible(false);
        return;
      }
      let fileContent = '';
      let fileName = `students_export_${Date.now()}`;
      let filePath = '';
      let baseDir = '';
      if (Platform.OS === 'android') {
        baseDir = `${RNFS.DownloadDirectoryPath}/Attender/Students`;
      } else {
        baseDir = `${RNFS.DocumentDirectoryPath}/Attender/Students`;
      }
      await RNFS.mkdir(baseDir);
      if (format === 'csv') {
        const headers = [
          'Name',
          'Email',
          'Gender',
          'ABC_ID',
          'Semester',
          'Batch',
          'Year',
          'Status',
          'Course',
        ];
        const rows = (exportStudents as any[]).map(s => [
          s.Name || s.name,
          s.Email || s.email,
          s.Gender || s.gender,
          s.ABC_ID || s.abcId,
          s.Semester || s.semester,
          s.Batch || s.batch,
          s.Year || s.year,
          s.Status || s.status,
          s.Course?.Programme || s.courseName || s.Course || s.course || '',
        ]);
        fileContent = [headers.join(','), ...rows.map(r => r.join(','))].join(
          '\n',
        );
        fileName += '.csv';
        filePath = `${baseDir}/${fileName}`;
        await RNFS.writeFile(String(filePath), fileContent, 'utf8');
      } else if (format === 'pdf') {
        const headers = [
          'Name',
          'Email',
          'Gender',
          'ABC_ID',
          'Semester',
          'Batch',
          'Year',
          'Status',
          'Course',
        ];
        const rowsHtml = (exportStudents as any[])
          .map(
            s =>
              `<tr><td>${s.Name || s.name}</td><td>${s.Email || s.email}</td><td>${
                s.Gender || s.gender
              }</td><td>${s.ABC_ID || s.abcId}</td><td>${
                s.Semester || s.semester
              }</td><td>${s.Batch || s.batch}</td><td>${
                s.Year || s.year
              }</td><td>${s.Status || s.status}</td><td>${
                s.Course?.Programme ||
                s.courseName ||
                s.Course ||
                s.course ||
                ''
              }</td></tr>`,
          )
          .join('');
        const html = `
          <h2>Students Export</h2>
          <table border="1" style="border-collapse:collapse;width:100%">
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            ${rowsHtml}
          </table>
        `;
        fileName += '.pdf';
        // 1. Generate PDF in default location
        const pdf = await RNHTMLtoPDF.convert({
          html,
          fileName: fileName.replace('.pdf', ''),
          base64: false,
        });
        // 2. Move PDF to Downloads/Attender/Students/
        const targetPath = `${baseDir}/${fileName}`;
        await RNFS.mkdir(baseDir);
        await RNFS.moveFile(String(pdf.filePath), String(targetPath));
        filePath = String(targetPath);
      }
      if (action === 'download') {
        Alert.alert('Export Complete', `File saved to:\n${filePath}`);
      } else if (action === 'share') {
        await Share.open({
          url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
          type: format === 'pdf' ? 'application/pdf' : 'text/csv',
          failOnCancel: false,
        });
      }
    } catch (e) {
      Alert.alert(
        'Export Error',
        e instanceof Error ? e.message : 'Failed to export',
      );
    } finally {
      setExportModalVisible(false);
    }
  };

  const renderDetailsModal = () => {
    if (!selectedStudent) {
      return null;
    }
    const course = courseData?.find(c => c.$id === selectedStudent.course);
    const courseName = course?.Programme || 'Unknown';
    const isCourseInactive = course?.Status === 'Inactive';

    return (
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Student Details</Text>
            <TouchableOpacity
              onPress={() => setDetailsModalVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{selectedStudent.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{selectedStudent.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Course:</Text>
                <Text style={styles.detailValue}>
                  {courseName}
                  {isCourseInactive && (
                    <Text style={{color: Colors.warning}}> (Inactive)</Text>
                  )}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gender:</Text>
                <Text style={styles.detailValue}>{selectedStudent.gender}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ABC ID:</Text>
                <Text style={styles.detailValue}>{selectedStudent.abcId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Semester:</Text>
                <Text style={styles.detailValue}>
                  {selectedStudent.semester}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Batch:</Text>
                <Text style={styles.detailValue}>{selectedStudent.batch}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Year:</Text>
                <Text style={styles.detailValue}>{selectedStudent.year}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: isCourseInactive
                        ? Colors.warning
                        : selectedStudent.status === 'Active'
                        ? Colors.success
                        : Colors.error,
                    },
                  ]}>
                  {isCourseInactive
                    ? 'Inactive (Course Inactive)'
                    : selectedStudent.status}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: isCourseInactive
                      ? Colors.disabled
                      : Colors.primary,
                  },
                ]}
                onPress={() => {
                  if (!isCourseInactive) {
                    setDetailsModalVisible(false);
                    handleEdit(selectedStudent);
                  }
                }}
                disabled={isCourseInactive}>
                <Image
                  source={require('../../../assets/icons/edit.png')}
                  style={[styles.icon, styles.iconWhite]}
                />
                <Text style={[styles.modalButtonText, {color: Colors.white}]}>
                  {isCourseInactive ? 'Edit Disabled' : 'Edit'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, {backgroundColor: Colors.error}]}
                onPress={() => {
                  setDetailsModalVisible(false);
                  handleDelete(selectedStudent.id);
                }}>
                <Image
                  source={require('../../../assets/icons/delete.png')}
                  style={[styles.icon, styles.iconWhite]}
                />
                <Text style={[styles.modalButtonText, {color: Colors.white}]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Image
          source={require('../../../assets/icons/search.png')}
          style={[styles.icon, styles.iconBlack]}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ID..."
          placeholderTextColor="#A0AEC0"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}>
          <Image
            source={require('../../../assets/icons/filter.png')}
            style={[styles.icon, styles.iconWhite]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, {backgroundColor: Colors.success}]}
          onPress={() => setExportModalVisible(true)}>
          <Image
            source={require('../../../assets/icons/export.png')}
            style={[styles.icon, styles.iconWhite]}
          />
        </TouchableOpacity>
      </View>
      {filteredStudents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../../../assets/icons/share.png')}
            style={[styles.icon, styles.iconWhite]}
          />
          <Text style={styles.emptyText}>No students found</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setModalVisible(true);
            }}>
            <Text style={styles.addButtonText}>Add New Student</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          showsVerticalScrollIndicator={false}
          renderItem={renderStudentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={<View style={{height: 100}} />}
        />
      )}
      {renderDetailsModal()}

      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => setAddMethodModalVisible(true)}>
        <Image
          source={require('../../../assets/icons/add.png')}
          style={[styles.icon, styles.iconWhite]}
        />
      </TouchableOpacity>

      {/* Add Method Selection Modal */}
      <Modal
        visible={addMethodModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setAddMethodModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Student</Text>
            <TouchableOpacity
              style={styles.methodButton}
              onPress={() => {
                setAddMethodModalVisible(false);
                resetForm();
                setModalVisible(true);
              }}>
              <Text style={styles.methodButtonText}>Add Manually</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.methodButton}
              onPress={handleFileUpload}>
              <Text style={styles.methodButtonText}>Upload CSV/JSON File</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButtonExport}
              onPress={() => setAddMethodModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editId ? 'Edit Student' : 'Add New Student'}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder="Student Name"
                value={studentName}
                onChangeText={setStudentName}
                placeholderTextColor={Colors.gray}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={studentEmail}
                onChangeText={setStudentEmail}
                placeholderTextColor={Colors.gray}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="ABC ID"
                value={abcId}
                onChangeText={setAbcId}
                keyboardType="numeric"
                placeholderTextColor={Colors.gray}
              />
              <View style={styles.input}>
                <Picker
                  selectedValue={gender}
                  onValueChange={value => setGender(value)}
                  style={{color: Colors.text}}>
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                  <Picker.Item label="Others" value="Others" />
                </Picker>
              </View>
              <View style={styles.input}>
                <Picker
                  selectedValue={selectedCourse}
                  onValueChange={value => setSelectedCourse(value)}
                  style={{color: Colors.text}}>
                  <Picker.Item label="Select Course" value="" />
                  {activeCourses.map(course => (
                    <Picker.Item
                      key={course.$id}
                      label={course.Programme}
                      value={course.$id}
                    />
                  ))}
                </Picker>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Semester"
                value={semester}
                onChangeText={setSemester}
                keyboardType="numeric"
                placeholderTextColor={Colors.gray}
              />
              <TextInput
                style={styles.input}
                placeholder="Batch"
                value={batch}
                onChangeText={setBatch}
                keyboardType="numeric"
                placeholderTextColor={Colors.gray}
              />
              <View style={styles.input}>
                <Picker
                  selectedValue={year}
                  onValueChange={value => setYear(value)}
                  style={{color: Colors.text}}>
                  <Picker.Item label="First Year" value="First" />
                  <Picker.Item label="Second Year" value="Second" />
                  <Picker.Item label="Third Year" value="Third" />
                  <Picker.Item label="Fourth Year" value="Fourth" />
                  <Picker.Item label="Fifth Year" value="Fifth" />
                </Picker>
              </View>
              <View style={styles.input}>
                <Picker
                  selectedValue={status}
                  onValueChange={value => setStatus(value)}
                  style={{color: Colors.text}}>
                  <Picker.Item label="Active" value="Active" />
                  <Picker.Item label="Inactive" value="Inactive" />
                </Picker>
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSubmit}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Students</Text>
            <View style={styles.input}>
              <Picker
                selectedValue={statusFilter}
                onValueChange={value => setStatusFilter(value)}
                style={{color: Colors.text}}>
                <Picker.Item label="All Status" value="all" />
                <Picker.Item label="Active" value="Active" />
                <Picker.Item label="Inactive" value="Inactive" />
              </Picker>
            </View>
            <View style={styles.input}>
              <Picker
                selectedValue={courseFilter}
                onValueChange={value => setCourseFilter(value)}
                style={{color: Colors.text}}>
                <Picker.Item label="All Courses" value="" />
                {activeCourses.map(course => (
                  <Picker.Item
                    key={course.$id}
                    label={course.Programme}
                    value={course.$id}
                  />
                ))}
              </Picker>
            </View>
            <View style={styles.input}>
              <Picker
                selectedValue={batchFilter}
                onValueChange={value => setBatchFilter(value)}
                style={{color: Colors.text}}>
                <Picker.Item label="All Batches" value="" />
                {batchYears.map(year => (
                  <Picker.Item
                    key={year}
                    label={year.toString()}
                    value={year.toString()}
                  />
                ))}
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setFilterModalVisible(false);
                  clearFilters();
                }}>
                <Text style={styles.cancelButtonText}>Clear Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.saveButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Export Modal */}
      <Modal
        visible={exportModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setExportModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Export Students</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterSectionTitle}>Filter by Status</Text>
              <View style={styles.input}>
                <Picker
                  selectedValue={exportStatusFilter}
                  onValueChange={value => setExportStatusFilter(value)}
                  style={{color: Colors.text}}>
                  <Picker.Item label="All Students" value="all" />
                  <Picker.Item label="Active" value="Active" />
                  <Picker.Item label="Inactive" value="Inactive" />
                </Picker>
              </View>

              <Text style={styles.filterSectionTitle}>Filter by Course</Text>
              <View style={styles.input}>
                <Picker
                  selectedValue={exportCourseFilter}
                  onValueChange={value => setExportCourseFilter(value)}
                  style={{color: Colors.text}}>
                  <Picker.Item label="All Courses" value="" />
                  {activeCourses.map(course => (
                    <Picker.Item
                      key={course.$id}
                      label={course.Programme}
                      value={course.$id}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.filterSectionTitle}>Filter by Batch</Text>
              <View style={styles.input}>
                <Picker
                  selectedValue={exportBatchFilter}
                  onValueChange={value => setExportBatchFilter(value)}
                  style={{color: Colors.text}}>
                  <Picker.Item label="All Batches" value="" />
                  {batchYears.map(year => (
                    <Picker.Item
                      key={year}
                      label={year.toString()}
                      value={year.toString()}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.filterSectionTitle}>Filter by Semester</Text>
              <View style={styles.input}>
                <Picker
                  selectedValue={exportSemesterFilter}
                  onValueChange={value => setExportSemesterFilter(value)}
                  style={{color: Colors.text}}>
                  <Picker.Item label="All Semesters" value="" />
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <Picker.Item
                      key={sem}
                      label={sem.toString()}
                      value={sem.toString()}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.filterSectionTitle}>Export Format</Text>
              <View style={styles.exportFormatRow}>
                {[
                  {type: 'csv', label: 'CSV', icon: 'csv'},
                  {type: 'pdf', label: 'PDF', icon: 'pdf'},
                ].map(fmt => (
                  <View key={fmt.type} style={styles.exportFormatCard}>
                    {/* <Icon name={fmt.icon} size={32} color={Colors.primary} /> */}
                    {/* <Text style={styles.exportFormatLabel}>{fmt.label}</Text> */}
                    <View style={styles.exportFormatActions}>
                      <TouchableOpacity
                        style={styles.exportActionButton}
                        onPress={() =>
                          exportImmediately(
                            fmt.type as 'csv' | 'pdf',
                            'download',
                          )
                        }>
                        <Image
                          source={iconMap[fmt.icon]}
                          style={[styles.icon, styles.iconWhite]}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.exportActionButton}
                        onPress={() =>
                          exportImmediately(fmt.type as 'csv' | 'pdf', 'share')
                        }>
                        <Image
                          source={require('../../../assets/icons/share.png')}
                          style={[styles.icon, styles.iconWhite]}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setExportModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
