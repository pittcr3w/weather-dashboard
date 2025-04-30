<template>
  <div class="weather-dashboard" :class="{ 'dark-mode': isDarkMode }">
    <div class="header-container">
      <h1>Weather Dashboard</h1>
      <button
        @click="toggleDarkMode"
        class="theme-toggle"
        :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <span v-if="isDarkMode">☀️</span>
        <span v-else>🌙</span>
      </button>
    </div>
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
      isDarkMode: JSON.parse(localStorage.getItem("darkMode") || "false"),
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
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem("darkMode", JSON.stringify(this.isDarkMode));
      document.documentElement.setAttribute(
        "data-theme",
        this.isDarkMode ? "dark" : "light"
      );
    },
  },
  mounted() {
    // Apply theme on initial load
    document.documentElement.setAttribute(
      "data-theme",
      this.isDarkMode ? "dark" : "light"
    );
  },
};
</script>

<style lang="scss">
/* Remove the :root and [data-theme="dark"] declarations since they're now in styles.css */

.weather-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .header-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-bottom: 30px;
  }

  h1 {
    text-align: center;
    color: var(--text-color);
    margin-bottom: 0;
  }

  .theme-toggle {
    position: absolute;
    right: 0;
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba(128, 128, 128, 0.2);
    }

    &:focus {
      outline: none;
    }
  }

  .weather-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }
}
</style>
