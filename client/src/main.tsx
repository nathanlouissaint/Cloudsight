import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import {
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  ReactQueryDevtools,
} from "@tanstack/react-query-devtools";

import { queryClient } from "./lib/queryClient";
import { analytics } from "./lib/analytics";

analytics.init();

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />

      <ReactQueryDevtools
        initialIsOpen={false}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
