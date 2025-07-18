import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from '../screens/admin/Home/Home';
import Attendance from '../screens/admin/Attendance/Attendance';
import Students from '../screens/admin/Students/Students';
import Courses from '../screens/admin/Courses/Courses';
import CustomTabBar from '../components/navigation/CustomTabBar';

const Tab = createBottomTabNavigator();

const AdminStack = () => (
  <Tab.Navigator screenOptions={{headerShown: false}} tabBar={CustomTabBar}>
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen
      name="Attendance"
      component={Attendance}
      options={{tabBarLabel: () => null}}
    />
    <Tab.Screen
      name="Students"
      component={Students}
      options={{tabBarLabel: () => null}}
    />
    <Tab.Screen
      name="Courses"
      component={Courses}
      options={{tabBarLabel: () => null}}
    />
  </Tab.Navigator>
);

export default AdminStack;
