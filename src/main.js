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

/* Mostrar errores en pantalla */
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove('d-none');
  setTimeout(() => errorMsg.classList.add('d-none'), 4000);
}

/* Guardar ciudad en historial */
function saveCityToHistory(city) {
  let history = JSON.parse(localStorage.getItem('cityHistory')) || [];
  if (!history.includes(city)) {
    history.unshift(city); // agrega al inicio
    if (history.length > 5) history.pop(); // máximo 5 ciudades
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
    btn.className = 'btn btn-sm btn-outline-info';
    btn.textContent = city;
    btn.addEventListener('click', () => {
      cityInput.value = city;
      searchCity();
    });
    historyContainer.appendChild(btn);
  });
}

/* Buscar ciudad y mostrar clima */
async function searchCity() {
  const city = cityInput.value.trim();
  if (!city) return;

  loading.classList.remove('d-none');
  weatherCard.classList.add('d-none');
  forecast.classList.add('d-none');

  try {
    await getWeather(city);
    await getForecast(city);
    saveCityToHistory(city); // guardar en historial
    loading.classList.add('d-none');
  } catch (err) {
    loading.classList.add('d-none');
    showError(err.message);
  }
}

/* Autocompletado dinámico */
async function showSuggestions(query) {
  suggestions.innerHTML = '';
  if (!query) {
    suggestions.classList.add('d-none');
    return;
  }
  try {
    const cities = await getCitySuggestions(query);
    if (cities.length > 0) {
      cities.forEach((city) => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = `${city.name}, ${city.country}`;
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
    console.error(error);
  }
}

/* Eventos */
cityInput.addEventListener('input', () => {
  const query = cityInput.value.trim();
  showSuggestions(query);
});

searchBtn.addEventListener('click', searchCity);

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchCity();
});

closeBtn.addEventListener('click', () => {
  weatherCard.classList.add('d-none');
  forecast.classList.add('d-none');
});

/* Renderizar historial al cargar */
renderHistory();
