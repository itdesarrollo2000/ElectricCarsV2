import { Layout, Menu, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ThunderboltFilled } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 48px',
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
            fontSize: '20px',
            fontWeight: 700,
            marginRight: '60px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onClick={() => navigate('/')}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <ThunderboltFilled style={{ color: '#52c41a', fontSize: '24px' }} />
          <span style={{ color: '#1a1a1a' }}>
            Electric Cars
          </span>
        </div>
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
          }}
        />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginLeft: '24px',
        }}>
          <Avatar
            style={{
              backgroundColor: '#52c41a',
              cursor: 'pointer',
            }}
            size="default"
          >
            U
          </Avatar>
        </div>
      </Header>
      <Content style={{ padding: '24px 50px' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 'calc(100vh - 134px)' }}>
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Electric Cars ©{new Date().getFullYear()} - Sistema de Gestión de Vehículos Eléctricos
      </Footer>
    </Layout>
  );
};

export default MainLayout;
