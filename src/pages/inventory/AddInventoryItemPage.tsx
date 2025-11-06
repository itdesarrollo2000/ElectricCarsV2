import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Space,
  Typography,
  Row,
  Col,
  App,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CarOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import inventoryService from '../../services/inventoryService';
import vehicleService from '../../services/vehicleService';
import colorService from '../../services/colorService';
import type {
  InventoryItemRequest,
  VehicleVersion,
  VehicleColor,
} from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_OPTIONS = [
  { value: 'Available', label: 'Disponible' },
  { value: 'Reserved', label: 'Reservado' },
  { value: 'InTransit', label: 'En Tránsito' },
  { value: 'InMaintenance', label: 'Mantenimiento' },
  { value: 'Sold', label: 'Vendido' },
  { value: 'Damaged', label: 'Dañado' },
  { value: 'OnHold', label: 'En Espera' },
  { value: 'Delivered', label: 'Entregado' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - Dólar' },
  { value: 'MXN', label: 'MXN - Peso Mexicano' },
  { value: 'EUR', label: 'EUR - Euro' },
];

const AddInventoryItemPage = () => {
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();
  const [form] = Form.useForm();

  const [submitLoading, setSubmitLoading] = useState(false);
  const [vehicleVersions, setVehicleVersions] = useState<VehicleVersion[]>([]);
  const [colors, setColors] = useState<VehicleColor[]>([]);

  useEffect(() => {
    fetchVehicleVersions();
    fetchColors();
  }, []);

  const fetchVehicleVersions = async () => {
    try {
      const response = await vehicleService.getVehicleVersions({ pageSize: 1000 });
      setVehicleVersions(response.data || []);
    } catch (error) {
      console.error('Error loading vehicle versions:', error);
      setVehicleVersions([]);
    }
  };

  const fetchColors = async () => {
    try {
      const response = await colorService.getColors({});
      // Handle different response formats
      if (response && typeof response === 'object' && 'data' in response) {
        const colorsData = (response as any).data;
        setColors(Array.isArray(colorsData) ? colorsData : []);
      } else {
        setColors(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error loading colors:', error);
      setColors([]);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitLoading(true);

      const request: InventoryItemRequest = {
        vin: values.vin || null,
        serialNumber: values.serialNumber || null,
        vehicleVersionId: values.vehicleVersionId,
        vehicleColorId: values.vehicleColorId,
        location: values.location || null,
        status: values.status,
        mileage: values.mileage || null,
        modelYear: values.modelYear,
        entryDate: values.entryDate ? values.entryDate.toISOString() : null,
        entryNotes: values.entryNotes || null,
        purchasePrice: values.purchasePrice || null,
        purchaseCurrency: values.purchaseCurrency || null,
        supplierName: values.supplierName || null,
        exitDate: null,
        exitNotes: null,
      };

      await inventoryService.createInventoryItem(request);
      messageApi.success('Vehículo agregado al inventario exitosamente');
      navigate('/inventory');
    } catch (error: any) {
      console.error('Error creating inventory item:', error);
      messageApi.error(
        error.response?.data?.message || 'Error al agregar el vehículo al inventario'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventory');
  };

  return (
    <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleCancel}
          style={{ marginBottom: 12 }}
        >
          Volver
        </Button>
        <Title
          level={2}
          style={{
            margin: 0,
            fontSize: 'clamp(20px, 5vw, 28px)'
          }}
        >
          Agregar Vehículo al Inventario
        </Title>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'Available',
            modelYear: new Date().getFullYear(),
            entryDate: dayjs(),
            purchaseCurrency: 'MXN',
          }}
        >
          <Row gutter={[16, 16]}>
            {/* Información del Vehículo */}
            <Col span={24}>
              <Divider orientation="left">
                <Space>
                  <CarOutlined />
                  <Text strong>Información del Vehículo</Text>
                </Space>
              </Divider>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="VIN (Número de Identificación)"
                name="vin"
                rules={[
                  { required: true, message: 'Ingresa el VIN' },
                  { max: 17, message: 'El VIN debe tener máximo 17 caracteres' },
                ]}
              >
                <Input
                  placeholder="Ej: 1HGBH41JXMN109186"
                  maxLength={17}
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Número de Serie" name="serialNumber">
                <Input placeholder="Número de serie del vehículo" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Versión del Vehículo"
                name="vehicleVersionId"
                rules={[{ required: true, message: 'Selecciona la versión del vehículo' }]}
              >
                <Select
                  placeholder="Seleccionar versión"
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={(vehicleVersions || []).map((v) => ({
                    value: v.id,
                    label: v.versionName,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Color"
                name="vehicleColorId"
                rules={[{ required: true, message: 'Selecciona el color' }]}
              >
                <Select
                  placeholder="Seleccionar color"
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {(colors || []).map((c) => (
                    <Select.Option key={c.id} value={c.id} label={c.colorName}>
                      <Space>
                        {c.hexCode && (
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              backgroundColor: c.hexCode,
                              border: '1px solid #d9d9d9',
                              display: 'inline-block',
                            }}
                          />
                        )}
                        {c.colorName}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Año del Modelo"
                name="modelYear"
                rules={[{ required: true, message: 'Ingresa el año del modelo' }]}
              >
                <InputNumber
                  placeholder="Año"
                  min={2000}
                  max={2030}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Kilometraje" name="mileage">
                <InputNumber
                  placeholder="Kilometraje actual"
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  addonAfter="km"
                />
              </Form.Item>
            </Col>

            {/* Estado y Ubicación */}
            <Col span={24}>
              <Divider orientation="left">
                <Space>
                  <EnvironmentOutlined />
                  <Text strong>Estado y Ubicación</Text>
                </Space>
              </Divider>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Estado"
                name="status"
                rules={[{ required: true, message: 'Selecciona el estado' }]}
              >
                <Select placeholder="Seleccionar estado" options={STATUS_OPTIONS} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Ubicación"
                name="location"
                rules={[{ required: true, message: 'Ingresa la ubicación' }]}
              >
                <Input
                  placeholder="Ej: Almacén A - Pasillo 3"
                  prefix={<EnvironmentOutlined />}
                />
              </Form.Item>
            </Col>

            {/* Información de Compra */}
            <Col span={24}>
              <Divider orientation="left">
                <Space>
                  <DollarOutlined />
                  <Text strong>Información de Compra</Text>
                </Space>
              </Divider>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Precio de Compra" name="purchasePrice">
                <InputNumber
                  placeholder="Precio de compra"
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  prefix={<DollarOutlined />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Moneda" name="purchaseCurrency">
                <Select placeholder="Seleccionar moneda" options={CURRENCY_OPTIONS} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Proveedor" name="supplierName">
                <Input placeholder="Nombre del proveedor" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Fecha de Entrada"
                name="entryDate"
                rules={[{ required: true, message: 'Selecciona la fecha de entrada' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Seleccionar fecha"
                  suffixIcon={<CalendarOutlined />}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Notas de Entrada" name="entryNotes">
                <TextArea
                  rows={3}
                  placeholder="Notas adicionales sobre el vehículo al momento de entrada"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Botones de Acción */}
          <Row justify="end" style={{ marginTop: 24 }}>
            <Col xs={24} sm={24} md={12} lg={8}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }} wrap>
                <Button
                  onClick={handleCancel}
                  disabled={submitLoading}
                  style={{ minWidth: '100px' }}
                >
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={submitLoading}
                  style={{ minWidth: '140px' }}
                >
                  Guardar Vehículo
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AddInventoryItemPage;
