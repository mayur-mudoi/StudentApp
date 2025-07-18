import React from 'react';
import { Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import styles from './styles';
import XDate from 'xdate';
import { Colors } from '../../globalStyles';

const CalendarComponent = ({ attendanceData }: { attendanceData: Record<string, string> }) => {
  // Get today's date dynamically
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // e.g., "2025-05-06"

  const markedDates = Object.keys(attendanceData).reduce<
    Record<string, { selected: boolean; selectedColor: string; disableTouchEvent: boolean; disabled?: boolean }>
  >((acc, date) => {
    const isFutureDate = date > todayString; // Check if the date is after today
    acc[date] = {
      selected: true,
      selectedColor: attendanceData[date] === 'Present' ? Colors.success : Colors.error,
      disableTouchEvent: true, // Disable touch for all dates (as per your existing logic)
      disabled: isFutureDate, // Visually disable future dates
    };
    return acc;
  }, {});

  return (
    <View style={styles.calendarContainer}>
      <Calendar
        markedDates={markedDates}
        style={styles.calendar}
        maxDate={todayString} // Restrict navigation to today (e.g., "2025-05-06")
        theme={{
          backgroundColor: Colors.white,
          calendarBackground: Colors.white,
          textSectionTitleColor: Colors.text,
          selectedDayBackgroundColor: Colors.accent,
          selectedDayTextColor: Colors.white,
          todayTextColor: Colors.accent,
          dayTextColor: Colors.text,
          textDisabledColor: Colors.lightGray,
          dotColor: Colors.accent,
          selectedDotColor: Colors.white,
          arrowColor: Colors.accent,
          monthTextColor: Colors.text,
          indicatorColor: Colors.accent,
          disabledArrowColor: Colors.lightGray,
        }}
        renderHeader={(date) => (
          <Text style={styles.customHeader}>
            {date ? new XDate(date).toString('MMMM yyyy') : ''}
          </Text>
        )}
      />
    </View>
  );
};

export default CalendarComponent;
