import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LangueProvider } from "./context/LangueContext";
import "./theme/fonts.css";
import "./styles/ui.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("L'élément #root est introuvable dans index.html.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <LangueProvider>
      <App />
    </LangueProvider>
  </React.StrictMode>,
);
