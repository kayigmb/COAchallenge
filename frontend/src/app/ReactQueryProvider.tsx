"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React from "react";

const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:5*60*1000,
        refetchOnReconnect: true,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryProvider;
