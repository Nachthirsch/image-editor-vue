<script setup>
import { usePhotoStore } from "../stores/photoStore";
import { ref, onMounted } from "vue";

const photoStore = usePhotoStore();
const selectedImage = ref(null);

// Function to remove image from gallery
const removeFromGallery = (id) => {
  if (selectedImage.value && selectedImage.value.id === id) {
    selectedImage.value = null;
  }
  photoStore.removeFromGallery(id);
};

// When component mounts, load gallery from localStorage
onMounted(() => {
  photoStore.loadGalleryFromLocalStorage();
});
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Your Gallery</h1>

    <div v-if="photoStore.gallery.length === 0" class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-lg font-medium text-gray-700">Your Gallery is Empty</p>
      <p class="mt-2 text-gray-500">Edit and save some photos to see them here</p>
      <router-link to="/edit" class="mt-6 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"> Go to Editor </router-link>
    </div>

    <div v-else class="flex flex-col md:flex-row gap-6">
      <!-- Gallery Grid -->
      <div class="md:w-2/3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="item in photoStore.gallery.slice().reverse()" :key="item.id" class="relative group cursor-pointer" @click="selectedImage = item">
          <img :src="item.image" alt="Edited image" class="w-full h-40 object-cover rounded-md shadow-sm" :class="{ 'ring-2 ring-indigo-500': selectedImage && selectedImage.id === item.id }" />
          <div class="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 rounded-md">
            <button @click.stop="removeFromGallery(item.id)" class="p-1 bg-red-500 text-white rounded-full" title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <div class="mt-1 text-xs text-gray-500">
            {{ new Date(item.date).toLocaleDateString() }}
          </div>
        </div>
      </div>

      <!-- Selected Image Detail -->
      <div v-if="selectedImage" class="md:w-1/3 bg-white p-4 rounded-lg shadow-md">
        <div class="text-right mb-2">
          <button @click="selectedImage = null" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <img :src="selectedImage.image" alt="Selected image" class="w-full h-auto rounded-md shadow-sm mb-4" />

        <h3 class="font-medium">Filter Settings</h3>
        <div class="mt-2 text-sm space-y-1 text-gray-600">
          <div>Brightness: {{ selectedImage.filters.brightness }}%</div>
          <div>Contrast: {{ selectedImage.filters.contrast }}%</div>
          <div>Saturation: {{ selectedImage.filters.saturation }}%</div>
          <div>Sepia: {{ selectedImage.filters.sepia }}%</div>
          <div>Grayscale: {{ selectedImage.filters.grayscale }}%</div>
        </div>

        <div class="mt-4">
          <p class="text-sm text-gray-500">Created on {{ new Date(selectedImage.date).toLocaleString() }}</p>
        </div>

        <div class="mt-6">
          <a :href="selectedImage.image" download="edited-image.png" class="w-full block text-center px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition"> Download </a>
          <button @click="removeFromGallery(selectedImage.id)" class="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition">Delete</button>
        </div>
      </div>

      <div v-else class="md:w-1/3 bg-white p-8 rounded-lg shadow-md flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-gray-600">Select an image to view details</p>
      </div>
    </div>
  </div>
</template>
