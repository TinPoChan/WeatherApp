import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal, Dimensions, ScrollView, Image, Button } from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import * as Location from 'expo-location'; // Add this import
// import firebase from './firebaseConfig';


export default function WeatherApp({ navigation }) {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const [isLoadingLocation, setLoadingLocation] = useState(false); // State for loading current location

  const [user, setUser] = useState(null); // User state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginModalVisible, setLoginModalVisible] = useState(false);
  const [isSignupModalVisible, setSignupModalVisible] = useState(false);
  const [preferredName, setPreferredName] = useState('');
  const [greetingMessage, setGreetingMessage] = useState('');

  //console.log(greetingMessage);

  // Function to get the index for the current time or the next available hour
  function getNext24HoursIndex() {
    const currentTime = getCurrentTimeHHMM();
    const timeArray = currentTime.split(':');
    const currentHour = parseInt(timeArray[0]);

    if (weatherData && weatherData.forecast && weatherData.forecast.forecastday[0]) {
      const currentDayHours = weatherData.forecast.forecastday[0].hour;
      const nextDayHours = weatherData.forecast.forecastday[1].hour;
      
      // Find the index of the next available hour in the current or next day
      for (let i = 0; i < currentDayHours.length; i++) {
        const hourArray = currentDayHours[i].time.split(' ')[1].split(':');
        const hourValue = parseInt(hourArray[0]);

        if (hourValue >= currentHour) {
          return i;
        }
      }
      
      // If no available hour is found in the current day, continue to the next day
      for (let i = 0; i < nextDayHours.length; i++) {
        return currentDayHours.length + i;
      }
    }

    return 0; // Default to the first hour if data is not available
  }

  // // Function to handle user login
  // const handleLogin = async () => {
  //   try {
  //     await firebase.auth().signInWithEmailAndPassword(email, password);
  //     setLoginModalVisible(false); // Close the login modal
  //     setUser(firebase.auth().currentUser);

  //     const user = firebase.auth().currentUser;
  //     if (user && user.displayName) {
  //       setGreetingMessage(`Hello ${user.displayName}!`);
  //     }
  //     //console.log(firebase.auth().currentUser.displayName);
  //   } catch (error) {
  //     console.error('Error logging in:', error);
  //   }
  // };

  // // Function to handle user sign-up
  // const handleSignup = async () => {
  //   try {
  //     await firebase.auth().createUserWithEmailAndPassword(email, password);
  //     console.log('User account created & signed in!');

  //     // Update the user's profile with the preferred name
  //     await firebase.auth().currentUser.updateProfile({
  //       displayName: preferredName,
  //     });

  //     setSignupModalVisible(false); // Close the sign-up modal
  //     setUser(firebase.auth().currentUser);
  //   } catch (error) {
  //     console.error('Error signing up:', error);
  //   }
  // };


  // // Function to handle user logout
  // const handleLogout = async () => {
  //   try {
  //     await firebase.auth().signOut();
  //     setUser(null);
  //     setPreferredName('');
  //   } catch (error) {
  //     console.error('Error logging out:', error);
  //   }
  // };

  // Function to fetch weather data by current location
  const fetchWeatherDataByCurrentLocation = async () => {
    try {
      setLoadingLocation(true); // Set loading state to true

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Reverse geocode the coordinates to get the location name
        const locationData = await Location.reverseGeocodeAsync({ latitude, longitude });
        const locationName = locationData.length > 0 ? locationData[0].city : '';

        //console.log('Current location:', locationName);

        setCity(locationName);

      } else {
        console.log('Permission to access location denied');
      }
    } catch (error) {
      console.error('Error fetching weather data by current location:', error);
    } finally {
      setLoadingLocation(false); // Set loading state back to false when done
    }
  };

  //console.log(Dimensions.get('window').width); 

  // Get the currnet time in HH:MM format and round it to the nearest hour
  function getCurrentTimeHHMM() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    // If minutes are greater than 30, increment hours and set minutes to 0
    if (minutes > 30) {
      hours += 1;
      minutes = 0;
    } else {
      // If minutes are less than or equal to 30, set minutes to 0
      minutes = 0;
    }

    // Ensure hours and minutes are displayed as two digits
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    // Combine hours and minutes in HH:MM format
    return `${formattedHours}:${formattedMinutes}`;
  }

  function getCurrentTimeIndex() {
    const currentTime = getCurrentTimeHHMM();
    const timeArray = currentTime.split(':');
    const currentHour = parseInt(timeArray[0]);

    if (weatherData && weatherData.forecast && weatherData.forecast.forecastday[0]) {
      return weatherData.forecast.forecastday[0].hour.findIndex((hour) => {
        const hourArray = hour.time.split(' ')[1].split(':');
        const hourValue = parseInt(hourArray[0]);
        return hourValue >= currentHour;
      });
    }

    return 0; // Default to the first hour if data is not available
  }
  // Function to render the 3-day forecast in rows
  const renderThreeDayForecast = () => {
    if (weatherData && weatherData.forecast && weatherData.forecast.forecastday.length >= 3) {
      return (
        <View style={styles.forecastContainer}>
          {weatherData.forecast.forecastday.slice(0, 3).map((day, index) => (
            <View key={index} style={styles.forecastDay}>
              <Text style={styles.forecastDayName}>
                {index === 0 ? 'Today' : getDayOfWeek(day.date)}
              </Text>
              <Image
                source={{
                  uri: day.day.condition.icon.startsWith('//')
                    ? `https:${day.day.condition.icon}`
                    : day.day.condition.icon,
                }}
                style={styles.forecastIcon}
              />
              <Text style={styles.forecastTemp}>
                Low: {day.day.mintemp_c}°C, High: {day.day.maxtemp_c}°C
              </Text>
            </View>
          ))}
        </View>
      );
    }
    return null;
  };

  // Function to calculate the day of the week for a given date
  function getDayOfWeek(date) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayIndex = new Date(date).getDay();
    return daysOfWeek[dayIndex];
  }

  // Function to add a location to the list
  const addLocation = (location) => {
    // Check if the location already exists in the list
    const isLocationExists = locations.some((item) => item.name === location);

    if (!isLocationExists) {
      // Use the location name as the key and weatherData as the value
      setLocations([...locations, { name: location, weatherData }]);
    }

    setModalVisible(false); // Close the modal after adding a location
  };

  // Function to navigate to the weather detail screen
  const navigateToWeatherDetail = (location) => {
    navigation.navigate('WeatherDetail', { location });
  };

  // Function to fetch weather data
  const fetchWeatherData = () => {
    // Replace 'YOUR_API_KEY' with your actual API key
    const apiKey = 'fcb737a86c7748f1b5d71408230709';
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=no&alerts=no`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        // console.log(data.forecast);
        setWeatherData(data);
        setModalVisible(true);
        // console.log(isModalVisible);
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
      });
  };

  return (
    <View style={styles.container}>
      {/* {user ? (
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>{greetingMessage}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loginButtonsContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => setLoginModalVisible(true)}
          >
            <Text>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => setSignupModalVisible(true)}
          >
            <Text>Sign Up</Text>
          </TouchableOpacity>
        </View>
      )} */}
      <Text style={styles.title}>Weather App</Text>

      {/* Login Modal
      <Modal
        visible={isLoginModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Login</Text>
            <TextInput
              style={styles.loginInput}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
            <TextInput
              style={styles.loginInput}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
            <Button title="Login" onPress={handleLogin} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setLoginModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}

      {/* Signup Modal
      <Modal
        visible={isSignupModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign Up</Text>
            <TextInput
              style={styles.loginInput}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
            <TextInput
              style={styles.loginInput}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
            <TextInput
              style={styles.loginInput}
              placeholder="Preferred Name"
              value={preferredName}
              onChangeText={(text) => setPreferredName(text)}
            />
            <Button title="Sign Up" onPress={handleSignup} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSignupModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}


      {/* Search box */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter city"
          value={city}
          onChangeText={(text) => setCity(text)}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={fetchWeatherData}
        >
          <MaterialIcons name="search" size={24} color="grey" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={isLoadingLocation ? null : fetchWeatherDataByCurrentLocation} // Disable the button while loading
        >
          {isLoadingLocation ? ( // Display loading icon when isLoadingLocation is true
            <AntDesign name="clockcircleo" size={24} color="grey" />
          ) : (
            <MaterialIcons name="location-on" size={24} color="grey" />
          )}
        </TouchableOpacity>
      </View>

      {/* // Rendering of locationItem */}
      <FlatList
        data={locations}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.locationItem}
            onPress={() => navigateToWeatherDetail(item.name)}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.locationName}>{item.name}</Text>
              <Text style={styles.conditionText}>
                {item.weatherData ? item.weatherData.current.condition.text : ''}
              </Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.currentTempText}>
                {item.weatherData ? `${item.weatherData.current.temp_c}°C` : ''}
              </Text>
              <View style={styles.maxminTempContainer}>
                <View style={styles.maxminTempTextContainer}>
                  <Text style={styles.maxminTempText}>
                    High: {item.weatherData ? `${item.weatherData.forecast.forecastday[0].day.maxtemp_c}°C` : ''}
                  </Text>
                  <Text style={styles.maxminTempText}>
                    Low: {item.weatherData ? `${item.weatherData.forecast.forecastday[0].day.mintemp_c}°C` : ''}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Weather data modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addLocation(weatherData && weatherData.location.name)}
            >
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
            {/* Weather details */}
            <View style={styles.weatherDetails}>
              <View style={styles.column}>
                <Text style={styles.modalTitle}>
                  {weatherData && weatherData.location.name}
                </Text>
                <Text style={styles.modalCurrentTemp}>
                  {weatherData && weatherData.current.temp_c}°C
                </Text>
                <Text style={styles.modalCondition}>
                  {weatherData && weatherData.current.condition.text}
                </Text>
                <Text style={styles.modalHighLowTemp}>
                  High: {weatherData && weatherData.forecast.forecastday[0].day.maxtemp_c}°C   Low: {weatherData && weatherData.forecast.forecastday[0].day.mintemp_c}°C
                </Text>
                <ScrollView
                horizontal
                contentContainerStyle={styles.hourlyForecast}
                showsHorizontalScrollIndicator={false}
              >
                {weatherData &&
                  weatherData.forecast.forecastday
                    .reduce((acc, day) => acc.concat(day.hour), []) // Combine all hours from all forecast days
                    .slice(getNext24HoursIndex(), getNext24HoursIndex() + 24)
                    .map((hour, index) => (
                      <View key={index} style={styles.hourContainer}>
                        <Text style={styles.hourText}>
                          {index === 0 ? 'Now' : hour.time.slice(-5)}
                        </Text>
                        <Image
                          source={{
                            uri: hour.condition.icon.startsWith('//')
                              ? `https:${hour.condition.icon}`
                              : hour.condition.icon,
                          }}
                          style={{ width: 24, height: 24 }}
                        />
                        <Text style={styles.hourTemp}>{hour.temp_c}°C</Text>
                      </View>
                    ))}
              </ScrollView>
                <View style={styles.forecastContainer}>
                  {renderThreeDayForecast()}
                </View>
              </View>
            </View>


          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 100,
    // make the title to be left aligned
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 30,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 10,
    marginLeft: 20,
  },
  searchButton: {
    borderColor: 'grey',    // Border color
    borderWidth: 3,         // Border width
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  locationButton: {
    borderColor: 'grey',    // Border color
    borderWidth: 3,         // Border width
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 20, // Adjust the margin as needed
    marginRight: 20, // Adjust the margin as needed
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    width: Dimensions.get('window').width - 40, // Tried to use 80% but it didn't work for some reason
    height: 120,
    position: 'relative',
  },

  locationName: {
    fontSize: 25,
    fontWeight: 'bold',
    position: 'absolute',
    left: 5,
    bottom: 10,
  },

  conditionText: {
    fontSize: 12,
    position: 'absolute',
    top: 21,
    left: 5,
  },

  itemRight: {
    //alignItems: 'flex-end', // Align the content to the right
  },

  currentTempText: {
    fontSize: 35,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 3,
    right: 10,
  },

  maxminTempContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    position: 'absolute',
    top: 21,
    right: 5,
  },

  maxminTempTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  maxminTempText: {
    fontSize: 12,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Dimensions.get('window').width, // Full width
    height: Dimensions.get('window').height * 0.90, // 90% of screen height
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    marginTop: Dimensions.get('window').height * 0.1, // 10% margin at the top
  },


  closeButton: {
    position: 'absolute', // Position the close button absolutely
    top: 10, // Adjust the top position as needed
    left: 10, // Adjust the left position as needed
    padding: 10,

    borderRadius: 5,
  },

  addButton: {
    position: 'absolute', // Position the add button absolutely
    top: 10, // Adjust the top position as needed
    right: 10, // Adjust the right position as needed
    padding: 10,

    borderRadius: 5,

  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },

  weatherDetails: {
    flexDirection: 'row', // Arrange content horizontally
    justifyContent: 'space-between', // Space evenly between columns
    marginTop: 40, // Adjust the top margin as needed
  },

  column: {
    flex: 1, // Equal flex to distribute space evenly
    alignItems: 'center', // Center content horizontally in each column
  },
  modalTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 30,
  },
  modalCurrentTemp: {
    fontSize: 60,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalCondition: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalHighLowTemp: {
    fontSize: 15,
    marginBottom: 10,
  },
  hourlyForecast: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },

  hourContainer: {
    alignItems: 'center',
    marginRight: 20,
  },

  hourText: {
    fontSize: 16,
    marginBottom: 5,
  },

  hourTemp: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  forecastContainer: {
    flexDirection: 'column', // Change to column to display each day in a single line
    justifyContent: 'space-between',
    alignItems: 'left',
    marginTop: 20,
    paddingHorizontal: 16,
  },

  forecastDay: {
    flexDirection: 'row', // Change to row to display each day in a single line
    alignItems: 'center',
    width: '100%', // Adjust the width as needed
    justifyContent: 'space-between', // Space elements evenly
  },

  forecastDayName: {
    marginRight: 10,
    marginLeft: -10,
    fontSize: 16,
    fontWeight: 'bold',
  },

  forecastIcon: {
    width: 50,
    height: 50,
  },

  forecastTemp: {
    marginRight: -30,
    fontSize: 14,
  },
  loginButton: {
    position: 'absolute', // Position the close button absolutely
    top: 100, // Adjust the top position as needed
    right: -180,
    borderColor: 'grey',    // Border color
    borderWidth: 3,         // Border width
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 15,
  },
  signupButton: {
    position: 'absolute', // Position the close button absolutely
    top: 60, // Adjust the top position as needed
    right: -180,
    borderColor: 'grey',    // Border color
    borderWidth: 3,         // Border width
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 15,
  },
  loginInput: {
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 10,
    marginRight: 10,
    marginLeft: 20,
    marginBottom: 10,
  },
  logoutButton: {
    // position: 'absolute', // Position the close button absolutely
    // top: 100, // Adjust the top position as needed
    // right: 20,
    borderColor: 'grey',    // Border color
    borderWidth: 3,         // Border width
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 15,
    marginLeft: 20,
  },
  greetingContainer: {
    position: 'absolute', // Position the close button absolutely
    top: 100, // Adjust the top position as needed
    right: 20,
  },
  greetingText: {
    position: 'absolute', // Position the close button absolutely
    fontSize: 20,
    fontWeight: 'bold',
    top: -40,
    right: -5,
  },

});


