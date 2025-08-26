import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./App.css";

// Optimisation: Utilisation de StrictMode pour détecter les problèmes de performance
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
