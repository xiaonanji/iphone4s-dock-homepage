(function () {
  var WEATHER_LOCATION = {
    name: "Sydney",
    latitude: -33.8688,
    longitude: 151.2093
  };

  var WEATHER_REFRESH_MS = 30 * 60 * 1000;
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var DAY_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  var MONTH_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var displayNode = document.getElementById("display");
  var hoursNode = document.getElementById("clock-hours");
  var minutesNode = document.getElementById("clock-minutes");
  var dateNode = document.getElementById("date-line");
  var weekdayNode = document.getElementById("weekday-line");
  var iconNode = document.getElementById("weather-icon");
  var conditionNode = document.getElementById("weather-condition");
  var tempNode = document.getElementById("weather-temp");
  var rangeNode = document.getElementById("weather-range");

  function pad(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function fitDisplay() {
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 480;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 320;
    var orientationValue = window.orientation;
    var isPortrait;
    var scale;
    var scaleX;
    var targetScaleY;
    var landscapeHeightRatio = 1;

    if (orientationValue === 90 || orientationValue === -90) {
      isPortrait = false;
    } else if (orientationValue === 0 || orientationValue === 180) {
      isPortrait = true;
    } else {
      isPortrait = viewportHeight > viewportWidth;
    }

    var baseWidth = isPortrait ? 296 : 438;
    var baseHeight = isPortrait ? 432 : 238;
    var horizontalPadding = isPortrait ? 16 : 4;
    var verticalPadding = isPortrait ? 18 : 0;

    scaleX = (viewportWidth - horizontalPadding) / baseWidth;
    targetScaleY = ((viewportHeight - verticalPadding) * landscapeHeightRatio) / baseHeight;

    if (isPortrait) {
      scale = Math.min(scaleX, (viewportHeight - verticalPadding) / baseHeight);
    } else {
      scale = Math.min(scaleX, targetScaleY);
    }

    if (scale > 2.4) {
      scale = 2.4;
    }

    if (isPortrait) {
      displayNode.style.width = baseWidth + "px";
      displayNode.style.height = baseHeight + "px";
      displayNode.style.top = "50%";
      displayNode.style.left = "50%";
      displayNode.style.marginLeft = Math.round(baseWidth / -2) + "px";
      displayNode.style.marginTop = Math.round(baseHeight / -2) + "px";
      displayNode.style.borderRadius = "";
      displayNode.style.webkitTransformOrigin = "50% 50%";
      displayNode.style.transformOrigin = "50% 50%";
      displayNode.style.webkitTransform = "scale(" + scale + ")";
      displayNode.style.transform = "scale(" + scale + ")";
    } else {
      displayNode.style.width = viewportWidth + "px";
      displayNode.style.height = viewportHeight + "px";
      displayNode.style.top = "0";
      displayNode.style.left = "0";
      displayNode.style.marginLeft = "0";
      displayNode.style.marginTop = "0";
      displayNode.style.borderRadius = "0";
      displayNode.style.webkitTransformOrigin = "50% 50%";
      displayNode.style.transformOrigin = "50% 50%";
      displayNode.style.webkitTransform = "";
      displayNode.style.transform = "";
    }
  }

  function updateClock() {
    var now = new Date();
    hoursNode.innerHTML = pad(now.getHours());
    minutesNode.innerHTML = pad(now.getMinutes());
    dateNode.innerHTML = MONTH_SHORT[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear();
    weekdayNode.innerHTML = DAY_SHORT[now.getDay()];
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

  function weatherIconMarkup(code) {
    if (code === 0 || code === 1) {
      return '<svg viewBox="0 0 64 44" xmlns="http://www.w3.org/2000/svg"><circle cx="21" cy="18" r="11" fill="#ffe64b"/><g fill="#fffdf8"><circle cx="34" cy="24" r="11"/><circle cx="24" cy="28" r="9"/><circle cx="44" cy="28" r="8"/><rect x="24" y="24" width="28" height="12" rx="6"/></g></svg>';
    }

    if (code === 2 || code === 3 || code === 45 || code === 48) {
      return '<svg viewBox="0 0 64 44" xmlns="http://www.w3.org/2000/svg"><g fill="#fffdf8"><circle cx="28" cy="23" r="11"/><circle cx="18" cy="27" r="9"/><circle cx="40" cy="27" r="8"/><rect x="18" y="23" width="30" height="12" rx="6"/></g></svg>';
    }

    return '<svg viewBox="0 0 64 44" xmlns="http://www.w3.org/2000/svg"><g fill="#fffdf8"><circle cx="28" cy="20" r="11"/><circle cx="18" cy="24" r="9"/><circle cx="40" cy="24" r="8"/><rect x="18" y="20" width="30" height="12" rx="6"/></g><g fill="#00ff41"><path d="M18 39c2-4 2-4 4 0a3 3 0 1 1-4 0z"/><path d="M31 39c2-4 2-4 4 0a3 3 0 1 1-4 0z"/><path d="M44 39c2-4 2-4 4 0a3 3 0 1 1-4 0z"/></g></svg>';
  }

  function updateWeatherUI(payload) {
    if (!payload || !payload.current || !payload.daily) {
      conditionNode.innerHTML = "Weather unavailable";
      iconNode.innerHTML = "";
      rangeNode.innerHTML = "-- / --";
      tempNode.innerHTML = "--&deg;C";
      return;
    }

    conditionNode.innerHTML = weatherLabel(payload.current.weather_code);
    iconNode.innerHTML = weatherIconMarkup(payload.current.weather_code);
    tempNode.innerHTML = asTemperature(payload.current.temperature_2m) + "C";
    rangeNode.innerHTML = asTemperature(payload.daily.temperature_2m_min[0]) + " - " + asTemperature(payload.daily.temperature_2m_max[0]);
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
            iconNode.innerHTML = "";
            rangeNode.innerHTML = payload.message || "-- / --";
            tempNode.innerHTML = "--&deg;C";
            return;
          }

          updateWeatherUI(payload);
        } catch (error) {
          conditionNode.innerHTML = "Weather unavailable";
          iconNode.innerHTML = "";
          rangeNode.innerHTML = "DATA ERROR";
          tempNode.innerHTML = "--&deg;C";
        }
        return;
      }

      conditionNode.innerHTML = "Weather unavailable";
      iconNode.innerHTML = "";
      rangeNode.innerHTML = "NETWORK ERROR";
      tempNode.innerHTML = "--&deg;C";
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

  // ── Bunny runner ────────────────────────────────────────────
  var charCanvas = document.getElementById("char-sprite");
  if (charCanvas) {
    var raf = window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              function (fn) { return setTimeout(fn, 16); };

    var BUNNY_TYPES = [
      "BlackWhite", "Brown2Color", "BrownWhite", "BunnyBlack",
      "BunnyBrown", "DemonicBunny", "FantasyBunny",
      "GreyBunny", "LightBrown", "WhiteBunny"
    ];

    // All Running sheets are 256×32 — 8 frames of 32×32
    var FRAME_W    = 32;
    var FRAME_H    = 32;
    var RUN_FRAMES = 8;
    var SCALE      = 2;          // 64×64 px canvas — fills the 70px strip
    var CW         = FRAME_W * SCALE;
    var CH         = FRAME_H * SCALE;

    charCanvas.width  = CW;
    charCanvas.height = CH;

    // Pre-load every Running sheet
    var sprites = {};
    BUNNY_TYPES.forEach(function (name) {
      var img = new Image();
      img.src = "AllBunniesFree/" + name + "/Running.png";
      sprites[name] = img;
    });

    var cType   = BUNNY_TYPES[Math.floor(Math.random() * BUNNY_TYPES.length)];
    var cX      = -CW;
    var cFrame  = 0;
    var cFrameT = 0;
    var cLastT  = null;

    var RUN_SPEED  = 130;  // px/s
    var FRAME_RATE = 0.09; // s per animation frame

    function nextBunny() {
      var pool = BUNNY_TYPES.filter(function (n) { return n !== cType; });
      cType   = pool[Math.floor(Math.random() * pool.length)];
      cX      = -CW;
      cFrame  = 0;
      cFrameT = 0;
    }

    function bunnyTick(ts) {
      if (cLastT === null) { cLastT = ts; raf(bunnyTick); return; }
      var dt = Math.min((ts - cLastT) / 1000, 0.05);
      cLastT = ts;

      cX      += RUN_SPEED * dt;
      cFrameT += dt;
      if (cFrameT >= FRAME_RATE) {
        cFrameT = 0;
        cFrame  = (cFrame + 1) % RUN_FRAMES;
      }

      var vw = window.innerWidth || 480;
      if (cX > vw + CW) {
        nextBunny();
      }

      var img = sprites[cType];
      if (img && img.complete && img.naturalWidth > 0) {
        var ctx = charCanvas.getContext("2d");
        ctx.clearRect(0, 0, CW, CH);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, cFrame * FRAME_W, 0, FRAME_W, FRAME_H, 0, 0, CW, CH);
      }

      charCanvas.style.left = Math.round(cX) + "px";
      raf(bunnyTick);
    }

    raf(bunnyTick);
  }
  // ────────────────────────────────────────────────────────────

  // ── Daily math formula ──────────────────────────────────────
  var formulaLabel = document.getElementById("formula-label");
  var formulaKatex = document.getElementById("formula-katex");

  function getDayOfYear() {
    var now   = new Date();
    var start = new Date(now.getFullYear(), 0, 1);
    return Math.floor((now - start) / 86400000); // 0-indexed
  }

  function renderFormula(formulas) {
    if (!formulas || !formulas.length) { return; }
    var idx     = getDayOfYear() % formulas.length;
    var formula = formulas[idx];
    formulaLabel.textContent = formula.title || "";
    formulaKatex.innerHTML = "\\(" + (formula.latex || "") + "\\)";
    if (window.MathJax) {
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, formulaKatex]);
    }
  }

  // Fetch formulas
  var req = new XMLHttpRequest();
  req.open("GET", "/math_formulas_year9_12_365_english.json", true);
  req.onreadystatechange = function () {
    if (req.readyState !== 4) { return; }
    if (req.status >= 200 && req.status < 300) {
      try {
        var formulas = JSON.parse(req.responseText);
        renderFormula(formulas);
      } catch (e) {}
    }
  };
  req.send(null);
  // ────────────────────────────────────────────────────────────
})();
