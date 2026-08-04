import { Routes, Route, Navigate } from 'react-router-dom';

import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';

import { DashboardPage } from './pages/DashboardPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Authenticated routes — wrapped in AppProvider + Layout */}
      <Route
        element={
          <AppProvider>
            <Layout />
          </AppProvider>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
