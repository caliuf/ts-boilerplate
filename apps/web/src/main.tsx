import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { GreetingPage } from "./features/greeting/GreetingPage.tsx";

import "./design-system/style.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("missing #root container");
}

createRoot(container).render(
  <StrictMode>
    <GreetingPage />
  </StrictMode>,
);
