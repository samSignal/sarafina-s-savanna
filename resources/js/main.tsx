import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <CurrencyProvider>
            <App />
          </CurrencyProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
