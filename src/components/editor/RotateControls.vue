<script setup>
import { usePhotoStore } from "../../stores/photoStore";
import { ref, onMounted, watch } from "vue";

const photoStore = usePhotoStore();
const canvasRef = ref(null);
const canvasContext = ref(null);
const imageObj = ref(null);
const rotationAngle = ref(0);

// Function to draw the rotated image on the canvas
const drawRotatedImage = () => {
  if (!canvasRef.value || !canvasContext.value || !imageObj.value) return;

  const canvas = canvasRef.value;
  const ctx = canvasContext.value;
  const img = imageObj.value;

  // Calculate dimensions based on rotation
  const angle = (rotationAngle.value * Math.PI) / 180;
  const sin = Math.abs(Math.sin(angle));
  const cos = Math.abs(Math.cos(angle));

  // Calculate new dimensions
  const imgWidth = img.width;
  const imgHeight = img.height;

  // Set canvas dimensions to fit the rotated image
  const newWidth = Math.floor(imgWidth * cos + imgHeight * sin);
  const newHeight = Math.floor(imgWidth * sin + imgHeight * cos);

  canvas.width = newWidth;
  canvas.height = newHeight;

  // Clear the canvas
  ctx.clearRect(0, 0, newWidth, newHeight);

  // Move to the center of the canvas
  ctx.translate(newWidth / 2, newHeight / 2);

  // Rotate the canvas
  ctx.rotate(angle);

  // Apply filters
  ctx.filter = photoStore.filterStyle;

  // Draw the image centered and rotated
  ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

  // Reset the transformation
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

// Function to rotate image clockwise
const rotateClockwise = () => {
  rotationAngle.value = (rotationAngle.value + 90) % 360;
  drawRotatedImage();
};

// Function to rotate image counter-clockwise
const rotateCounterClockwise = () => {
  rotationAngle.value = (rotationAngle.value - 90) % 360;
  if (rotationAngle.value < 0) rotationAngle.value += 360;
  drawRotatedImage();
};

// Function to apply the rotation to the main image
const applyRotation = () => {
  if (!canvasRef.value) return;

  // Convert the canvas to a data URL
  const rotatedImageData = canvasRef.value.toDataURL("image/png");

  // Update the image in the store
  photoStore.setOriginalImage(rotatedImageData);
  
  // Ensure currentImage is also updated
  photoStore.updateCurrentImage(rotatedImageData);

  // Reset rotation angle
  rotationAngle.value = 0;
};

// Initialize the image when component is mounted
onMounted(() => {
  if (canvasRef.value) {
    canvasContext.value = canvasRef.value.getContext("2d");

    // If we already have an image, initialize it
    if (photoStore.originalImage) {
      imageObj.value = new Image();
      imageObj.value.onload = () => {
        drawRotatedImage();
      };
      imageObj.value.src = photoStore.originalImage;
    }
  }
});

// Watch for changes in the original image
watch(
  () => photoStore.originalImage,
  (newImage) => {
    if (!newImage) return;

    // Reset rotation angle
    rotationAngle.value = 0;

    // Create a new image object
    imageObj.value = new Image();

    // Set up onload handler
    imageObj.value.onload = () => {
      drawRotatedImage();
    };

    // Set the image source
    imageObj.value.src = newImage;
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <!-- Show placeholder if no image -->
    <div v-if="!photoStore.hasImage" class="text-center text-gray-500 py-4">
      <p>Upload an image to rotate</p>
    </div>

    <div v-else>
      <!-- Rotation preview -->
      <div class="mb-4 bg-gray-100 rounded-lg p-2 flex justify-center">
        <canvas ref="canvasRef" class="max-w-full max-h-64"></canvas>
      </div>

      <!-- Rotation controls -->
      <div class="flex justify-center space-x-4">
        <button @click="rotateCounterClockwise" class="p-2 bg-gray-200 rounded-full hover:bg-gray-300" title="Rotate Counter-Clockwise">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button @click="rotateClockwise" class="p-2 bg-gray-200 rounded-full hover:bg-gray-300" title="Rotate Clockwise">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" transform="scale(-1, 1) translate(-24, 0)" />
          </svg>
        </button>
      </div>

      <div class="mt-4 text-center">
        <p class="text-sm text-gray-500 mb-2">Current rotation: {{ rotationAngle }}°</p>
        <button @click="applyRotation" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Apply Rotation</button>
      </div>
    </div>
  </div>
</template>
