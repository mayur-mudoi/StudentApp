import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useData } from '../../context/DataContext';
import { Colors} from '../../globalStyles';
import styles from './styles';


const CourseSelector: React.FC = () => {
  const { courseData, fetchCourseData, selectedCourse, setSelectedCourse } = useData();

  // Fetch courses when the component mounts
  useEffect(() => {
    if (!courseData) {
      fetchCourseData();
    }
  }, [courseData, fetchCourseData]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Course</Text>
      {courseData ? (
        <Picker
          selectedValue={selectedCourse}
          onValueChange={(itemValue) => setSelectedCourse(itemValue)}
          style={styles.picker}
          dropdownIconColor={Colors.accent}
        >
          <Picker.Item
            label="Select a course..."
            value={null}
            color={Colors.textLight}
          />
          {courseData.map((course) => (
            <Picker.Item
              key={course.$id}
              label={course.Programme}
              value={course.$id}
              color={Colors.text}
            />
          ))}
        </Picker>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      )}
    </View>
  );
};

export default CourseSelector;
