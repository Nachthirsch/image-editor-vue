# Image Editor Vue

![Vue.js](https://img.shields.io/badge/Vue.js-3.3.4-42b883)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.3-38bdf8)

A lightweight, user-friendly image editor built with Vue.js. This application provides essential image editing capabilities with a clean, intuitive interface.

## ✨ Features

- 🖼️ Image cropping with advanced options
- 🔄 Image rotation and flipping
- 📐 Resize functionality
- 🎨 Basic filters and adjustments
- 💾 Export to different formats
- 📱 Responsive design for both desktop and mobile

## 🚀 Demo

Check out the live demo: [Image Editor Vue Demo](https://imditor.netlify.app/)

## 🛠️ Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository:

```bash
git clone https://github.com/Nachthirsch/image-editor-vue.git
cd image-editor-vue
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to:

```
http://localhost:5173
```

## 🏗️ Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

To preview the production build:

```bash
npm run preview
# or
yarn preview
```

## 🧩 Technologies Used

- **Vue.js 3** - Progressive JavaScript framework
- **Vue Router** - Official router for Vue.js
- **Pinia** - State management for Vue
- **vue-advanced-cropper** - Powerful cropping library
- **html2canvas** - Screenshots and image export
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next-generation frontend tooling

## 📖 Usage

1. Upload an image using the upload button or drag and drop
2. Use the sidebar tools to edit your image
3. Apply filters and adjustments as needed
4. Export your edited image in your preferred format

## 📁 Project Structure

```
image-editor-vue/
├── public/           # Static assets
├── src/
│   ├── assets/       # Images, fonts, etc.
│   ├── components/   # Vue components
│   ├── router/       # Vue Router configuration
│   ├── stores/       # Pinia stores
│   ├── views/        # Page components
│   ├── App.vue       # Root component
│   └── main.js       # Application entry point
├── index.html        # HTML template
└── package.json      # Project dependencies
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- [Vue.js](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [vue-advanced-cropper](https://norserium.github.io/vue-advanced-cropper/)
- [html2canvas](https://html2canvas.hertzen.com/)

---

Made with ❤️ by [Nachthirsch](https://github.com/Nachthirsch)
