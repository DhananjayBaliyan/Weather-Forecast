import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './components.css';

const HourlyForecast = ({ data, isFutureDay }) => {
  const componentRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    if (data) {
      gsap.fromTo(componentRef.current, 
        { autoAlpha: 0, y: 30 }, 
        { duration: 0.8, autoAlpha: 1, y: 0, ease: 'power3.out', delay: 0.2 }
      );
      gsap.fromTo(cardsRef.current, 
        { autoAlpha: 0, y: 20 },
        { duration: 0.5, autoAlpha: 1, y: 0, stagger: 0.1, ease: 'power3.out', delay: 0.4 }
      );
    }
  }, [data]);

  if (!data) return null;

  const hoursToShow = isFutureDay ? data : data.slice(0, 24);

  return (
    <div className="hourly-forecast-container glass-card" ref={componentRef}>
      <h3>{isFutureDay ? "Day Summary" : "Today's Forecast"}</h3>
      <div className="hour-cards-wrapper">
        {hoursToShow.map((hour, index) => {
          const timeToDisplay = isFutureDay
            ? hour.custom_time
            : new Date(hour.dt * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true });

          return (
            <div key={index} className="hour-card" ref={el => cardsRef.current[index] = el}>
              <p className="hour-time">{timeToDisplay}</p>
              <img 
                src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`} 
                alt={hour.weather[0].description} 
                className="hour-icon"
              />
              <p className="hour-temp">{Math.round(hour.temp)}°</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlyForecast;