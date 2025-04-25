<script setup>
import { usePhotoStore } from "../../stores/photoStore";
import { ref, watch } from "vue";

const photoStore = usePhotoStore();
const activeFilterSet = ref("basic"); // Options: basic, advanced, effects
const lastUsedFilter = ref(null);
const showFilterTooltip = ref(false);
const tooltipFilter = ref(null);
const doubleClickTimer = ref(null);
const tooltipTimeout = ref(null);

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

// Filter descriptions for tooltip
const filterDescriptions = {
  brightness: "Adjust the overall lightness of the image",
  contrast: "Increase/decrease the difference between light and dark areas",
  saturation: "Control the intensity of colors in the image",
  sepia: "Add a vintage, brownish tone to the image",
  grayscale: "Convert the image to black and white",
  lightness: "Adjust the overall light level without affecting contrast",
  vibrance: "Intelligently increase saturation of less-saturated colors",
  warmth: "Adjust the color temperature (warm/cool)",
  tint: "Shift the colors around the color wheel",
  highlights: "Adjust the brightness of the light areas",
  shadows: "Adjust the brightness of the dark areas",
  lightRange: "Expand or compress the bright tones",
  darkRange: "Expand or compress the dark tones",
  curve: "Adjust the tonal curve of the image",
  posterize: "Reduce the number of color levels for a poster-like effect",
  dispersion: "Create a chromatic aberration effect",
  denoise: "Reduce noise and grain in the image",
  clarity: "Enhance local contrast for a crisp look",
  fade: "Add a faded, matte look to the image",
  noise: "Add digital noise to the image",
  grain: "Add film-like grain to the image",
  sharpness: "Enhance edge detail for a sharper image",
  vignette: "Darken the edges of the image",
};

// Track if filter is at default value
const isFilterDefault = (filter) => {
  const defaultValue = filter === "brightness" || filter === "contrast" || filter === "saturation" || filter === "lightness" || filter === "vibrance" || filter === "warmth" || filter === "highlights" || filter === "shadows" || filter === "lightRange" || filter === "darkRange" || filter === "curve" ? 100 : filter === "tint" ? 0 : 0;

  return photoStore.filters[filter] === defaultValue;
};

// Handle filter change
const handleFilterChange = (filter, value) => {
  lastUsedFilter.value = filter;
  photoStore.updateFilter(filter, Number(value));
};

// Handle input element focus
const handleFocus = (filter) => {
  tooltipFilter.value = filter;
  showFilterTooltip.value = true;

  // Clear any existing timeout
  if (tooltipTimeout.value) {
    clearTimeout(tooltipTimeout.value);
  }
};

// Handle input element blur
const handleBlur = () => {
  // Set a timeout to hide the tooltip
  tooltipTimeout.value = setTimeout(() => {
    showFilterTooltip.value = false;
  }, 300);
};

// Handle double-click to reset filter
const handleDoubleClick = (filter) => {
  const defaultValue = filter === "brightness" || filter === "contrast" || filter === "saturation" || filter === "lightness" || filter === "vibrance" || filter === "warmth" || filter === "highlights" || filter === "shadows" || filter === "lightRange" || filter === "darkRange" || filter === "curve" ? 100 : filter === "tint" ? 0 : 0;

  photoStore.updateFilter(filter, defaultValue);
};

// Add keyboard access for the sliders
const handleKeyDown = (event, filter) => {
  if (event.key === "ArrowRight") {
    // Increment value
    const value = photoStore.filters[filter];
    const newValue = Math.min(filterRanges[filter].max, value + filterRanges[filter].step);
    photoStore.updateFilter(filter, newValue);
  } else if (event.key === "ArrowLeft") {
    // Decrement value
    const value = photoStore.filters[filter];
    const newValue = Math.max(filterRanges[filter].min, value - filterRanges[filter].step);
    photoStore.updateFilter(filter, newValue);
  } else if (event.key === "Home") {
    // Set to min value
    photoStore.updateFilter(filter, filterRanges[filter].min);
  } else if (event.key === "End") {
    // Set to max value
    photoStore.updateFilter(filter, filterRanges[filter].max);
  } else if (event.key === "r" || event.key === "R") {
    // Reset to default
    handleDoubleClick(filter);
  }
};

// Highlight recently used filters
const isRecentlyUsed = (filter) => {
  return lastUsedFilter.value === filter;
};

// Watch for tab changes to update the last used filter
watch(activeFilterSet, () => {
  lastUsedFilter.value = null;
});
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
          <button @click="activeFilterSet = 'basic'" :class="['px-3 py-2 flex items-center gap-1', activeFilterSet === 'basic' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500']">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Basic
          </button>
          <button @click="activeFilterSet = 'advanced'" :class="['px-3 py-2 flex items-center gap-1', activeFilterSet === 'advanced' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500']">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Advanced
          </button>
          <button @click="activeFilterSet = 'effects'" :class="['px-3 py-2 flex items-center gap-1', activeFilterSet === 'effects' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500']">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
            Effects
          </button>
        </div>
      </div>

      <!-- Filter sliders for active set -->
      <div v-for="filter in filterSets[activeFilterSet]" :key="filter" :class="['mb-4 p-2 rounded-lg transition-colors duration-300', isRecentlyUsed(filter) ? 'bg-indigo-50' : 'hover:bg-gray-50', !isFilterDefault(filter) ? 'border border-indigo-100' : '']">
        <div class="flex justify-between items-center mb-1">
          <label :for="filter" class="text-sm font-medium text-gray-700 flex items-center gap-1">
            {{ filterLabels[filter] }}
            <span v-if="!isFilterDefault(filter)" class="w-2 h-2 bg-indigo-500 rounded-full"></span>
          </label>
          <div class="flex items-center gap-2">
            <button v-if="!isFilterDefault(filter)" @click="handleDoubleClick(filter)" class="p-1 text-gray-400 hover:text-gray-700 transition-colors" title="Reset to default">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <span :class="['text-sm transition-colors', isFilterDefault(filter) ? 'text-gray-400' : 'text-indigo-600 font-medium']">
              {{ filter === "tint" ? `${photoStore.filters[filter]}°` : `${photoStore.filters[filter]}%` }}
            </span>
          </div>
        </div>

        <!-- Filter slider with tooltip -->
        <div class="relative" @mouseenter="handleFocus(filter)" @mouseleave="handleBlur">
          <input :id="filter" type="range" :min="filterRanges[filter].min" :max="filterRanges[filter].max" :step="filterRanges[filter].step" v-model="photoStore.filters[filter]" @input="handleFilterChange(filter, $event.target.value)" @dblclick="handleDoubleClick(filter)" @keydown="handleKeyDown($event, filter)" @focus="handleFocus(filter)" @blur="handleBlur" :class="['w-full h-2 rounded-lg appearance-none cursor-pointer', isFilterDefault(filter) ? 'bg-gray-200' : 'bg-indigo-100']" :title="`${filterLabels[filter]}: ${photoStore.filters[filter]}${filter === 'tint' ? '°' : '%'}`" />

          <!-- Custom thumb indicator for default/non-default values -->
          <div
            class="absolute h-4 w-4 rounded-full -mt-1 pointer-events-none transform -translate-x-1/2"
            :style="{
              left: `${((photoStore.filters[filter] - filterRanges[filter].min) / (filterRanges[filter].max - filterRanges[filter].min)) * 100}%`,
              top: '50%',
              backgroundColor: isFilterDefault(filter) ? '#9ca3af' : '#4f46e5',
            }"
          ></div>

          <!-- Tooltip with filter description -->
          <div v-if="showFilterTooltip && tooltipFilter === filter" class="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
            {{ filterDescriptions[filter] }}
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
          </div>
        </div>
      </div>

      <!-- Quick reset button for current filter set -->
      <button
        @click="
          filterSets[activeFilterSet].forEach((filter) => {
            const defaultValue = filter === 'brightness' || filter === 'contrast' || filter === 'saturation' || filter === 'lightness' || filter === 'vibrance' || filter === 'warmth' || filter === 'highlights' || filter === 'shadows' || filter === 'lightRange' || filter === 'darkRange' || filter === 'curve' ? 100 : filter === 'tint' ? 0 : 0;
            photoStore.updateFilter(filter, defaultValue);
          })
        "
        class="mt-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset {{ activeFilterSet }} filters
      </button>

      <!-- Filter presets -->
      <div class="mt-6" v-if="activeFilterSet === 'basic'">
        <h3 class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Basic Presets
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button @click="photoStore.resetFilters()" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Normal</button>
          <button @click="photoStore.filters = { ...photoStore.filters, brightness: 110, contrast: 110, saturation: 120, sepia: 0, grayscale: 0 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Vivid</button>
          <button @click="photoStore.filters = { ...photoStore.filters, brightness: 100, contrast: 100, saturation: 0, sepia: 0, grayscale: 100 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">B&W</button>
          <button @click="photoStore.filters = { ...photoStore.filters, brightness: 110, contrast: 110, saturation: 100, sepia: 70, grayscale: 0 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Vintage</button>
          <button @click="photoStore.filters = { ...photoStore.filters, brightness: 90, contrast: 120, saturation: 85, sepia: 20, grayscale: 0 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Cinematic</button>
          <button @click="photoStore.filters = { ...photoStore.filters, brightness: 130, contrast: 90, saturation: 100, sepia: 10, grayscale: 0 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Bright</button>
        </div>
      </div>

      <!-- Advanced presets -->
      <div class="mt-6" v-if="activeFilterSet === 'advanced'">
        <h3 class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Advanced Presets
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button @click="photoStore.filters = { ...photoStore.filters, lightness: 100, vibrance: 100, warmth: 100, tint: 0, highlights: 100, shadows: 100 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Reset</button>
          <button @click="photoStore.filters = { ...photoStore.filters, warmth: 120, tint: 15, highlights: 110, shadows: 90 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Warm</button>
          <button @click="photoStore.filters = { ...photoStore.filters, warmth: 80, tint: -10, highlights: 110, shadows: 100 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Cool</button>
          <button @click="photoStore.filters = { ...photoStore.filters, lightness: 110, highlights: 120, shadows: 90 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Bright Tone</button>
          <button @click="photoStore.filters = { ...photoStore.filters, lightness: 90, highlights: 80, shadows: 120, darkRange: 110 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Moody</button>
          <button @click="photoStore.filters = { ...photoStore.filters, vibrance: 130, warmth: 110, highlights: 110 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Vibrant</button>
        </div>
      </div>

      <!-- Effects presets -->
      <div class="mt-6" v-if="activeFilterSet === 'effects'">
        <h3 class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Effects Presets
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button @click="photoStore.filters = { ...photoStore.filters, posterize: 0, dispersion: 0, clarity: 0, fade: 0, noise: 0, grain: 0, sharpness: 0, vignette: 0 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Reset</button>
          <button @click="photoStore.filters = { ...photoStore.filters, clarity: 30, sharpness: 40, vignette: 30 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Sharp</button>
          <button @click="photoStore.filters = { ...photoStore.filters, fade: 30, grain: 15, vignette: 40 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Film</button>
          <button @click="photoStore.filters = { ...photoStore.filters, posterize: 60, clarity: 20 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Poster</button>
          <button @click="photoStore.filters = { ...photoStore.filters, denoise: 40, clarity: 10, sharpness: 15 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Smooth</button>
          <button @click="photoStore.filters = { ...photoStore.filters, dispersion: 20, vignette: 50 }" class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">Dreamy</button>
        </div>
      </div>

      <!-- Keyboard shortcuts hint -->
      <div class="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
        <p class="mb-1"><span class="font-medium">Tip:</span> Hover over sliders for descriptions</p>
        <p><span class="font-medium">Keyboard:</span> Arrow keys adjust values, R to reset</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom slider styles */
input[type="range"] {
  width: 100%;
  border-radius: 8px;
  background: #e2e8f0;
  -webkit-appearance: none;
}

input[type="range"]:focus {
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  height: 0px;
  width: 0px;
  -webkit-appearance: none;
}

input[type="range"]::-moz-range-thumb {
  height: 0px;
  width: 0px;
  background: transparent;
  border: none;
}

/* Value indicator track */
input[type="range"]::before {
  content: "";
  position: absolute;
  height: 8px;
  background: #4f46e5;
  border-radius: 8px 0 0 8px;
  pointer-events: none;
}

/* Add transition for smooth animations */
input[type="range"],
input[type="range"]::before,
input[type="range"]::-webkit-slider-thumb,
input[type="range"]::-moz-range-thumb {
  transition: all 0.2s ease;
}
</style>
