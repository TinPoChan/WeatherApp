import 'react-native-gesture-handler'; // Add this line at the top of your App.js

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // For search icon
import Icon from 'react-native-vector-icons/FontAwesome'; // For weather icons (import appropriate icons as needed)
import WeatherDetailScreen from './WeatherDetailScreen';
import WeatherApp from './WeatherApp';

import firebase from './firebaseConfig';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WeatherApp">
        <Stack.Screen name="WeatherApp" component={WeatherApp} options={{ headerShown: false }} />
        <Stack.Screen name="WeatherDetail" component={WeatherDetailScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


