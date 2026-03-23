import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DetectorPage } from './pages/DetectorPage';
import { AlertsPage } from './pages/AlertsPage';
import { MarketsPage } from './pages/MarketsPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/detector" element={<DetectorPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/signin" element={<AuthPage mode="signin" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/login" element={<Navigate to="/signin" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
