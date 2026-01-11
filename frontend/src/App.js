import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PetDetailPage from './pages/PetDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserLoginPage from './pages/UserLoginPage';
import AdminPage from './pages/AdminPage';
import PetEditPage from './pages/PetEditPage';
import AdoptionFormPage from './pages/AdoptionFormPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import ApplicationManagementPage from './pages/ApplicationManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/pet/:id" element={<PetDetailPage />} />
        <Route path="/adopt/:id" element={<AdoptionFormPage />} />
        
        {/* Auth Routes */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/user-login" element={<UserLoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* User Protected Routes */}
        <Route 
          path="/my-applications" 
          element={
            <ProtectedRoute>
              <MyApplicationsPage />
            </ProtectedRoute>
          } 
        />

        {/* Admin Protected Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/pet/:id/edit" 
          element={
            <ProtectedRoute>
              <PetEditPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/applications" 
          element={
            <ProtectedRoute>
              <ApplicationManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;