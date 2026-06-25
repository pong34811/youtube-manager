import useSidebarStore from "../../stores/sidebarStore";
import useThemeStore from "../../stores/themeStore";
import useAuthStore from "../../stores/authStore";
import { useLocale } from "../../hooks/useLocale";

export default function Header() {
  const { setMobileOpen } = useSidebarStore();
  const { theme, toggleTheme } = useThemeStore();
  const { locale, toggleLocale } = useLocale();

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

      <div className="flex items-center space-x-2">
        <button
          onClick={toggleLocale}
          className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium text-[var(--text-primary)] transition-colors"
        >
          {locale === "th" ? "EN" : "TH"}
        </button>

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
