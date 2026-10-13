import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/* ==========================================================================
 * Part 3, Step 3: Register the Service Worker
 * Checks that the browser supports service workers, then registers
 * service-worker.js once the window has finished loading.
 * ========================================================================== */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service worker registered with scope:", registration.scope);
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  });
}
