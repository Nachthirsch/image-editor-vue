<script setup>
// No imports needed here as we'll use router-view
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation Bar -->
    <nav class="bg-indigo-600 text-white shadow-md">
      <div class="container mx-auto px-4 py-3">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold tracking-tight"><span class="text-indigo-200">Interactive</span> Photo Filter Editor</h1>
          <div class="flex space-x-6">
            <router-link to="/edit" class="px-4 py-2 rounded-lg hover:bg-indigo-500 transition-all duration-300 font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Editor
            </router-link>
            <router-link to="/gallery" class="px-4 py-2 rounded-lg hover:bg-indigo-500 transition-all duration-300 font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
              </svg>
              Gallery
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content Area -->
    <router-view />
  </div>
</template>

<style>
/* Global styles if needed */
</style>
