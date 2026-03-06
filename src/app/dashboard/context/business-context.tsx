"use client";

import { createContext, useContext } from "react";
import type { MyBusiness } from "@/api/businesses";

const BusinessContext = createContext<MyBusiness | null>(null);

export function useBusinessContext(): MyBusiness {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error("useBusinessContext must be used inside AuthGuard");
  }
  return ctx;
}

export { BusinessContext };
