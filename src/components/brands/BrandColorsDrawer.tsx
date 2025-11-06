import { useState, useEffect } from 'react';
import {
  Drawer,
  Table,
  Button,
  Space,
  Form,
  Input,
  InputNumber,
  Select,
  Popconfirm,
  Typography,
  Tag,
  App,
  Divider,
  Row,
  Col,
  Card,
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

interface BrandColorsDrawerProps {
  open: boolean;
  brand: Brand | null;
  onClose: () => void;
}

const COLOR_TYPES = [
  { value: 1, label: 'Metálico' },
  { value: 2, label: 'Sólido' },
  { value: 3, label: 'Matte' },
  { value: 4, label: 'Pearlescente' },
  { value: 5, label: 'Especial' },
];

const COLOR_TYPE_NAMES: Record<number, string> = {
  1: 'Metálico',
  2: 'Sólido',
  3: 'Matte',
  4: 'Pearlescente',
  5: 'Especial',
};

const BrandColorsDrawer = ({ open, brand, onClose }: BrandColorsDrawerProps) => {
  const { message: messageApi } = App.useApp();
  const [colors, setColors] = useState<VehicleColor[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingColor, setEditingColor] = useState<VehicleColor | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && brand) {
      fetchColors();
      setIsFormVisible(false);
      setEditingColor(null);
      form.resetFields();
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
      colorCode: color.hexCode || color.colorCode || '',
      colorName: color.colorName,
      minYear: color.minYear,
      maxYear: color.maxYear,
      manufacturer: color.manufacturer || '',
      mainColorGroup: color.mainColorGroup || '',
      mainColorGroupHexCode: color.mainColorGroupHexCode || '',
      colorType: color.colorType,
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
      const request: VehicleColorRequest = {
        colorCode: values.colorCode,
        colorName: values.colorName,
        brandId: brand.id,
        hexCode: values.colorCode || null,
        minYear: values.minYear || null,
        maxYear: values.maxYear || null,
        manufacturer: values.manufacturer || null,
        mainColorGroup: values.mainColorGroup || null,
        mainColorGroupHexCode: values.mainColorGroupHexCode || null,
        colorType: values.colorType || null,
      };

      if (editingColor) {
        // Update existing color
        await colorService.updateColor(editingColor.id, request);
        messageApi.success('Color actualizado exitosamente');
      } else {
        // Create new color
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
      dataIndex: 'colorCode',
      key: 'preview',
      width: 120,
      render: (colorCode: string, record: VehicleColor) => {
        const hexValue = colorCode || record.hexCode;
        return hexValue ? (
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <div
              style={{
                width: '100%',
                height: 36,
                borderRadius: '6px',
                backgroundColor: hexValue,
                border: '2px solid #d9d9d9',
              }}
            />
            <Text type="secondary" style={{ fontSize: 11, textAlign: 'center', display: 'block' }}>
              {hexValue}
            </Text>
          </Space>
        ) : (
          <Tag>N/A</Tag>
        );
      },
    },
    {
      title: 'Nombre',
      dataIndex: 'colorName',
      key: 'colorName',
      width: 180,
    },
    {
      title: 'Tipo',
      dataIndex: 'colorType',
      key: 'colorType',
      width: 100,
      render: (type: number | string) => {
        const typeName = typeof type === 'number' ? COLOR_TYPE_NAMES[type] : type;
        return <Tag color="blue">{typeName || 'N/A'}</Tag>;
      },
    },
    {
      title: 'Grupo',
      dataIndex: 'mainColorGroup',
      key: 'mainColorGroup',
      width: 120,
      render: (group: string, record: VehicleColor) => (
        <Space>
          {record.mainColorGroupHexCode && (
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: record.mainColorGroupHexCode,
                border: '1px solid #d9d9d9',
              }}
            />
          )}
          <Text>{group || 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: 'Años',
      key: 'years',
      width: 100,
      render: (_: any, record: VehicleColor) => {
        if (!record.minYear && !record.maxYear) return 'N/A';
        return `${record.minYear || '-'} - ${record.maxYear || '-'}`;
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
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
    <Drawer
      title={
        <Space>
          <BgColorsOutlined />
          <span>Colores de {brand?.brandName}</span>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={1000}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          disabled={isFormVisible}
        >
          Agregar Color
        </Button>
      }
    >
      {isFormVisible && (
        <Card
          style={{
            marginBottom: 24,
            borderColor: '#1890ff',
          }}
          title={
            <Space>
              <BgColorsOutlined />
              <Text strong>{editingColor ? 'Editar Color' : 'Nuevo Color'}</Text>
            </Space>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Divider orientation="left">Información Básica</Divider>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Código del Color"
                  name="colorCode"
                  rules={[
                    {
                      required: true,
                      message: 'Ingresa el código del color',
                    },
                    {
                      pattern: /^#[0-9A-F]{6}$/i,
                      message: 'Formato inválido (ej: #FFFFFF)',
                    },
                  ]}
                >
                  <Input placeholder="#FFFFFF" maxLength={7} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={16}>
                <Form.Item
                  label="Nombre del Color"
                  name="colorName"
                  rules={[
                    { required: true, message: 'Ingresa el nombre del color' },
                  ]}
                >
                  <Input placeholder="Ej: Blanco Perla, Negro Carbón" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Tipo de Color"
                  name="colorType"
                  rules={[
                    {
                      required: true,
                      message: 'Selecciona el tipo de color',
                    },
                  ]}
                >
                  <Select
                    placeholder="Seleccionar tipo"
                    options={COLOR_TYPES}
                    allowClear
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={8}>
                <Form.Item label="Fabricante" name="manufacturer">
                  <Input placeholder="Ej: PPG, DuPont" />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Grupo de Color</Divider>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Grupo de Color Principal" name="mainColorGroup">
                  <Input placeholder="Ej: Blanco, Negro, Azul" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Código Hex del Grupo"
                  name="mainColorGroupHexCode"
                  rules={[
                    {
                      pattern: /^#[0-9A-F]{6}$/i,
                      message: 'Formato inválido (ej: #FFFFFF)',
                    },
                  ]}
                >
                  <Input placeholder="#FFFFFF" maxLength={7} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Años de Disponibilidad</Divider>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Año Mínimo" name="minYear">
                  <InputNumber
                    placeholder="Ej: 2020"
                    min={1900}
                    max={2100}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item label="Año Máximo" name="maxYear">
                  <InputNumber
                    placeholder="Ej: 2024"
                    min={1900}
                    max={2100}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row justify="end" style={{ marginTop: 16 }}>
              <Space>
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                >
                  Guardar
                </Button>
              </Space>
            </Row>
          </Form>
        </Card>
      )}

      <Table
        columns={columns}
        dataSource={colors}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
        locale={{
          emptyText: 'No hay colores registrados para esta marca',
        }}
      />
    </Drawer>
  );
};

export default BrandColorsDrawer;
