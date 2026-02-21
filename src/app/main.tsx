import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { registerServiceWorker } from "./pwa/registerServiceWorker";

const container = document.getElementById("root");
if (container === null) {
  throw new Error("Root element was not found.");
}

document.title = "e-Plan Editor";

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);

void registerServiceWorker({
  onNeedRefresh: () => {
    window.dispatchEvent(new Event("app:pwa-update-available"));
  },
  onOfflineReady: () => {
    window.dispatchEvent(new Event("app:pwa-offline-ready"));
  },
  onRegistrationError: () => {
    window.dispatchEvent(new Event("app:pwa-registration-error"));
  }
});
