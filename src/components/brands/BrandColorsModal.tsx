import { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Button,
  Space,
  Form,
  Input,
  Popconfirm,
  Typography,
  Tag,
  App,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BgColorsOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import colorService from '../../services/colorService';
import type { VehicleColor, VehicleColorRequest, Brand } from '../../types';

const { Text } = Typography;

interface BrandColorsModalProps {
  open: boolean;
  brand: Brand | null;
  onClose: () => void;
}

const BrandColorsModal = ({ open, brand, onClose }: BrandColorsModalProps) => {
  const { message: messageApi } = App.useApp();
  const [colors, setColors] = useState<VehicleColor[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingColor, setEditingColor] = useState<VehicleColor | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && brand) {
      fetchColors();
    }
  }, [open, brand]);

  const fetchColors = async () => {
    if (!brand) return;

    try {
      setLoading(true);
      const response = await colorService.getColors({ brandId: brand.id });

      // Handle different response formats
      if (response && typeof response === 'object' && 'data' in response) {
        const colorsData = (response as any).data;
        setColors(Array.isArray(colorsData) ? colorsData : []);
      } else {
        setColors(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error loading colors:', error);
      messageApi.error('Error al cargar los colores');
      setColors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingColor(null);
    form.resetFields();
    setIsFormVisible(true);
  };

  const handleEdit = (color: VehicleColor) => {
    setEditingColor(color);
    form.setFieldsValue({
      colorCode: color.colorCode,
      colorName: color.colorName,
      hexCode: color.hexCode || '',
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await colorService.deleteColor(id);
      messageApi.success('Color eliminado exitosamente');
      fetchColors();
    } catch (error) {
      console.error('Error deleting color:', error);
      messageApi.error('Error al eliminar el color');
    }
  };

  const handleSubmit = async (values: any) => {
    if (!brand) return;

    try {
      if (editingColor) {
        // Update existing color
        await colorService.updateColor(editingColor.id, {
          colorCode: values.colorCode,
          colorName: values.colorName,
          brandId: brand.id,
          hexCode: values.hexCode || null,
        });
        messageApi.success('Color actualizado exitosamente');
      } else {
        // Create new color
        const request: VehicleColorRequest = {
          colorCode: values.colorCode,
          colorName: values.colorName,
          brandId: brand.id,
          hexCode: values.hexCode || null,
        };
        await colorService.addColor(request);
        messageApi.success('Color agregado exitosamente');
      }

      setIsFormVisible(false);
      form.resetFields();
      fetchColors();
    } catch (error: any) {
      console.error('Error saving color:', error);
      messageApi.error(
        error.response?.data?.message || 'Error al guardar el color'
      );
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingColor(null);
    form.resetFields();
  };

  const columns: ColumnsType<VehicleColor> = [
    {
      title: 'Preview',
      dataIndex: 'hexCode',
      key: 'preview',
      width: 80,
      render: (hexCode: string) =>
        hexCode ? (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              backgroundColor: hexCode,
              border: '2px solid #d9d9d9',
            }}
          />
        ) : (
          <Tag>Sin color</Tag>
        ),
    },
    {
      title: 'Código',
      dataIndex: 'colorCode',
      key: 'colorCode',
      render: (code: string) => <Text strong>{code}</Text>,
    },
    {
      title: 'Nombre',
      dataIndex: 'colorName',
      key: 'colorName',
    },
    {
      title: 'Hex',
      dataIndex: 'hexCode',
      key: 'hexCode',
      render: (hex: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {hex || 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_: any, record: VehicleColor) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="¿Estás seguro de eliminar este color?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <BgColorsOutlined />
          <span>Colores de {brand?.brandName}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          disabled={isFormVisible}
        >
          Agregar Color
        </Button>
      </div>

      {isFormVisible && (
        <div
          style={{
            background: '#f5f5f5',
            padding: 16,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              colorCode: '',
              colorName: '',
              hexCode: '',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  {editingColor ? 'Editar Color' : 'Nuevo Color'}
                </Text>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <Form.Item
                  label="Código del Color"
                  name="colorCode"
                  rules={[
                    {
                      required: true,
                      message: 'Ingresa el código del color',
                    },
                  ]}
                  style={{ flex: 1 }}
                >
                  <Input placeholder="Ej: WHT, BLK, RED" />
                </Form.Item>

                <Form.Item
                  label="Nombre del Color"
                  name="colorName"
                  rules={[
                    { required: true, message: 'Ingresa el nombre del color' },
                  ]}
                  style={{ flex: 2 }}
                >
                  <Input placeholder="Ej: Blanco Perla, Negro Carbón" />
                </Form.Item>

                <Form.Item
                  label="Código Hex"
                  name="hexCode"
                  rules={[
                    {
                      pattern: /^#[0-9A-F]{6}$/i,
                      message: 'Formato inválido (ej: #FFFFFF)',
                    },
                  ]}
                  style={{ flex: 1 }}
                >
                  <Input placeholder="#FFFFFF" maxLength={7} />
                </Form.Item>
              </div>

              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                >
                  Guardar
                </Button>
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  Cancelar
                </Button>
              </Space>
            </Space>
          </Form>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={colors}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: 'No hay colores registrados para esta marca',
        }}
      />
    </Modal>
  );
};

export default BrandColorsModal;
