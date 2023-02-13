const myApiKey = '513a01ef96799f8d057eeab78eeaf283';

let nearbyPlace;
let currentCityLat;
let currentCityLon;
let contentHours;
const ourMain = document.querySelector('.main');
let nearbyPlaceContainer;
const inputSearch = document.querySelector('.input__search');
const searchCity = document.querySelector('.search-img');
const fiveDayForecast = document.querySelector('.tabs__five');

const tabsToday = document.querySelector('.tabs__today');

let arrWeatherFiveDay;
let nameCity;

// ============================Отримуємо свої координати===========================
const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function success(pos) {
  const crd = pos.coords;
  currentCityLat = crd.latitude;
  currentCityLon = crd.longitude;
  getCurrentWeatherData(currentCityLat, currentCityLon);
  
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}
// =================Отримуємо геокоординати міста===========================
async function getGeocoding(city) {
  const current = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${myApiKey}`
  );
  const currentCity = await current.json();

  if (currentCity.length == 0) {
    renderErrorPage();
  } else {
    currentCityLat = currentCity[0].lat;

    currentCityLon = currentCity[0].lon;

    getCurrentWeatherData(currentCityLat, currentCityLon);
    
  }
}
// ===============================Отримуємо погоду в сусідніх містах==========================================
async function getWetherNearbyPlaceFirst(cityLat, cityLon) {
  const currentCoordinates = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${cityLat}&lon=${cityLon}&appid=${myApiKey}`
  );

  const currentWeather = await currentCoordinates.json();
  const weather = currentWeather;

  renderWeatherNearby(weather);
}
function getWetherNearbyPlace(cityLat, cityLon) {
  
  getWetherNearbyPlaceFirst(cityLat + 0.2, cityLon);
  getWetherNearbyPlaceFirst(cityLat - 0.2, cityLon);
  getWetherNearbyPlaceFirst(cityLat, cityLon + 0.2);
  getWetherNearbyPlaceFirst(cityLat, cityLon - 0.2);
}
// =================Отримуємо 3-годинний прогноз===========================
async function getHourlyForecast(cityLat, cityLon) {
  const getHourlyForecast = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${cityLat}&lon=${cityLon}&cnt=8&appid=${myApiKey}`
  );
  const hourlyForecast = await getHourlyForecast.json();
  const currentHour = hourlyForecast.list[0].dt_txt.slice(11, 13);
  const lengthArrHours = (24 - Number(currentHour)) / 3;
  const arrHours = hourlyForecast.list.slice(0, lengthArrHours);
  renderHourlyWeather(arrHours);
}
// =================Отримуємо прогноз на 5 днів===========================
async function getFiveDayForecast(city) {
  const currentWeatherContent = document.querySelector('.currentWeather__container')
  currentWeatherContent.innerHTML = '';
  const fiveDayCoordinate = await fetch(
    `http://api.weatherapi.com/v1/forecast.json?key=e4e382681c5740af8cd102056230502&q=${city}&days=5&aqi=no&alerts=no`
  );
  const fiveDayForecastWeather = await fiveDayCoordinate.json();
  arrWeatherFiveDay = fiveDayForecastWeather.forecast.forecastday;

  arrWeatherFiveDay.forEach((item) => {
    renderFiveDayForecast(item);
  });
}
// =================Отримуємо прогноз вибраного міста===================================================================
async function getCurrentWeatherData(cityLat, cityLon) {
  const currentCoordinates = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${cityLat}&lon=${cityLon}&appid=${myApiKey}`
  );

  const currentWeather = await currentCoordinates.json();
  const weather = currentWeather;

  renderOurWeather(weather);
}
// =====================Конвертуємо температуру==========================================================================
function temperatureСonversion(kelvin) {
  return Math.round(kelvin - 273.15);
}
// ===================Конвертуємо час згідно локального часу обраного міста===============================================

function dayDuration(unix) {
  const time = new Date(unix * 1000);
  const durationDay = unix + time.getTimezoneOffset() * 60;
  const ourDurationDay = new Date(durationDay * 1000);
  return ourDurationDay;
}

function timeСonversion(time, timezone) {
  const date = new Date(time * 1000);
  const current = date.getTimezoneOffset();
  const deference = time + (current * 60 + timezone);
  const currentDate = new Date(deference * 1000);

  return currentDate;
}
// ========================================================РЕНДЕРИ=========================================================
// ===========================Рендер поточної погоди=======================================================================
function renderOurWeather(el) {
  ourMain.innerHTML = `        <div class="currentWeather__container"></div>
  <div class="hourlyForecast__container">
    <div class="hourlyForecast__title title">
      <div class="title__title"><p>Hourly</p></div>
    </div>
    <div class="hourlyForecast__content content">
      <div class="content__info">
        <div class="info_paragraph">
          <p>Today</p>
        </div>
        <div class="icon"><img src="" alt="" /></div>
        <div>
          <p>Forecast</p>
        </div>
        <div>
          <p>Temp(C)</p>
        </div>
        <div>
          <p>RealFeel</p>
        </div>
        <div>
          <p>Wind(km/h)</p>
        </div>
      </div>

      <div class="content__hours"></div>
    </div>
  </div>
  <div class="nearbyPlaces__container"><div class="title__title"><p>nearby places</p></div> <div class="nearbyPlaces__content"></div></div>`
  const currentWeatherContent = document.querySelector(
    '.currentWeather__container'
  );
  contentHours = document.querySelector('.content__hours');
  const t = new Date(el.sys.sunrise);
 
  const temp = temperatureСonversion(el.main.temp);
  const feelsLike = temperatureСonversion(el.main.feels_like);

  const timeSunrise = timeСonversion(el.sys.sunrise, el.timezone)
    .toLocaleTimeString()
    .slice(0, 5);

  const timeSunset = timeСonversion(el.sys.sunset, el.timezone)
    .toLocaleTimeString()
    .slice(0, 5);

  const durationDay = dayDuration(el.sys.sunset - el.sys.sunrise)
    .toLocaleTimeString()
    .slice(0, 5);
  const ourDate = timeСonversion(el.dt, el.timezone).toLocaleDateString();
  nameCity = el.name;
  inputSearch.value = nameCity;
  currentWeatherContent.innerHTML = `<div class="currentWeather__wrapper"><div class="currentWeather__title title">
  <div class="title__title"><p>current weather</p></div>
  <div class="title__data"><p>${ourDate}</p></div>
</div>
<div class="currentWeather__content content"><div class="content__description">
<img class="img-weather" src="http://openweathermap.org/img/wn/${el.weather[0].icon}.png" alt="" /> <p>${el.weather[0].main}</p>

</div>
<div class="content__temperature temperature"><p class="temperature-temperature">${temp}&#176С</p>
<p class="temperature-feel">Real Feel:${feelsLike}&#176С </p></div>
<div class="content__duration duration">
<p class="duration-sunrise">Sunrise: ${timeSunrise} </p>
<p class="duration-sunset">Sunset: ${timeSunset}</p>
<p class="duration-duration">Duration: ${durationDay}</p></div></div>
</div>`;
getHourlyForecast(currentCityLat, currentCityLon);
  getWetherNearbyPlace(currentCityLat, currentCityLon);
}

// ===========================Рендер прогнозу через кожні 3 години===============================================================
function renderHourlyWeather(arr) {
  
  contentHours.innerHTML = ``;
  
  arr.map((el) => {
    const temp = temperatureСonversion(el.main.temp);
    const feelsLike = temperatureСonversion(el.main.feels_like);
    const speedWind = Math.round(el.wind.speed * 3.6);
    const degrees = el.wind.deg;
    const directionWind = directionOfWind(degrees);

    contentHours.insertAdjacentHTML(
      'beforeend',
      `<div class="content__data">
    <div>
      <p>${el.dt_txt.slice(11, 16)}</p>
    </div>
    <div class="icon"><img src="http://openweathermap.org/img/wn/${
      el.weather[0].icon
    }.png" alt="" /></div>
    <div>
      <p>${el.weather[0].main}</p>
    </div>
    <div>
      <p>${temp}&#176С</p>
    </div>
    <div>
      <p>${feelsLike}&#176С </p>
    </div>
    <div>
      <p>${speedWind} ${directionWind}  </p>
    </div>
  </div>`
    );
  });
}

// ===========================Рендер прогнозу погоди на 5 днів========================================================================
function renderFiveDayForecast(element) {
  const nearbyPlaceContainer = document.querySelector('.nearbyPlaces__container')
  const time = new Date(element.date_epoch * 1000);
  const dayWeek = time.toString().slice(0, 3);
  const month = time.toString().slice(4, 10);
  const weatherIcon = element.day.condition.icon;
  const weatherTemp = element.day.avgtemp_c;
  const wetherDescription = element.day.condition.text;
  nearbyPlaceContainer.innerHTML = '';
  const currentWeatherContent = document.querySelector(
    '.currentWeather__container'
  );
  currentWeatherContent.insertAdjacentHTML(
    'beforeend',
    `<div class="forecastFiveDay__days days" id="${element.date_epoch}">
              <div class="title__title">${dayWeek}</div>
              <div class="days__data">${month}</div>
              <div class="days__icon"><img src="${weatherIcon}" alt="" /></div>
              <div class="days__temp">${weatherTemp}&#176С</div>
              <div class="days__feel">${wetherDescription}</div>
            </div>`
  );
  const buttonDaysWeek = document.querySelectorAll('.forecastFiveDay__days');
  buttonDaysWeek.forEach((item) => {
    item.addEventListener('click', renderHourlyForecastCurrentDay);
  });
}

// ===========================Рендер почасового прогнозу погоди обраного дня з 5==========================================================
function renderHourlyForecastCurrentDay(e) {
  contentHours = document.querySelector('.content__hours')
  const infoParagraph = document.querySelector('.info_paragraph')
  const idElement = e.currentTarget.id;
  const currentDate = new Date();
  const currentDayWeek = currentDate.toString().slice(0, 3);
  const time = new Date(idElement * 1000);
  const dayWeek = time.toString().slice(0, 3);
  const arrHourlyForecast = arrWeatherFiveDay.filter((item) => {
    return Number(item.date_epoch) == Number(idElement);
  });

  infoParagraph.innerHTML = ``;
  if (currentDayWeek == dayWeek) {
    infoParagraph.innerHTML = `<p >Today</p>`;
  } else {
    infoParagraph.innerHTML = `<p >${dayWeek}</p>`;
  }
  contentHours.innerHTML = ``;

  arrHourlyForecast[0].hour.map((el) => {
    const speedWind = Math.round(el.wind_mph * 1.609);

    contentHours.insertAdjacentHTML(
      'beforeend',
      `<div class="content__data">
    <div>
      <p>${el.time.slice(11, 16)}</p>
    </div>
    <div class="icon"><img src="${el.condition.icon}" alt="" /></div>
    <div>
      <p>${el.condition.text}</p>
    </div>
    <div>
      <p>${el.temp_c}&#176С</p>
    </div>
    <div>
      <p>${el.feelslike_c}&#176С </p>
    </div>
    <div>
      <p>${speedWind} ${el.wind_dir}</p>
    </div>
  </div>`
    );
  });
}
// ============================================Рендер погоди у сусідніх містах=========================================
function renderWeatherNearby(el) {
  const temp = temperatureСonversion(el.main.temp);

  nearbyPlace = document.querySelector('.nearbyPlaces__content');
  nearbyPlace.insertAdjacentHTML(
    'beforeend',
    `<div class="nearbyCity"> 
  <div>
    <p>${el.name}</p>
  </div>
  <div class="nearbyCity__img"><img src="http://openweathermap.org/img/wn/${el.weather[0].icon}.png" alt="" /></div>
  <div>
  <p>${temp}&#176С</p>
</div>
  
  </div>`
  );
}
// =====================================Рендер сторінки Error==================================================================
function renderErrorPage() {
  ourMain.innerHTML = `<div class="error__container">
  <div class="error__number">
    <div class="error__img"><img src="img/cloud-computing.png" alt="" /></div>
  </div>
  <div class="error__info">
    <div class="info">
      <p>
        <span>Qwerty</span> could not be found. <br />Please enter a
        different location.
      </p>
    </div>
  </div>
</div>`
}
// ==================================Визначаємо напрямок вітру==============================================================
function directionOfWind(deg) {
  if (deg == 360 || deg == 0) return ' N';
  if (deg > 0 && deg < 45) return 'NNE';
  if (deg == 45) return 'NE';
  if (deg > 45 && deg < 90) return 'ENE';
  if (deg == 90) return 'E';
  if (deg > 90 && deg < 135) return 'ESE';
  if (deg == 135) return 'SE';
  if (deg > 135 && deg < 180) return 'SSE';
  if (deg == 180) return 'S';
  if (deg > 180 && deg < 225) return 'SSW';
  if (deg == 225) return 'SW';
  if (deg > 225 && deg < 270) return 'WSW';
  if (deg == 270) return 'W';
  if (deg > 270 && deg <= 315) return 'WWW';
  if (deg == 315) return 'NW';
  if (deg > 315 && deg <= 360) return 'NNW';
}
// =============================Отримуємо назву міста, яку ввів користувач==================================================
function getNameCity(e) {
  getGeocoding(nameCity);
}
// ==============================Події======================================================================================
inputSearch.addEventListener('input', function (event) {
  nameCity = this.value;
  return nameCity;
});
fiveDayForecast.addEventListener('click', function (e) {
  getFiveDayForecast(nameCity);
});
tabsToday.addEventListener('click', function (e) {
  getCurrentWeatherData(currentCityLat, currentCityLon);
 
});

searchCity.addEventListener('click', getNameCity);

navigator.geolocation.getCurrentPosition(success, error, options);
