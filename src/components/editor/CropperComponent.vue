<script setup>
import { ref, watch, onMounted } from "vue";
import { usePhotoStore } from "../../stores/photoStore";
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

const photoStore = usePhotoStore();
const cropperRef = ref(null);

// Cropper state
const coordinates = ref(null);
const imageData = ref(null);

// Function to apply the crop
const applyCrop = () => {
  if (!cropperRef.value) return;

  const { canvas } = cropperRef.value.getResult();

  if (canvas) {
    // Convert the cropped canvas to a data URL
    const croppedImageData = canvas.toDataURL("image/png");

    // Update the image in the store
    photoStore.setOriginalImage(croppedImageData);
  }
};

// Handle cropper changes
const onChange = ({ coordinates: coords }) => {
  // Update the coordinates ref
  coordinates.value = coords;
};

// Watch for changes in the original image
watch(
  () => photoStore.originalImage,
  (newImage) => {
    imageData.value = newImage;
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <!-- Show placeholder if no image -->
    <div v-if="!photoStore.hasImage" class="text-center text-gray-500 py-4">
      <p>Upload an image to crop</p>
    </div>

    <div v-else>
      <!-- Cropper component -->
      <div class="mb-4 bg-gray-100 rounded-lg p-2">
        <Cropper
          ref="cropperRef"
          class="cropper"
          :src="photoStore.originalImage"
          :stencil-props="{
            aspectRatio: null,
          }"
          @change="onChange"
        />
      </div>

      <!-- Cropper controls -->
      <div class="mt-4 text-center">
        <button @click="applyCrop" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Apply Crop</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cropper {
  height: 300px;
  background: #f1f1f1;
}
</style>
