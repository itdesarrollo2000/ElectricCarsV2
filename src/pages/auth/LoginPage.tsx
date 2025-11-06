import { Form, Input, Button, Card, Typography, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, ThunderboltFilled, CarOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginCredentials } from '../../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const [form] = Form.useForm();

  // Get the redirect path from location state or default to home
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (values: LoginCredentials) => {
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is already handled in AuthContext with message.error
      console.error('Login failed:', error);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        padding: 'clamp(16px, 4vw, 40px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(82, 196, 26, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(82, 196, 26, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .login-card {
            animation: slideIn 0.5s ease-out;
          }
        `}
      </style>

      <Row
        gutter={[32, 32]}
        style={{
          maxWidth: '1200px',
          width: '100%',
          zIndex: 1,
          flexDirection: window.innerWidth < 768 ? 'column-reverse' : 'row',
        }}
      >
        {/* Left Side - Info Panel */}
        <Col
          xs={0}
          md={12}
          lg={12}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 'clamp(20px, 4vw, 40px)',
          }}
        >
          <div style={{ color: '#ffffff' }}>
            <div
              style={{
                display: window.innerWidth < 768 ? 'none' : 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
              <ThunderboltFilled
                style={{
                  fontSize: 'clamp(48px, 8vw, 72px)',
                  color: '#52c41a',
                  filter: 'drop-shadow(0 0 20px rgba(82, 196, 26, 0.5))',
                }}
              />
              <div>
                <Title
                  level={1}
                  style={{
                    margin: 0,
                    color: '#ffffff',
                    fontSize: 'clamp(28px, 5vw, 42px)',
                    fontWeight: 800,
                    lineHeight: 1.2,
                  }}
                >
                  Electric Cars
                </Title>
                <Text
                  style={{
                    color: '#52c41a',
                    fontSize: 'clamp(14px, 2.5vw, 18px)',
                    fontWeight: 600,
                  }}
                >
                  Gestión Inteligente
                </Text>
              </div>
            </div>

            <Paragraph
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 'clamp(14px, 2.5vw, 18px)',
                lineHeight: 1.8,
                marginBottom: '32px',
                textAlign: window.innerWidth < 768 ? 'center' : 'left',
              }}
            >
              Sistema integral de gestión de vehículos eléctricos. Administra tu inventario,
              controla marcas y versiones, y optimiza tus operaciones en un solo lugar.
            </Paragraph>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(82, 196, 26, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CarOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                </div>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px' }}>
                  Gestión completa de inventario
                </Text>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(82, 196, 26, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ThunderboltFilled style={{ fontSize: '20px', color: '#52c41a' }} />
                </div>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px' }}>
                  Acceso rápido y seguro
                </Text>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(82, 196, 26, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                </div>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px' }}>
                  Panel de control intuitivo
                </Text>
              </div>
            </div>
          </div>
        </Col>

        {/* Right Side - Login Form */}
        <Col xs={24} md={12} lg={12}>
          <Card
            className="login-card"
            style={{
              borderRadius: '24px',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
            }}
            styles={{
              body: {
                padding: 'clamp(32px, 6vw, 56px)',
              },
            }}
          >
            {/* Logo for mobile */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '40px',
                display: 'block',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <ThunderboltFilled
                  style={{
                    fontSize: 'clamp(36px, 8vw, 48px)',
                    color: '#52c41a',
                    filter: 'drop-shadow(0 4px 12px rgba(82, 196, 26, 0.3))',
                  }}
                />
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    fontSize: 'clamp(24px, 5vw, 32px)',
                    background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800,
                    display: window.innerWidth < 768 ? 'block' : 'none',
                  }}
                >
                  Electric Cars
                </Title>
              </div>
              <Title
                level={3}
                style={{
                  margin: '0 0 8px 0',
                  fontSize: 'clamp(20px, 4vw, 24px)',
                  color: '#262626',
                  fontWeight: 700,
                }}
              >
                Bienvenido
              </Title>
              <Text
                style={{
                  fontSize: 'clamp(13px, 2.5vw, 15px)',
                  color: '#8c8c8c',
                }}
              >
                Ingresa tus credenciales para continuar
              </Text>
            </div>

            {/* Login Form */}
            <Form
              form={form}
              name="login"
              onFinish={handleSubmit}
              autoComplete="off"
              size="large"
              layout="vertical"
            >
              <Form.Item
                name="username"
                label={
                  <span style={{ fontWeight: 600, color: '#262626' }}>
                    Usuario o Correo Electrónico
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: 'Por favor ingresa tu usuario o correo electrónico',
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="usuario o tu@email.com"
                  autoComplete="username"
                  style={{
                    borderRadius: '12px',
                    height: '48px',
                    fontSize: '15px',
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  <span style={{ fontWeight: 600, color: '#262626' }}>Contraseña</span>
                }
                rules={[
                  { required: true, message: 'Por favor ingresa tu contraseña' },
                  { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
                ]}
                style={{ marginBottom: '32px' }}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    borderRadius: '12px',
                    height: '48px',
                    fontSize: '15px',
                  }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: '0' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={isLoading}
                  style={{
                    height: '52px',
                    fontSize: '16px',
                    fontWeight: 700,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(82, 196, 26, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(82, 196, 26, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(82, 196, 26, 0.3)';
                  }}
                >
                  Iniciar Sesión
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(12px, 3vw, 24px)',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
          }}
        >
          © {new Date().getFullYear()} Electric Cars. Todos los derechos reservados.
        </Text>
      </div>
    </div>
  );
};

export default LoginPage;
