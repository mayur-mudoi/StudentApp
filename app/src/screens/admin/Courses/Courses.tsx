import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {styles} from './styles';
import {useData} from '../../../context/DataContext';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {Colors} from '../../../globalStyles';

interface Course {
  id: string;
  name: string;
  duration: string;
  status: 'Active' | 'Inactive';
}

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'Active' | 'Inactive'
  >('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [addMethodModalVisible, setAddMethodModalVisible] = useState(false);
  const [manualAddModalVisible, setManualAddModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>(
    'csv',
  );
  const [exportStatusFilter, setExportStatusFilter] = useState<
    'all' | 'Active' | 'Inactive'
  >('all');

  const [courseName, setCourseName] = useState('');
  const [duration, setDuration] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const {courseData, fetchCourseData, addCourse, updateCourse, deleteCourse} =
    useData();

  useEffect(() => {
    console.log('📞 Fetching course data...');
    fetchCourseData();
  }, []);

  const resetForm = () => {
    setCourseName('');
    setDuration('');
    setStatus('Active');
    setEditingId(null);
  };

  const handleAddOrEditCourse = async () => {
    if (!courseName || !duration) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const cleanedName = courseName.replace(/\s+/g, '').toLowerCase();
    const parsedDuration = parseInt(duration, 10);

    const isDuplicate = courseData?.some(
      course =>
        course.Programme.replace(/\s+/g, '').toLowerCase() === cleanedName &&
        course.Duration === parsedDuration &&
        course.$id !== editingId,
    );

    if (isDuplicate) {
      Alert.alert(
        'Duplicate Course',
        'This course with the same duration already exists.',
      );
      return;
    }

    if (editingId) {
      await updateCourse(editingId, courseName, parsedDuration, status);
    } else {
      await addCourse(courseName, parsedDuration, status);
    }

    resetForm();
    setManualAddModalVisible(false);
    fetchCourseData();
  };

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

      try {
        let fileContent: string;

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

        let courses;
        if (file.name.toLowerCase().endsWith('.json')) {
          courses = JSON.parse(fileContent);
        } else {
          // Parse CSV
          const lines = fileContent
            .split('\n')
            .filter(line => line.trim() !== '');
          if (lines.length < 2) {
            throw new Error(
              'CSV file must contain at least a header row and one data row',
            );
          }

          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          const requiredHeaders = ['name', 'duration'];
          const missingHeaders = requiredHeaders.filter(
            h => !headers.includes(h),
          );

          if (missingHeaders.length > 0) {
            throw new Error(
              `Missing required headers: ${missingHeaders.join(', ')}`,
            );
          }

          courses = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.trim());
            if (values.length !== headers.length) {
              throw new Error(`Invalid number of columns in row ${index + 2}`);
            }

            const course: any = {};
            headers.forEach((header, i) => {
              if (header === 'name') {
                course.name = values[i];
              } else if (header === 'duration') {
                const duration = parseInt(values[i], 10);
                if (isNaN(duration) || duration <= 0) {
                  throw new Error(
                    `Invalid duration in row ${index + 2}: ${values[i]}`,
                  );
                }
                course.duration = duration;
              } else if (header === 'status') {
                const status = values[i].trim();
                if (status && status !== 'Active' && status !== 'Inactive') {
                  throw new Error(
                    `Invalid status in row ${index + 2}: ${status}`,
                  );
                }
                course.status = status || 'Active';
              }
            });

            return course;
          });
        }

        if (!Array.isArray(courses)) {
          throw new Error('File must contain an array of courses');
        }

        if (courses.length === 0) {
          throw new Error('No valid courses found in the file');
        }

        // Validate and add each course
        for (const course of courses) {
          if (!course.name || !course.duration) {
            throw new Error('Each course must have a name and duration');
          }

          // Check for duplicates before adding
          const cleanedName = course.name.replace(/\s+/g, '').toLowerCase();
          const isDuplicate = courseData?.some(
            existingCourse =>
              existingCourse.Programme.replace(/\s+/g, '').toLowerCase() ===
                cleanedName && existingCourse.Duration === course.duration,
          );

          if (isDuplicate) {
            throw new Error(
              `Duplicate course found: ${course.name} with duration ${course.duration} months`,
            );
          }

          await addCourse(
            course.name,
            course.duration,
            course.status || 'Active',
          );
        }

        Alert.alert('Success', 'Courses imported successfully');
        setAddMethodModalVisible(false);
        fetchCourseData();
      } catch (e) {
        if (e instanceof Error) {
          Alert.alert('Error', `Invalid file format: ${e.message}`);
        } else {
          Alert.alert('Error', 'Invalid file format');
        }
      }
    } catch (err) {
      const error = err as {code?: string};
      if (error.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Failed to read file');
      }
    }
  };

  const handleDeleteCourse = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this course?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCourse(id);
            fetchCourseData();
          },
        },
      ],
    );
  };

  const handleEditCourse = (course: Course) => {
    setCourseName(course.name);
    setDuration(String(course.duration));
    setStatus(course.status);
    setEditingId(course.id);
    setManualAddModalVisible(true);
  };

  const filteredCourses = useMemo((): Course[] => {
    if (!Array.isArray(courseData)) {
      return [];
    }

    return courseData
      .map(doc => ({
        id: doc.$id,
        name: doc.Programme ?? '',
        duration: doc.Duration ?? '',
        status: doc.Status ?? 'Inactive',
      }))
      .filter(course => {
        const matchesSearch = course.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === 'all' || course.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [courseData, searchTerm, statusFilter]);

  const renderCourseItem = ({item}: {item: Course}) => (
    <TouchableOpacity
      style={[
        styles.courseItem,
        item.status === 'Inactive' && styles.disabledItem,
      ]}
      onPress={() => {
        setSelectedCourse(item);
        setDetailsModalVisible(true);
      }}>
      <View style={styles.courseItemContent}>
        <View style={styles.courseInfo}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.courseName}>{item.name}</Text>
          </View>
          <Text style={styles.courseDetails}>
            Duration: {item.duration} months
          </Text>
        </View>
        <View>
          <View
            style={[
              styles.statusIndicator,
              item.status === 'Active'
                ? styles.statusActive
                : styles.statusInactive,
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDetailsModal = () => {
    if (!selectedCourse) {
      return null;
    }

    return (
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Course Details</Text>
            <TouchableOpacity
              onPress={() => setDetailsModalVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{selectedCourse.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duration:</Text>
                <Text style={styles.detailValue}>
                  {selectedCourse.duration} months
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color:
                        selectedCourse.status === 'Active'
                          ? Colors.success
                          : Colors.error,
                    },
                  ]}>
                  {selectedCourse.status}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, {backgroundColor: Colors.primary}]}
                onPress={() => {
                  setDetailsModalVisible(false);
                  handleEditCourse(selectedCourse);
                }}>
                <Image
                  source={require('../../../assets/icons/edit.png')}
                  style={[styles.icon, styles.iconWhite]}
                />
                <Text style={[styles.modalButtonText, {color: Colors.white}]}>
                  Edit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, {backgroundColor: Colors.error}]}
                onPress={() => {
                  setDetailsModalVisible(false);
                  handleDeleteCourse(selectedCourse.id);
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

  const exportImmediately = async (
    format: 'csv' | 'pdf',
    action: 'download' | 'share',
  ) => {
    try {
      // Filter courses based on exportStatusFilter
      let exportCourses = courseData || [];
      if (exportStatusFilter !== 'all') {
        exportCourses = exportCourses.filter(
          (doc: any) => doc.Status === exportStatusFilter,
        );
      }
      if (!exportCourses.length) {
        Alert.alert('No courses to export');
        setExportModalVisible(false);
        return;
      }
      let fileContent = '';
      let fileName = `courses_export_${Date.now()}`;
      let filePath = '';
      let baseDir = '';
      if (Platform.OS === 'android') {
        baseDir = `${RNFS.DownloadDirectoryPath}/Attender/courses`;
      } else {
        baseDir = `${RNFS.DocumentDirectoryPath}/Attender/courses`;
      }
      await RNFS.mkdir(baseDir);
      if (format === 'csv') {
        const headers = ['Programme', 'Duration', 'Status'];
        const rows = exportCourses.map((c: any) => [
          c.Programme,
          c.Duration,
          c.Status,
        ]);
        fileContent = [headers.join(','), ...rows.map(r => r.join(','))].join(
          '\n',
        );
        fileName += '.csv';
        filePath = `${baseDir}/${fileName}`;
        await RNFS.writeFile(filePath, fileContent, 'utf8');
      } else if (format === 'pdf') {
        const headers = ['Programme', 'Duration', 'Status'];
        const rowsHtml = exportCourses
          .map(
            c =>
              `<tr><td>${c.Programme}</td><td>${c.Duration}</td><td>${c.Status}</td></tr>`,
          )
          .join('');
        const html = `
          <h2>Courses Export</h2>
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
        // 2. Move PDF to Downloads/Attender/courses/
        const targetPath = `${baseDir}/${fileName}`;
        await RNFS.mkdir(baseDir);
        await RNFS.moveFile(pdf.filePath, targetPath);
        filePath = targetPath;
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Image
          source={require('../../../assets/icons/search.png')}
          style={[styles.icon, styles.iconBlack]}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
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
        <TouchableOpacity
          style={[styles.filterButton, {backgroundColor: Colors.success}]}
          onPress={() => setExportModalVisible(true)}>
          <Image
            source={require('../../../assets/icons/export.png')}
            style={[styles.icon, styles.iconWhite]}
          />
        </TouchableOpacity>
      </View>

      {filteredCourses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No courses found</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setAddMethodModalVisible(true);
            }}>
            <Text style={styles.addButtonText}>Add New Course</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={<View style={{height: 100}} />}
        />
      )}

      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => {
          resetForm();
          setAddMethodModalVisible(true);
        }}>
        <Image
          source={require('../../../assets/icons/add.png')}
          style={[styles.icon, styles.iconWhite]}
        />
      </TouchableOpacity>

      {/* Add Method Selection Modal */}
      <Modal
        visible={addMethodModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddMethodModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Course</Text>
            <TouchableOpacity
              style={styles.methodButton}
              onPress={() => {
                setAddMethodModalVisible(false);
                setManualAddModalVisible(true);
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

      {/* Manual Add/Edit Modal */}
      <Modal
        visible={manualAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setManualAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Edit Course' : 'Add Course'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Course Name"
              value={courseName}
              onChangeText={setCourseName}
            />
            <TextInput
              style={styles.input}
              placeholder="Duration (months)"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
            <Text style={styles.filterSectionTitle}>Status</Text>
            <View style={styles.statusOptions}>
              {['Active', 'Inactive'].map(s => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusOption,
                    status === s && styles.statusOptionSelected,
                  ]}
                  onPress={() => setStatus(s as 'Active' | 'Inactive')}>
                  <Text
                    style={[
                      styles.statusOptionText,
                      status === s && styles.statusOptionTextSelected,
                    ]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setManualAddModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddOrEditCourse}>
                <Text style={styles.saveButtonText}>
                  {editingId ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
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
            <Text style={styles.modalTitle}>Filter by Status</Text>
            {['all', 'Active', 'Inactive'].map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterOption,
                  statusFilter === option && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setStatusFilter(option as 'all' | 'Active' | 'Inactive');
                  setFilterModalVisible(false);
                }}>
                <Text
                  style={[
                    styles.filterOptionText,
                    statusFilter === option && styles.filterOptionTextSelected,
                  ]}>
                  {option === 'all' ? 'All Courses' : option}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={() => {
                setStatusFilter('all');
                setSearchTerm('');
                setFilterModalVisible(false);
              }}>
              <Text style={styles.markAllButtonText}>Clear All Filters</Text>
            </TouchableOpacity>
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
            <Text style={styles.modalTitle}>Export Courses</Text>
            <Text style={styles.filterSectionTitle}>Filter by Status</Text>
            {['all', 'Active', 'Inactive'].map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterOption,
                  exportStatusFilter === option && styles.filterOptionSelected,
                ]}
                onPress={() =>
                  setExportStatusFilter(option as 'all' | 'Active' | 'Inactive')
                }>
                <Text
                  style={[
                    styles.filterOptionText,
                    exportStatusFilter === option &&
                      styles.filterOptionTextSelected,
                  ]}>
                  {option === 'all' ? 'All Courses' : option}
                </Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.filterSectionTitle}>Export Format</Text>
            <View style={styles.exportFormatRow}>
              {[
                {type: 'csv', label: 'CSV'},
                {type: 'pdf', label: 'PDF'},
              ].map(fmt => (
                <View key={fmt.type} style={styles.exportFormatCardStatic}>
                  <Text style={styles.exportFormatLabelStatic}>
                    {fmt.label}
                  </Text>
                  <View style={styles.exportFormatActions}>
                    <TouchableOpacity
                      style={styles.exportShareIconBtn}
                      onPress={() =>
                        exportImmediately(fmt.type as 'csv' | 'pdf', 'share')
                      }>
                      <Image
                        source={require('../../../assets/icons/share.png')}
                        style={styles.exportShareIcon}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.exportDownloadIconBtn}
                      onPress={() =>
                        exportImmediately(fmt.type as 'csv' | 'pdf', 'download')
                      }>
                      <Image
                        source={require('../../../assets/icons/download.png')}
                        style={styles.exportDownloadIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
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

      {renderDetailsModal()}
    </SafeAreaView>
  );
}
