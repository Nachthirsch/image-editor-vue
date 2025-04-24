<script setup>
// No imports needed here as we'll use router-view
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation Bar -->
    <nav class="bg-indigo-600 text-white shadow-md">
      <div class="container mx-auto px-4 py-3">
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-bold">Interactive Photo Filter Editor</h1>
          <div class="space-x-4">
            <router-link to="/edit" class="px-3 py-2 rounded hover:bg-indigo-700 transition">Editor</router-link>
            <router-link to="/gallery" class="px-3 py-2 rounded hover:bg-indigo-700 transition">Gallery</router-link>
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
