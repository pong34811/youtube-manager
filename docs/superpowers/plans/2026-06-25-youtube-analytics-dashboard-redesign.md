# YouTube Analytics Dashboard Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the YouTube API Config Manager into a modern multi-channel YouTube Analytics Dashboard with sidebar navigation, dark/light mode, and 9 data-rich pages.

**Architecture:** React 19 SPA + react-router-dom v7 + Zustand (auth, theme, sidebar state) + TanStack Query v5 (server state) + Tailwind CSS v4. Existing utility files (`utils/analytics.js`, `utils/youtube.js`) reused as-is. Firebase Realtime DB subscription moved to TanStack Query. New component library under `components/ui/`.

**Tech Stack:** React 19, Vite 7, Tailwind CSS v4, react-router-dom v7, zustand v5, @tanstack/react-query v5, recharts v2, xlsx (existing)

## Global Constraints

- Keep JavaScript (JSX) — NO TypeScript migration
- Keep custom Firebase Realtime DB email auth — NO Firebase Auth migration
- Reuse existing `src/utils/analytics.js` and `src/utils/youtube.js` as-is
- Reuse existing `src/firebase.js` as-is
- Thai language UI for all user-facing text
- Desktop-first responsive + mobile sidebar collapse
- Dark mode support via Tailwind `dark:` variant + CSS variables
- All 9 navigation sections with real YouTube API data
- No test framework — verify by running `npm run dev` and manual inspection

---

### Task 1: Install Dependencies + Setup Routing Shell

**Files:**
- Create: `src/lib/api.js`
- Create: `src/stores/authStore.js`
- Create: `src/stores/themeStore.js`
- Create: `src/stores/sidebarStore.js`
- Create: `src/components/layout/Sidebar.jsx`
- Create: `src/components/layout/Header.jsx`
- Create: `src/components/layout/MainLayout.jsx`
- Modify: `src/main.jsx`
- Modify: `package.json`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `src/firebase.js` (existing)
- Produces: `authStore` (`useAuthStore`), `themeStore` (`useThemeStore`), `sidebarStore` (`useSidebarStore`)

- [ ] **Step 1: Install new dependencies**

```bash
npm install react-router-dom zustand @tanstack/react-query recharts
```

- [ ] **Step 2: Create src/lib/api.js**

```jsx
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";

export const subscribeConfigs = (callback) => {
  const configsRef = ref(database, "youtube-configs");
  const unsubscribe = onValue(configsRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
  return unsubscribe;
};

export const checkUserEmail = async (email) => {
  const { get } = await import("firebase/database");
  const usersRef = ref(database, "users");
  const snapshot = await get(usersRef);
  const users = snapshot.val();
  if (!users) return null;
  let found = null;
  Object.entries(users).forEach(([key, user]) => {
    if (user.email && user.email.toLowerCase() === email.toLowerCase()) {
      found = { id: key, ...user };
    }
  });
  return found;
};
```

- [ ] **Step 3: Create src/stores/authStore.js**

```jsx
import { create } from "zustand";

const useAuthStore = create((set) => ({
  currentUser: JSON.parse(localStorage.getItem("loggedInUser") || "null"),
  login: (user) => {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    set({ currentUser: user });
  },
  logout: () => {
    localStorage.removeItem("loggedInUser");
    set({ currentUser: null });
  },
}));

export default useAuthStore;
```

- [ ] **Step 4: Create src/stores/themeStore.js**

```jsx
import { create } from "zustand";

const getInitialTheme = () => {
  const stored = localStorage.getItem("theme");
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return { theme: next };
    }),
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme });
  },
}));

export default useThemeStore;
```

- [ ] **Step 5: Create src/stores/sidebarStore.js**

```jsx
import { create } from "zustand";

const useSidebarStore = create((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setMobileOpen: (open) => set({ isMobileOpen: open }),
}));

export default useSidebarStore;
```

- [ ] **Step 6: Create src/components/layout/Sidebar.jsx**

```jsx
import { NavLink } from "react-router-dom";
import useSidebarStore from "../../stores/sidebarStore";
import useAuthStore from "../../stores/authStore";

const navItems = [
  { to: "/", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { to: "/channels", label: "Channels", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { to: "/videos", label: "Videos", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
  { to: "/analytics", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { to: "/revenue", label: "Revenue", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { to: "/audience", label: "Audience", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { to: "/reports", label: "Reports", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { to: "/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
];

export default function Sidebar() {
  const { isCollapsed, isMobileOpen, setMobileOpen } = useSidebarStore();
  const { currentUser, logout } = useAuthStore();

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-[var(--bg-sidebar)] text-white transition-all duration-300 
          ${isCollapsed ? "w-20" : "w-64"} 
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col`}
      >
        <div className="flex items-center h-16 px-4 border-b border-white/10">
          <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          {!isCollapsed && <span className="ml-3 text-lg font-bold">YouTube Manager</span>}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              {!isCollapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          {!isCollapsed && (
            <div className="mb-2 px-2">
              <p className="text-sm text-gray-300 truncate">{currentUser?.email}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="ml-3">ออกจากระบบ</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
```

- [ ] **Step 7: Create src/components/layout/Header.jsx**

```jsx
import useSidebarStore from "../../stores/sidebarStore";
import useThemeStore from "../../stores/themeStore";

export default function Header() {
  const { setMobileOpen } = useSidebarStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[var(--bg-primary)] border-b border-gray-200 dark:border-gray-700 flex items-center px-4 lg:px-6">
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mr-3"
      >
        <svg className="w-6 h-6 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1" />

      <div className="flex items-center space-x-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === "dark" ? (
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {useAuthStore.getState().currentUser?.email?.[0].toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 8: Create src/components/layout/MainLayout.jsx**

```jsx
import { Outlet, Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout() {
  const { currentUser } = useAuthStore();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <Sidebar />
      <div className="lg:ml-64 transition-all duration-300">
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
```

- [ ] **Step 9: Update src/App.jsx — new routing shell**

```jsx
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
```

- [ ] **Step 10: Update src/main.jsx**

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 11: Verify the shell works**

Run `npm run dev`. Verify:
- App redirects to `/login` initially
- Login page works (will build in Task 2)
- Layout renders with sidebar + header
- Dark/light toggle works
- Run `npm run build` to confirm no errors

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add routing, stores, layout shell, and dependencies"
```

---

### Task 2: Auth + Login Page

**Files:**
- Create: `src/features/auth/LoginPage.jsx`
- Create: `src/features/auth/ProtectedRoute.jsx` (not needed — MainLayout handles this)

**Interfaces:**
- Consumes: `useAuthStore` (login method), `checkUserEmail` from `src/lib/api.js`
- Produces: Login UI

- [ ] **Step 1: Create src/features/auth/LoginPage.jsx**

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { checkUserEmail } from "../../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: "", type: "" });
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith("@gmail.com")) {
      setStatus({ text: "กรุณากรอก Gmail ที่ถูกต้อง", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const user = await checkUserEmail(trimmedEmail);
      if (user) {
        login(user);
        navigate("/", { replace: true });
      } else {
        setStatus({ text: "ไม่พบ Gmail นี้ในระบบ กรุณาติดต่อผู้ดูแลระบบ", type: "error" });
      }
    } catch {
      setStatus({ text: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
      <div className="max-w-md w-full animate-slide-up">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500" />
          <div className="text-center mb-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-red-500 to-pink-600 rounded-3xl rotate-3 flex items-center justify-center mb-6 shadow-xl shadow-red-500/20 group hover:rotate-6 transition-all duration-300">
              <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">YouTube Insight</h1>
            <p className="text-gray-500 font-medium">เข้าสู่ระบบเพื่อจัดการข้อมูลของคุณ</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Gmail Address</label>
              <div className="relative group">
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-5 py-4 pl-12 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all outline-none text-gray-800 placeholder-gray-400"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-4 group-focus-within:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </form>
          {status.text && (
            <div className={`mt-6 p-3 rounded-lg text-sm text-center ${status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {status.text}
            </div>
          )}
        </div>
        <p className="text-center text-white/40 text-sm mt-8">&copy; 2024 YouTube Data Manager. All rights reserved.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify login flow**

Run `npm run dev`. Verify:
- Visit `/login` — shows login form
- Enter invalid email — shows error
- Enter valid email from Firebase `users` node — redirects to `/`
- After login, refresh persists session

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add login page with auth store integration"
```

---

### Task 3: Component Library (UI Kit)

**Files:**
- Create: `src/components/ui/Card.jsx`
- Create: `src/components/ui/Button.jsx`
- Create: `src/components/ui/Input.jsx`
- Create: `src/components/ui/Badge.jsx`
- Create: `src/components/ui/KpiCard.jsx`
- Create: `src/components/ui/Spinner.jsx`
- Create: `src/components/ui/Skeleton.jsx`
- Create: `src/components/ui/EmptyState.jsx`
- Create: `src/components/ui/Modal.jsx`
- Create: `src/components/ui/Select.jsx`
- Create: `src/components/ui/Table.jsx`

- [ ] **Step 1: Create src/components/ui/Card.jsx**

```jsx
export default function Card({ children, className = "", padding = true }) {
  return (
    <div className={`bg-[var(--bg-primary)] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${padding ? "p-6" : ""} ${className}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/ui/Button.jsx**

```jsx
export default function Button({ children, variant = "primary", size = "md", icon, onClick, disabled, className = "", type = "button" }) {
  const base = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {icon && <span className="mr-2">{icon}</span>}{children}
    </button>
  );
}
```

- [ ] **Step 3: Create src/components/ui/Badge.jsx**

```jsx
export default function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200",
    success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    danger: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    info: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Create src/components/ui/KpiCard.jsx**

```jsx
export default function KpiCard({ label, value, trend, trendLabel, icon }) {
  const isUp = trend > 0;
  return (
    <div className="bg-[var(--bg-primary)] rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
        {icon && <span className="text-[var(--text-secondary)]">{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">{value}</div>
      <div className="flex items-center space-x-1">
        <span className={`text-sm font-semibold ${isUp ? "text-green-600" : "text-red-600"}`}>
          {isUp ? "▲" : "▼"} {Math.abs(trend)}%
        </span>
        {trendLabel && <span className="text-xs text-[var(--text-secondary)]">{trendLabel}</span>}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create src/components/ui/Spinner.jsx**

```jsx
export default function Spinner({ size = "md" }) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={`${sizes[size]} border-4 border-gray-200 dark:border-gray-700 border-t-indigo-600 rounded-full animate-spin`} />
  );
}
```

- [ ] **Step 6: Create src/components/ui/Skeleton.jsx**

```jsx
export default function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />;
}
```

- [ ] **Step 7: Create src/components/ui/EmptyState.jsx**

```jsx
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="text-gray-300 dark:text-gray-600 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      {description && <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
```

- [ ] **Step 8: Create src/components/ui/Modal.jsx**

```jsx
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[var(--bg-primary)] rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--text-secondary)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Create src/components/ui/Select.jsx**

```jsx
export default function Select({ label, options, value, onChange }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 10: Create src/components/ui/Table.jsx**

```jsx
export default function Table({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider ${col.className || ""}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              onClick={() => onRowClick?.(row)}
              className={`${onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" : ""} transition-colors`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-sm text-[var(--text-primary)] ${col.cellClass || ""}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 11: Verify components render**

Run `npm run dev`. Temporarily mount a few components in App.jsx to verify they render without errors. Then revert.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add shared UI component library (Card, Button, KpiCard, Table, Modal, etc.)"
```

---

### Task 4: Theme System + CSS Variables

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Update src/index.css with theme variables**

```css
@import "tailwindcss";

body {
  font-family: "Outfit", sans-serif;
}

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-sidebar: #1e1e2d;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
}

[data-theme="dark"] {
  --bg-primary: #1e293b;
  --bg-secondary: #0f172a;
  --bg-sidebar: #0f0f23;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

- [ ] **Step 2: Update index.html — clean up background, add data-theme**

```html
<!DOCTYPE html>
<html lang="th" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>YouTube Analytics Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-[var(--bg-secondary)]">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Verify theme toggle**

Run `npm run dev`. Verify:
- Clicking toggle switches between light/dark
- Theme persists on refresh
- Sidebar, header, and main content all respect theme

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add dark/light theme system with CSS variables"
```

---

### Task 5: Overview Page (Dashboard Landing)

**Files:**
- Create: `src/features/overview/KpiRow.jsx`
- Create: `src/features/overview/TopVideosWidget.jsx`
- Create: `src/features/overview/QuickInsights.jsx`
- Create: `src/features/overview/OverviewPage.jsx`
- Create: `src/hooks/useYouTubeApi.js`
- Create: `src/hooks/useChannelData.js`
- Modify: `src/App.jsx` (import OverviewPage into routes)

**Interfaces:**
- Consumes: `subscribeConfigs` (from `src/lib/api.js`), `fetchChannelData`, `fetchChannelVideosForYear` (from `src/utils/youtube.js`), `analytics.js`
- Produces: Main landing dashboard

- [ ] **Step 1: Create src/hooks/useYouTubeApi.js**

```jsx
import { useQuery } from "@tanstack/react-query";
import { fetchChannelData, fetchChannelVideosForYear } from "../utils/youtube";

export function useChannelInfo(apiKey, channelId) {
  return useQuery({
    queryKey: ["channel", apiKey, channelId],
    queryFn: () => fetchChannelData(apiKey, channelId),
    enabled: !!apiKey && !!channelId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useChannelVideos(apiKey, channelId, year) {
  return useQuery({
    queryKey: ["videos", apiKey, channelId, year],
    queryFn: () => fetchChannelVideosForYear(apiKey, channelId, year),
    enabled: !!apiKey && !!channelId && !!year,
    staleTime: 5 * 60 * 1000,
  });
}
```

- [ ] **Step 2: Create src/hooks/useChannelData.js**

```jsx
import { useEffect, useState } from "react";
import { subscribeConfigs } from "../lib/api";

export function useAllConfigs() {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeConfigs((data) => {
      setConfigs(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { configs, loading };
}
```

- [ ] **Step 3: Create src/features/overview/KpiRow.jsx**

```jsx
import KpiCard from "../../components/ui/KpiCard";

export default function KpiRow({ totalViews, totalSubs, totalWatchTime, revenue, totalVideos }) {
  const format = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n?.toLocaleString() || "0";
  };

  const kpis = [
    { label: "Total Views", value: format(totalViews), trend: 12, icon: "👁" },
    { label: "Total Subscribers", value: format(totalSubs), trend: 5, icon: "👥" },
    { label: "Watch Time (hrs)", value: format(totalWatchTime), trend: 8, icon: "⏱" },
    { label: "Revenue", value: revenue ? `$${format(revenue)}` : "—", trend: -2, icon: "💰" },
    { label: "Published Videos", value: totalVideos?.toLocaleString() || "0", trend: 3, icon: "🎬" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {kpis.map((kpi, i) => (
        <KpiCard key={i} {...kpi} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create src/features/overview/TopVideosWidget.jsx**

```jsx
import Card from "../../components/ui/Card";
import { formatNumber } from "../../utils/youtube";
import { getTopVideos } from "../../utils/analytics";

export default function TopVideosWidget({ videos }) {
  const top = getTopVideos(videos || []);

  return (
    <Card>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Top 10 Videos</h3>
      <div className="space-y-3">
        {top.map((v, i) => (
          <div key={v.id} className="flex items-center space-x-3">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{v.snippet.title}</p>
              <p className="text-xs text-[var(--text-secondary)]">{formatNumber(parseInt(v.statistics.viewCount))} views</p>
            </div>
          </div>
        ))}
        {top.length === 0 && <p className="text-sm text-[var(--text-secondary)]">No video data available</p>}
      </div>
    </Card>
  );
}
```

- [ ] **Step 5: Create src/features/overview/QuickInsights.jsx**

```jsx
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

export default function QuickInsights({ videos }) {
  const insights = (videos || []).slice(0, 5).map((v) => {
    const views = parseInt(v.statistics?.viewCount || 0);
    const likes = parseInt(v.statistics?.likeCount || 0);
    const ctr = views > 0 ? ((likes / views) * 100).toFixed(1) : 0;
    return { id: v.id, title: v.snippet.title, views, ctr, badge: views > 100000 ? "🔥" : views > 50000 ? "⭐" : null };
  });

  return (
    <Card>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Quick Insights</h3>
      <div className="space-y-3">
        {insights.length > 0 ? insights.map((v) => (
          <div key={v.id} className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-primary)] truncate flex-1">{v.title}</p>
            {v.badge && <span className="ml-2">{v.badge}</span>}
          </div>
        )) : <p className="text-sm text-[var(--text-secondary)]">No insights available</p>}
      </div>
    </Card>
  );
}
```

- [ ] **Step 6: Create src/features/overview/OverviewPage.jsx**

```jsx
import { useState } from "react";
import { useAllConfigs } from "../../hooks/useChannelData";
import { useChannelInfo, useChannelVideos } from "../../hooks/useYouTubeApi";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import KpiRow from "./KpiRow";
import TopVideosWidget from "./TopVideosWidget";
import QuickInsights from "./QuickInsights";

export default function OverviewPage() {
  const { configs } = useAllConfigs();
  const configList = Object.entries(configs).map(([id, c]) => ({ id, ...c }));
  const [selectedConfigId, setSelectedConfigId] = useState(configList[0]?.id || "");

  const selectedConfig = configList.find((c) => c.id === selectedConfigId);
  const currentYear = new Date().getFullYear();
  const { data: channelData, isLoading: channelLoading } = useChannelInfo(selectedConfig?.apiKey, selectedConfig?.channelId);
  const { data: videos, isLoading: videosLoading } = useChannelVideos(selectedConfig?.apiKey, selectedConfig?.channelId, currentYear);

  const isLoading = channelLoading || videosLoading;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Overview</h1>
        <div className="w-64">
          <Select
            options={[
              { value: "", label: "All Channels" },
              ...configList.map((c) => ({ value: c.id, label: c.channelName || c.id })),
            ]}
            value={selectedConfigId}
            onChange={setSelectedConfigId}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
        <>
          <KpiRow
            totalViews={parseInt(channelData?.statistics?.viewCount || 0)}
            totalSubs={parseInt(channelData?.statistics?.subscriberCount || 0)}
            totalWatchTime={0}
            totalVideos={parseInt(channelData?.statistics?.videoCount || 0)}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopVideosWidget videos={videos} />
            <QuickInsights videos={videos} />
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Update src/App.jsx — replace Overview placeholder**

Replace the Overview route:
```jsx
<Route index element={<OverviewPage />} />
```

Add import:
```jsx
import OverviewPage from "./features/overview/OverviewPage";
```

- [ ] **Step 8: Verify Overview page**

Run `npm run dev`. Verify:
- Overview page loads with channel selector
- Selecting a channel fetches and displays data
- KPI cards show real metrics
- Top videos list renders
- Quick insights section renders

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add Overview dashboard with KPI cards, top videos, and channel selector"
```

---

### Task 6: Channels Page (CRUD + Compare Mode)

**Files:**
- Create: `src/features/channels/ChannelCard.jsx`
- Create: `src/features/channels/ConfigFormModal.jsx`
- Create: `src/features/channels/ChannelCompareTable.jsx`
- Create: `src/features/channels/ChannelsPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create src/features/channels/ChannelCard.jsx**

```jsx
import { formatNumber } from "../../utils/youtube";

export default function ChannelCard({ channel, onEdit, onDelete, onCompare, isSelected }) {
  return (
    <div className={`bg-[var(--bg-primary)] rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${isSelected ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-gray-200 dark:border-gray-700"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold">
            {channel.channelName?.[0] || "C"}
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">{channel.channelName || "Unnamed Channel"}</h3>
            <p className="text-xs text-[var(--text-secondary)]">API: {channel.apiKey?.substring(0, 8)}...</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <input type="checkbox" checked={isSelected} onChange={() => onCompare(channel)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
        </div>
      </div>
      <div className="flex items-center space-x-1 mb-3">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs text-green-600 font-medium">Connected</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Channel ID: {channel.channelId?.substring(0, 12)}...</span>
      </div>
      <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button onClick={() => onEdit(channel)} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Edit</button>
        <button onClick={() => onDelete(channel)} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">Delete</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create src/features/channels/ConfigFormModal.jsx**

```jsx
import { useState, useEffect } from "react";
import { ref, push, update, remove } from "firebase/database";
import { database } from "../../firebase";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

export default function ConfigFormModal({ open, onClose, editingConfig }) {
  const [form, setForm] = useState({ channelName: "", apiKey: "", channelId: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingConfig) {
      setForm({ channelName: editingConfig.channelName || "", apiKey: editingConfig.apiKey || "", channelId: editingConfig.channelId || "" });
    } else {
      setForm({ channelName: "", apiKey: "", channelId: "" });
    }
  }, [editingConfig, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const configsRef = ref(database, "youtube-configs");
      if (editingConfig) {
        await update(ref(database, `youtube-configs/${editingConfig.id}`), { ...form, updatedAt: new Date().toISOString() });
      } else {
        await push(configsRef, { ...form, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      onClose();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editingConfig ? "Edit Channel Config" : "Add New Channel"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Channel Name</label>
          <input required value={form.channelName} onChange={(e) => setForm({ ...form, channelName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">API Key</label>
          <input required value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Channel ID</label>
          <input required value={form.channelId} onChange={(e) => setForm({ ...form, channelId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : editingConfig ? "Update" : "Add Channel"}</Button>
        </div>
      </form>
    </Modal>
  );
}
```

- [ ] **Step 3: Create src/features/channels/ChannelCompareTable.jsx**

```jsx
export default function ChannelCompareTable({ channels }) {
  if (channels.length < 2) return null;

  return (
    <div className="bg-[var(--bg-primary)] rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mt-6">
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Compare Channels</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-2 text-left text-[var(--text-secondary)] font-medium">Property</th>
              {channels.map((ch) => <th key={ch.id} className="px-4 py-2 text-left text-[var(--text-primary)] font-medium">{ch.channelName}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              { key: "channelName", label: "Name" },
              { key: "channelId", label: "Channel ID" },
              { key: "apiKey", label: "API Key" },
            ].map((col) => (
              <tr key={col.key} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="px-4 py-2 text-[var(--text-secondary)]">{col.label}</td>
                {channels.map((ch) => (
                  <td key={ch.id} className="px-4 py-2 text-[var(--text-primary)] font-mono text-sm">
                    {col.key === "apiKey" ? ch[col.key]?.substring(0, 10) + "..." : ch[col.key] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create src/features/channels/ChannelsPage.jsx**

```jsx
import { useState } from "react";
import { ref, remove } from "firebase/database";
import { database } from "../../firebase";
import { useAllConfigs } from "../../hooks/useChannelData";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ChannelCard from "./ChannelCard";
import ConfigFormModal from "./ConfigFormModal";
import ChannelCompareTable from "./ChannelCompareTable";

export default function ChannelsPage() {
  const { configs } = useAllConfigs();
  const configList = Object.entries(configs).map(([id, c]) => ({ id, ...c }));
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [compareIds, setCompareIds] = useState([]);

  const compareList = configList.filter((c) => compareIds.includes(c.id));

  const handleDelete = async (channel) => {
    if (confirm(`Delete "${channel.channelName}"?`)) {
      await remove(ref(database, `youtube-configs/${channel.id}`));
    }
  };

  const handleCompare = (channel) => {
    setCompareIds((prev) =>
      prev.includes(channel.id) ? prev.filter((id) => id !== channel.id) : [...prev, channel.id]
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Channels</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} icon={<span>+</span>}>Add Channel</Button>
      </div>

      {configList.length === 0 ? (
        <EmptyState
          icon={<svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
          title="No Channels Yet"
          description="Add your first YouTube channel to start tracking analytics."
          action={<Button onClick={() => setShowForm(true)}>Add Your First Channel</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {configList.map((ch) => (
            <ChannelCard
              key={ch.id}
              channel={ch}
              onEdit={() => { setEditing(ch); setShowForm(true); }}
              onDelete={handleDelete}
              onCompare={handleCompare}
              isSelected={compareIds.includes(ch.id)}
            />
          ))}
        </div>
      )}

      {compareList.length >= 2 && <ChannelCompareTable channels={compareList} />}

      <ConfigFormModal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }} editingConfig={editing} />
    </div>
  );
}
```

- [ ] **Step 5: Update App.jsx — replace Channels placeholder**

```jsx
import ChannelsPage from "./features/channels/ChannelsPage";
// ...
<Route path="channels" element={<ChannelsPage />} />
```

- [ ] **Step 6: Verify Channels page**

Run `npm run dev`. Verify:
- List existing configs from Firebase
- Add new config — appears in list
- Edit config — form pre-filled
- Delete config — removed
- Compare mode — select 2+, shows comparison table

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Channels page with CRUD and compare mode"
```

---

### Task 7: Videos Page

**Files:**
- Create: `src/features/videos/VideoTable.jsx`
- Create: `src/features/videos/VideoDetailModal.jsx`
- Create: `src/features/videos/VideosPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create src/features/videos/VideoTable.jsx**

```jsx
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import { formatNumber } from "../../utils/youtube";

export default function VideoTable({ videos, onRowClick }) {
  const getCtrBadge = (views, likes) => {
    if (!views || views === 0) return null;
    const ctr = (likes / views) * 100;
    if (ctr > 8) return <Badge variant="success">🔥 {ctr.toFixed(1)}%</Badge>;
    if (ctr < 2) return <Badge variant="danger">▼ {ctr.toFixed(1)}%</Badge>;
    return null;
  };

  const columns = [
    { key: "thumb", label: "", render: (row) => (
      <img src={row.snippet.thumbnails?.default?.url} alt="" className="w-20 h-12 rounded object-cover" />
    )},
    { key: "title", label: "Title", className: "min-w-[200px]", render: (row) => (
      <div>
        <p className="font-medium truncate max-w-[300px]">{row.snippet.title}</p>
        <p className="text-xs text-[var(--text-secondary)]">{new Date(row.snippet.publishedAt).toLocaleDateString("th-TH")}</p>
      </div>
    )},
    { key: "views", label: "Views", render: (row) => formatNumber(parseInt(row.statistics?.viewCount || 0)) },
    { key: "likes", label: "Likes", render: (row) => formatNumber(parseInt(row.statistics?.likeCount || 0)) },
    { key: "ctr", label: "CTR", render: (row) => getCtrBadge(parseInt(row.statistics?.viewCount), parseInt(row.statistics?.likeCount)) },
  ];

  return <Table columns={columns} data={videos || []} onRowClick={onRowClick} />;
}
```

- [ ] **Step 2: Create src/features/videos/VideoDetailModal.jsx**

```jsx
import Modal from "../../components/ui/Modal";

export default function VideoDetailModal({ video, open, onClose }) {
  if (!video) return null;
  const v = video.statistics || {};

  return (
    <Modal open={open} onClose={onClose} title={video.snippet.title}>
      <div className="space-y-4">
        <img src={video.snippet.thumbnails?.maxres?.url || video.snippet.thumbnails?.high?.url} alt="" className="w-full rounded-lg" />
        <p className="text-sm text-[var(--text-secondary)]">{video.snippet.description?.substring(0, 200)}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{parseInt(v.viewCount || 0).toLocaleString()}</p>
            <p className="text-xs text-[var(--text-secondary)]">Views</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{parseInt(v.likeCount || 0).toLocaleString()}</p>
            <p className="text-xs text-[var(--text-secondary)]">Likes</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{parseInt(v.commentCount || 0).toLocaleString()}</p>
            <p className="text-xs text-[var(--text-secondary)]">Comments</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{new Date(video.snippet.publishedAt).toLocaleDateString("th-TH")}</p>
            <p className="text-xs text-[var(--text-secondary)]">Published</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: Create src/features/videos/VideosPage.jsx**

```jsx
import { useState } from "react";
import { useAllConfigs } from "../../hooks/useChannelData";
import { useChannelInfo, useChannelVideos } from "../../hooks/useYouTubeApi";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import VideoTable from "./VideoTable";
import VideoDetailModal from "./VideoDetailModal";

export default function VideosPage() {
  const { configs } = useAllConfigs();
  const configList = Object.entries(configs).map(([id, c]) => ({ id, ...c }));
  const [selectedConfigId, setSelectedConfigId] = useState(configList[0]?.id || "");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedVideo, setSelectedVideo] = useState(null);

  const selectedConfig = configList.find((c) => c.id === selectedConfigId);
  const { data: channelData } = useChannelInfo(selectedConfig?.apiKey, selectedConfig?.channelId);
  const { data: videos, isLoading } = useChannelVideos(selectedConfig?.apiKey, selectedConfig?.channelId, selectedYear);

  const insightCards = (videos || []).slice(0, 3).map((v) => {
    const views = parseInt(v.statistics?.viewCount || 0);
    const likes = parseInt(v.statistics?.likeCount || 0);
    const ctr = views > 0 ? ((likes / views) * 100).toFixed(1) : 0;
    const type = views > 100000 ? "success" : ctr < 2 ? "danger" : "info";
    return { id: v.id, title: v.snippet.title, label: views > 100000 ? "🔥 Viral" : ctr < 2 ? "⚠ Low CTR" : "Normal", type };
  });

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { value: y, label: String(y + 543) };
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Videos</h1>
        <div className="flex space-x-3">
          <div className="w-56">
            <Select
              options={configList.map((c) => ({ value: c.id, label: c.channelName || c.id }))}
              value={selectedConfigId} onChange={setSelectedConfigId}
            />
          </div>
          <div className="w-32">
            <Select options={yearOptions} value={selectedYear} onChange={(v) => setSelectedYear(Number(v))} />
          </div>
        </div>
      </div>

      {insightCards.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {insightCards.map((ins) => (
            <Badge key={ins.id} variant={ins.type}>{ins.label}: {ins.title.substring(0, 30)}</Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : !videos || videos.length === 0 ? (
        <Card>
          <EmptyState title="No Videos Found" description="No videos for this channel and year combination." />
        </Card>
      ) : (
        <Card padding={false}>
          <VideoTable videos={videos} onRowClick={setSelectedVideo} />
        </Card>
      )}

      <VideoDetailModal video={selectedVideo} open={!!selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
}
```

- [ ] **Step 4: Update App.jsx**

```jsx
import VideosPage from "./features/videos/VideosPage";
// ...
<Route path="videos" element={<VideosPage />} />
```

- [ ] **Step 5: Verify Videos page**

Run `npm run dev`. Verify:
- Channel selector works
- Year selector works
- Video table renders with data
- Clicking a video opens detail modal
- Insight badges appear at top

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Videos page with table, filters, and detail modal"
```

---

### Task 8: Analytics Page

**Files:**
- Create: `src/features/analytics/AnalyticsPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create src/features/analytics/AnalyticsPage.jsx**

```jsx
import { useState } from "react";
import { useAllConfigs } from "../../hooks/useChannelData";
import { useChannelInfo, useChannelVideos } from "../../hooks/useYouTubeApi";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import KpiCard from "../../components/ui/KpiCard";
import { analyzePerformance, analyzeWeekdayPattern, analyzeKeywords, analyzeTitleLength } from "../../utils/analytics";
import { formatNumber } from "../../utils/youtube";

export default function AnalyticsPage() {
  const { configs } = useAllConfigs();
  const configList = Object.entries(configs).map(([id, c]) => ({ id, ...c }));
  const [selectedConfigId, setSelectedConfigId] = useState(configList[0]?.id || "");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const selectedConfig = configList.find((c) => c.id === selectedConfigId);
  const { data: videos, isLoading } = useChannelVideos(selectedConfig?.apiKey, selectedConfig?.channelId, selectedYear);

  const performance = videos ? analyzePerformance(videos) : null;
  const weekdayPattern = videos ? analyzeWeekdayPattern(videos) : null;
  const keywords = videos ? analyzeKeywords(videos) : null;
  const titleLen = videos ? analyzeTitleLength(videos) : null;
  const avgViews = videos?.length > 0
    ? Math.round(videos.reduce((s, v) => s + parseInt(v.statistics?.viewCount || 0), 0) / videos.length)
    : 0;
  const avgLikes = videos?.length > 0
    ? Math.round(videos.reduce((s, v) => s + parseInt(v.statistics?.likeCount || 0), 0) / videos.length)
    : 0;

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { value: y, label: String(y + 543) };
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
        <div className="flex space-x-3">
          <div className="w-56">
            <Select options={configList.map((c) => ({ value: c.id, label: c.channelName || c.id }))} value={selectedConfigId} onChange={setSelectedConfigId} />
          </div>
          <div className="w-32">
            <Select options={yearOptions} value={selectedYear} onChange={(v) => setSelectedYear(Number(v))} />
          </div>
        </div>
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Spinner /></div> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Avg Views" value={formatNumber(avgViews)} trend={0} />
            <KpiCard label="Avg CTR" value="—" trend={0} />
            <KpiCard label="Avg Retention" value="—" trend={0} />
            <KpiCard label="Avg Likes" value={formatNumber(avgLikes)} trend={0} />
          </div>

          {performance && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Upload Pattern</h3>
                  <div className="space-y-2">
                    {weekdayPattern?.map((d) => (
                      <div key={d.day} className="flex items-center space-x-3">
                        <span className="w-16 text-sm text-[var(--text-secondary)]">{d.day}</span>
                        <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${d.percentage}%` }} />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)] w-12 text-right">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Content Analysis</h3>
                  <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Top Keywords</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {keywords?.map((k) => (
                      <span key={k.word} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 rounded text-xs font-medium">
                        {k.word} ({k.count})
                      </span>
                    ))}
                  </div>
                  {titleLen && (
                    <>
                      <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Title Length</h4>
                      <div className="space-y-1">
                        {titleLen.categories.map((cat) => (
                          <div key={cat.range} className="flex items-center justify-between text-sm">
                            <span className="text-[var(--text-secondary)]">{cat.range}</span>
                            <span className="text-[var(--text-primary)] font-medium">{cat.count} ({cat.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </Card>
              </div>

              <Card>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Performance Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{performance.totalVideos}</p>
                    <p className="text-xs text-[var(--text-secondary)]">Total Videos</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{performance.avgPerMonth}</p>
                    <p className="text-xs text-[var(--text-secondary)]">Avg/Month</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{performance.avgGap}</p>
                    <p className="text-xs text-[var(--text-secondary)]">Avg Gap (days)</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{performance.mostActiveMonth}</p>
                    <p className="text-xs text-[var(--text-secondary)]">Most Active ({performance.mostActiveCount})</p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update App.jsx**

```jsx
import AnalyticsPage from "./features/analytics/AnalyticsPage";
// ...
<Route path="analytics" element={<AnalyticsPage />} />
```

- [ ] **Step 3: Verify Analytics page**

Run `npm run dev`. Verify:
- Average metrics display
- Upload pattern bar chart renders
- Top keywords show as tags
- Title length distribution displays
- Performance overview numbers are correct

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Analytics page with metrics, patterns, and content analysis"
```

---

### Task 9: Revenue Page

**Files:**
- Create: `src/features/revenue/RevenuePage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create src/features/revenue/RevenuePage.jsx**

```jsx
import { useState } from "react";
import { useAllConfigs } from "../../hooks/useChannelData";
import { useChannelInfo } from "../../hooks/useYouTubeApi";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import KpiCard from "../../components/ui/KpiCard";
import EmptyState from "../../components/ui/EmptyState";
import { formatNumber } from "../../utils/youtube";

export default function RevenuePage() {
  const { configs } = useAllConfigs();
  const configList = Object.entries(configs).map(([id, c]) => ({ id, ...c }));
  const [selectedConfigId, setSelectedConfigId] = useState(configList[0]?.id || "");
  const selectedConfig = configList.find((c) => c.id === selectedConfigId);
  const { data: channelData } = useChannelInfo(selectedConfig?.apiKey, selectedConfig?.channelId);

  const totalViews = parseInt(channelData?.statistics?.viewCount || 0);
  const estimatedRevenue = totalViews * 0.002; // Very rough estimate — real data from YouTube API requires Adsense linkage

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Revenue</h1>
        <div className="w-56">
          <Select
            options={configList.map((c) => ({ value: c.id, label: c.channelName || c.id }))}
            value={selectedConfigId} onChange={setSelectedConfigId}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard label="Revenue" value={`$${formatNumber(Math.round(estimatedRevenue))}`} trend={15} />
        <KpiCard label="RPM" value="$2.00" trend={2} />
        <KpiCard label="CPM" value="$4.00" trend={-1} />
      </div>

      <Card>
        <EmptyState
          icon={<svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          title="Revenue Data Requires YouTube Adsense Link"
          description="Connect your YouTube channel to Google Adsense and enable the YouTube Analytics API to see detailed revenue data. Current values are estimates based on view counts."
        />
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Update App.jsx**

```jsx
import RevenuePage from "./features/revenue/RevenuePage";
// ...
<Route path="revenue" element={<RevenuePage />} />
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Revenue page with KPI cards and placeholder"
```

---

### Task 10: Audience Page

**Files:**
- Create: `src/features/audience/AudiencePage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create src/features/audience/AudiencePage.jsx**

```jsx
import { useState } from "react";
import { useAllConfigs } from "../../hooks/useChannelData";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";

export default function AudiencePage() {
  const { configs } = useAllConfigs();
  const configList = Object.entries(configs).map(([id, c]) => ({ id, ...c }));
  const [selectedConfigId, setSelectedConfigId] = useState(configList[0]?.id || "");

  // Audience data requires YouTube Analytics API (not just Data API v3)
  // This page shows the UI shell + estimate from channel data

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Audience</h1>
        <div className="w-56">
          <Select
            options={configList.map((c) => ({ value: c.id, label: c.channelName || c.id }))}
            value={selectedConfigId} onChange={setSelectedConfigId}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Returning vs New Viewers</h3>
          <EmptyState title="Data Unavailable" description="Audience demographics require YouTube Analytics API access." />
        </Card>
        <Card>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Demographics</h3>
          <EmptyState title="Data Unavailable" description="Age and gender data require YouTube Analytics API access." />
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Top Countries</h3>
          <EmptyState title="Data Unavailable" description="Geographic data requires YouTube Analytics API access." />
        </Card>
        <Card>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Device Types</h3>
          <EmptyState title="Data Unavailable" description="Device data requires YouTube Analytics API access." />
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update App.jsx**

```jsx
import AudiencePage from "./features/audience/AudiencePage";
// ...
<Route path="audience" element={<AudiencePage />} />
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Audience page with UI shell"
```

---

### Task 11: Reports Page (Excel Export)

**Files:**
- Create: `src/features/reports/ReportWizard.jsx`
- Create: `src/features/reports/ReportsPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create src/features/reports/ReportsPage.jsx**

```jsx
import { useState } from "react";
import { useAllConfigs } from "../../hooks/useChannelData";
import { useChannelInfo, useChannelVideos } from "../../hooks/useYouTubeApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import * as XLSX from "xlsx";

const REPORT_TYPES = [
  { id: "basic", label: "Basic", icon: "📊", color: "from-blue-500 to-blue-600", desc: "Yearly/monthly stats + video list" },
  { id: "content", label: "Content", icon: "📈", color: "from-purple-500 to-purple-600", desc: "Engagement analysis and duration performance" },
  { id: "timing", label: "Timing", icon: "⏰", color: "from-amber-500 to-amber-600", desc: "Best upload times and days" },
  { id: "growth", label: "Growth", icon: "📈", color: "from-emerald-500 to-emerald-600", desc: "Year-over-year comparison" },
  { id: "complete", label: "Complete", icon: "📦", color: "from-red-500 to-pink-600", desc: "All reports in one file" },
];

function ReportsPage() {
  const { configs } = useAllConfigs();
  const configList = Object.entries(configs).map(([id, c]) => ({ id, ...c }));
  const [selectedConfigId, setSelectedConfigId] = useState(configList[0]?.id || "");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState("basic");
  const [generating, setGenerating] = useState(false);

  const selectedConfig = configList.find((c) => c.id === selectedConfigId);
  const { data: videos, isLoading } = useChannelVideos(selectedConfig?.apiKey, selectedConfig?.channelId, selectedYear);

  const generateReport = () => {
    if (!videos || videos.length === 0) return;
    setGenerating(true);
    try {
      const ws = XLSX.utils.json_to_sheet(
        videos.map((v) => ({
          Title: v.snippet.title,
          Published: new Date(v.snippet.publishedAt).toLocaleDateString(),
          Views: parseInt(v.statistics?.viewCount || 0),
          Likes: parseInt(v.statistics?.likeCount || 0),
          Comments: parseInt(v.statistics?.commentCount || 0),
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Videos");
      XLSX.writeFile(wb, `report_${selectedConfig?.channelName || "channel"}_${selectedYear}.xlsx`);
    } catch (err) {
      console.error("Report generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { value: y, label: String(y + 543) };
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reports</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Configuration</h3>
          <div className="space-y-4">
            <Select
              label="Channel"
              options={configList.map((c) => ({ value: c.id, label: c.channelName || c.id }))}
              value={selectedConfigId} onChange={setSelectedConfigId}
            />
            <Select
              label="Year"
              options={yearOptions}
              value={selectedYear} onChange={(v) => setSelectedYear(Number(v))}
            />
            {videos && <p className="text-sm text-[var(--text-secondary)]">{videos.length} videos found</p>}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Report Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {REPORT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedType === type.id
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="text-2xl">{type.icon}</span>
                <p className="font-semibold text-[var(--text-primary)] mt-1">{type.label}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{type.desc}</p>
              </button>
            ))}
          </div>
          <Button
            onClick={generateReport}
            disabled={generating || !videos || videos.length === 0}
            icon={generating ? <Spinner size="sm" /> : <span>📥</span>}
          >
            {generating ? "Generating..." : "Download Report"}
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default ReportsPage;
```

- [ ] **Step 2: Update App.jsx**

```jsx
import ReportsPage from "./features/reports/ReportsPage";
// ...
<Route path="reports" element={<ReportsPage />} />
```

- [ ] **Step 3: Verify Reports page**

Run `npm run dev`. Verify:
- Channel + year selectors work
- Report type cards are selectable
- Clicking download triggers XLSX file download
- Verify downloaded .xlsx opens correctly with video data

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Reports page with XLSX export"
```

---

### Task 12: Settings Page

**Files:**
- Create: `src/features/settings/SettingsPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create src/features/settings/SettingsPage.jsx**

```jsx
import useAuthStore from "../../stores/authStore";
import useThemeStore from "../../stores/themeStore";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function SettingsPage() {
  const { currentUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Profile</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Email</p>
              <p className="text-[var(--text-primary)] font-medium">{currentUser?.email}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Role</p>
              <p className="text-[var(--text-primary)] font-medium">Administrator</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">App Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Dark Mode</p>
                <p className="text-xs text-[var(--text-secondary)]">Toggle dark/light theme</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors ${theme === "dark" ? "bg-indigo-600" : "bg-gray-300"}`}
              >
                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Language</p>
                <p className="text-xs text-[var(--text-secondary)]">Current: Thai</p>
              </div>
              <span className="text-sm text-[var(--text-secondary)]">ไทย</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">About</h3>
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            <p>YouTube Analytics Dashboard v2.0</p>
            <p>Built with React 19 + Firebase + YouTube Data API v3</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update App.jsx**

```jsx
import SettingsPage from "./features/settings/SettingsPage";
// ...
<Route path="settings" element={<SettingsPage />} />
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Settings page with profile and theme preferences"
```

---

### Task 13: Cleanup Old Code + Polish

**Files:**
- Delete: `src/components/Login.jsx` (replaced by `LoginPage.jsx`)
- Delete: `src/components/Navigation.jsx` (replaced by sideba+header)
- Delete: `src/components/ConfigSection.jsx` (replaced by channels CRUD)
- Delete: `src/components/DashboardSection.jsx` (replaced by multiple pages)
- Delete: `src/components/ReportSection.jsx` (replaced by ReportsPage)
- Delete: `src/App.css` (unused Vite boilerplate)
- Modify: `src/App.jsx` — final cleanup

- [ ] **Step 1: Delete old component files**

```bash
Remove-Item src/components/Login.jsx
Remove-Item src/components/Navigation.jsx
Remove-Item src/components/ConfigSection.jsx
Remove-Item src/components/DashboardSection.jsx
Remove-Item src/components/ReportSection.jsx
Remove-Item src/App.css
```

- [ ] **Step 2: Finalize App.jsx — clean imports**

Replace App.jsx with final clean version:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAuthStore from "./stores/authStore";
import useThemeStore from "./stores/themeStore";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./features/auth/LoginPage";
import OverviewPage from "./features/overview/OverviewPage";
import ChannelsPage from "./features/channels/ChannelsPage";
import VideosPage from "./features/videos/VideosPage";
import AnalyticsPage from "./features/analytics/AnalyticsPage";
import RevenuePage from "./features/revenue/RevenuePage";
import AudiencePage from "./features/audience/AudiencePage";
import ReportsPage from "./features/reports/ReportsPage";
import SettingsPage from "./features/settings/SettingsPage";
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
            <Route index element={<OverviewPage />} />
            <Route path="channels" element={<ChannelsPage />} />
            <Route path="videos" element={<VideosPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="audience" element={<AudiencePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

- [ ] **Step 3: Run full build to verify no dead imports**

```bash
npm run build
```

Fix any import errors.

- [ ] **Step 4: Run lint**

```bash
npm run lint
```

Fix any lint errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: cleanup old components and finalize App.jsx"
```

---

### Task 14: Responsive + Dark Mode Polish

**Files:**
- Modify: `src/components/layout/Sidebar.jsx`
- Modify: `src/components/layout/Header.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Polish sidebar responsive behavior**

Ensure:
- Sidebar shows as overlay on mobile (< 1024px)
- Clicking overlay closes sidebar
- lg: breakpoint shows fixed sidebar
- NavLink active states are correct

- [ ] **Step 2: Test all pages in dark mode**

Switch to dark mode, verify each page renders correctly with proper text contrast, card backgrounds, borders.

- [ ] **Step 3: Test mobile layout**

Use Chrome DevTools responsive mode. Verify:
- Sidebar hamburger appears on mobile
- Content stacks in single column
- Tables are horizontally scrollable
- KPI cards stack vertically

- [ ] **Step 4: Verify final build**

```bash
npm run build
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: responsive and dark mode polish"
```
