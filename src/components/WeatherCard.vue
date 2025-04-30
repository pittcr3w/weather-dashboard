<template>
  <div class="weather-card" :class="{ 'is-loading': isLoading }">
    <div class="card-header">
      <h2>{{ location.name }}, {{ location.country }}</h2>
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
        <div class="detail">
          <span class="label">Wind:</span>
          <span class="value"
            >{{ Math.round(weatherData.wind.speed) }}
            {{ units === "metric" ? "m/s" : "mph" }}</span
          >
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
      units: "imperial", // 'metric' for Celsius, '' for Fahrenheit
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
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .remove-btn {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
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
    padding: 20px;
    text-align: center;
    color: var(--text-color);
  }

  .error {
    color: #e74c3c;
  }

  .weather-content {
    padding: 20px;
  }

  .current-weather {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .temperature {
      display: flex;
      flex-direction: column;

      .temp {
        font-size: 42px;
        font-weight: bold;
        line-height: 1;
      }

      .units-toggle {
        background: none;
        border: none;
        color: var(--button-bg);
        padding: 5px 0;
        margin-top: 5px;
        cursor: pointer;
        font-size: 12px;
        text-align: left;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .weather-info {
      text-align: center;

      .weather-icon {
        width: 70px;
        height: 70px;
      }

      .weather-description {
        text-transform: capitalize;
        margin-top: 5px;
      }
    }
  }

  .weather-details {
    background-color: var(--card-bg);
    border: 1px solid var(--input-border);
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 20px;

    .detail {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: var(--text-color);
        opacity: 0.8;
      }

      .value {
        font-weight: 600;
      }
    }
  }
}
</style>
