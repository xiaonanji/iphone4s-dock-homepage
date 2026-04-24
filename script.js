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
    checkFormulaDay();
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

  // ── Animal runner — state-machine behaviour ──────────────────
  var charCanvas = document.getElementById("char-sprite");
  if (charCanvas) {
    var raf = window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              function (fn) { return setTimeout(fn, 16); };

    // Frame counts per animation type (all 32×32 tiles)
    var ANIM_FRAMES = { run:7, jump:13, idle:7, idle2:14, attack:9, hurt:7, sit:3, lick:18 };

    // Per-state speed, frame rate, and how long the state lasts before transitioning
    var STATE_PROPS = {
      run:    { speed:130, frameRate:0.09, minDur:1.5, maxDur:4.0 },
      jump:   { speed:155, frameRate:0.07, minDur:0.6, maxDur:1.8 },
      idle:   { speed:  0, frameRate:0.13, minDur:1.0, maxDur:2.5 },
      idle2:  { speed:  0, frameRate:0.10, minDur:2.0, maxDur:5.0 },
      sit:    { speed:  0, frameRate:0.22, minDur:1.5, maxDur:3.5 },
      lick:   { speed:  0, frameRate:0.08, minDur:2.0, maxDur:5.0 },
      attack: { speed:110, frameRate:0.08, minDur:0.8, maxDur:2.5 },
      hurt:   { speed: 55, frameRate:0.09, minDur:0.8, maxDur:2.0 }
    };

    // Weighted transitions — s=next state, w=weight
    var TRANSITIONS = {
      run:    [{ s:"run",w:5 },{ s:"jump",w:3 },{ s:"idle",w:2 },{ s:"attack",w:2 },{ s:"hurt",w:1 }],
      jump:   [{ s:"run",w:6 },{ s:"jump",w:2 },{ s:"idle",w:1 }],
      idle:   [{ s:"run",w:5 },{ s:"idle2",w:2 },{ s:"sit",w:1 },{ s:"lick",w:1 }],
      idle2:  [{ s:"run",w:7 },{ s:"sit",w:1 }],
      sit:    [{ s:"run",w:8 },{ s:"idle",w:1 }],
      lick:   [{ s:"run",w:6 },{ s:"idle",w:2 }],
      attack: [{ s:"run",w:6 },{ s:"jump",w:2 },{ s:"idle",w:1 }],
      hurt:   [{ s:"run",w:5 },{ s:"idle",w:2 }]
    };

    // Cat definitions — null = animation not available for this cat
    var CAT_GROUPS = [
      { base:"Cats/BrownCat/",                  run:"RunCattt.png",   idle:"IdleCattt.png",   idle2:"Idle2Cattt.png",  jump:"JumpCatttt.png",  attack:"AttackCattt.png", hurt:"HurtCatttt.png",  sit:"Sittinggg.png"  },
      { base:"Cats/ChristmasCatPaid/",           run:"RunCattt.png",   idle:"IdleCattt.png",   idle2:"Idle2Cattt.png",  jump:"JumpCatttt.png",  attack:"AttackCattt.png", hurt:"HurtCatttt.png",  sit:"Sittinggg.png"  },
      { base:"Cats/Siamese/PNG/",                run:"RunCattt.png",   idle:"IdleCattt.png",   idle2:"Idle2Cattt.png",  jump:"JumpCatttt.png",  attack:"AttackCattt.png", hurt:"HurtCatttt.png",  sit:"Sittinggg.png"  },
      { base:"Cats/EgyptCatPaid/",               run:"RunCatb.png",    idle:"IdleCatb.png",    idle2:"Idle2Catb.png",   jump:"JumpCabt.png",    attack:"AttackCatb.png",  hurt:"HurtCatb.png",    sit:"Sittingb.png"   },
      { base:"Cats/BlackCat/PNG/",               run:"RunCatb.png",    idle:"IdleCatb.png",    idle2:"Idle2Catb.png",   jump:"JumpCabt.png",    attack:"AttackCatb.png",  hurt:"HurtCatb.png",    sit:"Sittingb.png"   },
      { base:"Cats/Halloween/Vampire/",           run:"RunCatb.png",    idle:"IdleCatb.png",    idle2:"Idle2Catb.png",   jump:"JumpCabt.png",    attack:"AttackCatb.png",  hurt:"HurtCatb.png",    sit:"Sittingb.png"   },
      { base:"Cats/ThreeColorPaid/",             run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png"   },
      { base:"Cats/TigerCatPaid/PNG/",           run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png"   },
      { base:"Cats/BatmanCatPaid/BlackMask/",    run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:null,              jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png"   },
      { base:"Cats/BatmanCatPaid/DarkBlueMask/", run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:null,              jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png"   },
      { base:"Cats/White-DifferentEyes/",        run:"RunCatttt.png",  idle:"IdleCatttt.png",  idle2:"Idle2Catttt.png", jump:"JumpCattttt.png", attack:"AttackCattt.png", hurt:"HurtCattttt.png", sit:"Sittingggg.png" },
      { base:"Cats/DemonicPaid/PNG/",            run:"RunCatd.png",    idle:"IdleCatd.png",    idle2:"Idle2Catd.png",   jump:"JumpCatd.png",    attack:"AttackCatd.png",  hurt:"HurtCatd.png",    sit:"Sittingd.png"   },
      { base:"Cats/CatClassical/BlackCollor/",   run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png",  lick:"Liking.png" },
      { base:"Cats/CatClassical/BlueCollar/",    run:"RunCat.png",     idle:"IdleCat.png",     idle2:"Idle2Cat.png",    jump:"JumpCat.png",     attack:"AttackCat.png",   hurt:"HurtCat.png",     sit:"Sitting.png",   lick:"Liking.png" },
      { base:"Cats/CatClassical/GreenCollor/",   run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png",  lick:"Liking.png" },
      { base:"Cats/CatClassical/OrangeCollor/",  run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png",  lick:"Liking.png" },
      { base:"Cats/CatClassical/PinkCollor/",    run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png",  lick:"Liking.png" },
      { base:"Cats/CatClassical/PurpleCollor/",  run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png",  lick:"Liking.png" },
      { base:"Cats/CatClassical/RedCollor/",     run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png",  lick:"Liking.png" },
      { base:"Cats/CatClassical/YellowCollor/",  run:"RunCatt.png",    idle:"IdleCatt.png",    idle2:"Idle2Catt.png",   jump:"JumpCattt.png",   attack:"AttackCatt.png",  hurt:"HurtCattt.png",   sit:"Sittingg.png",  lick:"Liking.png" },
      { base:"Cats/Halloween/Wizard/",            run:"RunCatb.png",    idle:"IdleCatb.png",    idle2:"Idle2Catb.png",   jump:null,              attack:null,              hurt:"HurtCatb.png",    sit:"Sittingb.png"   }
    ];

    // Build character pool — each entry holds all its preloaded animation images
    var CHAR_POOL = [];

    var BUNNY_NAMES = ["BlackWhite","Brown2Color","BrownWhite","BunnyBlack","BunnyBrown",
                       "DemonicBunny","FantasyBunny","GreyBunny","LightBrown","WhiteBunny"];
    BUNNY_NAMES.forEach(function (name) {
      CHAR_POOL.push({ w:1, anims: { run: { src:"AllBunniesFree/"+name+"/Running.png", frames:8 } } });
    });
    CHAR_POOL.push({ w:1, anims: { run: { src:"Cats/BONUSgift/GreyBunnyPaid/Running.png", frames:8 } } });

    var catAnimKeys = ["run","jump","idle","idle2","attack","hurt","sit","lick"];
    CAT_GROUPS.forEach(function (cat) {
      var charAnims = {};
      for (var i = 0; i < catAnimKeys.length; i++) {
        var key = catAnimKeys[i];
        if (cat[key]) { charAnims[key] = { src: cat.base + cat[key], frames: ANIM_FRAMES[key] }; }
      }
      CHAR_POOL.push({ w:2, anims: charAnims });
    });

    // Preload every image up front
    CHAR_POOL.forEach(function (char) {
      var keys = Object.keys(char.anims);
      for (var i = 0; i < keys.length; i++) {
        var a = char.anims[keys[i]];
        var img = new Image();
        img.src = a.src;
        a.img = img;
      }
    });

    var FRAME_W = 32, FRAME_H = 32, SCALE = 2;
    var CW = FRAME_W * SCALE, CH = FRAME_H * SCALE;
    charCanvas.width  = CW;
    charCanvas.height = CH;

    var cCharIdx = -1;
    var cState   = "run";
    var cStateDur = 0;
    var cX       = -CW;
    var cFrame   = 0;
    var cFrameT  = 0;
    var cLastT   = null;

    function randDur(state) {
      var p  = STATE_PROPS[state];
      var vw = window.innerWidth || 480;
      // Scale durations down on narrow screens so transitions are visible within the
      // viewport. Reference width 800px = full durations; iPhone 480px ≈ 0.6×.
      var scale = Math.max(0.3, Math.min(1.0, vw / 800));
      return (p.minDur + Math.random() * (p.maxDur - p.minDur)) * scale;
    }

    // Pick next state using weighted transitions; idle/sit only allowed when on screen
    function advanceState(char) {
      var pool = TRANSITIONS[cState] || [{ s:"run", w:1 }];
      var vw   = window.innerWidth || 480;
      // Allow transitions as soon as the sprite is visible and until 90% across —
      // wider than vw-CW so narrow screens get transitions throughout the crossing.
      var onScreen = cX > 0 && cX < vw * 0.9;
      var available = [];
      for (var i = 0; i < pool.length; i++) {
        var t = pool[i];
        if (!char.anims[t.s]) { continue; }
        if (!onScreen && (t.s==="idle"||t.s==="idle2"||t.s==="sit"||t.s==="lick")) { continue; }
        available.push(t);
      }
      if (!available.length) {
        cState = char.anims.run ? "run" : Object.keys(char.anims)[0];
      } else {
        var total = 0;
        for (var j = 0; j < available.length; j++) { total += available[j].w; }
        var r = Math.random() * total;
        for (var k = 0; k < available.length; k++) {
          r -= available[k].w;
          if (r <= 0) { cState = available[k].s; break; }
        }
        if (r > 0) { cState = available[available.length - 1].s; }
      }
      cStateDur = randDur(cState);
      cFrame    = 0;
      cFrameT   = 0;
    }

    function pickCharacter() {
      var total = 0;
      for (var i = 0; i < CHAR_POOL.length; i++) {
        if (i !== cCharIdx) { total += CHAR_POOL[i].w; }
      }
      var r = Math.random() * total;
      var next = cCharIdx;
      for (var i = 0; i < CHAR_POOL.length; i++) {
        if (i === cCharIdx) { continue; }
        r -= CHAR_POOL[i].w;
        if (r <= 0) { next = i; break; }
      }
      if (next === cCharIdx) {
        for (var i = CHAR_POOL.length - 1; i >= 0; i--) {
          if (i !== cCharIdx) { next = i; break; }
        }
      }
      cCharIdx  = next;
      cState    = "run";
      cStateDur = randDur("run");
      cX        = -CW;
      cFrame    = 0;
      cFrameT   = 0;
    }

    function animalTick(ts) {
      if (cLastT === null) { cLastT = ts; raf(animalTick); return; }
      var dt = Math.min((ts - cLastT) / 1000, 0.05);
      cLastT = ts;

      var char  = CHAR_POOL[cCharIdx];
      var props = STATE_PROPS[cState];
      var anim  = char.anims[cState];

      cX      += props.speed * dt;
      cFrameT += dt;
      if (cFrameT >= props.frameRate) {
        cFrameT = 0;
        cFrame  = (cFrame + 1) % anim.frames;
      }

      cStateDur -= dt;
      if (cStateDur <= 0) { advanceState(char); }

      var vw = window.innerWidth || 480;
      if (cX > vw + CW) { pickCharacter(); }

      var img = char.anims[cState].img;
      if (img && img.complete && img.naturalWidth > 0) {
        var ctx = charCanvas.getContext("2d");
        ctx.clearRect(0, 0, CW, CH);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, cFrame * FRAME_W, 0, FRAME_W, FRAME_H, 0, 0, CW, CH);
      }

      charCanvas.style.left = Math.round(cX) + "px";
      raf(animalTick);
    }

    pickCharacter();
    raf(animalTick);
  }
  // ────────────────────────────────────────────────────────────

  // ── Notification banner ─────────────────────────────────────
  var NOTIFICATION_REFRESH_MS = 2 * 60 * 1000;
  var notificationNode = document.getElementById("notification-text");

  function getTodayString() {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    return y + "-" + (m < 10 ? "0" + m : String(m)) + "-" + (d < 10 ? "0" + d : String(d));
  }

  function applyNotification(notifications) {
    if (!notificationNode) { return; }
    if (!notifications || !notifications.length) { notificationNode.textContent = ""; return; }
    var today = getTodayString();
    var matched = "";
    for (var i = 0; i < notifications.length; i++) {
      var n = notifications[i];
      if (!n.text) { continue; }
      if (!n.end) { continue; }                          // no end date → skip
      var start = n.start || today;                       // no start date → treat as today
      if (n.end < start) { continue; }                   // end before start → skip
      if (today >= start && today <= n.end) {
        matched = n.text;                                 // last match wins on overlap
      }
    }
    notificationNode.textContent = matched;
  }

  function fetchNotifications() {
    var nreq = new XMLHttpRequest();
    nreq.open("GET", "/notifications.json?_t=" + Date.now(), true);
    nreq.onreadystatechange = function () {
      if (nreq.readyState !== 4) { return; }
      if (nreq.status >= 200 && nreq.status < 300) {
        try { applyNotification(JSON.parse(nreq.responseText)); } catch (e) {}
      }
    };
    nreq.send(null);
  }

  fetchNotifications();
  setInterval(fetchNotifications, NOTIFICATION_REFRESH_MS);
  // ────────────────────────────────────────────────────────────

  // ── Daily math formula ──────────────────────────────────────
  var formulaLabel = document.getElementById("formula-label");
  var formulaKatex = document.getElementById("formula-katex");
  var cachedFormulas = null;
  var lastRenderedDay = -1;

  function getDayOfYear() {
    var now   = new Date();
    var start = new Date(now.getFullYear(), 0, 1);
    return Math.floor((now - start) / 86400000); // 0-indexed
  }

  function fitFormula() {
    formulaKatex.style.fontSize = "";
    var mj = formulaKatex.querySelector(".MathJax, .MathJax_Display");
    if (!mj) { return; }
    var available = formulaKatex.clientWidth;
    if (available <= 0) { return; }
    var rendered = mj.offsetWidth;
    if (rendered > available) {
      var baseSize = parseFloat(window.getComputedStyle(formulaKatex).fontSize);
      if (baseSize > 0) {
        formulaKatex.style.fontSize = (baseSize * available / rendered) + "px";
      }
    }
  }

  function renderFormula(formulas) {
    if (!formulas || !formulas.length) { return; }
    var day     = getDayOfYear();
    var idx     = day % formulas.length;
    var formula = formulas[idx];
    formulaLabel.textContent = formula.title || "";
    formulaKatex.innerHTML = "\\(" + (formula.latex || "") + "\\)";
    if (window.MathJax) {
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, formulaKatex], fitFormula);
    }
    lastRenderedDay = day;
  }

  window.addEventListener("resize", function () {
    if (window.MathJax) {
      MathJax.Hub.Queue(fitFormula);
    } else {
      fitFormula();
    }
  });

  function checkFormulaDay() {
    if (cachedFormulas && getDayOfYear() !== lastRenderedDay) {
      renderFormula(cachedFormulas);
    }
  }

  // Fetch formulas
  var req = new XMLHttpRequest();
  req.open("GET", "/math_formulas_year9_12_365_english.json", true);
  req.onreadystatechange = function () {
    if (req.readyState !== 4) { return; }
    if (req.status >= 200 && req.status < 300) {
      try {
        cachedFormulas = JSON.parse(req.responseText);
        renderFormula(cachedFormulas);
      } catch (e) {}
    }
  };
  req.send(null);
  // ────────────────────────────────────────────────────────────
})();
