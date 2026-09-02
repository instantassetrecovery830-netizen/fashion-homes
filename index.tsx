
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./components/App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CurrencyProvider } from "./context/CurrencyContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
