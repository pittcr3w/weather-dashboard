<template>
  <div class="location-input">
    <input
      type="text"
      v-model="locationName"
      @keyup.enter="addLocation"
      placeholder="Enter city name (optional: City, ST for US cities)"
      class="location-input-field"
    />
    <button @click="addLocation" class="add-location-btn">Add Location</button>
  </div>
</template>

<script>
import { getWeatherData } from "../services/weatherApi";

export default {
  name: "LocationInput",
  data() {
    return {
      locationName: "",
      isLoading: false,
      error: null,
    };
  },
  methods: {
    async addLocation() {
      if (!this.locationName.trim()) return;

      this.isLoading = true;
      this.error = null;

      try {
        const formattedLocation = this.formatLocationInput(this.locationName);

        // Fetch initial weather data to confirm the location exists
        const weatherData = await getWeatherData(formattedLocation);

        // If successful, emit the location to the parent
        this.$emit("add-location", {
          name: weatherData.name,
          country: weatherData.sys.country,
          state: this.extractStateFromInput(this.locationName),
          lat: weatherData.coord.lat,
          lon: weatherData.coord.lon,
          current: weatherData,
        });

        // Clear the input
        this.locationName = "";
      } catch (error) {
        this.error = error.message || "Failed to add location";
        console.error("Error adding location:", error);
        alert("City not found! Please try a different location.");
      } finally {
        this.isLoading = false;
      }
    },

    formatLocationInput(input) {
      // Check if input follows the "City, ST" format (city + 2-letter state code)
      const cityStateRegex = /^(.+),\s*([A-Za-z]{2})$/;
      const match = input.trim().match(cityStateRegex);

      if (match) {
        const city = match[1].trim();
        const state = match[2].toUpperCase();
        // Format as city,state,US for the OpenWeatherMap API
        return `${city},${state},US`;
      }

      // Return the original input if it doesn't match the city,state pattern
      return input.trim();
    },

    extractStateFromInput(input) {
      // Extract state code if present
      const cityStateRegex = /^(.+),\s*([A-Za-z]{2})$/;
      const match = input.trim().match(cityStateRegex);

      return match ? match[2].toUpperCase() : "";
    },
  },
};
</script>

<style lang="scss" scoped>
.location-input {
  display: flex;
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  .location-input-field {
    flex: 1;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 4px 0 0 4px;
    font-size: 16px;
    border-color: var(--input-border);
    color: var(--text-color);
    background-color: var(--card-bg);

    &:focus {
      outline: none;
      border-color: #3498db;
    }
  }

  .add-location-btn {
    padding: 12px 20px;
    background-color: var(--button-bg);
    color: var(--button-text);
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;

    &:hover {
      background-color: var(--button-hover);
    }
  }
}
</style>
