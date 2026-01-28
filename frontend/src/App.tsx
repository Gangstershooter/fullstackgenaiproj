import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { MainLayout } from "./components/layout/MainLayout";
import { ChatPage } from "./pages/ChatPage";
import { SearchModal } from "@/components/search/SearchModal";
import { LoginPage } from "@/pages/LoginPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function App() {
  return (
    // <GoogleOAuthProvider
    //   clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    //   onScriptLoadSuccess={() => {
    //     (window as any).google?.accounts.id.disableAutoSelect();
    //     (window as any).google?.accounts.id.cancel();
    //   }}
    // >

      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            {/* <Route path="/login" element={<LoginPage />} /> */}

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                // <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<ChatPage />} />
                      <Route path="/c/:chatId" element={<ChatPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>

                    {/* Global Search Modal */}
                    <SearchModal />
                  </MainLayout>
                // </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    // </GoogleOAuthProvider>
  );
}
