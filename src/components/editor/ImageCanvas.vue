<script setup>
import { ref, watch, onMounted, onUnmounted, defineExpose } from "vue";
import { usePhotoStore } from "../../stores/photoStore";

const photoStore = usePhotoStore();
const canvasRef = ref(null);
const canvasContext = ref(null);
const imageObj = ref(null);
const imageLoaded = ref(false); // Track if image is fully loaded
const tempCanvas = ref(document.createElement("canvas"));
const tempCtx = ref(null); // Initialize this later to ensure proper context

// Function to draw the image on the canvas with all filters applied
const drawImage = () => {
  if (!canvasRef.value || !canvasContext.value || !imageObj.value || !imageLoaded.value) {
    console.log("Cannot draw: missing required elements or image not loaded");
    return;
  }

  // Get canvas dimensions
  const canvas = canvasRef.value;
  const ctx = canvasContext.value;

  // Ensure we have a valid temp context
  if (!tempCtx.value) {
    tempCtx.value = tempCanvas.value.getContext("2d");
    if (!tempCtx.value) return; // Exit if we can't get a context
  }

  // Resize canvas to match image proportions while maintaining reasonable display size
  const maxWidth = canvas.parentElement?.clientWidth || 800;
  const maxHeight = 500; // Maximum height

  // Ensure image has valid dimensions
  let width = imageObj.value.naturalWidth || 0;
  let height = imageObj.value.naturalHeight || 0;

  // Validate image dimensions
  if (width <= 0 || height <= 0) {
    console.error("Invalid image dimensions:", width, height);
    return;
  }

  // Calculate aspect ratio
  const aspectRatio = width / height;

  // Resize image to fit within the container
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  // Ensure dimensions are at least 1px
  width = Math.max(1, Math.floor(width));
  height = Math.max(1, Math.floor(height));

  // Set canvas dimensions
  canvas.width = width;
  canvas.height = height;

  // Setup temp canvas with same dimensions
  tempCanvas.value.width = width;
  tempCanvas.value.height = height;

  // Clear the canvas
  ctx.clearRect(0, 0, width, height);
  tempCtx.value.clearRect(0, 0, width, height);

  try {
    // First, draw the image with basic CSS filters to the temp canvas
    tempCtx.value.filter = photoStore.filterStyle;
    tempCtx.value.drawImage(imageObj.value, 0, 0, width, height);

    // Validate that tempCanvas has content before proceeding
    if (width > 0 && height > 0) {
      // Get image data from temp canvas for pixel manipulation
      const imageData = tempCtx.value.getImageData(0, 0, width, height);

      // Apply advanced filters that require pixel manipulation
      applyAdvancedFilters(imageData);

      // Put the processed image data back to the main canvas
      ctx.putImageData(imageData, 0, 0);

      // Apply post-processing effects that need to be drawn on top
      applyPostEffects(ctx, width, height);
      
      // Update photoStore.currentImage for mobile preview
      if (canvasRef.value) {
        photoStore.updateCurrentImage(canvasRef.value.toDataURL('image/png'));
      }
    }
  } catch (error) {
    console.error("Error drawing image:", error);
  }
};

// Apply advanced filters that require pixel-level manipulation
const applyAdvancedFilters = (imageData) => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Get filter values from store
  const { lightness, vibrance, warmth, tint, highlights, shadows, lightRange, darkRange, posterize, clarity, fade, noise, grain } = photoStore.filters;

  // Process each pixel
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Apply lightness adjustment
    if (lightness !== 100) {
      const factor = lightness / 100;
      r = Math.min(255, r * factor);
      g = Math.min(255, g * factor);
      b = Math.min(255, b * factor);
    }

    // Apply warmth (adjust red/blue balance)
    if (warmth !== 100) {
      const warmthFactor = (warmth - 100) / 100;
      r = Math.min(255, r + warmthFactor * 30);
      b = Math.max(0, b - warmthFactor * 30);
    }

    // Convert to HSL for some adjustments
    const [h, s, l] = rgbToHsl(r, g, b);

    // Apply vibrance (saturate colors more intelligently)
    let newS = s;
    if (vibrance !== 100) {
      const vibFactor = (vibrance - 100) / 200;
      // Increase saturation more for less saturated colors
      newS = s + (1 - s) * vibFactor;
      newS = Math.max(0, Math.min(1, newS));
    }

    // Apply highlights/shadows adjustments
    let newL = l;
    if (highlights !== 100 && l > 0.5) {
      // Adjust only highlights (brighter areas)
      const highlightsFactor = (highlights - 100) / 200;
      const amount = (l - 0.5) * 2; // How much "highlight" it is (0-1)
      newL = l + amount * highlightsFactor * 0.5;
    }

    if (shadows !== 100 && l < 0.5) {
      // Adjust only shadows (darker areas)
      const shadowsFactor = (shadows - 100) / 200;
      const amount = (0.5 - l) * 2; // How much "shadow" it is (0-1)
      newL = l + amount * shadowsFactor * 0.5;
    }

    // Apply light/dark range adjustments
    if (lightRange !== 100 && l > 0.5) {
      const rangeFactor = (lightRange - 100) / 100;
      newL = 0.5 + (newL - 0.5) * (1 + rangeFactor);
    }

    if (darkRange !== 100 && l < 0.5) {
      const rangeFactor = (darkRange - 100) / 100;
      newL = 0.5 - (0.5 - newL) * (1 + rangeFactor);
    }

    // Apply posterize effect
    if (posterize > 0) {
      const levels = Math.max(2, Math.round(20 - (posterize / 100) * 18));
      newL = Math.round(newL * levels) / levels;
      newS = Math.round(newS * levels) / levels;
    }

    // Apply fade effect
    if (fade > 0) {
      const fadeFactor = fade / 100;
      newS = Math.max(0, newS * (1 - fadeFactor * 0.7));
      newL = 0.5 + (newL - 0.5) * (1 - fadeFactor * 0.5);
    }

    // Convert back to RGB
    let [newR, newG, newB] = hslToRgb(h, newS, newL);

    // Apply noise/grain
    if (noise > 0 || grain > 0) {
      const noiseFactor = (noise / 100) * 50; // Up to 50 levels of noise
      const grainFactor = (grain / 100) * 30; // Up to 30 levels of grain

      // Random noise
      if (noise > 0) {
        const randomNoise = (Math.random() - 0.5) * noiseFactor;
        newR += randomNoise;
        newG += randomNoise;
        newB += randomNoise;
      }

      // Film-like grain (more in darker areas)
      if (grain > 0) {
        const darkness = 1 - newL;
        const grainAmount = Math.random() * grainFactor * darkness;
        newR += grainAmount;
        newG += grainAmount;
        newB += grainAmount;
      }
    }

    // Apply clarity (local contrast)
    if (clarity !== 0) {
      // This is just an approximation since real clarity needs neighborhood info
      const clarityFactor = clarity / 100;
      // Enhance differences from middle gray
      const diff = newL - 0.5;
      newL = newL + diff * clarityFactor * 0.5;
    }

    // Ensure values are within range
    data[i] = Math.max(0, Math.min(255, Math.round(newR)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(newG)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(newB)));
  }
};

// Apply effects that need to be drawn on top of the image
const applyPostEffects = (ctx, width, height) => {
  // Apply vignette effect
  if (photoStore.filters.vignette > 0) {
    const vignetteFactor = photoStore.filters.vignette / 100;

    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2)));

    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(0.5 + 0.4 * (1 - vignetteFactor), "rgba(0,0,0,0)");
    gradient.addColorStop(1, `rgba(0,0,0,${vignetteFactor * 0.7})`);

    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = "multiply";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  }

  // Apply dispersion/chromatic aberration effect
  if (photoStore.filters.dispersion > 0) {
    const dispersionFactor = (photoStore.filters.dispersion / 100) * 10; // Up to 10px displacement

    // We need the original image data for this
    const imageData = tempCtx.value.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Create separate canvases for R, G, B channels
    const rCanvas = document.createElement("canvas");
    const gCanvas = document.createElement("canvas");
    const bCanvas = document.createElement("canvas");

    rCanvas.width = gCanvas.width = bCanvas.width = width;
    rCanvas.height = gCanvas.height = bCanvas.height = height;

    const rCtx = rCanvas.getContext("2d");
    const gCtx = gCanvas.getContext("2d");
    const bCtx = bCanvas.getContext("2d");

    // Clear and set composite mode
    rCtx.clearRect(0, 0, width, height);
    gCtx.clearRect(0, 0, width, height);
    bCtx.clearRect(0, 0, width, height);

    // We just draw the whole image on each channel canvas, then offset them
    rCtx.drawImage(canvasRef.value, 0, 0);
    gCtx.drawImage(canvasRef.value, 0, 0);
    bCtx.drawImage(canvasRef.value, 0, 0);

    // Draw to main canvas with offsets and blending
    ctx.globalCompositeOperation = "screen";

    // Red channel offset to the left
    ctx.drawImage(rCanvas, -dispersionFactor, 0);

    // Green channel stays centered
    ctx.drawImage(gCanvas, 0, 0);

    // Blue channel offset to the right
    ctx.drawImage(bCanvas, dispersionFactor, 0);

    // Reset composite mode
    ctx.globalCompositeOperation = "source-over";
  }
};

// Helper: Convert RGB to HSL
const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h, s, l];
};

// Helper: Convert HSL to RGB
const hslToRgb = (h, s, l) => {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r * 255, g * 255, b * 255];
};

// Load image when originalImage changes
watch(
  () => photoStore.originalImage,
  (newImage) => {
    if (!newImage) {
      imageLoaded.value = false;
      return;
    }

    // Reset image loaded flag
    imageLoaded.value = false;

    // Create a new image object
    imageObj.value = new Image();

    // Handle loading errors
    imageObj.value.onerror = (err) => {
      console.error("Error loading image:", err);
      imageLoaded.value = false;
    };

    // Set up onload handler
    imageObj.value.onload = () => {
      // Check if image has valid dimensions
      if (imageObj.value.naturalWidth > 0 && imageObj.value.naturalHeight > 0) {
        imageLoaded.value = true;
        console.log("Image loaded successfully with dimensions:", imageObj.value.naturalWidth, "x", imageObj.value.naturalHeight);
        // Wait for next tick to ensure DOM is updated
        setTimeout(drawImage, 0);
      } else {
        console.error("Image loaded but has invalid dimensions");
        imageLoaded.value = false;
      }
    };

    // Set the image crossOrigin attribute for CORS issues
    imageObj.value.crossOrigin = "Anonymous";

    // Set the image source
    imageObj.value.src = newImage;
  },
  { immediate: true }
);

// Redraw when filters change
watch(
  () => photoStore.filters,
  () => {
    if (imageLoaded.value) {
      drawImage();
    }
  },
  { deep: true }
);

// Initialize canvas context when component is mounted
onMounted(() => {
  if (canvasRef.value) {
    canvasContext.value = canvasRef.value.getContext("2d");

    // Initialize temp context
    tempCtx.value = tempCanvas.value.getContext("2d");

    // If we already have an image, draw it
    if (photoStore.originalImage) {
      imageObj.value = new Image();
      imageObj.value.crossOrigin = "Anonymous";

      imageObj.value.onload = () => {
        if (imageObj.value.naturalWidth > 0 && imageObj.value.naturalHeight > 0) {
          imageLoaded.value = true;
          drawImage();
        }
      };

      imageObj.value.onerror = (err) => {
        console.error("Error loading existing image:", err);
      };

      imageObj.value.src = photoStore.originalImage;
    }
  }

  // Handle window resize
  const handleResize = () => {
    // Add a small delay to ensure DOM measurements are complete
    setTimeout(drawImage, 100);
  };

  window.addEventListener("resize", handleResize);

  // Clean up event listener when component is unmounted
  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
  });
});

// Expose the canvas element to parent components
defineExpose({
  toDataURL: (type = "image/png", quality = 0.95) => {
    return canvasRef.value?.toDataURL(type, quality);
  },
});
</script>

<template>
  <canvas ref="canvasRef" class="max-w-full" v-show="photoStore.hasImage"></canvas>
</template>
