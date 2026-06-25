export const analyzePerformance = (videos) => {
  const totalVideos = videos.length;
  const avgPerMonth = (totalVideos / 12).toFixed(1);
  const dates = videos
    .map((v) => new Date(v.snippet.publishedAt))
    .sort((a, b) => a - b);
  let totalGaps = 0;
  for (let i = 1; i < dates.length; i++) {
    totalGaps += (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
  }
  const avgGap =
    dates.length > 1 ? (totalGaps / (dates.length - 1)).toFixed(1) : 0;
  const monthCounts = new Array(12).fill(0);
  videos.forEach(
    (video) => monthCounts[new Date(video.snippet.publishedAt).getMonth()]++
  );
  const maxMonthIndex = monthCounts.indexOf(Math.max(...monthCounts));
  const monthNames = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];

  return {
    totalVideos,
    avgPerMonth,
    avgGap,
    mostActiveMonth: monthNames[maxMonthIndex],
    mostActiveCount: monthCounts[maxMonthIndex],
  };
};

export const analyzeWeekdayPattern = (videos) => {
  const weekdays = [
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัสบดี",
    "ศุกร์",
    "เสาร์",
  ];
  const weekdayCounts = new Array(7).fill(0);
  videos.forEach(
    (video) => weekdayCounts[new Date(video.snippet.publishedAt).getDay()]++
  );
  const total = videos.length;
  return weekdays.map((day, index) => ({
    day,
    count: weekdayCounts[index],
    percentage:
      total > 0 ? ((weekdayCounts[index] / total) * 100).toFixed(1) : 0,
  }));
};

export const analyzeKeywords = (videos) => {
  const words = {};
  const commonWords = [
    "และ",
    "ใน",
    "ที่",
    "เป็น",
    "มี",
    "ได้",
    "จะ",
    "ไป",
    "มา",
    "ให้",
    "ของ",
    "กับ",
    "ก็",
    "ไม่",
    "แล้ว",
    "ว่า",
    "ถ้า",
    "เมื่อ",
    "ซึ่ง",
    "นี้",
    "นั้น",
    "อย่าง",
    "เพื่อ",
    "ทำ",
    "ใช้",
    "ดู",
    "รู้",
    "เอา",
    "ขึ้น",
    "ลง",
    "ออก",
    "เข้า",
  ];
  videos.forEach((video) => {
    const title = video.snippet.title.toLowerCase();
    const titleWords = title
      .split(/[\s\-_.,!?()[\]{}]+/)
      .filter(
        (word) =>
          word.length > 2 && !commonWords.includes(word) && !/^\d+$/.test(word)
      );
    titleWords.forEach((word) => (words[word] = (words[word] || 0) + 1));
  });
  return Object.entries(words)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
};

export const analyzeTitleLength = (videos) => {
  const lengths = videos.map((v) => v.snippet.title.length);
  const avgLength = (
    lengths.reduce((a, b) => a + b, 0) / lengths.length
  ).toFixed(1);
  const minLength = Math.min(...lengths);
  const maxLength = Math.max(...lengths);
  const short = lengths.filter((l) => l < 30).length;
  const medium = lengths.filter((l) => l >= 30 && l <= 60).length;
  const long = lengths.filter((l) => l > 60).length;
  const total = lengths.length;
  return {
    avgLength,
    minLength,
    maxLength,
    categories: [
      {
        range: "สั้น (< 30 ตัวอักษร)",
        count: short,
        percentage: ((short / total) * 100).toFixed(1),
      },
      {
        range: "ปานกลาง (30-60 ตัวอักษร)",
        count: medium,
        percentage: ((medium / total) * 100).toFixed(1),
      },
      {
        range: "ยาว (> 60 ตัวอักษร)",
        count: long,
        percentage: ((long / total) * 100).toFixed(1),
      },
    ],
  };
};

export const getTopVideos = (videos) => {
  return videos
    .sort(
      (a, b) =>
        parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount)
    )
    .slice(0, 5);
};

export const processMonthlyData = (videos) => {
  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const monthlyCount = new Array(12).fill(0);
  const monthlyVideos = Array.from({ length: 12 }, () => []);
  videos.forEach((video) => {
    const month = new Date(video.snippet.publishedAt).getMonth();
    monthlyCount[month]++;
    monthlyVideos[month].push(video);
  });
  const totalVideos = videos.length;
  return monthNames.map((monthName, index) => ({
    month: monthName,
    monthIndex: index,
    count: monthlyCount[index],
    percentage:
      totalVideos > 0
        ? ((monthlyCount[index] / totalVideos) * 100).toFixed(1)
        : 0,
    videos: monthlyVideos[index],
  }));
};

// NEW: Content Performance Analysis
export const analyzeContentPerformance = (videos) => {
  const videosWithEngagement = videos.map((v) => {
    const views = parseInt(v.statistics.viewCount || 0);
    const likes = parseInt(v.statistics.likeCount || 0);
    const comments = parseInt(v.statistics.commentCount || 0);
    const engagementRate =
      views > 0 ? (((likes + comments) / views) * 100).toFixed(2) : 0;

    return {
      ...v,
      engagementRate: parseFloat(engagementRate),
      views,
      likes,
      comments,
    };
  });

  const topByEngagement = [...videosWithEngagement]
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 10);

  const topByComments = [...videosWithEngagement]
    .sort((a, b) => b.comments - a.comments)
    .slice(0, 10);

  // Analyze video duration performance
  const durationGroups = {
    "สั้นมาก (< 30 วิ)": [],
    "30 วิ ถึง 59 วิ": [],
    "1 - 2.59 นาที": [],
    "3 - 4.59 นาที": [],
    "5 - 14.59 นาที": [],
    "15 - 29.59 นาที": [],
    "30 นาที ถึง 59.59 นาที": [],
    "1 ชั่วโมง ถึง 2.59 ชั่วโมง": [],
    "ยาวมาก (> 3 ชั่วโมง)": [],
  };

  videos.forEach((v) => {
    if (!v.contentDetails?.duration) return;
    const duration = parseDuration(v.contentDetails.duration);
    const views = parseInt(v.statistics.viewCount || 0);

    if (duration < 30) durationGroups["สั้นมาก (< 30 วิ)"].push(views);
    else if (duration < 60) durationGroups["30 วิ ถึง 59 วิ"].push(views);
    else if (duration < 180) durationGroups["1 - 2.59 นาที"].push(views);
    else if (duration < 300) durationGroups["3 - 4.59 นาที"].push(views);
    else if (duration < 900) durationGroups["5 - 14.59 นาที"].push(views);
    else if (duration < 1800) durationGroups["15 - 29.59 นาที"].push(views);
    else if (duration < 3600) durationGroups["30 นาที ถึง 59.59 นาที"].push(views);
    else if (duration < 10800) durationGroups["1 ชั่วโมง ถึง 2.59 ชั่วโมง"].push(views);
    else durationGroups["ยาวมาก (> 3 ชั่วโมง)"].push(views);
  });

  const durationPerformance = Object.entries(durationGroups).map(
    ([range, views]) => ({
      range,
      count: views.length,
      avgViews:
        views.length > 0
          ? Math.round(views.reduce((a, b) => a + b, 0) / views.length)
          : 0,
      totalViews: views.reduce((a, b) => a + b, 0),
    })
  );

  return {
    topByEngagement,
    topByComments,
    durationPerformance,
    avgEngagementRate: (
      videosWithEngagement.reduce((sum, v) => sum + v.engagementRate, 0) /
      videosWithEngagement.length
    ).toFixed(2),
  };
};

// NEW: Time-based Analysis
export const analyzeTimePatterns = (videos) => {
  const hourCounts = new Array(24).fill(0);
  const dayCounts = new Array(7).fill(0);
  const hourViews = new Array(24).fill(0);
  const dayViews = new Array(7).fill(0);

  videos.forEach((v) => {
    const date = new Date(v.snippet.publishedAt);
    const hour = date.getHours();
    const day = date.getDay();
    const views = parseInt(v.statistics.viewCount || 0);

    hourCounts[hour]++;
    dayCounts[day]++;
    hourViews[hour] += views;
    dayViews[day] += views;
  });

  const weekdays = [
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัสบดี",
    "ศุกร์",
    "เสาร์",
  ];

  const bestUploadTimes = hourCounts
    .map((count, hour) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      count,
      avgViews: count > 0 ? Math.round(hourViews[hour] / count) : 0,
    }))
    .filter((h) => h.count > 0)
    .sort((a, b) => b.avgViews - a.avgViews)
    .slice(0, 5);

  const bestUploadDays = dayCounts
    .map((count, day) => ({
      day: weekdays[day],
      count,
      avgViews: count > 0 ? Math.round(dayViews[day] / count) : 0,
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.avgViews - a.avgViews);

  return {
    bestUploadTimes,
    bestUploadDays,
    hourlyDistribution: hourCounts.map((count, hour) => ({ hour, count })),
    dailyDistribution: dayCounts.map((count, day) => ({
      day: weekdays[day],
      count,
    })),
  };
};

// NEW: Growth Metrics (requires multiple years data)
export const analyzeGrowthMetrics = (videosByYear) => {
  // videosByYear should be an object like { 2023: [...videos], 2024: [...videos] }
  const years = Object.keys(videosByYear).sort();

  const yearlyStats = years.map((year) => {
    const videos = videosByYear[year];
    const totalViews = videos.reduce(
      (sum, v) => sum + parseInt(v.statistics.viewCount || 0),
      0
    );
    const totalLikes = videos.reduce(
      (sum, v) => sum + parseInt(v.statistics.likeCount || 0),
      0
    );
    const avgViewsPerVideo =
      videos.length > 0 ? Math.round(totalViews / videos.length) : 0;

    return {
      year: parseInt(year),
      videoCount: videos.length,
      totalViews,
      totalLikes,
      avgViewsPerVideo,
    };
  });

  const growthRates = yearlyStats.slice(1).map((current, index) => {
    const previous = yearlyStats[index];
    return {
      year: current.year,
      videoGrowth:
        previous.videoCount > 0
          ? (
              ((current.videoCount - previous.videoCount) /
                previous.videoCount) *
              100
            ).toFixed(1)
          : 0,
      viewGrowth:
        previous.totalViews > 0
          ? (
              ((current.totalViews - previous.totalViews) /
                previous.totalViews) *
              100
            ).toFixed(1)
          : 0,
      avgViewsGrowth:
        previous.avgViewsPerVideo > 0
          ? (
              ((current.avgViewsPerVideo - previous.avgViewsPerVideo) /
                previous.avgViewsPerVideo) *
              100
            ).toFixed(1)
          : 0,
    };
  });

  return {
    yearlyStats,
    growthRates,
  };
};

// Helper function to parse ISO 8601 duration
export function parseDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1]?.replace("H", "") || 0);
  const minutes = parseInt(match[2]?.replace("M", "") || 0);
  const seconds = parseInt(match[3]?.replace("S", "") || 0);

  return hours * 3600 + minutes * 60 + seconds;
}
