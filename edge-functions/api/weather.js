function json(body, status, cacheControl) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": cacheControl || "no-store"
    }
  });
}

function toNumber(value, fallback) {
  var parsed = parseFloat(value);

  if (isNaN(parsed)) {
    return fallback;
  }

  return parsed;
}

export async function onRequestGet(context) {
  var requestUrl = new URL(context.request.url);
  var latitude = toNumber(requestUrl.searchParams.get("latitude"), -33.8688);
  var longitude = toNumber(requestUrl.searchParams.get("longitude"), 151.2093);
  var timezone = requestUrl.searchParams.get("timezone") || "auto";
  var upstreamUrl = new URL("https://api.open-meteo.com/v1/forecast");

  upstreamUrl.searchParams.set("latitude", String(latitude));
  upstreamUrl.searchParams.set("longitude", String(longitude));
  upstreamUrl.searchParams.set("current", "temperature_2m,apparent_temperature,weather_code");
  upstreamUrl.searchParams.set("daily", "temperature_2m_max,temperature_2m_min");
  upstreamUrl.searchParams.set("forecast_days", "1");
  upstreamUrl.searchParams.set("timezone", timezone);

  try {
    var upstreamResponse = await fetch(upstreamUrl.toString(), {
      headers: {
        "accept": "application/json"
      }
    });

    if (!upstreamResponse.ok) {
      return json({
        error: true,
        message: "Upstream weather request failed."
      }, 502, "no-store");
    }

    var upstreamText = await upstreamResponse.text();

    return new Response(upstreamText, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=900"
      }
    });
  } catch (error) {
    return json({
      error: true,
      message: "Weather service is temporarily unavailable."
    }, 502, "no-store");
  }
}
