import { useState } from "react";
import {
  fetchChannelData,
  fetchChannelVideosForYear,
  generateYearOptions,
  formatNumber,
  formatDuration,
} from "../utils/youtube";
import {
  analyzePerformance,
  analyzeWeekdayPattern,
  analyzeKeywords,
  analyzeTitleLength,
  getTopVideos,
  processMonthlyData,
} from "../utils/analytics";

export default function DashboardSection({ allConfigs, showStatus }) {
  const [selectedConfig, setSelectedConfig] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMonthDetail, setShowMonthDetail] = useState(false);
  const [selectedMonthData, setSelectedMonthData] = useState(null);

  const handleChannelChange = async (e) => {
    const configId = e.target.value;
    setSelectedConfig(configId);
    setChannelData(null);
    setVideos([]);
    setSelectedYear("");
    setShowMonthDetail(false);

    if (!configId) return;

    const config = allConfigs[configId];
    setLoading(true);

    try {
      const data = await fetchChannelData(config.apiKey, config.channelId);
      setChannelData(data);
      const years = generateYearOptions(data.snippet.publishedAt);
      setYearOptions(years);

      // Auto-select current year
      const currentYear = new Date().getFullYear();
      const currentYearOption = years.find((y) => y.value === currentYear);
      if (currentYearOption) {
        setSelectedYear(currentYear);
        // Trigger year load
        await loadYearData(config, currentYear);
      }

      showStatus("โหลดข้อมูลช่องสำเร็จ!", "success");
    } catch (error) {
      console.error("Error loading channel:", error);
      showStatus(`เกิดข้อผิดพลาด: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadYearData = async (config, year) => {
    setLoading(true);
    try {
      const videoData = await fetchChannelVideosForYear(
        config.apiKey,
        config.channelId,
        year
      );
      setVideos(videoData);
      showStatus(`โหลดข้อมูลปี ${year + 543} สำเร็จ!`, "success");
    } catch (error) {
      console.error("Error loading videos:", error);
      showStatus(`เกิดข้อผิดพลาด: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = async (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    setShowMonthDetail(false);

    if (!year || !selectedConfig) return;

    const config = allConfigs[selectedConfig];
    await loadYearData(config, year);
  };

  const handleShowMonthDetail = (monthData) => {
    setSelectedMonthData(monthData);
    setShowMonthDetail(true);
  };

  const handleBackToAnalytics = () => {
    setShowMonthDetail(false);
    setSelectedMonthData(null);
  };

  const configsArray = Object.entries(allConfigs).map(([key, value]) => ({
    id: key,
    ...value,
  }));

  if (showMonthDetail && selectedMonthData) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              วิดีโอในเดือน{selectedMonthData.month} {selectedYear + 543} (
              {selectedMonthData.count} วิดีโอ)
            </h2>
            <button
              onClick={handleBackToAnalytics}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition duration-200"
            >
              ← กลับ
            </button>
          </div>
          <div className="space-y-4">
            {selectedMonthData.videos.length === 0 ? (
              <div className="text-center text-gray-400 py-12 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p>ไม่มีวิดีโอในเดือนนี้</p>
              </div>
            ) : (
              selectedMonthData.videos.map((video) => (
                <div
                  key={video.id}
                  className="glass-card p-4 rounded-2xl hover:bg-white transition-all duration-300 group"
                >
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="flex-shrink-0 relative overflow-hidden rounded-xl">
                      <img
                        src={video.snippet.thumbnails.medium.url}
                        alt={video.snippet.title}
                        className="w-full md:w-48 h-32 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium backdrop-blur-sm">
                        {video.contentDetails
                          ? formatDuration(video.contentDetails.duration)
                          : ""}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                          {video.snippet.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                          {video.snippet.description || "ไม่มีคำอธิบาย"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 md:gap-6">
                        <span className="flex items-center text-sm font-medium text-gray-700">
                          <svg
                            className="w-4 h-4 mr-1.5 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          {formatNumber(video.statistics.viewCount)}
                        </span>
                        <span className="flex items-center text-sm font-medium text-gray-700">
                          <svg
                            className="w-4 h-4 mr-1.5 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          {formatNumber(video.statistics.likeCount || 0)}
                        </span>
                        <a
                          href={`https://www.youtube.com/watch?v=${video.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                          Watch
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Channel Selector */}
      <div className="glass-panel rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </span>
          เลือกช่อง YouTube
        </h2>
        <select
          value={selectedConfig}
          onChange={handleChannelChange}
          disabled={loading}
          className="w-full px-5 py-4 bg-white/50 border border-white/40 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none cursor-pointer text-gray-700 font-medium text-lg appearance-none shadow-sm backdrop-blur-sm hover:bg-white/70 disabled:opacity-50"
        >
          <option value="">เลือกช่อง YouTube ของคุณ...</option>
          {configsArray.map((config) => (
            <option key={config.id} value={config.id}>
              {config.channelName}
            </option>
          ))}
        </select>
      </div>

      {/* Channel Info */}
      {channelData && (
        <div className="bg-white rounded-lg shadow-lg p-6 animate-fade-in">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            ข้อมูลช่อง
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full blur opacity-50"></div>
                <img
                  src={channelData.snippet.thumbnails.medium.url}
                  alt={channelData.snippet.title}
                  className="relative w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {channelData.snippet.title}
              </h3>
              <p className="text-gray-500 text-xs mb-3 font-medium bg-gray-100 px-3 py-1 rounded-full">
                สร้างเมื่อ:{" "}
                {new Date(channelData.snippet.publishedAt).toLocaleDateString(
                  "th-TH"
                )}
              </p>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {channelData.snippet.description}
              </p>
              <a
                href={`https://youtube.com/channel/${channelData.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center"
              >
                ไปที่ช่อง
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
            <div className="glass-card p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden group hover:bg-white/90">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-100 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
              <h4 className="font-semibold text-gray-500 mb-2 uppercase text-xs tracking-wider z-10">
                ผู้ติดตาม
              </h4>
              <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 z-10">
                {formatNumber(channelData.statistics.subscriberCount)}
              </p>
              <p className="text-sm text-gray-400 mt-2 z-10">Subscribers</p>
            </div>
            <div className="glass-card p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden group hover:bg-white/90">
              <div className="absolute right-0 top-0 w-24 h-24 bg-green-100 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
              <h4 className="font-semibold text-gray-500 mb-2 uppercase text-xs tracking-wider z-10">
                วิดีโอทั้งหมด
              </h4>
              <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 z-10">
                {formatNumber(channelData.statistics.videoCount)}
              </p>
              <p className="text-sm text-gray-400 mt-2 z-10">Videos Uploaded</p>
            </div>
            <div className="glass-card p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden group hover:bg-white/90">
              <div className="absolute right-0 top-0 w-24 h-24 bg-purple-100 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
              <h4 className="font-semibold text-gray-500 mb-2 uppercase text-xs tracking-wider z-10">
                ยอดวิวรวม
              </h4>
              <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 z-10">
                {formatNumber(channelData.statistics.viewCount)}
              </p>
              <p className="text-sm text-gray-400 mt-2 z-10">Total Views</p>
            </div>
          </div>
        </div>
      )}

      {/* Year Filter */}
      {channelData && (
        <div className="glass-panel rounded-3xl p-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg mr-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </span>
            เลือกปี
          </h2>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            disabled={loading}
            className="w-full px-5 py-4 bg-white/50 border border-white/40 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none cursor-pointer text-gray-700 font-medium text-lg appearance-none shadow-sm backdrop-blur-sm hover:bg-white/70 disabled:opacity-50"
          >
            <option value="">เลือกปีที่ต้องการวิเคราะห์...</option>
            {yearOptions.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Analytics Section */}
      {videos.length > 0 && (
        <AnalyticsDisplay
          videos={videos}
          selectedYear={selectedYear}
          onShowMonthDetail={handleShowMonthDetail}
        />
      )}
    </div>
  );
}

function AnalyticsDisplay({ videos, selectedYear, onShowMonthDetail }) {
  const performance = analyzePerformance(videos);
  const weekdayPattern = analyzeWeekdayPattern(videos);
  const keywords = analyzeKeywords(videos);
  const titleAnalysis = analyzeTitleLength(videos);
  const topVideosList = getTopVideos(videos);
  const monthlyData = processMonthlyData(videos);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Performance Overview */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          📊 ภาพรวมประสิทธิภาพ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-5 rounded-2xl text-center border-b-4 border-blue-500">
            <h4 className="font-semibold text-gray-600 mb-1 text-sm uppercase tracking-wide">
              รวมทั้งปี
            </h4>
            <p className="text-3xl font-bold text-gray-800 my-2">
              {performance.totalVideos}
            </p>
            <p className="text-xs text-blue-500 font-medium bg-blue-50 py-1 px-2 rounded-lg inline-block">
              วิดีโอ
            </p>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center border-b-4 border-green-500">
            <h4 className="font-semibold text-gray-600 mb-1 text-sm uppercase tracking-wide">
              เฉลี่ยต่อเดือน
            </h4>
            <p className="text-3xl font-bold text-gray-800 my-2">
              {performance.avgPerMonth}
            </p>
            <p className="text-xs text-green-500 font-medium bg-green-50 py-1 px-2 rounded-lg inline-block">
              วิดีโอ/เดือน
            </p>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center border-b-4 border-purple-500">
            <h4 className="font-semibold text-gray-600 mb-1 text-sm uppercase tracking-wide">
              ช่วงห่างเฉลี่ย
            </h4>
            <p className="text-3xl font-bold text-gray-800 my-2">
              {performance.avgGap}
            </p>
            <p className="text-xs text-purple-500 font-medium bg-purple-50 py-1 px-2 rounded-lg inline-block">
              วัน/คลิป
            </p>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center border-b-4 border-orange-500">
            <h4 className="font-semibold text-gray-600 mb-1 text-sm uppercase tracking-wide">
              เดือนที่ขยันที่สุด
            </h4>
            <p className="text-xl font-bold text-gray-800 my-2 truncate">
              {performance.mostActiveMonth}
            </p>
            <p className="text-xs text-orange-500 font-medium bg-orange-50 py-1 px-2 rounded-lg inline-block">
              {performance.mostActiveCount} วิดีโอ
            </p>
          </div>
        </div>
      </div>

      {/* Upload Pattern Analysis */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          📈 รูปแบบการอัปโหลด
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              วันในสัปดาห์
            </h3>
            <div className="space-y-2">
              {weekdayPattern.map((data) => (
                <div
                  key={data.day}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700 w-20">
                    {data.day}
                  </span>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-8 text-right">
                    {data.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              ความสม่ำเสมอ
            </h3>
            <div className="space-y-3">
              <div className="glass-card p-4 rounded-xl flex items-center space-x-4 border-l-4 border-green-500">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">
                    ความสม่ำเสมอ
                  </h4>
                  <p className="text-xs text-gray-500">
                    อัปโหลดทุก {performance.avgGap} วันโดยเฉลี่ย
                  </p>
                </div>
              </div>
              <div className="glass-card p-4 rounded-xl flex items-center space-x-4 border-l-4 border-blue-500">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">
                    วันที่ขยันที่สุด
                  </h4>
                  <p className="text-xs text-gray-500">
                    {
                      weekdayPattern.reduce((max, current) =>
                        current.count > max.count ? current : max
                      ).day
                    }
                  </p>
                </div>
              </div>
              <div className="glass-card p-4 rounded-xl flex items-center space-x-4 border-l-4 border-purple-500">
                <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">
                    ช่วงเวลาทอง
                  </h4>
                  <p className="text-xs text-gray-500">
                    {performance.mostActiveMonth} ({performance.mostActiveCount}{" "}
                    วิดีโอ)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Videos */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          🏆 วิดีโอยอดนิยม
        </h2>
        <div className="space-y-4">
          {topVideosList.map((video, index) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start space-x-4 p-3 bg-white hover:bg-gray-50 rounded-xl transition-all hover:shadow-md border border-transparent hover:border-gray-100 group"
            >
              <div className="flex-shrink-0 relative">
                <span className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm z-10">
                  {index + 1}
                </span>
                <img
                  src={video.snippet.thumbnails.default.url}
                  alt={video.snippet.title}
                  className="w-24 h-16 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                  {video.snippet.title}
                </h4>
                <div className="flex items-center space-x-3 mt-1.5">
                  <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md flex items-center">
                    <svg
                      className="w-3 h-3 mr-1 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {formatNumber(video.statistics.viewCount)}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date(video.snippet.publishedAt).toLocaleDateString(
                      "th-TH"
                    )}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Content Analysis */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          💡 วิเคราะห์เนื้อหา
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              คำหลักยอดนิยม
            </h3>
            <div className="space-y-2">
              {keywords.map((keyword, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-gray-400 w-5">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {keyword.word}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (keyword.count / keywords[0].count) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-6 text-right">
                      {keyword.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              ความยาวชื่อเรื่อง
            </h3>
            <div className="space-y-3">
              <div className="glass-card p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
                <h4 className="font-medium text-indigo-800 text-sm">
                  ความยาวเฉลี่ย
                </h4>
                <p className="text-2xl font-bold text-indigo-600 my-1">
                  {titleAnalysis.avgLength}{" "}
                  <span className="text-sm font-normal text-indigo-400">
                    ตัวอักษร
                  </span>
                </p>
                <p className="text-xs text-indigo-400">
                  สั้นสุด: {titleAnalysis.minLength} | ยาวสุด:{" "}
                  {titleAnalysis.maxLength}
                </p>
              </div>
              {titleAnalysis.categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2"
                >
                  <span className="text-xs text-gray-600 w-40">
                    {cat.range}
                  </span>
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-10 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Videos Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          📅 จำนวนวิดีโอแต่ละเดือน
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  เดือน
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  จำนวนวิดีโอ
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  เปอร์เซ็นต์
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  ดูคลิป
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data, index) => (
                <tr
                  key={index}
                  className="transition-colors hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-4 text-sm text-gray-800 font-medium">
                    {data.month}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        data.count > 0
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.count}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${data.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs w-8 text-right">
                        {data.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {data.count > 0 ? (
                      <button
                        onClick={() => onShowMonthDetail(data)}
                        className="text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
                      >
                        ดูคลิป
                      </button>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-xl text-center">
              <h4 className="font-semibold text-gray-500 text-xs uppercase mb-1">
                รวมทั้งปี
              </h4>
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                {videos.length} วิดีโอ
              </p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <h4 className="font-semibold text-gray-500 text-xs uppercase mb-1">
                เฉลี่ยต่อเดือน
              </h4>
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">
                {performance.avgPerMonth}
              </p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center border border-purple-100 bg-purple-50/30">
              <h4 className="font-semibold text-purple-600 text-xs uppercase mb-1">
                เดือนที่มากที่สุด
              </h4>
              <p className="text-lg font-bold text-gray-800">
                {performance.mostActiveMonth}
              </p>
              <p className="text-xs text-purple-500">
                {performance.mostActiveCount} วิดีโอ
              </p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center border border-orange-100 bg-orange-50/30">
              <h4 className="font-semibold text-orange-600 text-xs uppercase mb-1">
                เดือนที่น้อยที่สุด
              </h4>
              <p className="text-lg font-bold text-gray-800">
                {
                  monthlyData.reduce((min, current) =>
                    current.count < min.count ? current : min
                  ).month
                }
              </p>
              <p className="text-xs text-orange-500">
                {
                  monthlyData.reduce((min, current) =>
                    current.count < min.count ? current : min
                  ).count
                }{" "}
                วิดีโอ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
