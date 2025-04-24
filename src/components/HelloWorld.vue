<script setup>
import { ref } from "vue";

defineProps({
  msg: String,
});

const count = ref(0);
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
    <!-- Hero Section -->
    <header class="container mx-auto px-4 py-20 md:py-32">
      <h1 class="text-4xl md:text-6xl font-bold text-center text-gray-100">Post-Rock Horizons</h1>
      <p class="mt-6 text-xl text-center text-gray-300 max-w-3xl mx-auto">Explore the expansive soundscapes and emotional crescendos of one of music's most cinematic genres.</p>
      <div class="mt-10 flex justify-center">
        <button class="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-300 mr-4" type="button" @click="count++">Played {{ count }} times</button>
        <a href="#discover" class="px-8 py-3 bg-transparent border border-gray-400 text-gray-200 font-medium rounded-lg hover:bg-gray-700 transition duration-300"> Discover More </a>
      </div>
    </header>

    <!-- About Post-Rock Section -->
    <section id="discover" class="py-16 bg-gray-800">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-gray-100">What is Post-Rock?</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <p class="text-gray-300 mb-6 text-lg">Post-rock is a form of experimental rock characterized by the use of rock instruments primarily to explore textures and timbres rather than traditional rock song structures.</p>
            <p class="text-gray-300 mb-6 text-lg">Typically featuring long compositions built on atmospheric soundscapes, the genre transcends the conventional verse-chorus structure in favor of dynamic, texture-focused compositions.</p>
            <p class="text-gray-300 text-lg">Often instrumental, post-rock emphasizes the power of sound itself, creating emotional journeys through carefully crafted musical crescendos and decrescendos.</p>
          </div>
          <div class="rounded-lg overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Concert scene" class="w-full h-auto" />
          </div>
        </div>
      </div>
    </section>

    <!-- Key Artists Section -->
    <section class="py-16 bg-gray-900">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-gray-100">Influential Artists</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="p-6 bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition duration-300 border border-gray-700">
            <div class="text-indigo-400 text-2xl mb-4">★</div>
            <h3 class="text-xl font-semibold mb-2 text-gray-100">Godspeed You! Black Emperor</h3>
            <p class="text-gray-300">Known for their orchestral compositions, political themes, and haunting visual elements.</p>
          </div>

          <div class="p-6 bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition duration-300 border border-gray-700">
            <div class="text-indigo-400 text-2xl mb-4">★</div>
            <h3 class="text-xl font-semibold mb-2 text-gray-100">Explosions in the Sky</h3>
            <p class="text-gray-300">Masters of creating emotive soundscapes with their distinctive guitar-driven approach.</p>
          </div>

          <div class="p-6 bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition duration-300 border border-gray-700">
            <div class="text-indigo-400 text-2xl mb-4">★</div>
            <h3 class="text-xl font-semibold mb-2 text-gray-100">Sigur Rós</h3>
            <p class="text-gray-300">Icelandic band blending ethereal vocals with expansive instrumental arrangements.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Album Recommendations -->
    <section class="py-16 bg-gradient-to-b from-gray-800 to-indigo-900">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold text-white mb-10">Essential Albums</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-gray-900 p-4 rounded-lg shadow-lg transition duration-300 hover:transform hover:scale-105">
            <img src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c6a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Album cover" class="w-full h-auto rounded mb-4" />
            <h3 class="font-semibold text-lg text-gray-100">F♯ A♯ ∞</h3>
            <p class="text-gray-400">Godspeed You! Black Emperor</p>
          </div>
          <div class="bg-gray-900 p-4 rounded-lg shadow-lg transition duration-300 hover:transform hover:scale-105">
            <img src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Album cover" class="w-full h-auto rounded mb-4" />
            <h3 class="font-semibold text-lg text-gray-100">The Earth Is Not a Cold Dead Place</h3>
            <p class="text-gray-400">Explosions in the Sky</p>
          </div>
          <div class="bg-gray-900 p-4 rounded-lg shadow-lg transition duration-300 hover:transform hover:scale-105">
            <img src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Album cover" class="w-full h-auto rounded mb-4" />
            <h3 class="font-semibold text-lg text-gray-100">Ágætis byrjun</h3>
            <p class="text-gray-400">Sigur Rós</p>
          </div>
          <div class="bg-gray-900 p-4 rounded-lg shadow-lg transition duration-300 hover:transform hover:scale-105">
            <img src="https://images.unsplash.com/photo-1603048588665-791ca8aea617?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Album cover" class="w-full h-auto rounded mb-4" />
            <h3 class="font-semibold text-lg text-gray-100">Spiderland</h3>
            <p class="text-gray-400">Slint</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="py-16 bg-indigo-900">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold text-white mb-6">Stay Connected</h2>
        <p class="text-indigo-200 mb-8 max-w-2xl mx-auto">Subscribe to our newsletter for the latest post-rock releases, concert announcements, and deep dives into the genre.</p>
        <div class="max-w-md mx-auto">
          <div class="flex flex-col md:flex-row gap-2">
            <input type="email" placeholder="Your email address" class="flex-grow px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-800 text-white border border-gray-700" />
            <button class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-300">Subscribe</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-12">
      <div class="container mx-auto px-4">
        <div class="text-center">
          <p class="mb-4">Created for post-rock enthusiasts worldwide</p>
          <div class="flex justify-center space-x-6">
            <a href="#" class="hover:text-indigo-400 transition duration-300">Spotify Playlists</a>
            <a href="#" class="hover:text-indigo-400 transition duration-300">Community</a>
            <a href="#" class="hover:text-indigo-400 transition duration-300">Events</a>
            <a href="#" class="hover:text-indigo-400 transition duration-300">Contact</a>
          </div>
          <p class="mt-8 text-sm">Note: This is a fictional site created as an example. Album art images are placeholders.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Tailwind classes handle all styling */
</style>
