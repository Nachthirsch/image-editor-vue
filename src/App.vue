<script setup>
// No imports needed here as we'll use router-view
import { ref, onMounted, onUnmounted } from "vue";

// Track scroll position for nav effects
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

// Handle scroll events
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

// Add scroll listener
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Check initial scroll position
});

// Clean up scroll listener
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// Toggle mobile menu
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Bar -->
    <nav :class="['fixed w-full z-30 transition-all duration-300', isScrolled ? 'bg-white/90 backdrop-blur-md text-gray-800 shadow-md py-2' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3']">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold tracking-tight">
              <span :class="isScrolled ? 'text-indigo-600' : 'text-indigo-200'">Interactive</span>
              <span> Photo Editor</span>
            </h1>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex space-x-1">
            <router-link to="/edit" class="px-4 py-2 rounded-lg hover:bg-indigo-500/10 transition-all duration-300 font-medium flex items-center" :class="isScrolled ? 'text-indigo-600 hover:text-indigo-800' : 'text-white'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Editor
            </router-link>
            <router-link to="/gallery" class="px-4 py-2 rounded-lg hover:bg-indigo-500/10 transition-all duration-300 font-medium flex items-center" :class="isScrolled ? 'text-indigo-600 hover:text-indigo-800' : 'text-white'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
              </svg>
              Gallery
            </router-link>
          </div>

          <!-- Mobile menu button -->
          <button class="md:hidden p-2 rounded-lg" @click="toggleMobileMenu" :class="isScrolled ? 'text-indigo-600' : 'text-white'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Mobile Navigation Menu -->
        <div v-if="isMobileMenuOpen" class="md:hidden mt-3 pb-3 space-y-1 transition-all duration-300">
          <router-link to="/edit" class="block px-4 py-2 rounded-lg hover:bg-indigo-500/10 transition-all duration-300" :class="isScrolled ? 'text-indigo-600 hover:text-indigo-800' : 'text-white'" @click="isMobileMenuOpen = false">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Editor
            </div>
          </router-link>
          <router-link to="/gallery" class="block px-4 py-2 rounded-lg hover:bg-indigo-500/10 transition-all duration-300" :class="isScrolled ? 'text-indigo-600 hover:text-indigo-800' : 'text-white'" @click="isMobileMenuOpen = false">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
              </svg>
              Gallery
            </div>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Main Content Area with padding for fixed header -->
    <div class="pt-20">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- Footer -->
    <footer class="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-10 mt-16 relative overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
        <div class="grid grid-cols-12 gap-4 h-full opacity-5">
          <div v-for="i in 12" :key="i" class="col-span-1 h-full bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent"></div>
        </div>
      </div>

      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center py-4">
          <!-- Logo and creator -->
          <div class="mb-6 md:mb-0 flex flex-col items-center md:items-start">
            <div class="text-xl font-bold tracking-tight mb-2">
              <span class="text-indigo-400">Interactive</span>
              <span class="text-white"> Photo Editor</span>
            </div>
            <div class="text-gray-400">Created by Handra Putratama Tanjung</div>
          </div>

          <!-- Social links -->
          <div class="flex flex-col items-center md:items-end space-y-4">
            <div class="flex items-center space-x-4">
              <a href="https://github.com/Nachthirsch" target="_blank" rel="noopener noreferrer" class="social-link p-2 rounded-full bg-gray-800 hover:bg-indigo-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
            <div class="text-sm text-gray-400 hover:text-gray-300 transition-colors">Connect with me on social media</div>
          </div>
        </div>

        <div class="border-t border-gray-800 my-4"></div>

        <!-- Quick Links -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
          <div class="text-center md:text-left">
            <h3 class="text-lg font-semibold text-indigo-400 mb-3">Quick Links</h3>
            <ul class="space-y-2">
              <li><router-link to="/edit" class="text-gray-400 hover:text-white transition-colors">Photo Editor</router-link></li>
              <li><router-link to="/gallery" class="text-gray-400 hover:text-white transition-colors">Gallery</router-link></li>
            </ul>
          </div>
          <div class="text-center md:text-left">
            <h3 class="text-lg font-semibold text-indigo-400 mb-3">Resources</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Tutorials</a></li>
            </ul>
          </div>
          <div class="text-center md:text-left">
            <h3 class="text-lg font-semibold text-indigo-400 mb-3">Contact</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Support</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Feedback</a></li>
            </ul>
          </div>
        </div>

        <!-- Copyright -->
        <div class="text-sm text-gray-500 text-center py-4 mt-4">&copy; {{ new Date().getFullYear() }} Interactive Photo Editor. All rights reserved.</div>
      </div>
    </footer>
  </div>
</template>

<style>
/* Global styles */
body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #b8c1ec;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #8896e0;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, background-color 0.2s;
  cursor: pointer;
  z-index: 10;
  position: relative;
  width: 36px;
  height: 36px;
}

.social-link:hover {
  transform: translateY(-2px);
  background-color: rgb(79, 70, 229);
}

.social-link svg {
  pointer-events: none;
}
</style>
