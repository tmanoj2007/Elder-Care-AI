import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sun, CloudSun, CloudRain, Thermometer, Wind, Droplets, MapPin, RefreshCw, Compass } from 'lucide-react';

interface WeatherWidgetProps {
  location?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location = 'Oakridge Residence, CA' }) => {
  const [unit, setUnit] = useState<'F' | 'C'>('F');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [weatherIndex, setWeatherIndex] = useState(0);

  const weatherOptions = [
    {
      tempF: 72,
      tempC: 22,
      condition: 'Mild & Sunny',
      icon: Sun,
      iconColor: 'text-amber-400',
      bgColor: 'from-amber-900/30 via-slate-900 to-emerald-950/40',
      borderColor: 'border-amber-400/40',
      humidity: '45%',
      wind: '6 mph SW',
      uvIndex: '2 (Low)',
      airQuality: 'Good (32 AQI)',
      outdoorAdvice: '☀️ Perfect weather for a 15-minute garden walk or patio tea. Light layers recommended.',
    },
    {
      tempF: 68,
      tempC: 20,
      condition: 'Partly Cloudy & Pleasant',
      icon: CloudSun,
      iconColor: 'text-sky-300',
      bgColor: 'from-sky-950/40 via-slate-900 to-teal-950/40',
      borderColor: 'border-sky-400/40',
      humidity: '52%',
      wind: '8 mph W',
      uvIndex: '3 (Moderate)',
      airQuality: 'Excellent (24 AQI)',
      outdoorAdvice: '🌤️ Pleasant afternoon breeze! Great for breathing exercises by an open window or outdoor porch.',
    },
    {
      tempF: 64,
      tempC: 18,
      condition: 'Passing Spring Shower',
      icon: CloudRain,
      iconColor: 'text-teal-300',
      bgColor: 'from-teal-950/40 via-slate-900 to-indigo-950/40',
      borderColor: 'border-teal-400/40',
      humidity: '78%',
      wind: '10 mph NW',
      uvIndex: '1 (Low)',
      airQuality: 'Clean & Fresh (18 AQI)',
      outdoorAdvice: '🌧️ Cozy indoor weather. Enjoy indoor leg stretches, warm herbal tea, and classical music.',
    },
  ];

  const currentWeather = weatherOptions[weatherIndex];
  const IconComponent = currentWeather.icon;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setWeatherIndex((prev) => (prev + 1) % weatherOptions.length);
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className={`bg-gradient-to-br ${currentWeather.bgColor} bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border-2 ${currentWeather.borderColor} shadow-xl relative overflow-hidden flex flex-col justify-between gap-4 h-full`}>
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400 shrink-0 stroke-[2.5]" />
          <span className="font-black text-xs sm:text-sm text-slate-200 truncate max-w-[180px]">
            {location}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Unit Toggle */}
          <button
            onClick={() => setUnit(unit === 'F' ? 'C' : 'F')}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-black px-2.5 py-1 rounded-xl border border-white/20 transition-all active:scale-95 min-h-[32px]"
            title="Toggle Temperature Unit (°F / °C)"
          >
            °{unit}
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-xl border border-white/20 transition-all active:scale-95 disabled:opacity-50 min-w-[32px] min-h-[32px] flex items-center justify-center"
            title="Refresh Live Weather Data"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-300 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Temp & Weather Display */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
              {unit === 'F' ? `${currentWeather.tempF}°F` : `${currentWeather.tempC}°C`}
            </span>
            <span className="text-xs font-black uppercase text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              Outdoor Safety
            </span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-slate-200">
            {currentWeather.condition}
          </div>
        </div>

        {/* Large Weather Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center shrink-0 shadow-lg">
          <IconComponent className={`w-10 h-10 sm:w-12 sm:h-12 ${currentWeather.iconColor} stroke-[2.2] animate-pulse`} />
        </div>
      </div>

      {/* Weather Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center bg-black/20 p-2.5 rounded-2xl border border-white/10 text-xs">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
            <Droplets className="w-3 h-3 text-sky-400" /> Humidity
          </div>
          <div className="font-black text-white text-xs mt-0.5">{currentWeather.humidity}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
            <Wind className="w-3 h-3 text-teal-300" /> Wind
          </div>
          <div className="font-black text-white text-xs mt-0.5">{currentWeather.wind}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
            <Compass className="w-3 h-3 text-amber-300" /> UV Index
          </div>
          <div className="font-black text-white text-xs mt-0.5">{currentWeather.uvIndex}</div>
        </div>
      </div>

      {/* Senior Activity Safety Tip Banner */}
      <div className="bg-emerald-950/80 border-2 border-emerald-400/60 rounded-2xl p-3 text-xs text-emerald-100 font-extrabold flex items-start gap-2 shadow-inner">
        <span className="text-base leading-none">💡</span>
        <span>{currentWeather.outdoorAdvice}</span>
      </div>
    </div>
  );
};
