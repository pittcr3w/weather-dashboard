<template>
  <div class="location-input">
    <input
      type="text"
      v-model="locationName"
      @keyup.enter="addLocation"
      placeholder="Enter a city name (e.g., London, New York, Tokyo)"
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
        // Fetch initial weather data to confirm the location exists
        const weatherData = await getWeatherData(this.locationName);

        // If successful, emit the location to the parent
        this.$emit("add-location", {
          name: weatherData.name,
          country: weatherData.sys.country,
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

    &:focus {
      outline: none;
      border-color: #3498db;
    }
  }

  .add-location-btn {
    padding: 12px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;

    &:hover {
      background-color: #2980b9;
    }
  }
}
</style>
