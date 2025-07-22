import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import './App.css';
import WeatherDisplay from './components/WeatherDisplay';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';

const backgroundMap = {
  Clear_Day: 'sunny',
  Clear_Night: 'night',
  Clouds: 'cloudy',
  Rain: 'rainy',
  Drizzle: 'rainy',
  Thunderstorm: 'stormy',
  Snow: 'snowy',
  default: 'cloudy'
};

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const appRef = useRef(null);

  useEffect(() => {
    gsap.to(appRef.current, { duration: 1, autoAlpha: 1, ease: 'power3.out' });
  }, []);

  useEffect(() => {
    document.body.className = 'default';
    if (!weatherData) return;
    
    // DEBUG 1: See what weather data we're working with
    console.log("Weather data updated, determining background:", weatherData);

    const condition = weatherData.current.weather[0].main;
    let backgroundKey = condition;

    if (condition === 'Clear') {
      const currentTime = weatherData.current.dt;
      const sunriseTime = weatherData.current.sunrise;
      const sunsetTime = weatherData.current.sunset;
      backgroundKey = (currentTime > sunriseTime && currentTime < sunsetTime) ? 'Clear_Day' : 'Clear_Night';
    }
    
    const newClass = backgroundMap[backgroundKey] || backgroundMap.default;
    
    // DEBUG 2: Check which class name was chosen
    console.log(`Condition: ${condition}, Chosen Class: ${newClass}`);
    
    document.body.className = newClass;
    
  }, [weatherData]);

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

  const fetchWeather = async (lat, lon, cityName) => {
    setLoading(true);
    setError('');
    setSelectedDayIndex(0);
    
    // DEBUG 3: Check if the API Key is being loaded correctly
    console.log("Using API Key:", API_KEY ? "Loaded" : "!!! UNDEFINED !!!");

    await gsap.to('.main-content > *', { duration: 0.3, autoAlpha: 0, y: 20, stagger: 0.1, ease: 'power3.in' });

    try {
      const response = await axios.get('https://api.openweathermap.org/data/3.0/onecall', {
        params: { lat, lon, exclude: 'minutely,alerts', appid: API_KEY, units: 'metric' },
      });
      response.data.cityName = cityName;
      setWeatherData(response.data);
    } catch (err) {
      setError('Could not fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ... All other functions remain unchanged ...
  const getCoordsForCity = async (cityName) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
        params: { q: cityName, limit: 1, appid: API_KEY },
      });
      if (response.data.length > 0) {
        const { lat, lon, name } = response.data[0];
        fetchWeather(lat, lon, name);
      } else {
        setError(`City not found: ${cityName}`);
        setLoading(false);
      }
    } catch (err) {
      setError('Could not find city. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
             try {
                const response = await axios.get('https://api.openweathermap.org/geo/1.0/reverse', {
                    params: { lat: latitude, lon: longitude, limit: 1, appid: API_KEY },
                });
                const cityName = response.data[0]?.name || "Your Location";
                fetchWeather(latitude, longitude, cityName);
             } catch (err) {
                 fetchWeather(latitude, longitude, "Your Location");
             }
          },
          () => { getCoordsForCity('London'); }
        );
      } else {
        getCoordsForCity('London');
      }
    };
    fetchUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      getCoordsForCity(city);
    }
  };
  
  const handleDayClick = (index) => {
    setSelectedDayIndex(index);
  };

  const displayData = weatherData ? (selectedDayIndex === 0 ? weatherData.current : weatherData.daily[selectedDayIndex]) : null;

  let hourlyDataForDisplay;
  if (weatherData) {
    if (selectedDayIndex === 0) {
      hourlyDataForDisplay = weatherData.hourly;
    } else {
      const selectedDay = weatherData.daily[selectedDayIndex];
      hourlyDataForDisplay = [
        { custom_time: 'Morning', temp: selectedDay.temp.morn, weather: selectedDay.weather },
        { custom_time: 'Day', temp: selectedDay.temp.day, weather: selectedDay.weather },
        { custom_time: 'Evening', temp: selectedDay.temp.eve, weather: selectedDay.weather },
        { custom_time: 'Night', temp: selectedDay.temp.night, weather: selectedDay.weather },
      ];
    }
  }

  return (
    <div className="App" ref={appRef}>
      <header className="App-header">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search for a city..."
            className="city-input"
          />
          <button type="submit">Search</button>
        </form>
      </header>
      <main className="main-content">
        {loading && <div className="loader"></div>}
        {error && <p className="error">{error}</p>}
        
        {weatherData && displayData && (
          <>
            <WeatherDisplay 
              data={displayData}
              cityName={weatherData.cityName}
              isToday={selectedDayIndex === 0}
            />
            <HourlyForecast 
              data={hourlyDataForDisplay} 
              isFutureDay={selectedDayIndex > 0}
            />
            <DailyForecast 
              data={weatherData.daily}
              onDayClick={handleDayClick}
              selectedIndex={selectedDayIndex}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;