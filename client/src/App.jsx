import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import SecuritySettings from './pages/SecuritySettings';
import PasswordRecovery from './pages/PasswordRecovery';
import NoticesPage from './pages/NoticesPage';
import { ProfileDashboard } from './pages/FacultyDashboard';
export default function App() {
  const { user } = useAuth();
  return <><a className="skip-link" href="#main-content">Skip to main content</a><Routes><Route path="/login" element={<LoginPage />} /><Route path="/forgot-password" element={<PasswordRecovery />} /><Route path="/reset-password" element={<PasswordRecovery reset />} /><Route element={<ProtectedRoute />}><Route path="/security" element={<SecuritySettings />} /><Route path="/profile" element={<ProfileDashboard />} /><Route path="/notices" element={<NoticesPage />} /><Route element={<RoleRoute role="admin" />}><Route path="/admin" element={<AdminDashboard />} /></Route><Route element={<RoleRoute role="faculty" />}><Route path="/faculty" element={<FacultyDashboard />} /></Route><Route element={<RoleRoute role="student" />}><Route path="/student" element={<StudentDashboard />} /></Route><Route path="*" element={<Navigate to={user ? `/${user.role}` : '/login'} replace />} /></Route></Routes></>;
}
