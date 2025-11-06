import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Drawer, Button } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ThunderboltFilled, UserOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      label: <span style={{ fontWeight: 500, fontSize: '14px', color: '#262626' }}>Inicio</span>,
      style: {
        padding: '0 16px',
        height: '64px',
        lineHeight: '64px',
        borderBottom: location.pathname === '/' ? '2px solid #52c41a' : '2px solid transparent',
        marginBottom: '-1px',
      },
    },
    {
      key: '/vehicles',
      label: <span style={{ fontWeight: 500, fontSize: '14px', color: '#262626' }}>Vehículos</span>,
      style: {
        padding: '0 16px',
        height: '64px',
        lineHeight: '64px',
        borderBottom: location.pathname === '/vehicles' ? '2px solid #52c41a' : '2px solid transparent',
        marginBottom: '-1px',
      },
    },
    {
      key: '/brands',
      label: <span style={{ fontWeight: 500, fontSize: '14px', color: '#262626' }}>Marcas</span>,
      style: {
        padding: '0 16px',
        height: '64px',
        lineHeight: '64px',
        borderBottom: location.pathname === '/brands' ? '2px solid #52c41a' : '2px solid transparent',
        marginBottom: '-1px',
      },
    },
    {
      key: '/inventory',
      label: <span style={{ fontWeight: 500, fontSize: '14px', color: '#262626' }}>Inventario</span>,
      style: {
        padding: '0 16px',
        height: '64px',
        lineHeight: '64px',
        borderBottom: location.pathname.startsWith('/inventory') ? '2px solid #52c41a' : '2px solid transparent',
        marginBottom: '-1px',
      },
    },
    {
      key: '/users',
      label: <span style={{ fontWeight: 500, fontSize: '14px', color: '#262626' }}>Usuarios</span>,
      style: {
        padding: '0 16px',
        height: '64px',
        lineHeight: '64px',
        borderBottom: location.pathname === '/users' ? '2px solid #52c41a' : '2px solid transparent',
        marginBottom: '-1px',
      },
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
    setDrawerVisible(false);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 clamp(16px, 4vw, 48px)',
          boxShadow: '0 1px 0 rgba(0, 0, 0, 0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: '#ffffff',
          height: '64px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#1a1a1a',
            fontSize: 'clamp(16px, 4vw, 20px)',
            fontWeight: 700,
            marginRight: 'clamp(12px, 4vw, 60px)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            flex: '0 0 auto',
          }}
          onClick={() => navigate('/')}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <ThunderboltFilled style={{ color: '#52c41a', fontSize: 'clamp(20px, 5vw, 24px)' }} />
          <span style={{ color: '#1a1a1a', display: window.innerWidth < 480 ? 'none' : 'inline' }}>
            Electric Cars
          </span>
        </div>

        {/* Menú hamburguesa para móvil */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
          style={{
            display: window.innerWidth < 768 ? 'flex' : 'none',
            fontSize: '20px',
            marginLeft: 'auto',
          }}
        />

        {/* Menú horizontal para desktop */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            flex: 1,
            minWidth: 0,
            borderBottom: 'none',
            fontSize: '14px',
            background: 'transparent',
            lineHeight: '64px',
            display: window.innerWidth < 768 ? 'none' : 'flex',
          }}
        />

        {/* Avatar y usuario */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginLeft: window.innerWidth < 768 ? 'auto' : '24px',
        }}>
          <Text
            style={{
              fontSize: '14px',
              color: '#595959',
              display: window.innerWidth < 480 ? 'none' : 'inline',
            }}
          >
            {user?.name || user?.email}
          </Text>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'profile',
                  icon: <UserOutlined />,
                  label: 'Mi Perfil',
                  onClick: () => {
                    // TODO: Navigate to profile page
                  },
                },
                {
                  type: 'divider',
                },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Cerrar Sesión',
                  onClick: handleLogout,
                  danger: true,
                },
              ],
            }}
            placement="bottomRight"
            arrow
          >
            <Avatar
              style={{
                backgroundColor: '#52c41a',
                cursor: 'pointer',
              }}
              size="default"
            >
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </Dropdown>
        </div>
      </Header>

      {/* Drawer para menú móvil */}
      <Drawer
        title="Menú"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={250}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            borderRight: 'none',
          }}
        />
      </Drawer>
      <Content style={{ padding: 'clamp(12px, 3vw, 24px) clamp(16px, 4vw, 50px)' }}>
        <div style={{
          background: '#fff',
          padding: 'clamp(12px, 3vw, 24px)',
          minHeight: 'calc(100vh - 134px)'
        }}>
          <Outlet />
        </div>
      </Content>
      <Footer style={{
        textAlign: 'center',
        fontSize: 'clamp(12px, 2.5vw, 14px)',
        padding: 'clamp(12px, 3vw, 24px)',
      }}>
        Electric Cars ©{new Date().getFullYear()}
        <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>
          {' '}- Sistema de Gestión de Vehículos Eléctricos
        </span>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
