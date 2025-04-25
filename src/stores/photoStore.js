import { defineStore } from "pinia";

export const usePhotoStore = defineStore("photo", {
  state: () => ({
    // Original image and edited image URLs
    originalImage: null,
    editedImage: null,
    currentImage: null, // Added for mobile preview

    // Image filter settings
    filters: {
      brightness: 100, // default: 100%
      contrast: 100, // default: 100%
      saturation: 100, // default: 100%
      sepia: 0, // default: 0%
      grayscale: 0, // default: 0%
      lightness: 100, // default: 100%
      vibrance: 100, // default: 100%
      warmth: 100, // default: 100%
      tint: 0, // default: 0%
      highlights: 100, // default: 100%
      shadows: 100, // default: 100%
      lightRange: 100, // default: 100%
      darkRange: 100, // default: 100%
      curve: 100, // default: 100%
      posterize: 0, // default: 0%
      dispersion: 0, // default: 0%
      denoise: 0, // default: 0%
      clarity: 0, // default: 0%
      fade: 0, // default: 0%
      noise: 0, // default: 0%
      grain: 0, // default: 0%
      sharpness: 0, // default: 0%
      vignette: 0, // default: 0%
    },

    // Gallery of saved images
    gallery: [],

    // Editing history for undo/redo
    history: [],
    historyIndex: -1,
  }),

  getters: {
    // Return CSS filter string based on current filter values
    filterStyle: (state) => {
      // Basic CSS filters
      let filterString = `brightness(${state.filters.brightness}%) 
                           contrast(${state.filters.contrast}%) 
                           saturate(${state.filters.saturation}%) 
                           sepia(${state.filters.sepia}%) 
                           grayscale(${state.filters.grayscale}%)`;
      
      // Add additional CSS filters that can be applied directly
      if (state.filters.sharpness > 0) {
        // Using a combination of contrast and brightness to simulate sharpness
        const sharpFactor = state.filters.sharpness / 10;
        filterString += ` contrast(${100 + sharpFactor}%)`;
      }
      
      // Apply tint (hue-rotate)
      if (state.filters.tint !== 0) {
        filterString += ` hue-rotate(${state.filters.tint}deg)`;
      }
      
      return filterString;
    },

    // Advanced filter data for canvas-based effects
    advancedFilterData: (state) => {
      return {
        lightness: state.filters.lightness,
        vibrance: state.filters.vibrance,
        warmth: state.filters.warmth,
        tint: state.filters.tint,
        highlights: state.filters.highlights,
        shadows: state.filters.shadows,
        lightRange: state.filters.lightRange,
        darkRange: state.filters.darkRange,
        curve: state.filters.curve,
        posterize: state.filters.posterize,
        dispersion: state.filters.dispersion,
        denoise: state.filters.denoise,
        clarity: state.filters.clarity,
        fade: state.filters.fade,
        noise: state.filters.noise,
        grain: state.filters.grain,
        sharpness: state.filters.sharpness,
        vignette: state.filters.vignette
      };
    },

    // Check if we have an image loaded
    hasImage: (state) => !!state.originalImage,

    // Check if we can undo
    canUndo: (state) => state.historyIndex > 0,

    // Check if we can redo
    canRedo: (state) => state.historyIndex < state.history.length - 1
  },

  actions: {
    // Set the original image
    setOriginalImage(imageData) {
      this.originalImage = imageData;
      this.editedImage = imageData;
      this.currentImage = imageData; // Update currentImage as well

      // Reset filters
      this.resetFilters();

      // Add to history
      this.addToHistory();
    },

    // Update current image for preview
    updateCurrentImage(imageData) {
      this.currentImage = imageData;
    },

    // Reset all filters to default values
    resetFilters() {
      this.filters = {
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

      // Add to history
      this.addToHistory();
    },

    // Update a filter value
    updateFilter(filter, value) {
      this.filters[filter] = value;

      // Add to history
      this.addToHistory();
    },

    // Save current edited image to gallery
    saveToGallery(canvas) {
      const imageData = canvas.toDataURL("image/png");

      this.gallery.push({
        id: Date.now(),
        image: imageData,
        filters: { ...this.filters }, // Store a copy of the filters
        date: new Date().toISOString(),
      });

      // Persist to localStorage if needed
      this.saveGalleryToLocalStorage();
    },

    // Remove image from gallery
    removeFromGallery(id) {
      this.gallery = this.gallery.filter((item) => item.id !== id);

      // Update localStorage
      this.saveGalleryToLocalStorage();
    },

    // Load gallery from localStorage
    loadGalleryFromLocalStorage() {
      const savedGallery = localStorage.getItem("photoEditorGallery");
      if (savedGallery) {
        try {
          this.gallery = JSON.parse(savedGallery);
        } catch (e) {
          console.error("Failed to load gallery from localStorage", e);
        }
      }
    },

    // Save gallery to localStorage
    saveGalleryToLocalStorage() {
      localStorage.setItem("photoEditorGallery", JSON.stringify(this.gallery));
    },

    // Add current state to history
    addToHistory() {
      // If we're not at the end of the history array, truncate it
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }

      // Add current state to history
      this.history.push({
        filters: { ...this.filters },
      });

      // Set history index to the end
      this.historyIndex = this.history.length - 1;
    },

    // Undo last action
    undo() {
      if (this.canUndo) {
        this.historyIndex--;
        this.filters = { ...this.history[this.historyIndex].filters };
      }
    },

    // Redo last undone action
    redo() {
      if (this.canRedo) {
        this.historyIndex++;
        this.filters = { ...this.history[this.historyIndex].filters };
      }
    },
  },
});
