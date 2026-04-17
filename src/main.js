import { getWeather, getForecast, getCitySuggestions } from './weather.js';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const closeBtn = document.getElementById('closeBtn');
const weatherCard = document.getElementById('weatherCard');
const loading = document.getElementById('loading');
const forecast = document.getElementById('forecast');
const errorMsg = document.getElementById('errorMsg');
const suggestions = document.getElementById('suggestions');
const historyContainer = document.getElementById('history');


// Evita que se hagan 10 peticiones si escribes rápido "Madrid"
let debounceTimer;

/* Mostrar errores en pantalla */
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove('d-none');
  setTimeout(() => errorMsg.classList.add('d-none'), 4000);
}

/* Guardar ciudad en historial */
function saveCityToHistory(city) {
  if (!city) return;
  let history = JSON.parse(localStorage.getItem('cityHistory')) || [];
  
  // Guardamos solo el nombre limpio y evitamos duplicados ignorando mayúsculas
  const cityLower = city.toLowerCase();
  if (!history.some(c => c.toLowerCase() === cityLower)) {
    history.unshift(city); 
    if (history.length > 5) history.pop();
    localStorage.setItem('cityHistory', JSON.stringify(history));
  }
  renderHistory();
}

/* Mostrar historial en pantalla */
function renderHistory() {
  let history = JSON.parse(localStorage.getItem('cityHistory')) || [];
  historyContainer.innerHTML = '';
  history.forEach((city) => {
    const btn = document.createElement('button');
    // Usamos las clases de tu nuevo CSS
    btn.className = 'btn btn-sm btn-outline-info me-2 mb-2';
    btn.textContent = city;
    btn.onclick = () => {
      cityInput.value = city;
      searchCity();
    };
    historyContainer.appendChild(btn);
  });
}

/* Buscar ciudad y mostrar clima */
async function searchCity() {
  const city = cityInput.value.trim();
  if (!city) return;

  // Limpieza previa
  suggestions.classList.add('d-none');
  errorMsg.classList.add('d-none');
  loading.classList.remove('d-none');
  weatherCard.classList.add('d-none');
  forecast.classList.add('d-none');

  try {
    // Ejecutamos ambas promesas al mismo tiempo para más velocidad
    await Promise.all([getWeather(city), getForecast(city)]);
    
    saveCityToHistory(city);
    loading.classList.add('d-none');
    // El CSS hará la animación gracias a .show
    weatherCard.classList.remove('d-none');
    weatherCard.classList.add('show'); 
  } catch (err) {
    loading.classList.add('d-none');
    showError("Ciudad no encontrada o error de conexión");
  }
}

/* Autocompletado dinámico */
async function showSuggestions(query) {
  if (query.length < 3) {
    suggestions.classList.add('d-none');
    return;
  }

  try {
    const cities = await getCitySuggestions(query);
    suggestions.innerHTML = '';

    if (cities && cities.length > 0) {
      cities.forEach((city) => {
        const li = document.createElement('li');
        // Usamos template literals para un diseño más limpio
        li.innerHTML = `<span>${city.name}, ${city.country}</span> <small>📍</small>`;
        li.addEventListener('click', () => {
          cityInput.value = city.name;
          suggestions.classList.add('d-none');
          searchCity();
        });
        suggestions.appendChild(li);
      });
      suggestions.classList.remove('d-none');
    } else {
      suggestions.classList.add('d-none');
    }
  } catch (error) {
    console.error("Error en sugerencias:", error);
  }
}

/* --- EVENTOS --- */

// Aplicamos Debounce al input
cityInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const query = cityInput.value.trim();
  debounceTimer = setTimeout(() => showSuggestions(query), 400); 
});

searchBtn.addEventListener('click', searchCity);

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchCity();
});

closeBtn.addEventListener('click', () => {
  weatherCard.classList.add('d-none');
  forecast.classList.add('d-none');
  cityInput.value = '';
});

// MEJORA: Cerrar sugerencias si se hace clic fuera del buscador
document.addEventListener('click', (e) => {
  if (!cityInput.contains(e.target) && !suggestions.contains(e.target)) {
    suggestions.classList.add('d-none');
  }
});

/* Renderizar historial al cargar */
renderHistory();
