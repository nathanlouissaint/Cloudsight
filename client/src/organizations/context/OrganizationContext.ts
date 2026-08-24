import {
  createContext,
} from "react";

import type {
  OrganizationContextType,
} from "../types";

export const OrganizationContext =
  createContext<OrganizationContextType | null>(
    null,
  );
