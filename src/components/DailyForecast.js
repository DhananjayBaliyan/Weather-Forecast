import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './components.css';

const DailyForecast = ({ data, onDayClick, selectedIndex }) => {
  const componentRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    if (data) {
      gsap.fromTo(componentRef.current, 
        { autoAlpha: 0, y: 30 }, 
        { duration: 0.8, autoAlpha: 1, y: 0, ease: 'power3.out', delay: 0.4 }
      );
       gsap.fromTo(cardsRef.current, 
        { autoAlpha: 0, y: 20 },
        { duration: 0.5, autoAlpha: 1, y: 0, stagger: 0.1, ease: 'power3.out', delay: 0.6 }
      );
    }
  }, [data]);

  if (!data) return null;

  return (
    <div className="daily-forecast-container glass-card" ref={componentRef}>
      <h3>7-Day Forecast</h3>
      <div className="day-cards-wrapper">
        {data.slice(0, 7).map((day, index) => (
          <div 
            key={index} 
            className={`day-card ${index === selectedIndex ? 'active' : ''}`}
            onClick={() => onDayClick(index)}
            ref={el => cardsRef.current[index] = el}
          >
            <p className="day-name">{index === 0 ? 'Today' : new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
            <img 
              src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} 
              alt={day.weather[0].description} 
              className="day-icon"
            />
            <p className="day-temp">{Math.round(day.temp.max)}° / {Math.round(day.temp.min)}°</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyForecast;