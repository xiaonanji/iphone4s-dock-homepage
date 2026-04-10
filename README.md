# iPhone 4 Desk Display

Simple static web page for an iPhone 4/4S used as a landscape desk clock and weather display.

## What is included

- Large local clock
- Full date
- Weather panel with current temperature, feels-like temperature, and daily high/low
- Lightweight HTML, CSS, and JavaScript only
- No build step required for the frontend
- Includes an EdgeOne Pages function for weather proxying

## Configuration

Edit the top of [script.js](C:\Users\stick\Documents\iphone4s-dock-homepage\script.js) to change the default weather location:

```js
var WEATHER_LOCATION = {
  name: "Sydney",
  latitude: -33.8688,
  longitude: 151.2093
};
```

The displayed time and date come from the device browser, so they follow the iPhone's local time zone automatically.
Weather is requested from the site's own `/api/weather` endpoint, which proxies Open-Meteo through EdgeOne Pages Functions.

## Deploy To EdgeOne Pages

This repo is ready to deploy as a static site from Git.

Use these settings in EdgeOne Pages:

- Framework preset: `Other` or `Static Site`
- Build command: leave empty
- Output directory: `.`
- Install command: leave empty

After deployment, open the site in Safari on the iPhone and keep the device in landscape orientation.

## Notes

- The layout is tuned for a 480x320 landscape screen first.
- For the cleanest full-screen look on iPhone, add the page to the home screen and launch it from there.
- Weather data is loaded from Open-Meteo every 30 minutes.
