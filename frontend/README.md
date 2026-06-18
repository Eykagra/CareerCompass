# 🧭 CareerCompass - Frontend Client

This is the React SPA frontend client for CareerCompass, built with **Vite**, **Tailwind CSS**, **Framer Motion**, and **XYFlow** (React Flow).

## 🚀 Development Setup

Make sure you have Node.js 20+ installed.

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The dev server will run on [http://localhost:5173](http://localhost:5173). It is configured to automatically proxy `/api` calls to the FastAPI backend running on port `8000`.

## 📦 Scripts

- `npm run dev`: Starts the dev server with HMR.
- `npm run build`: Compiles the static assets into `dist/` for production.
- `npm run lint`: Runs ESLint on the source files.
- `npm run preview`: Previews the built production assets locally.

## 📂 Key Dependencies

- **XYFlow (`@xyflow/react`)**: Interactive canvas rendering for branching roadmaps.
- **Framer Motion**: Smooth page transitions, scroll animations, and interactive hover effects.
- **Lucide React**: Vector icons for navigation, status, and layout.
- **Tailwind CSS**: Utility-first CSS styling and layout configuration.
