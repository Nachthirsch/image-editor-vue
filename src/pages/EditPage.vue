<script setup>
import { ref, onMounted } from "vue";
import { usePhotoStore } from "../stores/photoStore";
import ImageUploader from "../components/editor/ImageUploader.vue";
import FilterControls from "../components/editor/FilterControls.vue";
import ImageCanvas from "../components/editor/ImageCanvas.vue";
import RotateControls from "../components/editor/RotateControls.vue";
import CropperComponent from "../components/editor/CropperComponent.vue";

const photoStore = usePhotoStore();
const activeTab = ref("filters"); // Default tab: 'filters', 'crop', 'rotate'

// Canvas reference
const canvasRef = ref(null);

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
};

// Function to save the image to gallery
const saveToGallery = () => {
  if (!canvasRef.value || !photoStore.hasImage) return;
  photoStore.saveToGallery(canvasRef.value);
};

// When component mounts, load gallery from localStorage
onMounted(() => {
  photoStore.loadGalleryFromLocalStorage();
});
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Photo Editor</h1>

    <!-- Main Editor Layout -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left Sidebar: Controls -->
      <div class="w-full lg:w-1/4 bg-white p-4 rounded-lg shadow-md">
        <!-- Upload Component -->
        <ImageUploader />

        <!-- Mobile Preview - Now positioned above tabs on mobile -->
        <div v-if="photoStore.hasImage" class="mt-4 mb-4 lg:hidden">
          <h3 class="text-sm font-semibold mb-2 text-gray-600">Image Preview</h3>
          <div class="w-full max-h-48 overflow-hidden flex justify-center items-center border rounded-md">
            <img :src="photoStore.currentImage" alt="Preview" class="max-w-full max-h-48 object-contain" />
          </div>
        </div>

        <!-- Tabs for different editing modes -->
        <div class="mt-6 border-b border-gray-200">
          <ul class="flex space-x-4">
            <li>
              <button @click="activeTab = 'filters'" :class="['px-3 py-2', activeTab === 'filters' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500']">Filters</button>
            </li>
            <li>
              <button @click="activeTab = 'crop'" :class="['px-3 py-2', activeTab === 'crop' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500']" :disabled="!photoStore.hasImage">Crop</button>
            </li>
            <li>
              <button @click="activeTab = 'rotate'" :class="['px-3 py-2', activeTab === 'rotate' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500']" :disabled="!photoStore.hasImage">Rotate</button>
            </li>
          </ul>
        </div>

        <!-- Controls based on active tab -->
        <div class="mt-4">
          <FilterControls v-if="activeTab === 'filters'" />
          <CropperComponent v-else-if="activeTab === 'crop'" />
          <RotateControls v-else-if="activeTab === 'rotate'" />
        </div>

        <!-- History Controls (Undo/Redo) -->
        <div class="mt-6 flex space-x-2">
          <button @click="photoStore.undo()" :disabled="!photoStore.canUndo" class="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300">Undo</button>
          <button @click="photoStore.redo()" :disabled="!photoStore.canRedo" class="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300">Redo</button>
          <button @click="photoStore.resetFilters()" :disabled="!photoStore.hasImage" class="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300">Reset</button>
        </div>

        <!-- Action buttons -->
        <div class="mt-6 flex flex-col space-y-2">
          <button @click="downloadImage" :disabled="!photoStore.hasImage" class="w-full px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:bg-indigo-400">Download Image</button>
          <button @click="saveToGallery" :disabled="!photoStore.hasImage" class="w-full px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:bg-green-400">Save to Gallery</button>
        </div>
      </div>

      <!-- Main Content: Canvas -->
      <div class="w-full lg:w-3/4 bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center min-h-[500px]">
        <ImageCanvas ref="canvasRef" />

        <!-- No image placeholder -->
        <div v-if="!photoStore.hasImage" class="text-center text-gray-500 p-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-lg font-medium">No Image Uploaded</p>
          <p class="mt-2">Upload an image to start editing</p>
        </div>
      </div>
    </div>

    <!-- Recent Edits Preview -->
    <div v-if="photoStore.gallery.length > 0" class="mt-8">
      <h2 class="text-xl font-semibold mb-4">Recent Edits</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div v-for="item in photoStore.gallery.slice().reverse().slice(0, 6)" :key="item.id" class="relative group">
          <img :src="item.image" alt="Edited image" class="w-full h-32 object-cover rounded-md shadow-sm" />
          <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 rounded-md">
            <router-link to="/gallery" class="px-2 py-1 bg-white text-gray-800 rounded text-sm"> View </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
