"use client";

import { useState, useEffect } from "react";
import { Printer, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, AlertTriangle, CloudFog, SunDim } from "lucide-react";

interface CityDef {
  name: string;
  lat: number;
  lon: number;
}

const CITIES: Record<string, CityDef> = {
  "calama": { name: "Calama (Faena Norte)", lat: -22.4559, lon: -68.9253 },
  "chuquicamata": { name: "Chuquicamata (Mina)", lat: -22.3167, lon: -68.9333 },
  "santiago": { name: "Santiago (Casa Matriz)", lat: -33.4489, lon: -70.6693 },
  "lima": { name: "Lima, Perú (Sucursal)", lat: -12.0464, lon: -77.0428 }
};

const getWeatherInfo = (code: number) => {
  if (code === 0) return { label: "Despejado", icon: <Sun className="text-amber-500" size={48} /> };
  if (code === 1 || code === 2) return { label: "Parcialmente Nublado", icon: <Cloud className="text-zinc-400" size={48} /> };
  if (code === 3) return { label: "Nublado", icon: <Cloud className="text-zinc-500" size={48} /> };
  if (code === 45 || code === 48) return { label: "Niebla", icon: <CloudFog className="text-zinc-400" size={48} /> };
  if (code >= 51 && code <= 67) return { label: "Lluvia", icon: <CloudRain className="text-blue-400" size={48} /> };
  if (code >= 71 && code <= 86) return { label: "Nieve", icon: <CloudSnow className="text-cyan-300" size={48} /> };
  if (code >= 95) return { label: "Tormenta", icon: <CloudLightning className="text-purple-500" size={48} /> };
  return { label: "Desconocido", icon: <Cloud className="text-zinc-500" size={48} /> };
};

interface WeatherResponse {
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    weathercode: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
    precipitation_probability_max?: number[];
    uv_index_max?: number[];
  };
}

export function GeneradorClima() {
  const [cityKey, setCityKey] = useState<string>("calama");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alerta, setAlerta] = useState("");
  const [fechaReporte, setFechaReporte] = useState(new Date().toLocaleDateString("es-CL", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

  const fetchWeather = async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const city = CITIES[key];
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,wind_speed_10m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max,uv_index_max&timezone=auto&forecast_days=4`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error HTTP ${res.status} al obtener datos meteorologicos`);
      const data: WeatherResponse = await res.json();
      setWeather(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      console.error("Error fetching weather", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(cityKey);
  }, [cityKey]);

  const handlePrint = () => {
    window.print();
  };

  const city = CITIES[cityKey];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
      {/* PANEL DE CONFIGURACIÓN */}
      <div className="lg:col-span-4 space-y-6 print:hidden">
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-text mb-4">Configurar Reporte</h2>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text-soft">Ubicación / Ciudad</label>
              <select 
                className="input"
                value={cityKey}
                onChange={e => setCityKey(e.target.value)}
              >
                {Object.entries(CITIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text-soft">Alerta Meteorológica / Operativa</label>
              <textarea 
                className="input resize-none"
                rows={4}
                value={alerta}
                onChange={e => setAlerta(e.target.value)}
                placeholder="Ej: Ruta 23-CH cerrada por viento blanco..."
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text-soft">Fecha del Boletín</label>
              <input 
                type="text" 
                className="input"
                value={fechaReporte}
                onChange={e => setFechaReporte(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handlePrint}
          disabled={loading || !weather}
          className="btn btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Printer size={18} /> Imprimir / PDF
        </button>
      </div>

      {/* ÁREA DE PREVISUALIZACIÓN */}
      <div className="lg:col-span-8 flex justify-center items-start print:w-full">
        {loading || !weather ? (
          <div className="w-full h-96 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-text-muted print:hidden gap-3">
            {error ? (
              <>
                <AlertTriangle className="text-red-400" size={32} />
                <p className="text-sm font-semibold text-red-500 text-center max-w-xs">{error}</p>
              </>
            ) : (
              <p>Cargando datos meteorologicos...</p>
            )}
          </div>
        ) : (
          <div className="w-full max-w-3xl bg-white rounded-xl overflow-hidden shadow-2xl print:shadow-none print:max-w-none print:w-[210mm] print:h-[297mm]">
            
            {/* Cabecera del Boletín */}
            <div className="bg-[#1A418C] text-white p-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">BOLETÍN METEOROLÓGICO</h1>
                <p className="text-blue-200 mt-1 uppercase tracking-widest text-sm font-semibold">{city.name}</p>
                <p className="text-blue-200 text-xs mt-1">{fechaReporte}</p>
              </div>
              <Cloud size={48} className="opacity-20 absolute right-8" />
            </div>

            {/* Contenido Principal */}
            <div className="p-8 bg-[#FAFAFA] min-h-[500px]">
              
              {/* Alerta Destacada */}
              {alerta && (
                <div className="mb-8 border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg flex gap-4 items-start">
                  <AlertTriangle className="text-red-500 shrink-0" size={24} />
                  <div>
                    <h3 className="text-red-800 font-bold text-sm uppercase mb-1">Alerta Operativa</h3>
                    <p className="text-red-700 whitespace-pre-wrap">{alerta}</p>
                  </div>
                </div>
              )}

              {/* Clima Actual */}
              <div className="mb-10">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Condiciones Actuales</h3>
                <div className="flex items-center gap-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  {getWeatherInfo(weather.current.weathercode).icon}
                  <div>
                    <span className="text-6xl font-black text-gray-800 tracking-tighter">
                      {Math.round(weather.current.temperature_2m)}°<span className="text-3xl text-gray-400">C</span>
                    </span>
                    <p className="text-xl font-medium text-gray-500">{getWeatherInfo(weather.current.weathercode).label}</p>
                  </div>
                  <div className="ml-auto pl-8 border-l border-gray-100 space-y-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Wind size={18} className="text-gray-400"/>
                      <span className="font-semibold">{weather.current.wind_speed_10m} km/h</span> (Viento)
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <SunDim size={18} className="text-amber-500"/>
                      <span className="font-semibold">{weather.daily?.uv_index_max?.[0] || 0}</span> (Índice UV Máx)
                    </div>
                  </div>
                </div>
              </div>

              {/* Pronóstico extendido */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Pronóstico Próximos 3 Días</h3>
                <div className="grid grid-cols-3 gap-4">
                  {weather.daily.time.slice(1, 4).map((timeStr: string, idx: number) => {
                    // +1 because slice starts from index 1 (tomorrow)
                    const dayIndex = idx + 1;
                    const dateObj = new Date(timeStr + "T12:00:00");
                    const dayName = dateObj.toLocaleDateString("es-CL", { weekday: 'short' }).toUpperCase();
                    
                    const min = Math.round(weather.daily.temperature_2m_min[dayIndex]);
                    const max = Math.round(weather.daily.temperature_2m_max[dayIndex]);
                    const wInfo = getWeatherInfo(weather.daily.weathercode[dayIndex]);
                    const precip = weather.daily.precipitation_probability_max?.[dayIndex] || 0;

                    return (
                      <div key={timeStr} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
                        <span className="text-sm font-bold text-gray-500 mb-3 block">{dayName} {dateObj.getDate()}</span>
                        <div className="mb-3">
                          {wInfo.icon}
                        </div>
                        <div className="flex gap-3 justify-center mb-1">
                          <span className="text-lg font-bold text-gray-800">{max}°</span>
                          <span className="text-lg font-medium text-gray-400">{min}°</span>
                        </div>
                        <span className="text-xs text-gray-500 block mb-2">{wInfo.label}</span>
                        {precip > 20 && (
                          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                            {precip}% Lluvia
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
            
            {/* Footer */}
            <div className="h-6 w-full" style={{ backgroundColor: "#F29100" }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
