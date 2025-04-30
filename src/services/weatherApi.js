// OpenWeatherMap API configuration
const API_KEY = process.env.VUE_APP_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

/**
 * Fetch current weather data for a location
 * @param {string} query - City name or coordinates (lat=...&lon=...)
 * @param {string} units - Units (metric or imperial)
 * @returns {Promise<Object>} Weather data
 */
export async function getWeatherData(query, units = "imperial") {
  // Determine if query is a city name or coordinates
  const queryParam =
    typeof query === "string" && !query.includes("lat=")
      ? `q=${encodeURIComponent(query)}`
      : query;

  const url = `${BASE_URL}/weather?${queryParam}&appid=${API_KEY}&units=${units}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch weather data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getWeatherData:", error);
    throw error;
  }
}

/**
 * Fetch forecast data for coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Units (metric or imperial)
 * @returns {Promise<Object>} Forecast data
 */
export async function getForecastData(lat, lon, units = "imperial") {
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch forecast data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getForecastData:", error);
    throw error;
  }
}
