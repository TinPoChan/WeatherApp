import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

export default function WeatherDetailScreen({ route }) {
  const { location } = route.params;
  const [weatherData, setWeatherData] = useState(null);

  // Function to fetch weather data for the selected location
  const fetchWeatherData = () => {
    // Replace 'YOUR_API_KEY' with your actual API key
    const apiKey = 'fcb737a86c7748f1b5d71408230709';
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;

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
    <View>
      <Text>Weather for {location}</Text>
      {weatherData && (
        <View>
          <Text>Temperature: {weatherData.current.temp_c}°C</Text>
          <Text>Condition: {weatherData.current.condition.text}</Text>
          {/* Display other weather information as needed */}
        </View>
      )}
    </View>
  );
}