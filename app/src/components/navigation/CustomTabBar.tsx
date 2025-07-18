import React from 'react';
import {View, TouchableOpacity, Image} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {styles} from './styles';
import { Colors } from '../../globalStyles';

const iconMap = {
  Home: {
    outline: require('../../assets/icons/home.png'),
    filled: require('../../assets/icons/home-filled.png'),
  },
  Attendance: {
    outline: require('../../assets/icons/attendance.png'),
    filled: require('../../assets/icons/attendance-filled.png'),
  },
  Students: {
    outline: require('../../assets/icons/students.png'),
    filled: require('../../assets/icons/students-filled.png'),
  },
  Courses: {
    outline: require('../../assets/icons/courses.png'),
    filled: require('../../assets/icons/courses-filled.png'),
  },
};

function CustomTabBar({state, navigation}: BottomTabBarProps): React.ReactNode {
  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        const iconSource = isFocused
          ? iconMap[route.name as keyof typeof iconMap].filled
          : iconMap[route.name as keyof typeof iconMap].outline;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tab}>
            <Image
              source={iconSource}
              style={[
                styles.icon,
                { tintColor: isFocused ? Colors.accent : Colors.secondary },
              ]}
            />
            {isFocused && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default CustomTabBar;
