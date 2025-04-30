<template>
  <div class="weather-forecast">
    <h3>5-Day Forecast</h3>

    <div v-if="isLoading" class="loading">Loading forecast...</div>

    <div v-else-if="forecast && forecast.length" class="forecast-items">
      <div v-for="(day, index) in forecast" :key="index" class="forecast-item">
        <div class="forecast-date">{{ formatDay(day.dt) }}</div>
        <img
          :src="`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`"
          :alt="day.weather[0].description"
          class="forecast-icon"
        />
        <div class="forecast-temp">
          <span class="high">{{ Math.round(day.temp.max) }}°</span>
          <span class="low">{{ Math.round(day.temp.min) }}°</span>
        </div>
      </div>
    </div>

    <div v-else class="error">Failed to load forecast data.</div>
  </div>
</template>

<script>
import { getForecastData } from "../services/weatherApi";

export default {
  name: "WeatherForecast",
  props: {
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    units: {
      type: String,
      default: "metric",
    },
  },
  data() {
    return {
      forecast: [],
      isLoading: false,
      error: null,
    };
  },
  watch: {
    units() {
      // Reload forecast when units change
      this.fetchForecastData();
    },
  },
  mounted() {
    this.fetchForecastData();
  },
  methods: {
    async fetchForecastData() {
      this.isLoading = true;

      try {
        const forecastData = await getForecastData(
          this.lat,
          this.lon,
          this.units
        );
        // Process the data to get one entry per day
        this.forecast = this.processForecastData(forecastData);
      } catch (error) {
        this.error = error.message || "Failed to fetch forecast data";
        console.error("Error fetching forecast data:", error);
      } finally {
        this.isLoading = false;
      }
    },
    processForecastData(data) {
      // Group forecast by day and extract daily min/max temperatures
      const dailyData = [];
      const groupedByDay = {};

      // Create groups by day
      data.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toDateString();

        if (!groupedByDay[date]) {
          groupedByDay[date] = {
            dt: item.dt,
            temp: {
              min: item.main.temp,
              max: item.main.temp,
            },
            weather: item.weather,
          };
        } else {
          // Update min/max temperatures
          if (item.main.temp > groupedByDay[date].temp.max) {
            groupedByDay[date].temp.max = item.main.temp;
          }
          if (item.main.temp < groupedByDay[date].temp.min) {
            groupedByDay[date].temp.min = item.main.temp;
          }

          // Use the weather from noon if available (for better icon)
          const hour = new Date(item.dt * 1000).getHours();
          if (hour >= 11 && hour <= 13) {
            groupedByDay[date].weather = item.weather;
          }
        }
      });

      // Convert to array and limit to 5 days
      for (const day in groupedByDay) {
        dailyData.push(groupedByDay[day]);
      }

      return dailyData.slice(0, 5);
    },
    formatDay(timestamp) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const date = new Date(timestamp * 1000);
      return days[date.getDay()];
    },
  },
};
</script>

<style lang="scss" scoped>
.weather-forecast {
  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 16px;
    color: #333;
  }

  .loading,
  .error {
    text-align: center;
    padding: 10px;
    font-size: 14px;
  }

  .error {
    color: #e74c3c;
  }

  .forecast-items {
    display: flex;
    justify-content: space-between;

    .forecast-item {
      flex: 1;
      text-align: center;
      padding: 10px 5px;

      .forecast-date {
        font-size: 14px;
        margin-bottom: 5px;
      }

      .forecast-icon {
        width: 40px;
        height: 40px;
      }

      .forecast-temp {
        font-size: 14px;

        .high {
          font-weight: bold;
          margin-right: 5px;
        }

        .low {
          color: #777;
        }
      }
    }
  }
}
</style>
