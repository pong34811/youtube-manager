# YouTube Analytics Dashboard — UI/UX Redesign

Date: 2026-06-25
Status: Design Spec

## Overview

Complete UI/UX redesign of YouTube API Config Manager → Multi-Channel YouTube Analytics Dashboard. Modern SaaS dashboard with left sidebar navigation, widget-based analytics pages, dark/light mode support, and responsive layout.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 19 | UI Framework |
| Vite 7 | Build Tool |
| Tailwind CSS v4 | Styling |
| Zustand | Global State (auth, theme, sidebar) |
| TanStack Query (react-query) | Server State (YouTube API, Firebase data) |
| react-router-dom | Routing |
| recharts | Charts |
| xlsx (SheetJS) | Excel Export (existing) |
| Firebase Realtime DB | Backend (existing) |
| Outfit (Google Fonts) | Typography (existing) |

## Decisions (Clarified with User)

- **Language:** JavaScript (JSX) — no TypeScript migration
- **Auth:** Keep custom Firebase Realtime DB email check (no Firebase Auth)
- **Routing:** react-router-dom for all pages
- **State:** Zustand (global) + TanStack Query (server)
- **Navigation:** 9 sections with real data
- **Responsive:** Desktop-first + mobile sidebar collapse
- **Approach:** Hybrid — new layout shell, refactor existing components, reuse `utils/`

## Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Badge.jsx
│   │   ├── KpiCard.jsx
│   │   ├── Table.jsx
│   │   ├── Modal.jsx
│   │   ├── Tabs.jsx
│   │   ├── Toggle.jsx
│   │   ├── Spinner.jsx
│   │   ├── Skeleton.jsx
│   │   └── EmptyState.jsx
│   ├── charts/
│   │   └── Chart.jsx
│   └── layout/
│       ├── Sidebar.jsx
│       ├── Header.jsx
│       ├── MainLayout.jsx
│       └── MobileSidebar.jsx
├── features/
│   ├── overview/
│   │   ├── OverviewPage.jsx
│   │   ├── KpiRow.jsx
│   │   ├── ViewsTrendChart.jsx
│   │   ├── TopVideosWidget.jsx
│   │   └── QuickInsights.jsx
│   ├── channels/
│   │   ├── ChannelsPage.jsx
│   │   ├── ChannelCard.jsx
│   │   ├── ChannelCompareTable.jsx
│   │   └── ConfigFormModal.jsx
│   ├── videos/
│   │   ├── VideosPage.jsx
│   │   ├── VideoTable.jsx
│   │   └── VideoDetailModal.jsx
│   ├── analytics/
│   │   ├── AnalyticsPage.jsx
│   │   ├── AvgMetricsRow.jsx
│   │   ├── ContentAnalysis.jsx
│   │   └── UploadPattern.jsx
│   ├── revenue/
│   │   ├── RevenuePage.jsx
│   │   └── TopEarningVideos.jsx
│   ├── audience/
│   │   ├── AudiencePage.jsx
│   │   ├── DemographicsChart.jsx
│   │   └── GeographyChart.jsx
│   ├── reports/
│   │   ├── ReportsPage.jsx
│   │   ├── ReportHistory.jsx
│   │   └── ReportWizard.jsx
│   ├── settings/
│   │   ├── SettingsPage.jsx
│   │   └── ApiKeyManager.jsx
│   └── auth/
│       ├── LoginPage.jsx
│       └── ProtectedRoute.jsx
├── hooks/
│   ├── useYouTubeApi.js
│   ├── useChannelData.js
│   └── useTheme.js
├── stores/
│   ├── authStore.js
│   ├── themeStore.js
│   └── sidebarStore.js
├── lib/
│   ├── firebase.js (existing, reuse)
│   └── api.js
├── utils/
│   ├── analytics.js (existing, reuse)
│   └── youtube.js (existing, reuse)
├── App.jsx
└── main.jsx
```

## Layout

### Structure
- **Sidebar (Left):** Fixed 240px, collapsible on mobile (hamburger), logo top, nav items middle, user info bottom
- **Header (Top):** Search bar, notification bell, user avatar, dark/light toggle
- **Main Content:** max-w-7xl centered, widget grid

### Navigation Items
1. **Overview** — ภาพรวมทั้งหมด (Dashboard landing page)
2. **Channels** — จัดการ + เปรียบเทียบ YouTube channels
3. **Videos** — วิเคราะห์วิดีโอทั้งหมด
4. **Analytics** — ข้อมูลเชิงลึก
5. **Revenue** — รายได้
6. **Audience** — ผู้ชม
7. **Reports** — รายงาน (Excel export)
8. **Settings** — ตั้งค่าระบบ

### Routing
```
/                   → Overview (default, protected)
/login              → Login page (public)
/channels           → Channels (protected)
/videos             → Videos (protected)
/analytics          → Analytics (protected)
/revenue            → Revenue (protected)
/audience           → Audience (protected)
/reports            → Reports (protected)
/settings           → Settings (protected)
```

## Pages Detail

### Overview Page
- 5 KPI Cards (Views, Subs, Watch Time, Revenue, Published Videos)
- Views Trend (area chart)
- Subscriber Growth (line chart)
- Top 5 Videos (ranked list with metrics)
- Quick Insights cards (viral videos, declining CTR, high retention)
- Audience Overview (returning vs new, top country)
- Channel selector filter (all / specific channel)
- Time range selector (7d / 30d / 90d / 1y)

### Channels Page
- Channel cards list with status indicators
- CRUD for channel configs (reuse logic from ConfigSection.jsx)
- Compare mode (select 2+ channels, side-by-side metrics)
- Search + filter
- Status: connected / error / last sync time

### Videos Page
- Sortable table (thumbnail + title, views, likes, CTR, published date)
- Channel filter, year filter, search
- Performance badges (🔥 viral, 📉 declining, 💀 low retention)
- Pagination
- Click row → detail modal with full stats
- Quick insights section

### Analytics Page
- Average metrics row (AVG Views, AVG CTR, AVG Retention, AVG Likes)
- Views per Month (bar chart)
- CTR Trend (line chart)
- Content Analysis — keyword frequency, upload day distribution, title length (from analytics.js)
- Channel + year selector

### Revenue Page
- Revenue, RPM, CPM KPI cards
- Revenue Trend (bar chart)
- Top Earning Videos (ranked list)
- Channel + year + month selectors

### Audience Page
- Returning vs New viewers (donut chart)
- Demographics (gender + age distribution)
- Top Countries (bar chart or map)
- Device Types (mobile, desktop, TV)
- Time range selector

### Reports Page
- Report history list (download/delete)
- Create New Report wizard:
  - Select report type (Basic, Content, Timing, Growth, Complete)
  - Select channel + year
  - Generate + download XLSX
- Reuse logic from ReportSection.jsx

### Settings Page
- Profile (name, email, role display)
- YouTube API Keys management (moved from old Config tab)
- App Preferences (dark/light toggle, language, auto-refresh interval)

### Login Page
- Centered card layout (same auth logic, new UI)
- Email input, validation, submit
- Loading/error/success states

## Component Design System

### Theme Variables (CSS)
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-sidebar: #1e1e2d;
  --text-primary: #1a1a2e;
  --text-secondary: #6c757d;
  --accent: #4f46e5;        /* indigo-600 */
  --accent-hover: #4338ca;   /* indigo-700 */
  --success: #10b981;        /* emerald-500 */
  --warning: #f59e0b;        /* amber-500 */
  --danger: #ef4444;         /* red-500 */
  --chart-1: #6366f1;
  --chart-2: #ec4899;
  --chart-3: #14b8a6;
  --chart-4: #f97316;
  --chart-5: #8b5cf6;
}
[data-theme="dark"] {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-sidebar: #0f0f23;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
}
```

### Responsive Breakpoints
| Breakpoint | Layout |
|-----------|--------|
| < 768px | Sidebar hidden (hamburger), single column, stacked KPI cards |
| 768-1024px | Sidebar collapsed (icons only), 2-column grid |
| > 1024px | Sidebar expanded, 3-column grid |

## Data Flow

```
Firebase RTDB ──onValue──> App init ──> Zustand authStore
                                          └── currentUser

YouTube API ──fetch────> TanStack Query ──> Feature components
                              └── caching + refetch

Zustand Stores:
  authStore    — currentUser, login, logout
  themeStore   — theme (dark/light), persist to localStorage
  sidebarStore — isCollapsed, activeItem
```

## Migration Plan

### Phase 1: Foundation
1. Set up routing (react-router-dom), layouts, stores (Zustand), theme system
2. Create component library (ui/ components)
3. Build Login page + ProtectedRoute
4. Build Sidebar + Header + MainLayout

### Phase 2: Core Pages
5. Overview page (KPI cards, charts, top videos, insights)
6. Channels page (CRUD + compare mode, reuse ConfigSection logic)
7. Videos page (table + filters + detail modal)

### Phase 3: Analytics Pages
8. Analytics page (reuse analytics.js, content analysis)
9. Revenue page
10. Audience page

### Phase 4: Utilities & Polish
11. Reports page (reuse ReportSection logic)
12. Settings page
13. Dark mode polish, responsive testing
14. Remove old code (App.css, old App.jsx structure)

## Success Criteria
- All 9 pages navigable with react-router
- Dark/light mode toggle working and persisted
- Overview page loads with real data on first visit
- Channels CRUD functional
- Videos searchable, sortable, filterable
- Excel report generation working (reuse existing logic)
- Responsive layout functional on mobile/tablet/desktop
- No regression in Firebase data access or YouTube API calls

## Future Considerations
- English language support
- PDF report export
- Data export (CSV)
- Scheduled reports (email)
- Team collaboration features
