<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import { usePhotoStore } from "../stores/photoStore";
import ImageUploader from "../components/editor/ImageUploader.vue";
import FilterControls from "../components/editor/FilterControls.vue";
import ImageCanvas from "../components/editor/ImageCanvas.vue";
import RotateControls from "../components/editor/RotateControls.vue";
import CropperComponent from "../components/editor/CropperComponent.vue";

const photoStore = usePhotoStore();
const activeTab = ref("filters"); // Default tab: 'filters', 'crop', 'rotate'
const isSavingToGallery = ref(false);
const showPreview = ref(false);
const showTips = ref(false);
const editHistory = ref([]);
const undoTimeout = ref(null);

// Canvas reference
const canvasRef = ref(null);

// Tips for the photo editor
const editorTips = ["Use the B&W preset for dramatic black and white photos", "The Vibrant preset makes colors pop for landscape photos", "Try the Film effect for a classic vintage look", "Adjust shadows and highlights separately for better detail", "Vignette can help focus attention on the center of your image", "Use keyboard shortcuts: Ctrl+Z for undo, Ctrl+Y for redo", "Crop your image to improve composition", "Use the clarity filter to enhance texture and details"];

// Computed property to get a random tip
const randomTip = computed(() => {
  return editorTips[Math.floor(Math.random() * editorTips.length)];
});

// Function to download the edited image
const downloadImage = () => {
  if (!canvasRef.value || !photoStore.hasImage) return;

  const imageData = canvasRef.value.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = imageData;
  link.download = "edited-image.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Store edit action
  editHistory.value.push({
    action: "download",
    timestamp: new Date(),
  });
};

// Function to save the image to gallery with animation
const saveToGallery = () => {
  if (!canvasRef.value || !photoStore.hasImage) return;

  // Start saving animation
  isSavingToGallery.value = true;

  setTimeout(() => {
    photoStore.saveToGallery(canvasRef.value);

    // Store edit action
    editHistory.value.push({
      action: "save",
      timestamp: new Date(),
    });

    // Reset animation state after a delay
    setTimeout(() => {
      isSavingToGallery.value = false;
    }, 1000);
  }, 500);
};

// Toggle fullscreen preview mode
const togglePreview = () => {
  showPreview.value = !showPreview.value;

  if (showPreview.value) {
    document.body.classList.add("overflow-hidden");
  } else {
    document.body.classList.remove("overflow-hidden");
  }
};

// Toggle editor tips
const toggleTips = () => {
  showTips.value = !showTips.value;
};

// Apply the active filter tab
const applyActionAfterTabChange = () => {
  // Store the tab change in edit history
  editHistory.value.push({
    action: "tab_change",
    tab: activeTab.value,
    timestamp: new Date(),
  });
};

// Watch for undo/redo events to provide feedback
watch(
  () => photoStore.historyIndex,
  (newIndex, oldIndex) => {
    // Determine if this was an undo or redo
    const action = newIndex < oldIndex ? "undo" : "redo";

    // Store in edit history
    editHistory.value.push({
      action,
      timestamp: new Date(),
    });

    // Clear any existing timeout
    if (undoTimeout.value) {
      clearTimeout(undoTimeout.value);
    }
  }
);

// Keyboard shortcut handler
const handleKeyDown = (e) => {
  // Handle undo/redo keyboard shortcuts
  if (e.ctrlKey || e.metaKey) {
    if (e.key === "z" && photoStore.canUndo) {
      photoStore.undo();
      e.preventDefault();
    } else if ((e.key === "y" || (e.shiftKey && e.key === "z")) && photoStore.canRedo) {
      photoStore.redo();
      e.preventDefault();
    }
  }

  // Handle ESC for preview mode
  if (e.key === "Escape" && showPreview.value) {
    togglePreview();
    e.preventDefault();
  }
};

// Reset all filters with confirmation
const resetAll = () => {
  if (confirm("Are you sure you want to reset all filters?")) {
    photoStore.resetFilters();

    // Store action
    editHistory.value.push({
      action: "reset_all",
      timestamp: new Date(),
    });
  }
};

// When component mounts, load gallery from localStorage
onMounted(() => {
  photoStore.loadGalleryFromLocalStorage();

  // Add keyboard event listener
  document.addEventListener("keydown", handleKeyDown);

  // Show initial tips after a delay
  setTimeout(() => {
    showTips.value = true;

    // Auto-hide after 5 seconds
    setTimeout(() => {
      showTips.value = false;
    }, 5000);
  }, 2000);
});

// Clean up event listeners when component is destroyed
onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);

  if (undoTimeout.value) {
    clearTimeout(undoTimeout.value);
  }
});
</script>

<template>
  <div class="container mx-auto p-4">
    <!-- Header with breadcrumbs -->
    <div class="mb-6">
      <div class="flex items-center text-sm text-gray-500 mb-2">
        <router-link to="/" class="hover:text-indigo-600 transition-colors">Home</router-link>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <router-link to="/gallery" class="hover:text-indigo-600 transition-colors">Gallery</router-link>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-indigo-600 font-medium">Editor</span>
      </div>
      <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Photo Editor</h1>
    </div>

    <!-- Tips banner -->
    <transition name="fade">
      <div v-if="showTips" class="mb-6 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg flex items-start">
        <div class="text-indigo-500 mr-3 flex-shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div class="flex-grow">
          <p class="text-sm text-indigo-800">{{ randomTip }}</p>
        </div>
        <button @click="toggleTips" class="text-indigo-500 hover:text-indigo-700 ml-2 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </transition>

    <!-- Main Editor Layout -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left Sidebar: Controls -->
      <div class="w-full lg:w-1/4">
        <div class="bg-white p-4 rounded-lg shadow-md mb-4">
          <!-- Upload Component -->
          <ImageUploader />

          <!-- Mobile Preview - Now positioned above tabs on mobile -->
          <div v-if="photoStore.hasImage" class="mt-4 mb-4 lg:hidden">
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-sm font-semibold text-gray-600">Image Preview</h3>
              <button @click="togglePreview" class="p-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 text-xs flex items-center gap-1" title="Toggle fullscreen preview">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 3h6m0 0v6m0-6L14 10m-4 11h-6m0 0v-6m0 6l7-7" />
                </svg>
                <span>Expand</span>
              </button>
            </div>
            <div class="w-full max-h-48 overflow-hidden flex justify-center items-center border rounded-md bg-gray-50">
              <img :src="photoStore.currentImage" alt="Preview" class="max-w-full max-h-48 object-contain" />
            </div>
          </div>

          <!-- Tabs for different editing modes -->
          <div class="mt-6 border-b border-gray-200">
            <ul class="flex space-x-4">
              <li>
                <button
                  @click="
                    activeTab = 'filters';
                    applyActionAfterTabChange();
                  "
                  :class="['px-3 py-2 transition-colors', activeTab === 'filters' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-800']"
                >
                  Filters
                </button>
              </li>
              <li>
                <button
                  @click="
                    activeTab = 'crop';
                    applyActionAfterTabChange();
                  "
                  :class="['px-3 py-2 transition-colors', activeTab === 'crop' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-800']"
                  :disabled="!photoStore.hasImage"
                >
                  Crop
                </button>
              </li>
              <li>
                <button
                  @click="
                    activeTab = 'rotate';
                    applyActionAfterTabChange();
                  "
                  :class="['px-3 py-2 transition-colors', activeTab === 'rotate' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-800']"
                  :disabled="!photoStore.hasImage"
                >
                  Rotate
                </button>
              </li>
            </ul>
          </div>

          <!-- Controls based on active tab -->
          <div class="mt-4">
            <FilterControls v-if="activeTab === 'filters'" />
            <CropperComponent v-else-if="activeTab === 'crop'" />
            <RotateControls v-else-if="activeTab === 'rotate'" />
          </div>
        </div>

        <!-- History Controls (Undo/Redo) -->
        <div class="bg-white p-4 rounded-lg shadow-md">
          <div class="mb-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Edit History</h3>
            <div class="flex space-x-2">
              <button @click="photoStore.undo()" :disabled="!photoStore.canUndo" :class="['flex-1 px-3 py-1.5 rounded flex items-center justify-center gap-1 text-sm transition-colors', photoStore.canUndo ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed']" title="Undo (Ctrl+Z)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Undo
              </button>
              <button @click="photoStore.redo()" :disabled="!photoStore.canRedo" :class="['flex-1 px-3 py-1.5 rounded flex items-center justify-center gap-1 text-sm transition-colors', photoStore.canRedo ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed']" title="Redo (Ctrl+Y)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                Redo
              </button>
              <button @click="resetAll" :disabled="!photoStore.hasImage" :class="['px-3 py-1.5 rounded flex items-center justify-center gap-1 text-sm transition-colors', photoStore.hasImage ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed']" title="Reset all filters">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>

            <!-- Keyboard shortcut hint -->
            <div class="mt-2 text-xs text-gray-500 text-center">Keyboard shortcuts: Ctrl+Z (Undo), Ctrl+Y (Redo)</div>
          </div>

          <!-- Action buttons -->
          <div class="flex flex-col space-y-2">
            <button @click="downloadImage" :disabled="!photoStore.hasImage" :class="['w-full px-4 py-2.5 rounded-md font-medium flex items-center justify-center gap-2 transition-all', photoStore.hasImage ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md' : 'bg-indigo-300 text-white cursor-not-allowed']">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Image
            </button>
            <button @click="saveToGallery" :disabled="!photoStore.hasImage || isSavingToGallery" :class="['w-full px-4 py-2.5 rounded-md font-medium flex items-center justify-center gap-2 transition-all', photoStore.hasImage && !isSavingToGallery ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md' : 'bg-green-300 text-white cursor-not-allowed']">
              <svg v-if="!isSavingToGallery" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <svg v-else class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSavingToGallery ? "Saving..." : "Save to Gallery" }}
            </button>
            <router-link to="/gallery" class="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              View Gallery
            </router-link>
          </div>
        </div>
      </div>

      <!-- Main Content: Canvas -->
      <div class="w-full lg:w-3/4 bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center min-h-[500px] relative">
        <!-- Fullscreen preview button (desktop only) -->
        <button v-if="photoStore.hasImage" @click="togglePreview" class="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 z-10 hidden lg:block" title="Toggle fullscreen preview">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="!showPreview" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 3h6m0 0v6m0-6L14 10m-4 11h-6m0 0v-6m0 6l7-7" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Canvas with loading overlay for changes -->
        <div class="relative w-full flex items-center justify-center">
          <ImageCanvas ref="canvasRef" />
        </div>

        <!-- No image placeholder -->
        <div v-if="!photoStore.hasImage" class="text-center text-gray-500 p-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-lg font-medium">No Image Uploaded</p>
          <p class="mt-2">Upload an image to start editing</p>
          <p class="mt-4 text-sm text-gray-400">Supported formats: PNG, JPG, JPEG, or GIF</p>
        </div>
      </div>
    </div>

    <!-- Recent Edits Preview -->
    <div v-if="photoStore.gallery.length > 0" class="mt-8">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">Recent Edits</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div v-for="item in photoStore.gallery.slice().reverse().slice(0, 6)" :key="item.id" class="relative group overflow-hidden rounded-lg shadow-sm">
          <img :src="item.image" alt="Edited image" class="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center">
            <router-link :to="`/gallery?id=${item.id}`" class="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-sm font-medium mb-3 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform"> View </router-link>
          </div>
          <!-- Date badge -->
          <div class="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded">
            {{ new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Fullscreen preview modal -->
    <div v-if="showPreview && photoStore.hasImage" class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" @click="togglePreview">
      <div class="relative max-w-full max-h-full" @click.stop>
        <img :src="photoStore.currentImage" alt="Preview" class="max-w-full max-h-[90vh] object-contain rounded shadow-2xl" />
        <button @click="togglePreview" class="absolute -top-4 -right-4 p-2 bg-white rounded-full text-gray-800 shadow-lg hover:bg-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="absolute bottom-6 text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">Press ESC to close preview</div>
    </div>
  </div>
</template>

<style scoped>
/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Add pulse animation to the save button when active */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
