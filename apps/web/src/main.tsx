import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/app.tsx";

import "./design-system/theme/global.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("missing #root container");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
