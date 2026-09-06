import React from "react";
import { RouterProvider } from "react-router-dom";
import { QueryProvider } from "./providers/QueryProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { SocketProvider } from "./providers/SocketProvider";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { router } from "./routes";

export const App: React.FC = () => {
  return (
    <QueryProvider>
      <AuthProvider>
        <SocketProvider>
          <TooltipProvider>
            <RouterProvider router={router} />
          </TooltipProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryProvider>
  );
};

export default App;
