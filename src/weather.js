// Mapeo de condiciones a íconos de Weather Icons
const iconMap = {
  Clear: "wi wi-day-sunny",
  Clouds: "wi wi-cloudy",
  Rain: "wi wi-rain",
  Thunderstorm: "wi wi-thunderstorm",
  Snow: "wi wi-snow",
  Mist: "wi wi-fog",
  Drizzle: "wi wi-sprinkle",
  Smoke: "wi wi-smoke",
  Haze: "wi wi-day-haze"
};

// Función para obtener el clima actual
export async function getWeather(city) {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API Key no configurada");

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Ciudad no encontrada o API inválida');
    const data = await res.json();

    document.getElementById('cityName').textContent = data.name;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('temperature').textContent = `🌡️ ${data.main.temp} °C`;
    document.getElementById('humidity').textContent = `💧 Humedad: ${data.main.humidity}%`;

    // Ícono personalizado
    const condition = data.weather[0].main;
    const weatherIcon = document.getElementById('weatherIcon');
    weatherIcon.className = iconMap[condition] || "wi wi-na";
    weatherIcon.classList.add("weather-icon");

    const card = document.getElementById('weatherCard');
    card.classList.remove('d-none');
    card.classList.add('show');
  } catch (error) {
    throw error;
  }
}

// Función para obtener pronóstico extendido
export async function getForecast(city) {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API Key no configurada");

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=es`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener pronóstico');
    const data = await res.json();

    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';
    forecastContainer.classList.remove('d-none');

    // Mostrar 5 intervalos (cada 8 horas aprox.)
    data.list.slice(0, 5).forEach(item => {
      const condition = item.weather[0].main;
      const iconClass = iconMap[condition] || "wi wi-na";

      const card = document.createElement('div');
      card.className = 'forecast-card col';
      card.innerHTML = `
        <h6>${new Date(item.dt_txt).toLocaleDateString('es-ES', { weekday: 'short', hour: '2-digit' })}</h6>
        <i class="${iconClass} weather-icon"></i>
        <p>${item.main.temp} °C</p>
      `;
      forecastContainer.appendChild(card);
    });
  } catch (error) {
    console.error(error);
  }
}

// Función para obtener sugerencias de ciudades (autocompletado dinámico)
export async function getCitySuggestions(query) {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error("API Key no configurada");

  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al obtener sugerencias');
    const data = await res.json();

    // Devuelve un array de objetos con nombre y país
    return data.map(item => ({
      name: item.name,
      country: item.country
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}
