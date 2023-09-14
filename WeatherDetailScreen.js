import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';


export default function WeatherDetailScreen({ route }) {
  const { location } = route.params;
  const navigation = useNavigation();
  const [weatherData, setWeatherData] = useState(null);

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

  // Function to calculate the day of the week for a given date
  function getDayOfWeek(date) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayIndex = new Date(date).getDay();
    return daysOfWeek[dayIndex];
  }

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

  function renderAdditionalDetails() {
    if (weatherData) {
      const additionalDetails = [
        { label: 'Humidity', value: `${weatherData.current.humidity}%` },
        { label: 'Cloud', value: `${weatherData.current.cloud}%` },
        { label: 'Feels Like', value: `${weatherData.current.feelslike_c}°C` },
        { label: 'Visibility', value: `${weatherData.current.vis_km} km` },
        { label: 'Wind', value: `${weatherData.current.wind_kph} km/h` },
        { label: 'UV', value: `${weatherData.current.uv}` },
      ];

      return (
        <View style={styles.additionalDetailsContainer}>
          {[0, 2, 4].map((startIndex) => (
            <View key={startIndex} style={styles.additionalDetailsRow}>
              {additionalDetails.slice(startIndex, startIndex + 2).map((detail, index) => (
                <View key={index} style={styles.additionalDetailBox}>
                  <Text style={styles.additionalDetailLabel}>{detail.label}</Text>
                  <Text style={styles.additionalDetailValue}>{detail.value}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      );
    }

    return null;
  }




  // Function to fetch weather data for the selected location
  const fetchWeatherData = () => {
    // Replace 'YOUR_API_KEY' with your actual API key
    const apiKey = 'fcb737a86c7748f1b5d71408230709';
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=3&aqi=no&alerts=no`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        setWeatherData(data);
      })
      .catch((error) => {
        console.error('Error fetching weather data:', error);
      });
  };

  // Fetch weather data when the component mounts
  useEffect(() => {
    fetchWeatherData();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        {weatherData && (
          <View style={styles.weatherDetails}>
            <View style={styles.column}>
              <Text style={styles.modalTitle}>{location}</Text>
              <Text style={styles.modalCurrentTemp}>
                {weatherData.current.temp_c}°C
              </Text>
              <Text style={styles.modalCondition}>
                {weatherData.current.condition.text}
              </Text>

              {/* Display other weather information as needed */}
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
              {renderAdditionalDetails()}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 100,
    paddingHorizontal: 20,
    // height: Dimensions.get('window').height, // Full-screen height
  },
  column: {
    flex: 1,
    alignItems: 'center',
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
  
  hourlyForecast: {
    // flexDirection: 'row',
    // alignItems: 'center',
    marginTop: 40,
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
    marginTop: 10,
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
  additionalDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  additionalDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 100,
    marginBottom: 20
  },

  additionalDetailBox: {
    borderColor: 'lightgray',
    borderWidth: 1,
    padding: 15,
    paddingLeft: 20,
    borderRadius: 20,
    width: Dimensions.get('window').width / 2 - 30,
  },

  additionalDetailLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  additionalDetailValue: {
    fontWeight: 'bold',
    fontSize: 30,
  },
});
