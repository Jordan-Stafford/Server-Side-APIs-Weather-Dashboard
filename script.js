// Variables
let lat = "";
let lon = "";
let citySearch = "";
let citySearchEl = document.querySelector("#presentCity");
let checkWeatherBtn = document.querySelector("#checkWeather");
let checkForecastBtn = document.querySelector("#checkForecast");
let historyBtn = document.querySelector("#history");
let clearLocalBtn = document.querySelector("#clearStorage");
let historyContainerEl = document.getElementById("historyResult");

let cityArray = [];
if (window.localStorage.getItem("city")) {
  cityArray.push(...JSON.parse(window.localStorage.getItem("city")));
}

function historySave() {
  historyContainerEl.innerHTML = "";
  for (x = cityArray.length - 1; x > cityArray.length - 6; x--) {
    let newBtn = document.createElement("button");
    newBtn.setAttribute("id", "prevHist");
    newBtn.innerHTML = cityArray[x];
    historyContainerEl.appendChild(newBtn);
    // newBtn.classList.add('prevHist');
  }
}

let prevHistBtn = document.getElementById("#prevHist");
if (prevHistBtn) {
  prevHistBtn.addEventListener("click", swapper, false, () => {
    checkWeatherBtn();
  });
}

function display(historyEl) {
  let historyContainerEl = document.getElementById("#historyResult");
  let historySpecial = localStorage.getItem(historyEl);
  historyContainerEl.innerHTML = historySpecial;
  citySearchEl.value = prevHistBtn((x = cityArray.length - 1));
}

// Save Data
let presentCondition = {
  id: "",
  temp: "",
  wind: "",
  humidity: "",
  UVIndex: "",
  clouds: "",
};

// Get Lat & Long
let getCityLatLon = function (citySearch) {
  citySearch = citySearchEl.value;
  if (citySearch) {
    let apiSearch =
      "https://api.openweathermap.org/geo/1.0/direct?q=" +
      citySearch +
      "&limit=1&appid=9087d0900e6a038fb8bf1b65a574774d";
    fetch(apiSearch).then(function (response) {
      response.json().then(function (data) {
        lat = data[0].lat;
        lon = data[0].lon;
        getWeatherData(lat, lon);
      });
    });
    cityArray.push(citySearch);
    console.log(cityArray);
    window.localStorage.setItem("city", JSON.stringify(cityArray));
  } else {
    alert("Enter a City Name");
  }
};
// Call Weather Data
let getWeatherData = function (lat, lon) {
  let latLon =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    lat +
    "&lon=" +
    lon +
    "&units=imperial&exclude=minutely,hourly,alerts&appid=9087d0900e6a038fb8bf1b65a574774d";
  console.log(latLon);
  fetch(latLon).then(function (response) {
    response.json().then(function (data) {
      console.log(data);
      presentCondition.id = data.current.weather[0].id;
      presentCondition.temp = data.current.temp;
      presentCondition.wind = data.current.wind_speed;
      presentCondition.humidity = data.current.humidity;
      presentCondition.UVIndex = data.current.uvi;
      presentCondition.clouds = data.current.clouds;
      displayWeather();
    });
  });
};

// Add weather + display weather
let displayWeather = function () {
  let presentCityEl = document.querySelector("#currentWeather");
  let presentCityUvEl = document.createElement("p");
  let presentCitySearchEl = document.createElement("p");
  let presentCityTempEl = document.createElement("p");
  let presentCityWindEl = document.createElement("p");
  let presentCityHumidityEl = document.createElement("p");
  let presentCityClouds = document.createElement("i");
  presentCityEl.innerHTML = "";
  presentCitySearchEl.textContent = citySearch;
  presentCityTempEl.textContent =
    "Temperature: " + presentCondition.temp + "°F";
  presentCityWindEl.textContent =
    "Wind Speeds: " + presentCondition.wind + "MPH";
  presentCityHumidityEl.textContent =
    "Humidity: " + presentCondition.humidity + "%";
  presentCityUvEl.textContent = "UV Index: " + presentCondition.UVIndex;
  presentCityEl.appendChild(presentCitySearchEl);
  presentCityEl.appendChild(presentCityTempEl);
  presentCityEl.appendChild(presentCityWindEl);
  presentCityEl.appendChild(presentCityHumidityEl);
  presentCityEl.appendChild(presentCityUvEl);
};

// Forecast API
// Get Lat & Long
let gotPosition = function (citySearch) {
  citySearch = citySearchEl.value;
  if (citySearch) {
    let apiSearch =
      "https://api.openweathermap.org/geo/1.0/direct?q=" +
      citySearch +
      "&limit=1&appid=9087d0900e6a038fb8bf1b65a574774d";
    fetch(apiSearch).then(function (response) {
      response.json().then(function (data) {
        lat = data[0].lat;
        lon = data[0].lon;
        getForecast(lat, lon);
      });
    });
  } else {
    alert("Enter a City Name");
  }
};

// Call Forecast Data
let getForecast = function (lat, lon) {
  let url =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    lat +
    "&lon=" +
    lon +
    "&exclude=current,minutely,hourly&appid=9087d0900e6a038fb8bf1b65a574774d";
  getWeatherText(url);
};

async function getWeatherText(url) {
  let weatherObject = await fetch(url);
  let weatherText = await weatherObject.text();
  parseWeather(weatherText);
}

// Piece Together Forcast
let parseWeather = function (weatherText) {
  let weatherJSON = JSON.parse(weatherText);
  let dailyForecast = weatherJSON.daily;
  document.getElementById("forecast").innerHTML = "";
  for (x = 1; x < dailyForecast.length; x++) {
    let day = dailyForecast[x];
    let today = new Date().getDay() + x;
    if (today > 6) {
      today = today - 7;
    }
    let dayOfWeek = getWeekday(today);
    let icon = day.weather[0].icon;
    let highTemp = temperatureConversion(day.temp.max);
    let lowTemp = temperatureConversion(day.temp.min);
    let humidity = day.humidity;
    let windSpeed = day.wind_speed;
    let windGust = day.wind_gust;
    let UVIndex = day.uvi;
    displayWeatherDay(
      dayOfWeek,
      icon,
      highTemp,
      lowTemp,
      humidity,
      windSpeed,
      windGust,
      UVIndex
    );
  }
};

let displayWeatherDay = function (
  dayOfWeek,
  icon,
  highTemp,
  lowTemp,
  humidity,
  windSpeed,
  windGust,
  UVIndex
) {
  let out =
    "<div class='forecastContainer'><img src='http://openweathermap.org/img/wn/" +
    icon +
    ".png'/>";
  out += "<h2>" + dayOfWeek + "</h2>";
  out += "<p>Temperature: " + highTemp + "°F to " + lowTemp + "°F</p>";
  out += "<p>Humidity: " + humidity + "%</p>";
  out +=
    "<p>Wind Speeds: " +
    Math.round(windSpeed) +
    " to " +
    Math.round(windGust) +
    " MPH </p> ";
  out += "<p>UV Index: " + UVIndex + "</p></div>";
  document.getElementById("forecast").innerHTML += out;
};

// Days of the Week
let getWeekday = function (dayNumber) {
  var weekday = new Array(7);
  weekday[0] = "Sunday";
  weekday[1] = "Monday";
  weekday[2] = "Tuesday";
  weekday[3] = "Wednesday";
  weekday[4] = "Thursday";
  weekday[5] = "Friday";
  weekday[6] = "Saturday";

  return weekday[dayNumber];
};

// Temperature & Time
let temperatureConversion = function (kelvinTemperature) {
  const celsius = kelvinTemperature - 273;
  const fahrenheit = Math.floor(celsius * (9 / 5) + 32);
  return fahrenheit;
};

let timestampToTime = function (timeStamp) {
  let date = new Date(timeStamp * 1000);
  let hours = date.getHours();
  let minutes = "";
  if (date.getMinutes() < 10) {
    minutes = "0" + date.getMinutes();
  } else {
    minutes = date.getMinutes();
  }
  return hours + ":" + minutes;
};

// Working Button
checkWeatherBtn.addEventListener("click", () => {
  getCityLatLon();
  gotPosition();
  historySave();
});
// checkForecastBtn.addEventListener("click", gotPosition);
// historyBtn.addEventListener("click", historySave);
// clearLocalBtn.addEventListener("click", deleteData);
