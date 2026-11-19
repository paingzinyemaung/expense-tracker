import { Navigate, Route, Routes } from 'react-router';
import GuestRoute from './features/auth/GuestRoute';
import ProtectedRoute from './features/auth/ProtectedRoute';
import DesignPreview from './pages/DesignPreview';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppLayout from './layouts/AppLayout';
import ComingSoonPage from './pages/ComingSoonPage';
import CategoriesPage from './pages/CategoriesPage';
import TransactionsPage from './pages/TransactionsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
        </Route>
      </Route>

      <Route path="/design" element={<DesignPreview />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
