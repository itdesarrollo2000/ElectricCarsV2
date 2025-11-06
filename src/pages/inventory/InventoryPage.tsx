import { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Select,
  DatePicker,
  Drawer,
  Form,
  InputNumber,
  Tooltip,
  Modal,
  App,
  Dropdown,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  SwapOutlined,
  DashboardOutlined,
  FilterOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import inventoryService from '../../services/inventoryService';
import vehicleService from '../../services/vehicleService';
import colorService from '../../services/colorService';
import type {
  InventoryItem,
  InventoryFilters,
  VehicleVersion,
  VehicleColor,
} from '../../types';
import { InventoryStatus } from '../../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Status color mapping
const STATUS_COLORS: Record<InventoryStatus, string> = {
  Available: 'green',
  Reserved: 'gold',
  InTransit: 'blue',
  InMaintenance: 'orange',
  Sold: 'red',
  Damaged: 'volcano',
  OnHold: 'default',
  Delivered: 'purple',
};

// Status labels in Spanish
const STATUS_LABELS: Record<InventoryStatus, string> = {
  [InventoryStatus.Available]: 'Disponible',
  [InventoryStatus.Reserved]: 'Reservado',
  [InventoryStatus.InTransit]: 'En Tránsito',
  [InventoryStatus.InMaintenance]: 'Mantenimiento',
  [InventoryStatus.Sold]: 'Vendido',
  [InventoryStatus.Damaged]: 'Dañado',
  [InventoryStatus.OnHold]: 'En Espera',
  [InventoryStatus.Delivered]: 'Entregado',
};

// Mapeo de números a estados (basado en el API)
const STATUS_NUMBER_TO_KEY: Record<number, InventoryStatus> = {
  1: InventoryStatus.Available,
  2: InventoryStatus.Reserved,
  3: InventoryStatus.InTransit,
  4: InventoryStatus.InMaintenance,
  5: InventoryStatus.Sold,
  6: InventoryStatus.Damaged,
  7: InventoryStatus.OnHold,
  8: InventoryStatus.Delivered,
};

// Helper para obtener el estado correcto
const getStatusKey = (status: any): InventoryStatus => {
  if (typeof status === 'number') {
    return STATUS_NUMBER_TO_KEY[status] || InventoryStatus.Available;
  }
  return status as InventoryStatus;
};

const InventoryPage = () => {
  const navigate = useNavigate();
  const { message: messageApi, modal } = App.useApp();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [vehicleVersions, setVehicleVersions] = useState<VehicleVersion[]>([]);
  const [colors, setColors] = useState<VehicleColor[]>([]);
  const [form] = Form.useForm();

  // Modal states
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [mileageModalOpen, setMileageModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [locationForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [mileageForm] = Form.useForm();

  useEffect(() => {
    fetchInventoryItems();
    fetchVehicleVersions();
    fetchColors();
  }, [currentPage, pageSize, filters]);

  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventoryItems({
        ...filters,
        PageNumber: currentPage,
        PageSize: pageSize,
      });

      console.log('Inventory items response:', response.data);
      if (response.data && response.data.length > 0) {
        console.log('First item sample:', response.data[0]);
      }

      setInventoryItems(response.data || []);
      setTotalRecords(response.totalRecords || 0);
    } catch (error: any) {
      console.error('Error loading inventory:', error);
      if (error.response?.status !== 400 || error.response?.data?.errorCode !== 2) {
        messageApi.error('Error al cargar el inventario');
      }
      setInventoryItems([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

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
      console.log('Colors response:', response);
      console.log('Is array?:', Array.isArray(response));

      // Check if response is an object with a data property
      if (response && typeof response === 'object' && 'data' in response) {
        const colorsData = (response as any).data;
        console.log('Colors data:', colorsData);
        setColors(Array.isArray(colorsData) ? colorsData : []);
      } else {
        setColors(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error loading colors:', error);
      setColors([]);
    }
  };

  const handleDelete = async (id: number) => {
    if (!id) {
      messageApi.error('ID de item inválido');
      return;
    }

    try {
      await inventoryService.deleteInventoryItem(id);
      messageApi.success('Item eliminado exitosamente');
      fetchInventoryItems();
    } catch (error: any) {
      console.error('Error deleting inventory item:', error);
      const errorMessage = error?.response?.data?.errors
        ? Object.values(error.response.data.errors).join(', ')
        : 'Error al eliminar el item';
      messageApi.error(errorMessage);
    }
  };

  // Modal handlers
  const openLocationModal = (item: InventoryItem) => {
    setSelectedItem(item);
    locationForm.setFieldsValue({
      newLocation: item.location || '',
      reason: '',
    });
    setLocationModalOpen(true);
  };

  const openStatusModal = (item: InventoryItem) => {
    setSelectedItem(item);
    const statusName = (item as any).statusName;
    const statusKey = statusName ? statusName as InventoryStatus : getStatusKey(item.status);
    statusForm.setFieldsValue({
      newStatus: statusKey,
      reason: '',
    });
    setStatusModalOpen(true);
  };

  const openMileageModal = (item: InventoryItem) => {
    setSelectedItem(item);
    mileageForm.setFieldsValue({
      newMileage: item.mileage || 0,
      notes: '',
    });
    setMileageModalOpen(true);
  };

  const handleChangeLocation = async (values: any) => {
    if (!selectedItem) return;

    const requestData = {
      inventoryItemId: selectedItem.inventoryItemId || (selectedItem as any).id || (selectedItem as any).inventoryId || 0,
      newLocation: values.newLocation,
      reason: values.reason,
      performedBy: user?.email || user?.name || 'Usuario',
    };

    console.log('Change location - Selected Item:', selectedItem);
    console.log('Change location - Request data:', requestData);

    try {
      await inventoryService.changeLocation(requestData);
      messageApi.success('Ubicación actualizada exitosamente');
      setLocationModalOpen(false);
      locationForm.resetFields();
      fetchInventoryItems();
    } catch (error: any) {
      console.error('Error changing location:', error);
      console.error('Error response:', error.response?.data);
      messageApi.error(
        error.response?.data?.errors?.['Item de inventario no encontrado'] ||
        'Error al cambiar la ubicación'
      );
    }
  };

  const handleChangeStatus = async (values: any) => {
    if (!selectedItem) return;

    const requestData = {
      inventoryItemId: selectedItem.inventoryItemId || (selectedItem as any).id || (selectedItem as any).inventoryId || 0,
      newStatus: values.newStatus,
      reason: values.reason,
      performedBy: user?.email || user?.name || 'Usuario',
    };

    console.log('Change status - Selected Item:', selectedItem);
    console.log('Change status - Request data:', requestData);

    try {
      await inventoryService.changeStatus(requestData);
      messageApi.success('Estado actualizado exitosamente');
      setStatusModalOpen(false);
      statusForm.resetFields();
      fetchInventoryItems();
    } catch (error: any) {
      console.error('Error changing status:', error);
      console.error('Error response:', error.response?.data);
      messageApi.error(
        error.response?.data?.errors?.['Item de inventario no encontrado'] ||
        'Error al cambiar el estado'
      );
    }
  };

  const handleUpdateMileage = async (values: any) => {
    if (!selectedItem) return;

    const requestData = {
      inventoryItemId: selectedItem.inventoryItemId || (selectedItem as any).id || (selectedItem as any).inventoryId || 0,
      newMileage: values.newMileage,
      notes: values.notes,
      performedBy: user?.email || user?.name || 'Usuario',
    };

    console.log('Update mileage - Selected Item:', selectedItem);
    console.log('Update mileage - Request data:', requestData);

    try {
      await inventoryService.updateMileage(requestData);
      messageApi.success('Kilometraje actualizado exitosamente');
      setMileageModalOpen(false);
      mileageForm.resetFields();
      fetchInventoryItems();
    } catch (error: any) {
      console.error('Error updating mileage:', error);
      console.error('Error response:', error.response?.data);
      messageApi.error(
        error.response?.data?.errors?.['Item de inventario no encontrado'] ||
        'Error al actualizar el kilometraje'
      );
    }
  };

  const handleApplyFilters = (values: any) => {
    const newFilters: InventoryFilters = {
      VIN: values.vin || undefined,
      SerialNumber: values.serialNumber || undefined,
      VehicleVersionId: values.vehicleVersionId || undefined,
      VehicleColorId: values.vehicleColorId || undefined,
      Location: values.location || undefined,
      Status: values.status || undefined,
      ModelYear: values.modelYear || undefined,
      MinMileage: values.minMileage || undefined,
      MaxMileage: values.maxMileage || undefined,
      SupplierName: values.supplierName || undefined,
      EntryDateFrom: values.entryDateRange?.[0]?.toISOString() || undefined,
      EntryDateTo: values.entryDateRange?.[1]?.toISOString() || undefined,
      HasExited: values.hasExited,
    };

    setFilters(newFilters);
    setCurrentPage(1);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    form.resetFields();
    setFilters({});
    setCurrentPage(1);
  };

  const columns: ColumnsType<InventoryItem> = [
    {
      title: 'VIN',
      dataIndex: 'vin',
      key: 'vin',
      width: window.innerWidth < 768 ? 120 : 180,
      responsive: ['sm'] as any,
      render: (vin: string) => (
        <Text strong style={{ fontFamily: 'monospace', fontSize: window.innerWidth < 768 ? '11px' : '14px' }}>
          {vin || 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Versión del Vehículo',
      dataIndex: 'vehicleVersion',
      key: 'vehicleVersion',
      render: (_: any, record: InventoryItem) => (
        <div>
          <Text>{record.vehicleVersion?.versionName || 'Sin versión'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.modelYear}
          </Text>
        </div>
      ),
    },
    {
      title: 'Color',
      dataIndex: 'vehicleColor',
      key: 'vehicleColor',
      width: 120,
      responsive: ['md'] as any,
      render: (vehicleColor: VehicleColor) => (
        <Space>
          {vehicleColor?.hexCode && (
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: vehicleColor.hexCode,
                border: '1px solid #d9d9d9',
              }}
            />
          )}
          <Text>{vehicleColor?.colorName || 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: any, record: InventoryItem) => {
        const statusName = (record as any).statusName;
        const statusKey = statusName ? statusName as InventoryStatus : getStatusKey(status);
        const displayLabel = STATUS_LABELS[statusKey];
        return (
          <Tag color={STATUS_COLORS[statusKey]}>
            {displayLabel}
          </Tag>
        );
      },
    },
    {
      title: 'Ubicación',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      responsive: ['lg'] as any,
      render: (location: string) => (
        <Space>
          <EnvironmentOutlined />
          <Text>{location || 'Sin ubicación'}</Text>
        </Space>
      ),
    },
    {
      title: 'Kilometraje',
      dataIndex: 'mileage',
      key: 'mileage',
      width: 120,
      responsive: ['md'] as any,
      render: (mileage: number) => (
        <Text>{mileage ? `${mileage.toLocaleString()} km` : 'N/A'}</Text>
      ),
    },
    {
      title: 'Fecha de Entrada',
      dataIndex: 'entryDate',
      key: 'entryDate',
      width: 130,
      responsive: ['lg'] as any,
      render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      fixed: window.innerWidth > 768 ? 'right' : false,
      render: (_: any, record: InventoryItem) => {
        const getMenuItems = (record: InventoryItem): MenuProps['items'] => [
          {
            key: 'location',
            icon: <EnvironmentOutlined />,
            label: 'Cambiar ubicación',
            onClick: () => openLocationModal(record),
          },
          {
            key: 'status',
            icon: <SwapOutlined />,
            label: 'Cambiar estado',
            onClick: () => openStatusModal(record),
          },
          {
            key: 'mileage',
            icon: <DashboardOutlined />,
            label: 'Actualizar kilometraje',
            onClick: () => openMileageModal(record),
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Eliminar',
            danger: true,
            onClick: () => {
              modal.confirm({
                title: '¿Estás seguro de eliminar este item?',
                content: 'Esta acción no se puede deshacer.',
                okText: 'Sí, eliminar',
                cancelText: 'Cancelar',
                okButtonProps: { danger: true },
                onOk: () => handleDelete(record.inventoryItemId || (record as any).id),
              });
            },
          },
        ];

        const handleViewDetails = () => {
          const id = record.inventoryItemId || (record as any).id || (record as any).inventoryId;
          console.log('Navigating to inventory detail, record:', record);
          console.log('ID to use:', id);
          if (id) {
            navigate(`/inventory/${id}`);
          } else {
            messageApi.error('No se pudo obtener el ID del item');
          }
        };

        return (
          <Space size="small">
            <Tooltip title="Ver detalles">
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={handleViewDetails}
              />
            </Tooltip>
            <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']} placement="bottomRight">
              <Button type="primary" icon={<MoreOutlined />} size="small">
                {window.innerWidth > 768 ? 'Más' : ''}
              </Button>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '0 16px' }}>
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div>
          <Title
            level={2}
            style={{
              marginBottom: '8px',
              color: '#1a1a1a',
              fontWeight: 600,
              fontSize: 'clamp(20px, 5vw, 28px)'
            }}
          >
            Inventario de Vehículos
          </Title>
          <Text style={{ fontSize: 'clamp(13px, 3vw, 15px)', color: '#595959' }}>
            Gestión de {totalRecords} vehículos en inventario
          </Text>
        </div>
        <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowFilters(true)}
            style={{ width: 'auto' }}
          >
            Filtros
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/inventory/add')}
            style={{ width: 'auto' }}
          >
            Agregar
          </Button>
        </Space>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={inventoryItems}
          rowKey={(record) => record.inventoryItemId || (record as any).id || String(Math.random())}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: window.innerWidth < 768 ? 5 : pageSize,
            total: totalRecords,
            showSizeChanger: window.innerWidth > 768,
            showTotal: (total) => window.innerWidth > 768 ? `Total ${total} items` : `${total}`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            responsive: true,
            simple: window.innerWidth < 768,
          }}
          scroll={{ x: window.innerWidth < 768 ? 800 : 'max-content' }}
          size={window.innerWidth < 768 ? "small" : "middle"}
        />
      </Card>

      {/* Drawer de filtros */}
      <Drawer
        title="Filtros de Búsqueda"
        open={showFilters}
        onClose={() => setShowFilters(false)}
        width={window.innerWidth < 768 ? '100%' : 400}
        extra={
          <Space>
            <Button onClick={handleClearFilters}>Limpiar</Button>
            <Button type="primary" onClick={() => form.submit()}>
              Aplicar
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleApplyFilters}>
          <Form.Item label="VIN" name="vin">
            <Input placeholder="Buscar por VIN" prefix={<SearchOutlined />} />
          </Form.Item>

          <Form.Item label="Número de Serie" name="serialNumber">
            <Input placeholder="Buscar por número de serie" />
          </Form.Item>

          <Form.Item label="Versión del Vehículo" name="vehicleVersionId">
            <Select
              placeholder="Seleccionar versión"
              allowClear
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

          <Form.Item label="Color" name="vehicleColorId">
            <Select
              placeholder="Seleccionar color"
              allowClear
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
                    <span>{c.colorName}</span>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Estado" name="status">
            <Select placeholder="Seleccionar estado" allowClear>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <Select.Option key={key} value={key}>
                  <Tag color={STATUS_COLORS[key as InventoryStatus]}>{label}</Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Ubicación" name="location">
            <Input placeholder="Buscar por ubicación" prefix={<EnvironmentOutlined />} />
          </Form.Item>

          <Form.Item label="Año del Modelo" name="modelYear">
            <InputNumber
              placeholder="Año"
              min={2000}
              max={2030}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Rango de Kilometraje">
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="minMileage" noStyle>
                <InputNumber placeholder="Mín" min={0} style={{ width: '50%' }} />
              </Form.Item>
              <Form.Item name="maxMileage" noStyle>
                <InputNumber placeholder="Máx" min={0} style={{ width: '50%' }} />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item label="Proveedor" name="supplierName">
            <Input placeholder="Buscar por proveedor" />
          </Form.Item>

          <Form.Item label="Rango de Fecha de Entrada" name="entryDateRange">
            <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Estado de Salida" name="hasExited">
            <Select placeholder="Seleccionar" allowClear>
              <Select.Option value={true}>Con fecha de salida</Select.Option>
              <Select.Option value={false}>Sin fecha de salida</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Modal para cambiar ubicación */}
      <Modal
        title="Cambiar Ubicación"
        open={locationModalOpen}
        onCancel={() => {
          setLocationModalOpen(false);
          locationForm.resetFields();
        }}
        onOk={() => locationForm.submit()}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={locationForm} layout="vertical" onFinish={handleChangeLocation}>
          <Form.Item
            label="Ubicación Actual"
          >
            <Input value={selectedItem?.location || 'Sin ubicación'} disabled />
          </Form.Item>

          <Form.Item
            label="Nueva Ubicación"
            name="newLocation"
            rules={[{ required: true, message: 'Por favor ingresa la nueva ubicación' }]}
          >
            <Input placeholder="Ej: Almacén A - Pasillo 3" prefix={<EnvironmentOutlined />} />
          </Form.Item>

          <Form.Item
            label="Razón del Cambio"
            name="reason"
            rules={[{ required: true, message: 'Por favor ingresa la razón del cambio' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Describe por qué se cambia la ubicación"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para cambiar estado */}
      <Modal
        title="Cambiar Estado"
        open={statusModalOpen}
        onCancel={() => {
          setStatusModalOpen(false);
          statusForm.resetFields();
        }}
        onOk={() => statusForm.submit()}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={statusForm} layout="vertical" onFinish={handleChangeStatus}>
          <Form.Item
            label="Estado Actual"
          >
            {selectedItem && (() => {
              const statusName = (selectedItem as any).statusName;
              const statusKey = statusName ? statusName as InventoryStatus : getStatusKey(selectedItem.status);
              return (
                <Tag color={STATUS_COLORS[statusKey]}>
                  {STATUS_LABELS[statusKey]}
                </Tag>
              );
            })()}
          </Form.Item>

          <Form.Item
            label="Nuevo Estado"
            name="newStatus"
            rules={[{ required: true, message: 'Por favor selecciona el nuevo estado' }]}
            initialValue={selectedItem ? ((selectedItem as any).statusName || getStatusKey(selectedItem.status)) : undefined}
          >
            <Select placeholder="Seleccionar nuevo estado">
              {(Object.keys(STATUS_LABELS) as InventoryStatus[]).map((statusKey) => (
                <Select.Option key={statusKey} value={statusKey}>
                  <Tag color={STATUS_COLORS[statusKey]}>{STATUS_LABELS[statusKey]}</Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Razón del Cambio"
            name="reason"
            rules={[{ required: true, message: 'Por favor ingresa la razón del cambio' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Describe por qué se cambia el estado"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para actualizar kilometraje */}
      <Modal
        title="Actualizar Kilometraje"
        open={mileageModalOpen}
        onCancel={() => {
          setMileageModalOpen(false);
          mileageForm.resetFields();
        }}
        onOk={() => mileageForm.submit()}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={mileageForm} layout="vertical" onFinish={handleUpdateMileage}>
          <Form.Item
            label="Kilometraje Actual"
          >
            <Input
              value={selectedItem?.mileage ? `${selectedItem.mileage.toLocaleString()} km` : 'N/A'}
              disabled
            />
          </Form.Item>

          <Form.Item
            label="Nuevo Kilometraje"
            name="newMileage"
            rules={[
              { required: true, message: 'Por favor ingresa el nuevo kilometraje' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Ingresa el kilometraje"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item
            label="Notas"
            name="notes"
          >
            <Input.TextArea
              rows={3}
              placeholder="Notas adicionales (opcional)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
