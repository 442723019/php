import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import Alarms from './pages/Alarms';
import Statistics from './pages/Statistics';
import Users from './pages/Users';
import Settings from './pages/Settings';
import History from './pages/History';
import NcInfo from './pages/nc';
// 路由保护组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="machines" element={<Machines />} />
          <Route path="history" element={<History />} />
          <Route path="alarms" element={<Alarms />} />
          <Route path="ncInfo" element={<NcInfo />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
