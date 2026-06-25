import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAuthStore from "./stores/authStore";
import useThemeStore from "./stores/themeStore";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./features/auth/LoginPage";
import OverviewPage from "./features/overview/OverviewPage";
import ChannelsPage from "./features/channels/ChannelsPage";
import VideosPage from "./features/videos/VideosPage";
import ReportsPage from "./features/reports/ReportsPage";
import SettingsPage from "./features/settings/SettingsPage";
import UsersPage from "./features/users/UsersPage";
import { useEffect } from "react";

const queryClient = new QueryClient();

function RequireAdmin({ children }) {
  const { currentUser } = useAuthStore();
  if (currentUser?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

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
            <Route index element={<OverviewPage />} />
            <Route path="channels" element={<RequireAdmin><ChannelsPage /></RequireAdmin>} />
            <Route path="videos" element={<VideosPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="users" element={<RequireAdmin><UsersPage /></RequireAdmin>} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
