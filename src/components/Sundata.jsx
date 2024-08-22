import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

function Sundata() {
  const [location, setLocation] = useState('');
  const [sunData, setSunData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sunResponse = await axios.get(`https://api.sunrise-sunset.org/json?lat=37.7749&lng=-122.4194&date=${moment(selectedDate).format('YYYY-MM-DD')}&formatted=0`);
        setSunData(sunResponse.data.results);

        // Hypothetical weather API call
        const weatherResponse = await axios.get(`https://api.hypothetical-weather.com/forecast?lat=37.7749&lng=-122.4194&date=${moment(selectedDate).format('YYYY-MM-DD')}`);
        setWeatherData(weatherResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (location) {
      fetchData();
    }
  }, [location, selectedDate]);

  const getLightingConditions = () => {
    if (!sunData || !weatherData) return 'Loading data...';

    const now = moment();
    const sunrise = moment(sunData.sunrise);
    const sunset = moment(sunData.sunset);

    // Define time ranges
    const morningGoldenHourStart = sunrise.clone().subtract(30, 'minutes');
    const morningGoldenHourEnd = sunrise.clone().add(30, 'minutes');
    const eveningGoldenHourStart = sunset.clone().subtract(30, 'minutes');
    const eveningGoldenHourEnd = sunset.clone().add(30, 'minutes');

    const morningBlueHourStart = sunrise.clone().subtract(30, 'minutes');
    const morningBlueHourEnd = sunrise;
    const eveningBlueHourStart = sunset;
    const eveningBlueHourEnd = sunset.clone().add(30, 'minutes');

    const dawn = sunrise.clone().subtract(30, 'minutes');
    const dusk = sunset.clone().add(30, 'minutes');

    // Check time-based conditions
    if (now.isBetween(morningGoldenHourStart, morningGoldenHourEnd)) {
      return 'Morning Golden Hour';
    } else if (now.isBetween(eveningGoldenHourStart, eveningGoldenHourEnd)) {
      return 'Evening Golden Hour';
    } else if (now.isBetween(morningBlueHourStart, morningBlueHourEnd)) {
      return 'Morning Blue Hour';
    } else if (now.isBetween(eveningBlueHourStart, eveningBlueHourEnd)) {
      return 'Evening Blue Hour';
    } else if (now.isBefore(dawn)) {
      return 'Night';
    } else if (now.isBetween(dawn, sunrise)) {
      return 'Dawn';
    } else if (now.isBetween(sunset, dusk)) {
      return 'Dusk';
    }

    // Check weather-based conditions
    switch (weatherData.condition) {
      case 'clear':
        return 'Sunny';
      case 'cloudy':
        return 'Overcast';
      case 'rain':
        return 'Rainy';
      case 'fog':
        return 'Foggy';
      case 'snow':
        return 'Snowy';
      case 'mist':
        if (now.hour() < 10) {
          return 'Misty Morning';
        }
        return 'Misty';
      default:
        return 'Normal daylight conditions';
    }
  };

  const getPhotographyTips = (condition) => {
    const tips = {
      'Morning Golden Hour': 'Soft, warm light perfect for landscapes and portraits. Use a low ISO and wide aperture.',
      'Evening Golden Hour': 'Beautiful warm tones. Great for silhouettes and backlit subjects.',
      'Morning Blue Hour': 'Cool blue tones. Ideal for city scenes and architecture. Use a tripod for longer exposures.',
      'Evening Blue Hour': 'Soft blue light mixed with artificial lights. Great for cityscapes.',
      'Night': 'Use a tripod and long exposures. Consider light painting or astrophotography.',
      'Sunny': 'High contrast. Use a polarizing filter and watch for harsh shadows.',
      'Overcast': 'Soft, diffused light. Great for portraits and reducing harsh shadows.',
      'Rainy': 'Reflections and moody scenes. Protect your gear and look for interesting water effects.',
      'Foggy': 'Atmospheric and moody. Use manual focus and look for isolated subjects.',
      'Snowy': 'High brightness. Adjust exposure compensation and watch for blue tones in shadows.',
      'Misty Morning': 'Ethereal scenes. Look for layered landscapes and use a telephoto lens.',
      'Dawn': 'Soft, cool light. Great for landscapes and nature photography.',
      'Dusk': 'Warm, fading light. Perfect for skylines and dramatic landscapes.',
    };

    return tips[condition] || 'Adjust settings based on available light and subject matter.';
  };

  const currentCondition = getLightingConditions();

  return (
    <div>
      <h1>Sun Data App</h1>
      <input
        type="text"
        placeholder="Enter location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        type="date"
        value={moment(selectedDate).format('YYYY-MM-DD')}
        onChange={(e) => setSelectedDate(new Date(e.target.value))}
      />
      {sunData && weatherData && (
        <div>
          <h2>Current Conditions: {currentCondition}</h2>
          <p>Photography Tips: {getPhotographyTips(currentCondition)}</p>
          <h3>Sun Data:</h3>
          <p>Sunrise: {moment(sunData.sunrise).format('HH:mm:ss')}</p>
          <p>Sunset: {moment(sunData.sunset).format('HH:mm:ss')}</p>
          <p>Solar Noon: {moment(sunData.solar_noon).format('HH:mm:ss')}</p>
          <p>Day Length: {moment.duration(sunData.day_length, 'seconds').humanize()}</p>
          <h3>Weather:</h3>
          <p>Temperature: {weatherData.temperature}°C</p>
          <p>Condition: {weatherData.condition}</p>
        </div>
      )}
    </div>
  );
}

export default Sundata;