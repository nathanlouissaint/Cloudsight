import React from "react";
import ReactDOM from "react-dom/client";
import {
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  ReactQueryDevtools,
} from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

import App from "./App";

import {
  AuthProvider,
} from "./auth/AuthProvider";

import {
  OrganizationProvider,
} from "./organizations/OrganizationProvider";

import {
  queryClient,
} from "./lib/queryClient";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")!,
).render(
  <React.StrictMode>
    <QueryClientProvider
      client={queryClient}
    >
      <AuthProvider>
        <OrganizationProvider>
          <App />

          <Toaster
            position="top-right"
            richColors
            closeButton
            expand={false}
            duration={4000}
          />
        </OrganizationProvider>
      </AuthProvider>

      <ReactQueryDevtools
        initialIsOpen={false}
      />
    </QueryClientProvider>
  </React.StrictMode>,
);
