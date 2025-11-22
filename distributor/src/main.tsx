import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { DistributorAuthProvider } from "./context/DistributorAuthContext";
import { DistributorOrderProvider } from "./context/DistributorOrderContext";
import { DistributorQuoteProvider } from "./context/DistributorQuoteContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DistributorAuthProvider>
      <DistributorOrderProvider>
        <DistributorQuoteProvider>
          <App />
        </DistributorQuoteProvider>
      </DistributorOrderProvider>
    </DistributorAuthProvider>
  </React.StrictMode>
);
