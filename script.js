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

  // ── Sprite character ───────────────────────────────────────
  var charCanvas = document.getElementById("char-sprite");
  if (charCanvas) {
    var raf = window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              function (fn) { return setTimeout(fn, 16); };

    // Spritesheet layout: 4 columns (frames) × 4 rows (directions)
    // Row 0 = walk down, 1 = walk left, 2 = walk right, 3 = walk up
    var SPRITE_COLS = 4;
    var SPRITE_ROWS = 4;
    var ROW_RIGHT = 2;
    var ROW_LEFT  = 1;
    var ROW_IDLE  = 0;

    var spriteImg    = new Image();
    var spriteReady  = false;
    var frameW       = 0;
    var frameH       = 0;
    var displayScale = 3;

    // Walk state
    var cX       = -80;
    var cRow     = ROW_RIGHT;
    var cFrame   = 0;
    var cFrameT  = 0;
    var cStateT  = 0;
    var cLastT   = null;
    var cIdle    = false;
    var cIdleEnd = 0;

    var WALK_SPEED    = 40;   // px per second
    var FRAME_RATE    = 0.18; // seconds per animation frame
    var IDLE_FRAME_RATE = 0.5;

    spriteImg.onload = function () {
      frameW = spriteImg.naturalWidth  / SPRITE_COLS;
      frameH = spriteImg.naturalHeight / SPRITE_ROWS;
      var stripH = 70;
      displayScale = Math.max(1, Math.min(4, Math.floor((stripH - 4) / frameH)));
      charCanvas.width  = Math.round(frameW * displayScale);
      charCanvas.height = Math.round(frameH * displayScale);
      spriteReady = true;
    };
    spriteImg.src = "Basic Charakter Spritesheet.png";

    function drawFrame() {
      var ctx = charCanvas.getContext("2d");
      ctx.clearRect(0, 0, charCanvas.width, charCanvas.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        spriteImg,
        cFrame * frameW, cRow * frameH, frameW, frameH,
        0, 0, charCanvas.width, charCanvas.height
      );
    }

    function charTick(ts) {
      if (!spriteReady) { raf(charTick); return; }
      if (cLastT === null) { cLastT = ts; raf(charTick); return; }
      var dt = Math.min((ts - cLastT) / 1000, 0.05);
      cLastT  = ts;
      cFrameT += dt;
      cStateT += dt;

      var vw = window.innerWidth || 480;

      if (cIdle) {
        // Stand still facing forward; cycle idle frames slowly
        cRow = ROW_IDLE;
        if (cFrameT >= IDLE_FRAME_RATE) {
          cFrameT = 0;
          cFrame  = (cFrame + 1) % SPRITE_COLS;
        }
        if (cStateT >= cIdleEnd) {
          cIdle   = false;
          cRow    = ROW_RIGHT;
          cFrame  = 0;
          cFrameT = 0;
          cStateT = 0;
        }
      } else {
        // Walk right
        cRow = ROW_RIGHT;
        cX  += WALK_SPEED * dt;
        if (cFrameT >= FRAME_RATE) {
          cFrameT = 0;
          cFrame  = (cFrame + 1) % SPRITE_COLS;
        }
        // Occasionally pause mid-screen for 1.5–3 s
        if (cX > vw * 0.3 && cX < vw * 0.7 && Math.random() < dt * 0.15) {
          cIdle    = true;
          cIdleEnd = 1.5 + Math.random() * 1.5;
          cStateT  = 0;
          cFrame   = 0;
        }
        // Wrap: reappear from left
        if (cX > vw + charCanvas.width) {
          cX = -charCanvas.width;
        }
      }

      drawFrame();
      charCanvas.style.left = Math.round(cX) + "px";
      raf(charTick);
    }

    raf(charTick);
  }
  // ───────────────────────────────────────────────────────────

  // ── Daily math formula ──────────────────────────────────────
  var dogStripEl   = document.getElementById("dog-strip");
  var mathStripEl  = document.getElementById("math-strip");
  var formulaLabel = document.getElementById("formula-label");
  var formulaKatex = document.getElementById("formula-katex");
  var toggleBtn    = document.getElementById("strip-toggle");

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

  function applyMode(mode) {
    if (mode === "math") {
      dogStripEl.classList.add("math-mode");
    } else {
      dogStripEl.classList.remove("math-mode");
    }
    try { localStorage.setItem("displayMode", mode); } catch (e) {}
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var current = dogStripEl.classList.contains("math-mode") ? "math" : "dog";
      applyMode(current === "math" ? "dog" : "math");
    });
  }

  // Restore last mode
  var savedMode = "dog";
  try { savedMode = localStorage.getItem("displayMode") || "dog"; } catch (e) {}
  applyMode(savedMode);

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
