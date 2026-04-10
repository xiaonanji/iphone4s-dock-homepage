(function () {
  var WEATHER_LOCATION = {
    name: "Sydney",
    latitude: -33.8688,
    longitude: 151.2093
  };

  var WEATHER_REFRESH_MS = 30 * 60 * 1000;
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var displayNode = document.getElementById("display");
  var hoursNode = document.getElementById("clock-hours");
  var minutesNode = document.getElementById("clock-minutes");
  var secondsNode = document.getElementById("clock-seconds");
  var dateNode = document.getElementById("date-line");
  var locationNode = document.getElementById("weather-location");
  var conditionNode = document.getElementById("weather-condition");
  var tempNode = document.getElementById("weather-temp");
  var feelsNode = document.getElementById("weather-feels");
  var highNode = document.getElementById("weather-high");
  var lowNode = document.getElementById("weather-low");
  var updatedNode = document.getElementById("weather-updated");
  var statusNode = document.getElementById("weather-status");

  function pad(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function fitDisplay() {
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 480;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 320;
    var orientationValue = window.orientation;
    var isPortrait;

    if (orientationValue === 90 || orientationValue === -90) {
      isPortrait = false;
    } else if (orientationValue === 0 || orientationValue === 180) {
      isPortrait = true;
    } else {
      isPortrait = viewportHeight > viewportWidth;
    }

    var baseWidth = isPortrait ? 296 : 456;
    var baseHeight = isPortrait ? 432 : 228;
    var horizontalPadding = isPortrait ? 16 : 4;
    var verticalPadding = isPortrait ? 18 : 4;
    var scaleX = (viewportWidth - horizontalPadding) / baseWidth;
    var scaleY = (viewportHeight - verticalPadding) / baseHeight;
    var scale = Math.min(scaleX, scaleY);

    if (scale > 2.4) {
      scale = 2.4;
    }

    displayNode.style.width = baseWidth + "px";
    displayNode.style.height = baseHeight + "px";

    if (isPortrait) {
      displayNode.style.top = "50%";
      displayNode.style.left = "50%";
      displayNode.style.marginLeft = Math.round(baseWidth / -2) + "px";
      displayNode.style.marginTop = Math.round(baseHeight / -2) + "px";
      displayNode.style.webkitTransformOrigin = "50% 50%";
      displayNode.style.transformOrigin = "50% 50%";
      displayNode.style.webkitTransform = "scale(" + scale + ")";
      displayNode.style.transform = "scale(" + scale + ")";
    } else {
      displayNode.style.top = "1px";
      displayNode.style.left = "50%";
      displayNode.style.marginLeft = Math.round(baseWidth / -2) + "px";
      displayNode.style.marginTop = "0";
      displayNode.style.webkitTransformOrigin = "50% 0";
      displayNode.style.transformOrigin = "50% 0";
      displayNode.style.webkitTransform = "scale(" + scale + ")";
      displayNode.style.transform = "scale(" + scale + ")";
    }
  }

  function updateClock() {
    var now = new Date();
    hoursNode.innerHTML = pad(now.getHours());
    minutesNode.innerHTML = pad(now.getMinutes());
    secondsNode.innerHTML = pad(now.getSeconds());
    dateNode.innerHTML = DAYS[now.getDay()] + ", " + now.getDate() + " " + MONTHS[now.getMonth()] + " " + now.getFullYear();
  }

  function weatherLabel(code) {
    if (code === 0) {
      return "Clear";
    }

    if (code === 1 || code === 2) {
      return "Partly clear";
    }

    if (code === 3) {
      return "Cloudy";
    }

    if (code === 45 || code === 48) {
      return "Fog";
    }

    if (code === 51 || code === 53 || code === 55) {
      return "Drizzle";
    }

    if (code === 56 || code === 57) {
      return "Freezing drizzle";
    }

    if (code === 61 || code === 63 || code === 65) {
      return "Rain";
    }

    if (code === 66 || code === 67) {
      return "Freezing rain";
    }

    if (code === 71 || code === 73 || code === 75 || code === 77) {
      return "Snow";
    }

    if (code === 80 || code === 81 || code === 82) {
      return "Rain showers";
    }

    if (code === 85 || code === 86) {
      return "Snow showers";
    }

    if (code === 95 || code === 96 || code === 99) {
      return "Thunderstorm";
    }

    return "Conditions unavailable";
  }

  function asTemperature(value) {
    if (typeof value !== "number" || isNaN(value)) {
      return "--\u00b0";
    }

    return Math.round(value) + "\u00b0";
  }

  function updateWeatherUI(payload) {
    if (!payload || !payload.current || !payload.daily) {
      conditionNode.innerHTML = "Weather unavailable";
      updatedNode.innerHTML = "Open-Meteo data could not be loaded.";
      statusNode.innerHTML = "Weather error";
      return;
    }

    locationNode.innerHTML = WEATHER_LOCATION.name;
    conditionNode.innerHTML = weatherLabel(payload.current.weather_code);
    tempNode.innerHTML = asTemperature(payload.current.temperature_2m);
    feelsNode.innerHTML = asTemperature(payload.current.apparent_temperature);
    highNode.innerHTML = asTemperature(payload.daily.temperature_2m_max[0]);
    lowNode.innerHTML = asTemperature(payload.daily.temperature_2m_min[0]);
    updatedNode.innerHTML = "Updated " + formatTime(new Date());
    statusNode.innerHTML = "Weather live";
  }

  function formatTime(date) {
    var hours = pad(date.getHours());
    var minutes = pad(date.getMinutes());
    return hours + ":" + minutes;
  }

  function requestWeather() {
    var endpoint = "/api/weather?latitude=" +
      encodeURIComponent(WEATHER_LOCATION.latitude) +
      "&longitude=" + encodeURIComponent(WEATHER_LOCATION.longitude) +
      "&timezone=auto";

    var request = new XMLHttpRequest();
    request.open("GET", endpoint, true);
    request.onreadystatechange = function () {
      if (request.readyState !== 4) {
        return;
      }

      if (request.status >= 200 && request.status < 300) {
        try {
          var payload = JSON.parse(request.responseText);

          if (payload && payload.error) {
            conditionNode.innerHTML = "Weather unavailable";
            updatedNode.innerHTML = payload.message || "Weather service is unavailable.";
            statusNode.innerHTML = "Weather offline";
            return;
          }

          updateWeatherUI(payload);
        } catch (error) {
          conditionNode.innerHTML = "Weather unavailable";
          updatedNode.innerHTML = "Received data could not be read.";
          statusNode.innerHTML = "Weather parse error";
        }
        return;
      }

      conditionNode.innerHTML = "Weather unavailable";
      updatedNode.innerHTML = "Network request failed.";
      statusNode.innerHTML = "Weather offline";
    };

    request.send(null);
  }

  updateClock();
  fitDisplay();
  requestWeather();

  setInterval(updateClock, 1000);
  setInterval(requestWeather, WEATHER_REFRESH_MS);
  setTimeout(fitDisplay, 350);
  setTimeout(fitDisplay, 1000);

  if (window.addEventListener) {
    window.addEventListener("resize", fitDisplay, false);
    window.addEventListener("orientationchange", function () {
      setTimeout(fitDisplay, 250);
      setTimeout(fitDisplay, 800);
    }, false);
  } else {
    window.onresize = fitDisplay;
  }
})();
