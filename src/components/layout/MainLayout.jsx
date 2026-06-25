import { Outlet, Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import useSidebarStore from "../../stores/sidebarStore";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout() {
  const { currentUser } = useAuthStore();
  const { isCollapsed } = useSidebarStore();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <Sidebar />
      <div className={`${isCollapsed ? "lg:ml-20" : "lg:ml-64"} transition-all duration-300`}>
        <Header />
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
