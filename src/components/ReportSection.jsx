import { useState } from "react";
import * as XLSX from "xlsx";
import {
  fetchChannelData,
  fetchChannelVideosForYear,
  generateYearOptions,
  formatDuration,
} from "../utils/youtube";
import {
  analyzePerformance,
  processMonthlyData,
  analyzeContentPerformance,
  analyzeTimePatterns,
  analyzeGrowthMetrics,
} from "../utils/analytics";

const REPORT_TYPES = [
  {
    id: "basic",
    name: "รายงานพื้นฐาน",
    icon: "📊",
    description: "สถิติรายปีและรายเดือน",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "content",
    name: "รายงานประสิทธิภาพเนื้อหา",
    icon: "🎯",
    description: "วิเคราะห์ engagement และความยาววิดีโอ",
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "timing",
    name: "รายงานช่วงเวลา",
    icon: "⏰",
    description: "เวลาที่เหมาะสมในการอัปโหลด",
    color: "from-orange-500 to-red-600",
  },
  {
    id: "growth",
    name: "รายงานการเติบโต",
    icon: "📈",
    description: "เปรียบเทียบข้อมูลหลายปี",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "complete",
    name: "รายงานครบถ้วน",
    icon: "📑",
    description: "รวมทุกรายงานในไฟล์เดียว",
    color: "from-indigo-600 to-purple-700",
  },
];

export default function ReportSection({ allConfigs, showStatus }) {
  const [selectedConfig, setSelectedConfig] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedReportType, setSelectedReportType] = useState("basic");
  const [yearOptions, setYearOptions] = useState([]);
  const [videos, setVideos] = useState([]);
  const [allYearsVideos, setAllYearsVideos] = useState({});
  const [loading, setLoading] = useState(false);
  const [channelData, setChannelData] = useState(null);

  const handleChannelChange = async (e) => {
    const configId = e.target.value;
    setSelectedConfig(configId);
    setSelectedYear("");
    setVideos([]);
    setAllYearsVideos({});

    if (!configId) {
      setYearOptions([]);
      return;
    }

    const config = allConfigs[configId];
    setLoading(true);

    try {
      const data = await fetchChannelData(config.apiKey, config.channelId);
      setChannelData(data);
      const years = generateYearOptions(data.snippet.publishedAt);
      setYearOptions(years);
    } catch (error) {
      console.error("Error loading channel:", error);
      showStatus(`เกิดข้อผิดพลาด: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = async (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);

    if (!year || !selectedConfig) return;

    const config = allConfigs[selectedConfig];
    setLoading(true);

    try {
      const videoData = await fetchChannelVideosForYear(
        config.apiKey,
        config.channelId,
        year
      );
      setVideos(videoData);
      setAllYearsVideos((prev) => ({ ...prev, [year]: videoData }));
      showStatus(
        `โหลดข้อมูลปี ${year + 543} สำเร็จ! (${videoData.length} วิดีโอ)`,
        "success"
      );
    } catch (error) {
      console.error("Error loading videos:", error);
      showStatus(`เกิดข้อผิดพลาด: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadAllYearsForGrowth = async () => {
    if (!selectedConfig || yearOptions.length === 0) return;

    const config = allConfigs[selectedConfig];
    setLoading(true);
    const allVideos = {};

    try {
      for (const yearOption of yearOptions) {
        if (!allYearsVideos[yearOption.value]) {
          const videoData = await fetchChannelVideosForYear(
            config.apiKey,
            config.channelId,
            yearOption.value
          );
          allVideos[yearOption.value] = videoData;
        } else {
          allVideos[yearOption.value] = allYearsVideos[yearOption.value];
        }
      }
      setAllYearsVideos(allVideos);
      showStatus("โหลดข้อมูลทุกปีสำเร็จ!", "success");
    } catch (error) {
      console.error("Error loading all years:", error);
      showStatus(`เกิดข้อผิดพลาด: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const exportBasicReport = (wb, config) => {
    const stats = analyzePerformance(videos);
    const dashboardData = [
      ["Report Configuration", "Value"],
      ["Channel Name", config.channelName],
      ["Year", selectedYear + 543],
      ["Generated Date", new Date().toLocaleString("th-TH")],
      [],
      ["Performance Metrics", "Value"],
      ["Total Videos", stats.totalVideos],
      ["Avg Videos/Month", stats.avgPerMonth],
      [
        "Total Views (This Year Content)",
        videos.reduce(
          (sum, v) => sum + parseInt(v.statistics.viewCount || 0),
          0
        ),
      ],
      [
        "Total Likes",
        videos.reduce(
          (sum, v) => sum + parseInt(v.statistics.likeCount || 0),
          0
        ),
      ],
      [
        "Most Active Month",
        `${stats.mostActiveMonth} (${stats.mostActiveCount} videos)`,
      ],
      ["Avg Days Between Uploads", stats.avgGap + " days"],
    ];
    const wsDashboard = XLSX.utils.aoa_to_sheet(dashboardData);
    XLSX.utils.book_append_sheet(wb, wsDashboard, "Dashboard");

    const monthlyData = processMonthlyData(videos);
    const monthlySheetData = monthlyData.map((m) => {
      const totalViews = m.videos
        ? m.videos.reduce(
            (sum, v) => sum + parseInt(v.statistics.viewCount || 0),
            0
          )
        : 0;
      return {
        Month: m.month,
        "Videos Published": m.count,
        "Percentage of Year": m.percentage + "%",
        "Total Views": totalViews,
        "Avg Views/Video": m.count > 0 ? Math.round(totalViews / m.count) : 0,
      };
    });

    const totalVideosPublished = monthlySheetData.reduce(
      (sum, row) => sum + row["Videos Published"],
      0
    );
    const totalViewsAll = monthlySheetData.reduce(
      (sum, row) => sum + row["Total Views"],
      0
    );
    const avgViewsOverall =
      totalVideosPublished > 0
        ? Math.round(totalViewsAll / totalVideosPublished)
        : 0;

    monthlySheetData.push({
      Month: "TOTAL",
      "Videos Published": totalVideosPublished,
      "Percentage of Year": "100%",
      "Total Views": totalViewsAll,
      "Avg Views/Video": avgViewsOverall,
    });

    const wsMonthly = XLSX.utils.json_to_sheet(monthlySheetData);
    XLSX.utils.book_append_sheet(wb, wsMonthly, "Monthly Stats");

    const videoListData = videos.map((v, index) => ({
      "No.": index + 1,
      "Publish Date": new Date(v.snippet.publishedAt).toLocaleDateString(
        "th-TH"
      ),
      Title: v.snippet.title,
      Views: parseInt(v.statistics.viewCount || 0),
      Likes: parseInt(v.statistics.likeCount || 0),
      Comments: parseInt(v.statistics.commentCount || 0),
      Duration: formatDuration(
        v.contentDetails ? v.contentDetails.duration : ""
      ),
      Link: `https://www.youtube.com/watch?v=${v.id}`,
    }));
    const wsVideos = XLSX.utils.json_to_sheet(videoListData);
    wsVideos["!cols"] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 50 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, wsVideos, "All Videos");
  };

  const exportContentPerformanceReport = (wb) => {
    const contentAnalysis = analyzeContentPerformance(videos);

    const engagementData = contentAnalysis.topByEngagement.map((v, index) => ({
      Rank: index + 1,
      Title: v.snippet.title,
      Views: v.views,
      Likes: v.likes,
      Comments: v.comments,
      "Engagement Rate (%)": v.engagementRate,
      Published: new Date(v.snippet.publishedAt).toLocaleDateString("th-TH"),
      Link: `https://www.youtube.com/watch?v=${v.id}`,
    }));
    const wsEngagement = XLSX.utils.json_to_sheet(engagementData);
    wsEngagement["!cols"] = [
      { wch: 5 },
      { wch: 50 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 15 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, wsEngagement, "Top Engagement");

    const commentsData = contentAnalysis.topByComments.map((v, index) => ({
      Rank: index + 1,
      Title: v.snippet.title,
      Comments: v.comments,
      Views: v.views,
      "Comment Rate (%)":
        v.views > 0 ? ((v.comments / v.views) * 100).toFixed(2) : 0,
      Published: new Date(v.snippet.publishedAt).toLocaleDateString("th-TH"),
      Link: `https://www.youtube.com/watch?v=${v.id}`,
    }));
    const wsComments = XLSX.utils.json_to_sheet(commentsData);
    wsComments["!cols"] = [
      { wch: 5 },
      { wch: 50 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 15 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, wsComments, "Top Comments");

    const durationData = contentAnalysis.durationPerformance.map((d) => ({
      "Duration Range": d.range,
      "Video Count": d.count,
      "Avg Views": d.avgViews,
      "Total Views": d.totalViews,
    }));
    const wsDuration = XLSX.utils.json_to_sheet(durationData);
    XLSX.utils.book_append_sheet(wb, wsDuration, "Duration Performance");
  };

  const exportTimingReport = (wb) => {
    const timeAnalysis = analyzeTimePatterns(videos);

    const timingData = timeAnalysis.bestUploadTimes.map((t, index) => ({
      Rank: index + 1,
      "Upload Time": t.hour,
      "Videos Uploaded": t.count,
      "Avg Views": t.avgViews,
    }));
    const wsTiming = XLSX.utils.json_to_sheet(timingData);
    XLSX.utils.book_append_sheet(wb, wsTiming, "Best Upload Times");

    const dayData = timeAnalysis.bestUploadDays.map((d, index) => ({
      Rank: index + 1,
      "Day of Week": d.day,
      "Videos Uploaded": d.count,
      "Avg Views": d.avgViews,
    }));
    const wsDay = XLSX.utils.json_to_sheet(dayData);
    XLSX.utils.book_append_sheet(wb, wsDay, "Best Upload Days");
  };

  const exportGrowthReport = (wb) => {
    const growthAnalysis = analyzeGrowthMetrics(allYearsVideos);

    const yearlyData = growthAnalysis.yearlyStats.map((y) => ({
      "Year (BE)": y.year + 543,
      "Video Count": y.videoCount,
      "Total Views": y.totalViews,
      "Total Likes": y.totalLikes,
      "Avg Views/Video": y.avgViewsPerVideo,
    }));
    const wsYearly = XLSX.utils.json_to_sheet(yearlyData);
    XLSX.utils.book_append_sheet(wb, wsYearly, "Yearly Stats");

    if (growthAnalysis.growthRates.length > 0) {
      const growthData = growthAnalysis.growthRates.map((g) => ({
        "Year (BE)": g.year + 543,
        "Video Growth (%)": g.videoGrowth,
        "View Growth (%)": g.viewGrowth,
        "Avg Views Growth (%)": g.avgViewsGrowth,
      }));
      const wsGrowth = XLSX.utils.json_to_sheet(growthData);
      XLSX.utils.book_append_sheet(wb, wsGrowth, "Growth Rates");
    }
  };

  const exportToExcel = async () => {
    if (
      selectedReportType === "growth" &&
      Object.keys(allYearsVideos).length < 2
    ) {
      const confirm = window.confirm(
        "รายงานการเติบโตต้องการข้อมูลอย่างน้อย 2 ปี ต้องการโหลดข้อมูลทุกปีหรือไม่?"
      );
      if (confirm) {
        await loadAllYearsForGrowth();
        return;
      } else {
        showStatus("กรุณาเลือกรายงานประเภทอื่น", "error");
        return;
      }
    }

    if (!videos || videos.length === 0) {
      showStatus("กรุณาเลือกช่องและปีก่อนดาวน์โหลด", "error");
      return;
    }

    const config = allConfigs[selectedConfig];
    const wb = XLSX.utils.book_new();

    try {
      switch (selectedReportType) {
        case "basic":
          exportBasicReport(wb, config);
          break;
        case "content":
          exportContentPerformanceReport(wb);
          break;
        case "timing":
          exportTimingReport(wb);
          break;
        case "growth":
          exportGrowthReport(wb);
          break;
        case "complete":
          exportBasicReport(wb, config);
          exportContentPerformanceReport(wb);
          exportTimingReport(wb);
          if (Object.keys(allYearsVideos).length >= 2) {
            exportGrowthReport(wb);
          }
          break;
      }

      const reportName =
        REPORT_TYPES.find((r) => r.id === selectedReportType)?.name || "Report";

      const fileName = `${config.channelName}_${reportName}_${
        selectedYear + 543
      }_${new Date().toISOString().split("T")[0]}.xlsx`;

      // Use XLSX.writeFile with options for better browser compatibility
      XLSX.writeFile(wb, fileName, {
        bookType: "xlsx",
        type: "binary",
        compression: false,
      });

      showStatus("ดาวน์โหลดรายงาน Excel สำเร็จ!", "success");
    } catch (error) {
      console.error("Export error:", error);
      showStatus("เกิดข้อผิดพลาดในการสร้างรายงาน", "error");
    }
  };

  const configsArray = Object.entries(allConfigs).map(([key, value]) => ({
    id: key,
    ...value,
  }));

  const selectedReport = REPORT_TYPES.find((r) => r.id === selectedReportType);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Report Type Selection */}
      <div className="glass-panel rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </span>
          เลือกประเภทรายงาน
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TYPES.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReportType(report.id)}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                selectedReportType === report.id
                  ? "border-indigo-500 bg-indigo-50 shadow-lg scale-105"
                  : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-3xl">{report.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1">
                    {report.name}
                  </h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration */}
      <div className="glass-panel rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </span>
          กำหนดค่ารายงาน
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              เลือกช่อง YouTube
            </label>
            <select
              value={selectedConfig}
              onChange={handleChannelChange}
              disabled={loading}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none disabled:opacity-50"
            >
              <option value="">เลือกช่อง...</option>
              {configsArray.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.channelName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              เลือกปี
            </label>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              disabled={!selectedConfig || loading}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none disabled:opacity-50"
            >
              <option value="">
                {selectedConfig ? "เลือกปี..." : "รอเลือกช่อง..."}
              </option>
              {yearOptions.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Download Button */}
      {videos.length > 0 && (
        <div className="glass-panel rounded-3xl p-8 text-center">
          <div
            className={`inline-block bg-gradient-to-r ${selectedReport.color} p-1 rounded-3xl mb-6`}
          >
            <div className="bg-white rounded-3xl px-6 py-3">
              <h3 className="text-2xl font-bold text-gray-800">
                {selectedReport.icon} {selectedReport.name}
              </h3>
            </div>
          </div>
          <p className="text-gray-600 mb-6 text-lg">
            พร้อมสร้างรายงานสำหรับ{" "}
            <strong>{allConfigs[selectedConfig]?.channelName}</strong> ปี{" "}
            <strong>{selectedYear + 543}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-8">
            จำนวนวิดีโอ: {videos.length} คลิป
          </p>
          <button
            onClick={exportToExcel}
            disabled={loading}
            className={`bg-gradient-to-r ${selectedReport.color} hover:shadow-2xl text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center mx-auto text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
          >
            <svg
              className="w-6 h-6 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {loading ? "กำลังสร้างรายงาน..." : "ดาวน์โหลดรายงาน"}
          </button>
        </div>
      )}
    </div>
  );
}
