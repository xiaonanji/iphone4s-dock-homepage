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
    weekdayNode.innerHTML = DAYS[now.getDay()].toUpperCase();
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

  // ── Animal runner (bunnies + cats with multiple animations) ──
  var charCanvas = document.getElementById("char-sprite");
  if (charCanvas) {
    var raf = window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              function (fn) { return setTimeout(fn, 16); };

    // Per-animation-type properties. startOffset (0–1) makes slow anims
    // appear partway across the screen so they don't take forever to exit.
    var ANIM_PROPS = {
      run:    { frames: 7,  speed: 130, frameRate: 0.09 },
      jump:   { frames: 13, speed: 155, frameRate: 0.07 },
      idle:   { frames: 7,  speed:  25, frameRate: 0.13 },
      idle2:  { frames: 14, speed:  25, frameRate: 0.10 },
      attack: { frames: 9,  speed: 110, frameRate: 0.08 },
      hurt:   { frames: 7,  speed:  55, frameRate: 0.09 },
      sit:    { frames: 3,  speed:  30, frameRate: 0.22, startOffset: 0.35 },
      lick:   { frames: 18, speed:  30, frameRate: 0.08, startOffset: 0.35 }
    };

    // Cat groups — null means that animation isn't available for this cat.
    // Filenames match exactly what's on disk (the extra t/b/d suffixes vary per pack).
    var CAT_GROUPS = [
      { base: "Cats/BrownCat/",                  run:"RunCattt.png",   idle:"IdleCattt.png",   idle2:"Idle2Cattt.png",  jump:"JumpCatttt.png",  attack:"AttackCattt.png", hurt:"HurtCatttt.png",  sit:"Sittinggg.png"  },
      { base: "Cats/ChristmasCatPaid/",           run:"RunCattt.png",   idle:"IdleCattt.png",   idle2:"Idle2Cattt.png",  jump:"JumpCatttt.png",  attack:"AttackCattt.png", hurt:"HurtCatttt.png",  sit:"Sittinggg.png"  },
      { base: "Cats/Siamese/PNG/",                run:"RunCattt.png",   idle:"IdleCattt.png",   idle2:"Idle2Cattt.png",  jump:"JumpCatttt.png",  attack:"AttackCattt.png", hurt:"HurtCatttt.png",  sit:"Sittinggg.png"  },
      { base: "Cats/EgyptCatPaid/",               run:"RunCatb.png",    idle:"IdleCatb.png",    idle2:"Idle2Catb.png",   jump:"JumpCabt.png",    attack:"AttackCatb.png",  hurt:"HurtCatb.png",    sit:"Sittingb.png"   },
      { base: "Cats/BlackCat/PNG/",               run:"RunCatb.png",    idle:"IdleCatb.png",    idle2:"Idle2Catb.png",   jump:"JumpCabt.png",    attack:"AttackCatb.png",  hurt:"HurtCatb.png",    sit:"Sittingb.png"   },
      { base: "Cats/Halloween/Vampire/",           run:"RunCatb.png",    idle:"IdleCatb.png",    idle2:"Idle2Catb.png",   jump:"JumpCabt.png",    attack:"AttackCatb.png",  hurt:"HurtCatb.png",    sit:"Sittingb.png"   },
      { base: "Cats/ThreeColorPaid/",             run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png"   },
      { base: "Cats/TigerCatPaid/PNG/",           run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png"   },
      { base: "Cats/BatmanCatPaid/BlackMask/",    run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:null,              jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png"   },
      { base: "Cats/BatmanCatPaid/DarkBlueMask/", run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:null,              jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png"   },
      { base: "Cats/White-DifferentEyes/",        run:"RunCatttt.png",  idle:"IdleCatttt.png",  idle2:"Idle2Catttt.png", jump:"JumpCattttt.png", attack:"AttackCattt.png", hurt:"HurtCattttt.png", sit:"Sittingggg.png" },
      { base: "Cats/DemonicPaid/PNG/",            run:"RunCatd.png",    idle:"IdleCatd.png",    idle2:"Idle2Catd.png",   jump:"JumpCatd.png",    attack:"AttackCatd.png",  hurt:"HurtCatd.png",    sit:"Sittingd.png"   },
      { base: "Cats/CatClassical/BlackCollor/",   run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png",  lick:"Liking.png" },
      { base: "Cats/CatClassical/BlueCollar/",    run:"RunCat.png",     idle:"IdleCat.png",     idle2:"Idle2Cat.png",    jump:"JumpCat.png",     attack:"AttackCat.png",   hurt:"HurtCat.png",     sit:"Sitting.png",   lick:"Liking.png" },
      { base: "Cats/CatClassical/GreenCollor/",   run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png",  lick:"Liking.png" },
      { base: "Cats/CatClassical/OrangeCollor/",  run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png",  lick:"Liking.png" },
      { base: "Cats/CatClassical/PinkCollor/",    run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png",  lick:"Liking.png" },
      { base: "Cats/CatClassical/PurpleCollor/",  run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png",  lick:"Liking.png" },
      { base: "Cats/CatClassical/RedCollor/",     run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png",  lick:"Liking.png" },
      { base: "Cats/CatClassical/YellowCollor/",  run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png",  lick:"Liking.png" },
      { base: "Cats/Halloween/Wizard/",            run:"RunCatb.png",    idle:"IdleCatb.png",    idle2:"Idle2Catb.png",   jump:null,              attack:null,              hurt:"HurtCatb.png",    sit:"Sittingb.png"   }
    ];

    // Start with bunnies (always running, 8 frames)
    var CHARACTERS = [
      { src: "AllBunniesFree/BlackWhite/Running.png",   frames: 8, speed: 130, frameRate: 0.09 },
      { src: "AllBunniesFree/Brown2Color/Running.png",  frames: 8, speed: 130, frameRate: 0.09 },
      { src: "AllBunniesFree/BrownWhite/Running.png",   frames: 8, speed: 130, frameRate: 0.09 },
      { src: "AllBunniesFree/BunnyBlack/Running.png",   frames: 8, speed: 130, frameRate: 0.09 },
      { src: "AllBunniesFree/BunnyBrown/Running.png",   frames: 8, speed: 130, frameRate: 0.09 },
      { src: "AllBunniesFree/DemonicBunny/Running.png", frames: 8, speed: 130, frameRate: 0.09 },
      { src: "AllBunniesFree/FantasyBunny/Running.png", frames: 8, speed: 130, frameRate: 0.09 },
      { src: "AllBunniesFree/GreyBunny/Running.png",    frames: 8, speed: 130, frameRate: 0.09 },
      { src: "AllBunniesFree/LightBrown/Running.png",   frames: 8, speed: 130, frameRate: 0.09 },
      { src: "AllBunniesFree/WhiteBunny/Running.png",   frames: 8, speed: 130, frameRate: 0.09 },
      { src: "Cats/BONUSgift/GreyBunnyPaid/Running.png",frames: 8, speed: 130, frameRate: 0.09 }
    ];

    // Expand each cat group into one entry per animation type
    var animKeys = ["run","jump","idle","idle2","attack","hurt","sit","lick"];
    CAT_GROUPS.forEach(function (cat) {
      for (var i = 0; i < animKeys.length; i++) {
        var key  = animKeys[i];
        var file = cat[key];
        if (!file) { continue; }
        var props = ANIM_PROPS[key];
        var entry = { src: cat.base + file, frames: props.frames, speed: props.speed, frameRate: props.frameRate };
        if (props.startOffset) { entry.startOffset = props.startOffset; }
        CHARACTERS.push(entry);
      }
    });

    var FRAME_W = 32;
    var FRAME_H = 32;
    var SCALE   = 2;
    var CW      = FRAME_W * SCALE;
    var CH      = FRAME_H * SCALE;

    charCanvas.width  = CW;
    charCanvas.height = CH;

    // Pre-load all sprites up front
    CHARACTERS.forEach(function (c) {
      var img = new Image();
      img.src = c.src;
      c.img = img;
    });

    var cIdx    = Math.floor(Math.random() * CHARACTERS.length);
    var cX      = -CW;
    var cFrame  = 0;
    var cFrameT = 0;
    var cLastT  = null;

    function nextCharacter() {
      var next;
      do {
        next = Math.floor(Math.random() * CHARACTERS.length);
      } while (next === cIdx && CHARACTERS.length > 1);
      cIdx = next;
      var vw = window.innerWidth || 480;
      cX      = CHARACTERS[cIdx].startOffset ? Math.floor(CHARACTERS[cIdx].startOffset * vw) : -CW;
      cFrame  = 0;
      cFrameT = 0;
    }

    function bunnyTick(ts) {
      if (cLastT === null) { cLastT = ts; raf(bunnyTick); return; }
      var dt   = Math.min((ts - cLastT) / 1000, 0.05);
      cLastT   = ts;

      var char = CHARACTERS[cIdx];

      cX      += char.speed * dt;
      cFrameT += dt;
      if (cFrameT >= char.frameRate) {
        cFrameT = 0;
        cFrame  = (cFrame + 1) % char.frames;
      }

      var vw = window.innerWidth || 480;
      if (cX > vw + CW) { nextCharacter(); }

      var img = char.img;
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
