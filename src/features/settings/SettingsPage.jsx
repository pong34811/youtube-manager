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
