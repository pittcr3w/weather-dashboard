<template>
  <div class="weather-dashboard">
    <h1>Weather Dashboard</h1>
    <LocationInput @add-location="addLocation" />

    <div class="weather-cards">
      <WeatherCard
        v-for="location in locations"
        :key="location.id"
        :location="location"
        @remove="removeLocation"
      />
    </div>
  </div>
</template>

<script>
import LocationInput from "./components/LocationInput.vue";
import WeatherCard from "./components/WeatherCard.vue";

export default {
  name: "App",
  components: {
    LocationInput,
    WeatherCard,
  },
  data() {
    return {
      locations: JSON.parse(localStorage.getItem("weatherLocations") || "[]"),
    };
  },
  methods: {
    addLocation(location) {
      // Check if location already exists
      const exists = this.locations.some(
        (loc) => loc.name.toLowerCase() === location.name.toLowerCase()
      );

      if (!exists) {
        // Create a unique ID for the location
        const newLocation = {
          ...location,
          id: Date.now(),
        };

        this.locations.push(newLocation);
        this.saveLocations();
      }
    },
    removeLocation(id) {
      this.locations = this.locations.filter((location) => location.id !== id);
      this.saveLocations();
    },
    saveLocations() {
      localStorage.setItem("weatherLocations", JSON.stringify(this.locations));
    },
  },
};
</script>

<style lang="scss">
body {
  font-family: "Arial", sans-serif;
  background-color: #f0f2f5;
  margin: 0;
  padding: 20px;
}

.weather-dashboard {
  max-width: 1200px;
  margin: 0 auto;

  h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 30px;
  }

  .weather-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }
}
</style>
