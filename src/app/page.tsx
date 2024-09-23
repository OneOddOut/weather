'use client';

import { useState } from 'react';
import { motion } from 'framer-motion'; // For animations
import Image from 'next/image'; // Import next/image for optimized images
import { Processor } from 'postcss';

// Define type for the weather data from OpenWeather API
type WeatherData = {
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  weather: Array<{
    id: number;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    humidity: number;
  };
  dt: number;
};

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setWeather(null); // Reset previous results
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid={${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('City not found');
      }

      const data: WeatherData = await response.json();
      setWeather(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setWeather(null);
    }
  };

  const getWeatherAnimationClass = () => {
    if (!weather) return '';

    const weatherId = weather.weather[0].id;
    const isNight = weather.dt > weather.sys.sunset || weather.dt < weather.sys.sunrise;

    if (weatherId >= 200 && weatherId < 600) {
      return 'rain-animation';
    } else if (weatherId >= 600 && weatherId < 700) {
      return 'snow-animation';
    } else if (weatherId >= 700 && weatherId < 800) {
      return 'wind-animation';
    } else if (weatherId === 800) {
      return isNight ? 'night-animation' : 'sun-animation';
    } else if (weatherId > 800) {
      return 'cloud-animation';
    }
    return '';
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen text-gray-800 ${getWeatherAnimationClass()}`}>
      <h1 className="text-4xl font-bold mb-4">Weather App</h1>
      <form onSubmit={fetchWeather} className="flex flex-col items-center">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="mb-4 p-2 text-lg border-2 border-gray-300 rounded-lg shadow-lg focus:outline-none"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white text-lg rounded-lg shadow hover:bg-blue-600 transition"
        >
          Get Weather
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {weather && (
        <motion.div
          className="relative mt-8 p-6 bg-white rounded-lg shadow-lg text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold">
            {weather.name}, {weather.sys.country}
          </h2>
          <p className="text-xl mt-2">{weather.weather[0].description}</p>
          <p className="text-lg mt-1">Temperature: {weather.main.temp}°C</p>
          <p className="text-lg mt-1">Humidity: {weather.main.humidity}%</p>

          {/* Optimized image using next/image */}
          <Image
            className="mt-4 mx-auto"
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
            width={100}
            height={100}
          />
        </motion.div>
      )}
    </div>
  );
};

export default WeatherApp;
