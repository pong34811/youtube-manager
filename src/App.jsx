import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAuthStore from "./stores/authStore";
import useThemeStore from "./stores/themeStore";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./features/auth/LoginPage";
import { useEffect } from "react";

const queryClient = new QueryClient();

function App() {
  const { currentUser } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route element={<MainLayout />}>
            <Route index element={<div className="text-[var(--text-primary)]">Overview Page</div>} />
            <Route path="channels" element={<div className="text-[var(--text-primary)]">Channels Page</div>} />
            <Route path="videos" element={<div className="text-[var(--text-primary)]">Videos Page</div>} />
            <Route path="analytics" element={<div className="text-[var(--text-primary)]">Analytics Page</div>} />
            <Route path="revenue" element={<div className="text-[var(--text-primary)]">Revenue Page</div>} />
            <Route path="audience" element={<div className="text-[var(--text-primary)]">Audience Page</div>} />
            <Route path="reports" element={<div className="text-[var(--text-primary)]">Reports Page</div>} />
            <Route path="settings" element={<div className="text-[var(--text-primary)]">Settings Page</div>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
