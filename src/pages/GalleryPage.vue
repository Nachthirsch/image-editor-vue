<script setup>
import { usePhotoStore } from "../stores/photoStore";
import { ref, onMounted, computed, watch, onUnmounted } from "vue";

const photoStore = usePhotoStore();
const selectedImage = ref(null);
const isViewingFullscreen = ref(false);
const deleteConfirmation = ref(null);
const searchQuery = ref("");
const sortOption = ref("newest");
const filterActive = ref(false);
const activeFilterType = ref(null);
const confirmationTimer = ref(null);

// Sort and filter options
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

// Computed property to get sorted and filtered gallery items
const filteredGalleryItems = computed(() => {
  let items = [...photoStore.gallery];

  // Apply search filter if query exists
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    // Filter by date as searchable property
    items = items.filter((item) => {
      const date = new Date(item.date).toLocaleDateString();
      return date.toLowerCase().includes(query);
    });
  }

  // Apply filter type if active
  if (filterActive.value && activeFilterType.value) {
    items = items.filter((item) => {
      if (activeFilterType.value === "bw") {
        return item.filters.grayscale > 50; // Images with significant grayscale
      } else if (activeFilterType.value === "vintage") {
        return item.filters.sepia > 30; // Images with sepia effect
      } else if (activeFilterType.value === "vibrant") {
        return item.filters.saturation > 120 || item.filters.vibrance > 120; // Colorful images
      }
      return true;
    });
  }

  // Sort based on the selected option
  if (sortOption.value === "newest") {
    return items.sort((a, b) => b.id - a.id);
  } else if (sortOption.value === "oldest") {
    return items.sort((a, b) => a.id - b.id);
  }

  return items;
});

// Count of applied filters for each image
const countAppliedFilters = (filters) => {
  let count = 0;
  const defaultValues = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 0,
    grayscale: 0,
    lightness: 100,
    vibrance: 100,
    warmth: 100,
    tint: 0,
    highlights: 100,
    shadows: 100,
    lightRange: 100,
    darkRange: 100,
    curve: 100,
    posterize: 0,
    dispersion: 0,
    denoise: 0,
    clarity: 0,
    fade: 0,
    noise: 0,
    grain: 0,
    sharpness: 0,
    vignette: 0,
  };

  Object.keys(filters).forEach((key) => {
    if (filters[key] !== defaultValues[key]) count++;
  });

  return count;
};

// Function to remove image from gallery with confirmation
const initiateDelete = (id) => {
  deleteConfirmation.value = id;

  // Auto-close confirmation after 5 seconds
  if (confirmationTimer.value) clearTimeout(confirmationTimer.value);
  confirmationTimer.value = setTimeout(() => {
    deleteConfirmation.value = null;
  }, 5000);
};

const removeFromGallery = (id) => {
  if (selectedImage.value && selectedImage.value.id === id) {
    selectedImage.value = null;
  }
  photoStore.removeFromGallery(id);
  deleteConfirmation.value = null;

  // Clear the timer
  if (confirmationTimer.value) {
    clearTimeout(confirmationTimer.value);
    confirmationTimer.value = null;
  }
};

const cancelDelete = () => {
  deleteConfirmation.value = null;

  // Clear the timer
  if (confirmationTimer.value) {
    clearTimeout(confirmationTimer.value);
    confirmationTimer.value = null;
  }
};

// Toggle fullscreen view
const toggleFullscreen = () => {
  isViewingFullscreen.value = !isViewingFullscreen.value;

  if (isViewingFullscreen.value) {
    document.body.classList.add("overflow-hidden");
  } else {
    document.body.classList.remove("overflow-hidden");
  }
};

// Use selected image in editor
const editSelectedImage = () => {
  if (!selectedImage.value) return;

  // Set the original image in the store
  photoStore.setOriginalImage(selectedImage.value.image);

  // Also apply the filters from the selected image
  Object.keys(selectedImage.value.filters).forEach((filter) => {
    photoStore.updateFilter(filter, selectedImage.value.filters[filter]);
  });

  // Navigate to edit page
  window.location.href = "/#/edit";
};

// Download selected image
const downloadSelectedImage = () => {
  if (!selectedImage.value) return;

  const link = document.createElement("a");
  link.href = selectedImage.value.image;
  link.download = `photo-${selectedImage.value.id}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Toggle filter type
const toggleFilterType = (type) => {
  if (activeFilterType.value === type) {
    // If the same filter is clicked, disable filtering
    activeFilterType.value = null;
    filterActive.value = false;
  } else {
    // Activate the selected filter
    activeFilterType.value = type;
    filterActive.value = true;
  }
};

// When component mounts, load gallery from localStorage
onMounted(() => {
  photoStore.loadGalleryFromLocalStorage();

  // If there's a selected image in URL params, select it
  const urlParams = new URLSearchParams(window.location.search);
  const imageId = urlParams.get("id");
  if (imageId) {
    const image = photoStore.gallery.find((item) => item.id.toString() === imageId);
    if (image) {
      selectedImage.value = image;
    }
  }

  // Handle keyboard navigation
  document.addEventListener("keydown", handleKeyDown);
});

// Cleanup keyboard event listener
onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
});

// Keyboard navigation handler
const handleKeyDown = (e) => {
  if (!selectedImage.value) return;

  if (e.key === "Escape" && isViewingFullscreen.value) {
    toggleFullscreen();
    e.preventDefault();
  } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    // Get the current index
    const currentIndex = filteredGalleryItems.value.findIndex((img) => img.id === selectedImage.value.id);
    if (currentIndex === -1) return;

    let newIndex;
    if (e.key === "ArrowLeft") {
      // Previous image
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredGalleryItems.value.length - 1;
    } else {
      // Next image
      newIndex = currentIndex < filteredGalleryItems.value.length - 1 ? currentIndex + 1 : 0;
    }

    selectedImage.value = filteredGalleryItems.value[newIndex];
    e.preventDefault();
  }
};

// Update URL when selected image changes
watch(selectedImage, (newImage) => {
  if (newImage) {
    // Update URL with selected image ID
    const url = new URL(window.location);
    url.searchParams.set("id", newImage.id);
    window.history.pushState({}, "", url);
  } else {
    // Remove the ID parameter if no image is selected
    const url = new URL(window.location);
    url.searchParams.delete("id");
    window.history.pushState({}, "", url);
  }
});
</script>

<template>
  <div class="container mx-auto p-4 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Your Gallery</h1>
      <router-link to="/edit" class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add New Photo
      </router-link>
    </div>

    <div v-if="photoStore.gallery.length === 0" class="text-center py-16 bg-white rounded-xl shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-gray-500 max-w-md mx-auto">Start by editing and saving some photos to build your collection</p>
      <router-link to="/edit" class="mt-8 inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"> Go to Photo Editor </router-link>
    </div>

    <div v-else>
      <!-- Filter and Sort Controls -->
      <div class="mb-6 p-4 bg-white rounded-lg shadow-sm">
        <div class="flex flex-col md:flex-row gap-4 justify-between">
          <!-- Search and info -->
          <div class="flex flex-col md:flex-row items-center gap-4">
            <div class="text-sm text-gray-600">{{ filteredGalleryItems.length }} of {{ photoStore.gallery.length }} photos</div>

            <!-- Search input -->
            <div class="relative">
              <input type="text" v-model="searchQuery" placeholder="Search by date..." class="py-1.5 pl-8 pr-4 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 w-full md:w-48" />
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <!-- Filter buttons -->
            <div class="flex gap-2">
              <button @click="toggleFilterType('bw')" :class="['px-2 py-1 rounded-lg text-xs font-medium transition-colors', activeFilterType === 'bw' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-700']">B&W</button>
              <button @click="toggleFilterType('vintage')" :class="['px-2 py-1 rounded-lg text-xs font-medium transition-colors', activeFilterType === 'vintage' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-700']">Vintage</button>
              <button @click="toggleFilterType('vibrant')" :class="['px-2 py-1 rounded-lg text-xs font-medium transition-colors', activeFilterType === 'vibrant' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-700']">Vibrant</button>
            </div>
          </div>

          <!-- Sort dropdown -->
          <div class="flex items-center gap-2">
            <label for="sort" class="text-sm text-gray-600">Sort by:</label>
            <select id="sort" v-model="sortOption" class="bg-gray-100 border border-gray-200 text-gray-700 py-1.5 px-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400">
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Gallery Grid -->
        <div class="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div v-for="item in filteredGalleryItems" :key="item.id" class="bg-white p-3 rounded-lg shadow-sm group hover:shadow-md transition-all duration-300">
            <!-- Image with overlay -->
            <div class="relative overflow-hidden rounded-md">
              <!-- Status indicator badges for applied filters -->
              <div class="absolute top-2 left-2 z-10 flex flex-wrap gap-1">
                <span v-if="countAppliedFilters(item.filters) > 0" class="text-xs px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-medium"> {{ countAppliedFilters(item.filters) }} filter{{ countAppliedFilters(item.filters) !== 1 ? "s" : "" }} </span>
                <span v-if="item.filters.grayscale > 50" class="text-xs px-1.5 py-0.5 rounded-full bg-gray-700 text-white font-medium"> B&W </span>
                <span v-if="item.filters.sepia > 30" class="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium"> Vintage </span>
              </div>

              <!-- Image -->
              <img :src="item.image" alt="Gallery image" class="w-full h-48 object-cover rounded-md cursor-pointer transform hover:scale-105 transition-transform duration-500" @click="selectedImage = item" />

              <!-- Hover overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <!-- Action buttons -->
                <div class="absolute bottom-2 right-2 flex gap-1">
                  <button @click="selectedImage = item" class="p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button v-if="deleteConfirmation !== item.id" @click="initiateDelete(item.id)" class="p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <!-- Delete confirmation buttons -->
                  <div v-if="deleteConfirmation === item.id" class="flex items-center gap-1 animate-fade-in">
                    <button @click="removeFromGallery(item.id)" class="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button @click="cancelDelete" class="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-200 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Image metadata -->
            <div class="mt-2 text-xs text-gray-500">
              {{ formatDate(item.date) }}
            </div>
          </div>
        </div>

        <!-- Selected Image Detail -->
        <div v-if="selectedImage" :class="['lg:w-1/3 bg-white p-5 rounded-lg shadow-md transition-all duration-300', isViewingFullscreen ? 'fixed inset-0 z-50 p-6 rounded-none overflow-auto' : '']">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold text-lg text-gray-800">Image Details</h3>
            <div class="flex gap-2">
              <button @click="toggleFullscreen" class="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors" title="Toggle fullscreen view">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="!isViewingFullscreen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button @click="selectedImage = null" class="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors" title="Close image details">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Image with navigation overlay -->
          <div class="relative max-h-[60vh] overflow-hidden rounded-lg shadow-sm group mb-6">
            <img :src="selectedImage.image" alt="Selected Image" class="w-full object-contain rounded-lg" />

            <!-- Arrow navigation overlay (only visible on hover) -->
            <div class="absolute inset-0 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="p-2 mx-2 bg-black/50 backdrop-blur-sm rounded-full text-white transform hover:scale-110 transition-transform" @click="selectedImage = filteredGalleryItems[(filteredGalleryItems.findIndex((img) => img.id === selectedImage.id) + filteredGalleryItems.length - 1) % filteredGalleryItems.length]" title="Previous image (Left arrow key)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button class="p-2 mx-2 bg-black/50 backdrop-blur-sm rounded-full text-white transform hover:scale-110 transition-transform" @click="selectedImage = filteredGalleryItems[(filteredGalleryItems.findIndex((img) => img.id === selectedImage.id) + 1) % filteredGalleryItems.length]" title="Next image (Right arrow key)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex gap-3 mb-6">
            <button @click="editSelectedImage" class="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Image
            </button>
            <button @click="downloadSelectedImage" class="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button @click="initiateDelete(selectedImage.id)" class="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors" title="Delete image">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <!-- Image metadata -->
          <div class="mb-6">
            <div class="text-sm text-gray-500">
              <div class="flex justify-between items-center mb-2">
                <span>Added on:</span>
                <span class="font-medium text-gray-700">{{ formatDate(selectedImage.date) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span>Applied filters:</span>
                <span class="font-medium text-gray-700">{{ countAppliedFilters(selectedImage.filters) }}</span>
              </div>
            </div>
          </div>

          <!-- Filter Settings -->
          <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Filter Settings
          </h4>

          <div class="grid grid-cols-2 gap-3 text-sm">
            <!-- Show filters only if they're different from default -->
            <template v-for="(value, key) in selectedImage.filters" :key="key">
              <div v-if="value !== (key === 'brightness' || key === 'contrast' || key === 'saturation' || key === 'lightness' || key === 'vibrance' || key === 'warmth' || key === 'highlights' || key === 'shadows' || key === 'lightRange' || key === 'darkRange' || key === 'curve' ? 100 : key === 'tint' ? 0 : 0)" class="bg-white p-2 rounded border border-gray-200 hover:border-indigo-200 transition-colors">
                <div class="text-gray-500 text-xs capitalize">{{ key.replace(/([A-Z])/g, " $1").trim() }}</div>
                <div class="font-medium">{{ key === "tint" ? `${value}°` : `${value}%` }}</div>
                <div class="mt-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    :class="['bg-indigo-500 h-full', value < 0 ? 'float-right' : '']"
                    :style="{
                      width: `${Math.abs(value) / (key === 'tint' ? 1.8 : 2)}%`,
                      maxWidth: '100%',
                    }"
                  ></div>
                </div>
              </div>
            </template>

            <!-- Show a message if no filters are applied -->
            <div v-if="countAppliedFilters(selectedImage.filters) === 0" class="col-span-2 text-center text-gray-500 p-4">No filters have been applied to this image</div>
          </div>

          <!-- Navigation hint on fullscreen -->
          <div v-if="isViewingFullscreen" class="mt-6 text-xs text-center text-gray-500">Use arrow keys to navigate between images • Press ESC to exit fullscreen</div>
        </div>

        <div v-else class="lg:w-1/3 bg-white p-8 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <div class="p-6 bg-indigo-50 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">No Image Selected</h3>
          <p class="text-gray-600 max-w-xs">Select an image from your gallery to view its details and filter settings</p>
        </div>
      </div>

      <!-- Keyboard controls hint -->
      <div class="mt-6 text-xs text-center text-gray-500">
        <p>Keyboard shortcuts: Arrow keys to navigate between images • ESC to exit fullscreen</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add some animations and transitions */
.grid > div {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>
