import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import esES from 'antd/locale/es_ES';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/home/HomePage';
import VehiclesPage from './pages/vehicles/VehiclesPage';
import VehicleDetailPage from './pages/vehicles/VehicleDetailPage';
import BrandsPage from './pages/brands/BrandsPage';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={esES}>
      <AntdApp>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="vehicles/:id" element={<VehicleDetailPage />} />
              <Route path="brands" element={<BrandsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
