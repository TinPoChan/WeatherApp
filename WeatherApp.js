import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function WeatherApp({ navigation }) {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);

  //console.log(Dimensions.get('window').width);

  // Function to add a location to the list
  const addLocation = (location) => {
    // Use the location name as the key and weatherData as the value
    setLocations([...locations, { name: location, weatherData }]);
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
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&day=1&aqi=no&alerts=no`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setWeatherData(data);
        setModalVisible(true);
        console.log(isModalVisible);
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather App</Text>

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
            <Text style={styles.modalTitle}>
              Weather for {weatherData && weatherData.location.name}
            </Text>
            <Text>
              Temperature: {weatherData && weatherData.current.temp_c}°C
            </Text>
            <Text>
              Condition: {weatherData && weatherData.current.condition.text}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                addLocation(weatherData && weatherData.location.name)
              }
            >
              <Text>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text>Close</Text>
            </TouchableOpacity>
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
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
});