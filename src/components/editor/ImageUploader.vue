<script setup>
import { usePhotoStore } from "../../stores/photoStore";

const photoStore = usePhotoStore();

// Handle file selection
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Check if the file is an image
  if (!file.type.match("image.*")) {
    alert("Please select an image file");
    return;
  }

  // Create a FileReader to read the image
  const reader = new FileReader();

  // Set up the FileReader onload event
  reader.onload = (e) => {
    // Set the image in the store
    photoStore.setOriginalImage(e.target.result);
  };

  // Read the image file as a data URL
  reader.readAsDataURL(file);

  // Reset the input to allow selecting the same file again
  event.target.value = "";
};

// Handle drag and drop events
const handleDrop = (event) => {
  event.preventDefault();

  // Get the files
  const files = event.dataTransfer.files;
  if (files.length === 0) return;

  // Only use the first file
  const file = files[0];

  // Check if the file is an image
  if (!file.type.match("image.*")) {
    alert("Please drop an image file");
    return;
  }

  // Create a FileReader to read the image
  const reader = new FileReader();

  // Set up the FileReader onload event
  reader.onload = (e) => {
    // Set the image in the store
    photoStore.setOriginalImage(e.target.result);
  };

  // Read the image file as a data URL
  reader.readAsDataURL(file);
};

const preventDefault = (event) => {
  event.preventDefault();
};
</script>

<template>
  <div class="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition duration-200" @dragover.prevent="preventDefault" @dragenter.prevent="preventDefault" @drop.prevent="handleDrop">
    <label for="file-upload" class="cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <div class="text-base font-medium text-gray-700"><span>Click to upload</span> or drag and drop</div>
      <p class="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, or GIF</p>
    </label>
    <input id="file-upload" type="file" class="hidden" accept="image/*" @change="handleFileUpload" />
  </div>
</template>
