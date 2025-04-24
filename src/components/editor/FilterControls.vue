<script setup>
import { usePhotoStore } from "../../stores/photoStore";
import { ref } from "vue";

const photoStore = usePhotoStore();
const activeFilterSet = ref("basic"); // Options: basic, advanced, effects

// Filter sets to organize the UI
const filterSets = {
  basic: ["brightness", "contrast", "saturation", "sepia", "grayscale"],
  advanced: ["lightness", "vibrance", "warmth", "tint", "highlights", "shadows", "lightRange", "darkRange", "curve"],
  effects: ["posterize", "dispersion", "denoise", "clarity", "fade", "noise", "grain", "sharpness", "vignette"],
};

// Filter range definitions (min, max, step)
const filterRanges = {
  // Basic filters
  brightness: { min: 0, max: 200, step: 1 },
  contrast: { min: 0, max: 200, step: 1 },
  saturation: { min: 0, max: 200, step: 1 },
  sepia: { min: 0, max: 100, step: 1 },
  grayscale: { min: 0, max: 100, step: 1 },

  // Advanced filters
  lightness: { min: 0, max: 200, step: 1 },
  vibrance: { min: 0, max: 200, step: 1 },
  warmth: { min: 0, max: 200, step: 1 },
  tint: { min: -180, max: 180, step: 1 },
  highlights: { min: 0, max: 200, step: 1 },
  shadows: { min: 0, max: 200, step: 1 },
  lightRange: { min: 0, max: 200, step: 1 },
  darkRange: { min: 0, max: 200, step: 1 },
  curve: { min: 0, max: 200, step: 1 },

  // Effect filters
  posterize: { min: 0, max: 100, step: 1 },
  dispersion: { min: 0, max: 100, step: 1 },
  denoise: { min: 0, max: 100, step: 1 },
  clarity: { min: 0, max: 100, step: 1 },
  fade: { min: 0, max: 100, step: 1 },
  noise: { min: 0, max: 100, step: 1 },
  grain: { min: 0, max: 100, step: 1 },
  sharpness: { min: 0, max: 100, step: 1 },
  vignette: { min: 0, max: 100, step: 1 },
};

// Filter labels for display
const filterLabels = {
  // Basic filters
  brightness: "Brightness",
  contrast: "Contrast",
  saturation: "Saturation",
  sepia: "Sepia",
  grayscale: "Grayscale",

  // Advanced filters
  lightness: "Lightness",
  vibrance: "Vibrance",
  warmth: "Warmth",
  tint: "Tint",
  highlights: "Highlights",
  shadows: "Shadows",
  lightRange: "Light Range",
  darkRange: "Dark Range",
  curve: "Curve",

  // Effect filters
  posterize: "Posterize",
  dispersion: "Dispersion",
  denoise: "De-noise",
  clarity: "Clarity",
  fade: "Fade",
  noise: "Noise",
  grain: "Grain",
  sharpness: "Sharpness",
  vignette: "Vignette",
};

// Handle filter change
const handleFilterChange = (filter, value) => {
  photoStore.updateFilter(filter, Number(value));
};
</script>

<template>
  <div class="space-y-4">
    <!-- Show placeholder if no image -->
    <div v-if="!photoStore.hasImage" class="text-center text-gray-500 py-4">
      <p>Upload an image to apply filters</p>
    </div>

    <!-- Filters -->
    <div v-else>
      <!-- Filter set selector -->
      <div class="mb-6">
        <div class="flex justify-between border-b border-gray-200">
          <button @click="activeFilterSet = 'basic'" :class="['px-3 py-2', activeFilterSet === 'basic' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500']">Basic</button>
          <button @click="activeFilterSet = 'advanced'" :class="['px-3 py-2', activeFilterSet === 'advanced' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500']">Advanced</button>
          <button @click="activeFilterSet = 'effects'" :class="['px-3 py-2', activeFilterSet === 'effects' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500']">Effects</button>
        </div>
      </div>

      <!-- Filter sliders for active set -->
      <div v-for="filter in filterSets[activeFilterSet]" :key="filter" class="mb-4">
        <div class="flex justify-between mb-1">
          <label :for="filter" class="text-sm font-medium text-gray-700">
            {{ filterLabels[filter] }}
          </label>
          <span class="text-sm text-gray-500">
            {{ filter === "tint" ? `${photoStore.filters[filter]}°` : `${photoStore.filters[filter]}%` }}
          </span>
        </div>
        <input :id="filter" type="range" :min="filterRanges[filter].min" :max="filterRanges[filter].max" :step="filterRanges[filter].step" v-model="photoStore.filters[filter]" @input="handleFilterChange(filter, $event.target.value)" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
      </div>

      <!-- Quick reset button for current filter set -->
      <button
        @click="
          filterSets[activeFilterSet].forEach((filter) => {
            const defaultValue = filter === 'brightness' || filter === 'contrast' || filter === 'saturation' || filter === 'lightness' || filter === 'vibrance' || filter === 'warmth' || filter === 'highlights' || filter === 'shadows' || filter === 'lightRange' || filter === 'darkRange' || filter === 'curve' ? 100 : filter === 'tint' ? 0 : 0;
            photoStore.updateFilter(filter, defaultValue);
          })
        "
        class="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
      >
        Reset {{ activeFilterSet }} filters
      </button>

      <!-- Filter presets -->
      <div class="mt-6" v-if="activeFilterSet === 'basic'">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Presets</h3>
        <div class="grid grid-cols-3 gap-2">
          <button @click="photoStore.resetFilters()" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Normal</button>
          <button @click="photoStore.filters = { ...photoStore.filters, brightness: 110, contrast: 110, saturation: 120, sepia: 0, grayscale: 0 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Vivid</button>
          <button @click="photoStore.filters = { ...photoStore.filters, brightness: 100, contrast: 100, saturation: 0, sepia: 0, grayscale: 100 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">B&W</button>
          <button @click="photoStore.filters = { ...photoStore.filters, brightness: 110, contrast: 110, saturation: 100, sepia: 70, grayscale: 0 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Vintage</button>
          <button @click="photoStore.filters = { ...photoStore.filters, brightness: 90, contrast: 120, saturation: 85, sepia: 20, grayscale: 0 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Cinematic</button>
          <button @click="photoStore.filters = { ...photoStore.filters, brightness: 130, contrast: 90, saturation: 100, sepia: 10, grayscale: 0 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Bright</button>
        </div>
      </div>

      <!-- Advanced presets -->
      <div class="mt-6" v-if="activeFilterSet === 'advanced'">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Advanced Presets</h3>
        <div class="grid grid-cols-3 gap-2">
          <button @click="photoStore.filters = { ...photoStore.filters, lightness: 100, vibrance: 100, warmth: 100, tint: 0, highlights: 100, shadows: 100 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Reset</button>
          <button @click="photoStore.filters = { ...photoStore.filters, warmth: 120, tint: 15, highlights: 110, shadows: 90 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Warm</button>
          <button @click="photoStore.filters = { ...photoStore.filters, warmth: 80, tint: -10, highlights: 110, shadows: 100 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Cool</button>
          <button @click="photoStore.filters = { ...photoStore.filters, lightness: 110, highlights: 120, shadows: 90 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Bright Tone</button>
          <button @click="photoStore.filters = { ...photoStore.filters, lightness: 90, highlights: 80, shadows: 120, darkRange: 110 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Moody</button>
          <button @click="photoStore.filters = { ...photoStore.filters, vibrance: 130, warmth: 110, highlights: 110 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Vibrant</button>
        </div>
      </div>

      <!-- Effects presets -->
      <div class="mt-6" v-if="activeFilterSet === 'effects'">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Effects Presets</h3>
        <div class="grid grid-cols-3 gap-2">
          <button @click="photoStore.filters = { ...photoStore.filters, posterize: 0, dispersion: 0, clarity: 0, fade: 0, noise: 0, grain: 0, sharpness: 0, vignette: 0 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Reset</button>
          <button @click="photoStore.filters = { ...photoStore.filters, clarity: 30, sharpness: 40, vignette: 30 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Sharp</button>
          <button @click="photoStore.filters = { ...photoStore.filters, fade: 30, grain: 15, vignette: 40 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Film</button>
          <button @click="photoStore.filters = { ...photoStore.filters, posterize: 60, clarity: 20 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Poster</button>
          <button @click="photoStore.filters = { ...photoStore.filters, denoise: 40, clarity: 10, sharpness: 15 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Smooth</button>
          <button @click="photoStore.filters = { ...photoStore.filters, dispersion: 20, vignette: 50 }" class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Dreamy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom slider styles */
input[type="range"] {
  height: 8px;
  -webkit-appearance: none;
  margin: 10px 0;
  width: 100%;
  border-radius: 8px;
  background: #e2e8f0;
}
input[type="range"]:focus {
  outline: none;
}
input[type="range"]::-webkit-slider-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -4px;
}
input[type="range"]::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
}
</style>
