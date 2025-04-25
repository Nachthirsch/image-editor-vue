<script setup>
import { usePhotoStore } from "../../stores/photoStore";
import { ref, computed } from "vue";

const photoStore = usePhotoStore();
const dragActive = ref(false);
const fileInputRef = ref(null);
const isUploading = ref(false);
const errorMessage = ref("");

// Computed property for checking file size
const maxFileSizeMB = 10; // 10MB maximum file size
const maxFileSize = maxFileSizeMB * 1024 * 1024; // Convert to bytes

// Handle file selection
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  errorMessage.value = "";

  // Check if the file is an image
  if (!file.type.match("image.*")) {
    errorMessage.value = "Please select an image file";
    return;
  }

  // Check file size
  if (file.size > maxFileSize) {
    errorMessage.value = `File too large. Maximum size is ${maxFileSizeMB}MB`;
    return;
  }

  // Show loading state
  isUploading.value = true;

  // Create a FileReader to read the image
  const reader = new FileReader();

  // Set up the FileReader onload event
  reader.onload = (e) => {
    // Set the image in the store with a slight delay to show the loading animation
    setTimeout(() => {
      photoStore.setOriginalImage(e.target.result);
      isUploading.value = false;
    }, 500);
  };

  reader.onerror = () => {
    errorMessage.value = "Error reading the file";
    isUploading.value = false;
  };

  // Read the image file as a data URL
  reader.readAsDataURL(file);

  // Reset the input to allow selecting the same file again
  event.target.value = "";
};

// Handle drag and drop events
const handleDragEnter = (event) => {
  event.preventDefault();
  dragActive.value = true;
};

const handleDragLeave = (event) => {
  event.preventDefault();
  dragActive.value = false;
};

const handleDragOver = (event) => {
  event.preventDefault();
  dragActive.value = true;
};

const handleDrop = (event) => {
  event.preventDefault();
  dragActive.value = false;
  errorMessage.value = "";

  // Get the files
  const files = event.dataTransfer.files;
  if (files.length === 0) return;

  // Check if the file is an image
  const file = files[0];
  if (!file.type.match("image.*")) {
    errorMessage.value = "Please select an image file";
    return;
  }

  // Check file size
  if (file.size > maxFileSize) {
    errorMessage.value = `File too large. Maximum size is ${maxFileSizeMB}MB`;
    return;
  }

  // Show loading state
  isUploading.value = true;

  // Create a FileReader to read the image
  const reader = new FileReader();

  // Set up the FileReader onload event
  reader.onload = (e) => {
    // Set the image in the store with a slight delay to show the loading animation
    setTimeout(() => {
      photoStore.setOriginalImage(e.target.result);
      isUploading.value = false;
    }, 500);
  };

  reader.onerror = () => {
    errorMessage.value = "Error reading the file";
    isUploading.value = false;
  };

  // Read the image file as a data URL
  reader.readAsDataURL(file);
};

// Trigger file input click
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

// Open demo image
const demoImages = [
  {
    name: "Landscape",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop",
  },
  {
    name: "Portrait",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop",
  },
  {
    name: "Food",
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop",
  },
];

const loadDemoImage = (url) => {
  isUploading.value = true;
  errorMessage.value = "";

  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTimeout(() => {
          photoStore.setOriginalImage(e.target.result);
          isUploading.value = false;
        }, 500);
      };
      reader.onerror = () => {
        errorMessage.value = "Error loading demo image";
        isUploading.value = false;
      };
      reader.readAsDataURL(blob);
    })
    .catch(() => {
      errorMessage.value = "Error loading demo image";
      isUploading.value = false;
    });
};

// Check if we're in a mobile browser
const isMobile = computed(() => {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
});
</script>

<template>
  <div>
    <!-- Upload area -->
    <div :class="['relative rounded-lg border-2 border-dashed transition-all duration-300 overflow-hidden', dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 bg-gray-50', photoStore.hasImage ? 'py-4' : 'py-8']" @dragenter="handleDragEnter" @dragleave="handleDragLeave" @dragover="handleDragOver" @drop="handleDrop" @click="triggerFileInput">
      <!-- Loading state -->
      <div v-if="isUploading" class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
        <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p class="text-indigo-600 font-medium">Loading image...</p>
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="absolute top-0 inset-x-0 bg-red-500 text-white text-center py-1 text-sm font-medium z-10">
        {{ errorMessage }}
      </div>

      <!-- Image preview if we have an image -->
      <div v-if="photoStore.hasImage" class="flex flex-col items-center justify-center p-2">
        <div class="relative w-full max-h-32 overflow-hidden rounded-md shadow-sm mb-3">
          <img :src="photoStore.originalImage" alt="Original image" class="max-w-full max-h-32 object-contain mx-auto" />
          <div class="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
            <button class="p-1.5 bg-white rounded-full text-gray-700 transform hover:scale-110 transition-all" @click.stop="photoStore.setOriginalImage(null)" title="Remove current image">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <p class="text-sm text-center text-gray-600">Click/Drag to upload a different image</p>
      </div>

      <!-- Upload icon and text when no image -->
      <div v-else class="flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div class="text-base font-medium text-gray-700"><span>Click to upload</span> <span v-if="!isMobile">or drag and drop</span></div>
        <p class="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, or GIF</p>
      </div>
    </div>

    <input id="file-upload" ref="fileInputRef" type="file" class="hidden" accept="image/*" @change="handleFileUpload" />

    <!-- Demo images section -->
    <div v-if="!photoStore.hasImage" class="mt-4">
      <h3 class="text-sm font-medium text-gray-700 mb-2">Or try a demo image:</h3>
      <div class="flex flex-wrap gap-2">
        <button v-for="(demo, index) in demoImages" :key="index" @click="loadDemoImage(demo.url)" class="px-3 py-1.5 bg-gray-100 rounded text-gray-700 text-sm hover:bg-gray-200 transition-colors flex-1">
          {{ demo.name }}
        </button>
      </div>
    </div>

    <!-- Keyboard shortcut hint -->
    <div v-if="photoStore.hasImage" class="mt-3 text-xs text-center text-gray-400">Press <span class="px-1.5 py-0.5 bg-gray-100 rounded font-mono">F</span> for fullscreen mode</div>
  </div>
</template>

<style scoped>
/* Improve the focus state of the upload area */
div:focus-within {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}
</style>
