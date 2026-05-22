"use client"

import React, { useEffect, useState } from 'react';

interface WeatherData {
  temperature: number;
  weathercode: number;
}

export function WeatherBanner() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Open-Meteo API for Medellin (Lat: 6.2518, Lon: -75.5636)
    const fetchWeather = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/shop/weather/');
        const data = await response.json();
        
        if (data && data.current_weather) {
          setWeather({
            temperature: data.current_weather.temperature,
            weathercode: data.current_weather.weathercode,
          });
        }
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading || !weather) return null;

  // Simple interpretation of WMO Weather codes
  const isRaining = weather.weathercode >= 50;
  const isCold = weather.temperature < 18;

  let suggestion = "Perfect weather for our Latest Drop.";
  let icon = "wb_sunny";

  if (isRaining) {
    suggestion = "It's raining in Medellín. Stay dry with our technical jackets.";
    icon = "rainy";
  } else if (isCold) {
    suggestion = "Chilly in Medellín. Layer up with our signature hoodies.";
    icon = "ac_unit";
  } else {
    suggestion = `Current weather in Medellín: ${weather.temperature}°C. Perfect conditions for streetwear.`;
    icon = "partly_cloudy_day";
  }

  return (
    <div className="w-full h-8 bg-[#1A1918] text-[#FDFBF7] flex items-center justify-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-widest font-semibold z-50">
      <span className="material-symbols-outlined text-[14px]">{icon}</span>
      <span className="text-center">{suggestion}</span>
    </div>
  );
}
