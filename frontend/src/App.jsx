import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { GuestRoute } from './components/common/GuestRoute';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// App Pages
import DashboardPage from './pages/DashboardPage';
import PlatformsPage from './pages/PlatformsPage';
import ProblemsPage from './pages/ProblemsPage';
import SubmissionsPage from './pages/SubmissionsPage';
import ContestsPage from './pages/ContestsPage';
import GoalsPage from './pages/GoalsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';

const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Guest-only routes (redirects to /dashboard if logged in) */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected routes wrapped in AppLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/platforms" element={<PlatformsPage />} />
                <Route path="/problems" element={<ProblemsPage />} />
                <Route path="/submissions" element={<SubmissionsPage />} />
                <Route path="/contests" element={<ContestsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />

                {/* Admin-only route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Route>

            {/* Default root navigation */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
