import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './components.css';

const WeatherDisplay = ({ data, cityName, isToday }) => {
  const componentRef = useRef(null);

  useEffect(() => {
    if (data) {
      gsap.fromTo(componentRef.current, 
        { autoAlpha: 0, y: 30 }, 
        { duration: 0.8, autoAlpha: 1, y: 0, ease: 'power3.out' }
      );
    }
  }, [data]);

  if (!data) return null;

  const { weather, dt } = data;
  const weatherIconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;
  
  const displayTemp = isToday ? data.temp : data.temp.day;
  const feelsLike = isToday ? data.feels_like : data.feels_like.day;
  const description = weather[0].description;
  const humidity = data.humidity;
  const wind = data.wind_speed;
  
  const dayName = new Date(dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = new Date(dt * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div className="weather-display glass-card" ref={componentRef}>
      <div className="location-info">
        <h2>{cityName}</h2>
        <p>{dayName}, {fullDate}</p>
      </div>

      <div className="weather-details">
        <div className="weather-main">
            <img src={weatherIconUrl} alt={description} />
            <p className="temperature">{Math.round(displayTemp)}<span>°</span></p>
        </div>
        <div className="weather-extra">
            <p className="description">{description}</p>
            <div className="extra-stats">
              <p><strong>Feels like:</strong> {Math.round(feelsLike)}°</p>
              <p><strong>Humidity:</strong> {humidity}%</p>
              <p><strong>Wind:</strong> {wind.toFixed(1)} m/s</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;