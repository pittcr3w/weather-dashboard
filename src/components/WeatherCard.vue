<template>
  <div class="weather-card" :class="{ 'is-loading': isLoading }">
    <div class="card-header">
      <h2>
        {{ location.name
        }}<!--
        --><template v-if="location.state">, {{ location.state }}</template
        ><!--
        --><template v-if="location.country">, {{ location.country }}</template>
      </h2>
      <button @click="$emit('remove', location.id)" class="remove-btn">
        &times;
      </button>
    </div>

    <div v-if="isLoading" class="loading">Loading weather data...</div>

    <div v-else-if="weatherData" class="weather-content">
      <div class="current-weather">
        <div class="temperature">
          <span class="temp"
            >{{ Math.round(weatherData.main.temp) }}°{{
              units === "metric" ? "C" : "F"
            }}</span
          >
          <button @click="toggleUnits" class="units-toggle">
            Switch to {{ units === "metric" ? "°F" : "°C" }}
          </button>
        </div>

        <div class="weather-info">
          <img
            :src="`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`"
            :alt="weatherData.weather[0].description"
            class="weather-icon"
          />
          <div class="weather-description">
            {{ weatherData.weather[0].description }}
          </div>
        </div>
      </div>

      <div class="weather-details">
        <div class="detail">
          <span class="label">Feels like:</span>
          <span class="value"
            >{{ Math.round(weatherData.main.feels_like) }}°{{
              units === "metric" ? "C" : "F"
            }}</span
          >
        </div>
        <div class="detail">
          <span class="label">Humidity:</span>
          <span class="value">{{ weatherData.main.humidity }}%</span>
        </div>
        <!-- Add dewpoint -->
        <div class="detail">
          <span class="label">Dewpoint:</span>
          <span class="value"
            >{{ calculateDewPoint() }}°{{
              units === "metric" ? "C" : "F"
            }}</span
          >
        </div>
        <!-- Add pressure -->
        <div class="detail">
          <span class="label">Pressure:</span>
          <span class="value">{{ weatherData.main.pressure }} hPa</span>
        </div>
        <!-- Wind information (enhanced) -->
        <div class="detail">
          <span class="label">Wind:</span>
          <span class="value">
            {{ Math.round(weatherData.wind.speed) }}
            {{ units === "metric" ? "m/s" : "mph" }}
            {{ getWindDirection(weatherData.wind.deg) }}
          </span>
        </div>
        <!-- Add UV index if available -->
        <div class="detail" v-if="weatherData.uvi !== undefined">
          <span class="label">UV Index:</span>
          <span class="value">{{ Math.round(weatherData.uvi) }}</span>
        </div>
        <!-- Visibility -->
        <div class="detail">
          <span class="label">Visibility:</span>
          <span class="value">{{
            formatVisibility(weatherData.visibility)
          }}</span>
        </div>
      </div>

      <WeatherForecast :lat="location.lat" :lon="location.lon" :units="units" />
    </div>

    <div v-else class="error">
      Failed to load weather data. Please try again later.
    </div>
  </div>
</template>

<script>
import { getWeatherData } from "../services/weatherApi";
import WeatherForecast from "./WeatherForecast.vue";

export default {
  name: "WeatherCard",
  components: {
    WeatherForecast,
  },
  props: {
    location: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      weatherData: this.location.current || null,
      isLoading: false,
      error: null,
      units: "imperial", // 'metric' for Celsius, 'imperial' for Fahrenheit
      refreshInterval: null,
    };
  },
  mounted() {
    this.fetchWeatherData();

    // Refresh weather data every 10 minutes
    this.refreshInterval = setInterval(() => {
      this.fetchWeatherData();
    }, 10 * 60 * 1000);
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    async fetchWeatherData() {
      this.isLoading = true;

      try {
        this.weatherData = await getWeatherData(
          `lat=${this.location.lat}&lon=${this.location.lon}`,
          this.units
        );
      } catch (error) {
        this.error = error.message || "Failed to fetch weather data";
        console.error("Error fetching weather data:", error);
      } finally {
        this.isLoading = false;
      }
    },
    toggleUnits() {
      this.units = this.units === "metric" ? "imperial" : "metric";
      this.fetchWeatherData();
    },
    // Calculate dewpoint based on temperature and humidity
    calculateDewPoint() {
      if (!this.weatherData) return 0;

      const temp = this.weatherData.main.temp;
      const humidity = this.weatherData.main.humidity;

      // Using the Magnus-Tetens approximation
      // For Celsius calculations
      let a = 17.27;
      let b = 237.7;

      if (this.units === "imperial") {
        // Adjusted constants for Fahrenheit
        a = 17.27;
        b = 237.7;

        // Convert Fahrenheit to Celsius for calculation
        const tempC = ((temp - 32) * 5) / 9;

        // Calculate dewpoint in Celsius
        const dewPointC =
          (b * ((a * tempC) / (b + tempC) + Math.log(humidity / 100))) /
          (a - ((a * tempC) / (b + tempC) + Math.log(humidity / 100)));

        // Convert back to Fahrenheit
        return Math.round((dewPointC * 9) / 5 + 32);
      } else {
        // Calculate dewpoint in Celsius directly
        const dewPoint =
          (b * ((a * temp) / (b + temp) + Math.log(humidity / 100))) /
          (a - ((a * temp) / (b + temp) + Math.log(humidity / 100)));
        return Math.round(dewPoint);
      }
    },
    // Get wind direction from degrees
    getWindDirection(degrees) {
      if (degrees === undefined) return "";

      const directions = [
        "N",
        "NNE",
        "NE",
        "ENE",
        "E",
        "ESE",
        "SE",
        "SSE",
        "S",
        "SSW",
        "SW",
        "WSW",
        "W",
        "WNW",
        "NW",
        "NNW",
      ];
      const index = Math.round(degrees / 22.5) % 16;
      return `(${directions[index]})`;
    },
    // Format visibility from meters
    formatVisibility(visibility) {
      if (visibility === undefined) return "";

      if (this.units === "imperial") {
        // Convert meters to miles
        const miles = (visibility / 1609.34).toFixed(1);
        return `${miles} mi`;
      } else {
        // Display in km if over 1000m
        return visibility >= 1000
          ? `${(visibility / 1000).toFixed(1)} km`
          : `${visibility} m`;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.weather-card {
  background-color: var(--card-bg);
  color: var(--text-color);
  box-shadow: var(--card-shadow);
  border-radius: 8px;
  overflow: hidden;
  width: 350px;
  transition: all 0.3s ease;

  &.is-loading {
    opacity: 0.7;
  }

  .card-header {
    background-color: var(--button-bg);
    color: white;
    padding: 12px 15px; /* Slightly reduced padding */
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 16px; /* Reduced from 18px */
      font-weight: 600;
    }

    .remove-btn {
      background: none;
      border: none;
      color: white;
      font-size: 22px; /* Reduced from 24px */
      cursor: pointer;
      padding: 0 5px;
      line-height: 1;

      &:hover {
        color: #f8f8f8;
      }
    }
  }

  .loading,
  .error {
    padding: 15px; /* Reduced from 20px */
    text-align: center;
    color: var(--text-color);
    font-size: 14px; /* Added explicit font size */
  }

  .error {
    color: #e74c3c;
  }

  .weather-content {
    padding: 15px; /* Reduced from 20px */
  }

  .current-weather {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px; /* Reduced from 20px */

    .temperature {
      display: flex;
      flex-direction: column;

      .temp {
        font-size: 36px; /* Reduced from 42px */
        font-weight: bold;
        line-height: 1;
      }

      .units-toggle {
        background: none;
        border: none;
        color: var(--button-bg);
        padding: 3px 0; /* Reduced from 5px */
        margin-top: 3px; /* Reduced from 5px */
        cursor: pointer;
        font-size: 11px; /* Reduced from 12px */
        text-align: left;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .weather-info {
      text-align: center;

      .weather-icon {
        width: 60px; /* Reduced from 70px */
        height: 60px; /* Reduced from 70px */
      }

      .weather-description {
        text-transform: capitalize;
        margin-top: 3px; /* Reduced from 5px */
        font-size: 13px; /* Added explicit font size */
      }
    }
  }

  .weather-details {
    background-color: var(--card-bg);
    border: 1px solid var(--input-border);
    border-radius: 4px;
    padding: 12px; /* Reduced from 15px */
    margin-bottom: 15px; /* Reduced from 20px */
    /* Remove max-height and overflow-y to avoid scrollbars */
    font-size: 13px; /* Reduced size to fit more content */

    .detail {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px; /* Reduced from 8px */

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: var(--text-color);
        opacity: 0.8;
      }

      .value {
        font-weight: 600;
        margin-left: 8px; /* Ensure separation between label and value */
      }
    }
  }
}
</style>
