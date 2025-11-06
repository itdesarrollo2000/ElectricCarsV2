import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  DatePicker,
  App,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, UserAddOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import userService from '../../services/userService';
import type { UserRegistrationRequest, UserProfile } from '../../services/userService';

const { Title, Text } = Typography;

const UsersPage = () => {
  const { message: messageApi } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerForm] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUserProfiles();
      setUsers(response.data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      messageApi.error('Error al cargar los usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUser = async (values: any) => {
    try {
      setRegisterLoading(true);
      const userData: UserRegistrationRequest = {
        password: values.password,
        email: values.email,
        firstName: values.firstName,
        lastNameP: values.lastNameP,
        lastNameM: values.lastNameM,
        city: values.city,
        address: values.address,
        phoneNumber: values.phoneNumber,
        hireDate: values.hireDate ? values.hireDate.format('YYYY-MM-DD') : undefined,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : undefined,
      };

      await userService.registerUser(userData);
      messageApi.success('Usuario registrado exitosamente');
      setRegisterModalOpen(false);
      registerForm.resetFields();
      fetchUsers();
    } catch (error: any) {
      console.error('Error registering user:', error);
      const errorMessage = error?.response?.data?.errors
        ? Object.values(error.response.data.errors).join(', ')
        : 'Error al registrar el usuario';
      messageApi.error(errorMessage);
    } finally {
      setRegisterLoading(false);
    }
  };

  const columns: ColumnsType<UserProfile> = [
    {
      title: 'Nombre',
      key: 'name',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.fullName}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <MailOutlined /> {record.email}
          </Text>
        </Space>
      ),
      responsive: ['xs', 'sm', 'md', 'lg'],
    },
    {
      title: 'Teléfono',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone) => phone || 'N/A',
      responsive: ['md', 'lg'],
    },
    {
      title: 'Ciudad',
      dataIndex: 'city',
      key: 'city',
      render: (city) => city || 'N/A',
      responsive: ['lg'],
    },
    {
      title: 'Fecha de Contratación',
      dataIndex: 'hireDate',
      key: 'hireDate',
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'),
      responsive: ['lg'],
    },
    {
      title: 'Estado',
      dataIndex: 'accountStatus',
      key: 'accountStatus',
      render: (status) => (
        <Text type={status === 0 ? 'success' : 'danger'}>{status === 0 ? 'Activo' : 'Inactivo'}</Text>
      ),
      responsive: ['md', 'lg'],
    },
  ];

  return (
    <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
      <Card>
        <div
          style={{
            marginBottom: 'clamp(16px, 3vw, 24px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <Title level={2} style={{ margin: 0, fontSize: 'clamp(18px, 4vw, 28px)' }}>
            <UserAddOutlined /> Administración de Usuarios
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setRegisterModalOpen(true)}
            size={window.innerWidth < 768 ? 'middle' : 'large'}
          >
            {window.innerWidth < 768 ? 'Nuevo' : 'Registrar Usuario'}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="userId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} usuarios`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Modal de Registro de Usuario */}
      <Modal
        title="Registrar Nuevo Usuario"
        open={registerModalOpen}
        onCancel={() => {
          setRegisterModalOpen(false);
          registerForm.resetFields();
        }}
        onOk={() => registerForm.submit()}
        okText="Registrar"
        cancelText="Cancelar"
        confirmLoading={registerLoading}
        width={window.innerWidth < 768 ? '95%' : 800}
      >
        <Form form={registerForm} layout="vertical" onFinish={handleRegisterUser}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Correo Electrónico"
                name="email"
                rules={[
                  { required: true, message: 'Ingresa el correo electrónico' },
                  { type: 'email', message: 'Ingresa un correo válido' },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="usuario@ejemplo.com" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Contraseña"
                name="password"
                rules={[
                  { required: true, message: 'Ingresa la contraseña' },
                  { min: 8, message: 'La contraseña debe tener al menos 8 caracteres' },
                  {
                    pattern: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/,
                    message: 'La contraseña debe contener al menos una mayúscula, un número y un carácter especial',
                  },
                ]}
              >
                <Input.Password placeholder="Contraseña" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Nombre"
                name="firstName"
                rules={[{ required: true, message: 'Ingresa el nombre' }]}
              >
                <Input placeholder="Nombre" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Apellido Paterno"
                name="lastNameP"
                rules={[{ required: true, message: 'Ingresa el apellido paterno' }]}
              >
                <Input placeholder="Apellido Paterno" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Apellido Materno"
                name="lastNameM"
                rules={[{ required: true, message: 'Ingresa el apellido materno' }]}
              >
                <Input placeholder="Apellido Materno" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Teléfono" name="phoneNumber">
                <Input prefix={<PhoneOutlined />} placeholder="1234567890" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Ciudad" name="city">
                <Input placeholder="Ciudad" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Dirección" name="address">
            <Input.TextArea rows={2} placeholder="Dirección completa" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Fecha de Contratación" name="hireDate">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Seleccionar fecha" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Fecha de Nacimiento" name="birthDate">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Seleccionar fecha" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
