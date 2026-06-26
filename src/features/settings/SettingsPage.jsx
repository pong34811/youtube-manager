import { useState } from "react";
import useAuthStore from "../../stores/authStore";
import useThemeStore from "../../stores/themeStore";
import { useLocale } from "../../hooks/useLocale";
import Card from "../../components/ui/Card";
import ApiKeysTab from "./ApiKeysTab";

export default function SettingsPage() {
  const { currentUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { t, locale, toggleLocale } = useLocale();
  const [tab, setTab] = useState("profile");

  const tabs = [
    { key: "profile", label: t("settings.profile") },
    { key: "apiKeys", label: t("settings.apiKeys") },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl text-[var(--text-primary)] mb-6">{t("page.settings")}</h1>

      <div className="flex space-x-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`px-4 py-2.5 text-sm border-b-2 transition-colors ${
              tab === tb.key
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="space-y-6 max-w-2xl">
          <Card>
            <h3 className="text-base text-[var(--text-primary)] mb-4">{t("settings.profile")}</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{t("settings.email")}</p>
                <p className="text-[var(--text-primary)]">{currentUser?.email}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{t("settings.role")}</p>
                <p className="text-[var(--text-primary)]">{currentUser?.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้"}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-base text-[var(--text-primary)] mb-4">{t("settings.preferences")}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-primary)]">{t("settings.darkMode")}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{t("settings.darkModeDesc")}</p>
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
                  <p className="text-sm text-[var(--text-primary)]">{t("settings.language")}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{t("settings.currentLang")}</p>
                </div>
                <button
                  onClick={toggleLocale}
                  className={`relative w-12 h-6 rounded-full transition-colors ${locale === "th" ? "bg-indigo-600" : "bg-gray-300"}`}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${locale === "th" ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-base text-[var(--text-primary)] mb-4">{t("settings.about")}</h3>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              <p>YouTube Analytics Dashboard v2.0</p>
              <p>Built with React 19 + Firebase + YouTube Data API v3</p>
            </div>
          </Card>
        </div>
      )}

      {tab === "apiKeys" && (
        <div className="max-w-2xl">
          <ApiKeysTab />
        </div>
      )}
    </div>
  );
}
