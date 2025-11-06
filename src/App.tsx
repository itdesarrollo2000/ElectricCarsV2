import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import esES from 'antd/locale/es_ES';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/home/HomePage';
import VehiclesPage from './pages/vehicles/VehiclesPage';
import VehicleDetailPage from './pages/vehicles/VehicleDetailPage';
import BrandsPage from './pages/brands/BrandsPage';
import InventoryPage from './pages/inventory/InventoryPage';
import InventoryDetailPage from './pages/inventory/InventoryDetailPage';
import AddInventoryItemPage from './pages/inventory/AddInventoryItemPage';
import UsersPage from './pages/users/UsersPage';
import './App.css';

function App() {
  return (
    <ConfigProvider
      locale={esES}
      theme={{
        token: {
          borderRadius: 8,
          fontSize: 14,
        },
      }}
    >
      <AntdApp
        message={{
          maxCount: 3,
          duration: 5,
          top: 100,
        }}
      >
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomePage />} />
                <Route path="vehicles" element={<VehiclesPage />} />
                <Route path="vehicles/:id" element={<VehicleDetailPage />} />
                <Route path="brands" element={<BrandsPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="inventory/add" element={<AddInventoryItemPage />} />
                <Route path="inventory/:id" element={<InventoryDetailPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
