import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Diagram from "./pages/Diagram";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import TokenPurchase from "./pages/TokenPurchase";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/diagram"
                element={
                  <ProtectedRoute>
                    <Diagram />
                  </ProtectedRoute>
                }
              />
              {/* Token Purchase Routes - Disabled (Sandbox Mode) */}
              {/* <Route
                path="/purchase"
                element={
                  <ProtectedRoute>
                    <TokenPurchase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tokens"
                element={
                  <ProtectedRoute>
                    <TokenPurchase />
                  </ProtectedRoute>
                }
              /> */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
