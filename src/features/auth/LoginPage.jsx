import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../../hooks/useLocale";
import useAuthStore from "../../stores/authStore";
import { checkUserEmail } from "../../lib/api";

export default function LoginPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: "", type: "" });
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith("@gmail.com")) {
      setStatus({ text: t("auth.invalidGmail"), type: "error" });
      return;
    }
    setLoading(true);
    try {
      const user = await checkUserEmail(trimmedEmail);
      if (user) {
        login(user);
        navigate("/", { replace: true });
      } else {
        setStatus({ text: t("auth.notFound"), type: "error" });
      }
    } catch {
      setStatus({ text: t("auth.error"), type: "error" });
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">{t("app.name")}</h1>
            <p className="text-gray-500 font-medium">{t("auth.subtitle")}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">{t("auth.gmailAddress")}</label>
              <div className="relative group">
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.gmailPlaceholder")}
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
              <span>{loading ? t("auth.checking") : t("auth.login")}</span>
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
        <p className="text-center text-white/40 text-sm mt-8">{t("auth.footer")}</p>
      </div>
    </div>
  );
}
