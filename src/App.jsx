import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";
import Login from "./components/Login";
import Navigation from "./components/Navigation";
import ConfigSection from "./components/ConfigSection";
import DashboardSection from "./components/DashboardSection";
import ReportSection from "./components/ReportSection";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("config");
  const [allConfigs, setAllConfigs] = useState({});
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      setCurrentUser(JSON.parse(loggedInUser));
    }
  }, []);

  useEffect(() => {
    const configsRef = ref(database, "youtube-configs");
    const unsubscribe = onValue(configsRef, (snapshot) => {
      const configs = snapshot.val();
      setAllConfigs(configs || {});
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem("loggedInUser", JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setCurrentUser(null);
  };

  const showStatus = (text, type = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: "", type: "" }), 3000);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const pageSubtitles = {
    config: "จัดการการตั้งค่า YouTube API แบบ Real-time",
    dashboard: "วิเคราะห์ข้อมูลช่อง YouTube เชิงลึก",
    report: "สร้างรายงานสรุปผล",
  };

  return (
    <div className="min-h-screen pb-12">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={currentUser.email}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-md">
              YouTube API Config Manager
            </h1>
            <p className="text-indigo-100 text-lg">
              {pageSubtitles[activeTab]}
            </p>
          </div>

          {statusMessage.text && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center justify-center space-x-2 animate-fade-in ${
                statusMessage.type === "success"
                  ? "bg-green-100/80 text-green-700 border border-green-200"
                  : "bg-red-100/80 text-red-700 border border-red-200"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {statusMessage.type === "success" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
              <span className="font-medium">{statusMessage.text}</span>
            </div>
          )}

          {activeTab === "config" && (
            <ConfigSection allConfigs={allConfigs} showStatus={showStatus} />
          )}

          {activeTab === "dashboard" && (
            <DashboardSection allConfigs={allConfigs} showStatus={showStatus} />
          )}

          {activeTab === "report" && (
            <ReportSection allConfigs={allConfigs} showStatus={showStatus} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
