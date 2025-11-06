import { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Space,
  Button,
  Typography,
  Spin,
  Alert,
  Timeline,
  App,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Dropdown,
  Drawer,
  DatePicker,
  Image,
  Upload,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import type { MenuProps } from 'antd';
import {
  ArrowLeftOutlined,
  HistoryOutlined,
  EnvironmentOutlined,
  CarOutlined,
  CalendarOutlined,
  DashboardOutlined,
  SwapOutlined,
  MoreOutlined,
  EditOutlined,
  PictureOutlined,
  UploadOutlined,
  DeleteOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import inventoryService from '../../services/inventoryService';
import type {
  InventoryItem,
} from '../../types';
import { InventoryStatus } from '../../types';

const { Title, Text } = Typography;

const STATUS_COLORS: Record<InventoryStatus, string> = {
  [InventoryStatus.Available]: 'green',
  [InventoryStatus.Reserved]: 'gold',
  [InventoryStatus.InTransit]: 'blue',
  [InventoryStatus.InMaintenance]: 'orange',
  [InventoryStatus.Sold]: 'red',
  [InventoryStatus.Damaged]: 'volcano',
  [InventoryStatus.OnHold]: 'default',
  [InventoryStatus.Delivered]: 'purple',
};

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

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  Entry: 'Entrada',
  Exit: 'Salida',
  Transfer: 'Transferencia',
  StatusChange: 'Cambio de Estado',
  MaintenanceIn: 'Entrada a Mantenimiento',
  MaintenanceOut: 'Salida de Mantenimiento',
  Adjustment: 'Ajuste',
};

const InventoryDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { message: messageApi, modal } = App.useApp();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [images, setImages] = useState<any[]>([]);

  // Modals & Drawer
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [mileageModalOpen, setMileageModalOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);

  // Upload
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageType, setImageType] = useState<number | undefined>(undefined);

  // Forms
  const [locationForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [mileageForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [movementForm] = Form.useForm();

  useEffect(() => {
    if (id) {
      fetchInventoryItem();
    }
  }, [id]);

  const fetchInventoryItem = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await inventoryService.getInventoryItemById(Number(id));
      console.log('Inventory item response:', response);
      setItem(response);
      // Las imágenes vienen en el response
      const itemImages = (response as any).images || [];
      console.log('Images data:', itemImages);
      setImages(itemImages);
    } catch (error) {
      console.error('Error loading inventory item:', error);
      messageApi.error('Error al cargar el item de inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLocation = async (values: any) => {
    if (!item) return;

    try {
      const requestData = {
        inventoryItemId: item.inventoryItemId || (item as any).id,
        newLocation: values.newLocation,
        reason: values.reason,
        performedBy: user?.email || user?.name || 'Usuario',
      };
      await inventoryService.changeLocation(requestData);
      messageApi.success('Ubicación actualizada exitosamente');
      setLocationModalOpen(false);
      locationForm.resetFields();
      fetchInventoryItem();
    } catch (error: any) {
      console.error('Error changing location:', error);
      messageApi.error(error?.response?.data?.errors || 'Error al cambiar la ubicación');
    }
  };

  const handleChangeStatus = async (values: any) => {
    if (!item) return;

    try {
      const requestData = {
        inventoryItemId: item.inventoryItemId || (item as any).id,
        newStatus: values.newStatus,
        reason: values.reason,
        performedBy: user?.email || user?.name || 'Usuario',
      };
      await inventoryService.changeStatus(requestData);
      messageApi.success('Estado actualizado exitosamente');
      setStatusModalOpen(false);
      statusForm.resetFields();
      fetchInventoryItem();
    } catch (error: any) {
      console.error('Error changing status:', error);
      messageApi.error(error?.response?.data?.errors || 'Error al cambiar el estado');
    }
  };

  const handleUpdateMileage = async (values: any) => {
    if (!item) return;

    try {
      const requestData = {
        inventoryItemId: item.inventoryItemId || (item as any).id,
        newMileage: values.newMileage,
        notes: values.notes || '',
        performedBy: user?.email || user?.name || 'Usuario',
      };
      await inventoryService.updateMileage(requestData);
      messageApi.success('Kilometraje actualizado exitosamente');
      setMileageModalOpen(false);
      mileageForm.resetFields();
      fetchInventoryItem();
    } catch (error: any) {
      console.error('Error updating mileage:', error);
      messageApi.error(error?.response?.data?.errors || 'Error al actualizar el kilometraje');
    }
  };

  const openLocationModal = () => {
    if (!item) return;
    locationForm.setFieldsValue({
      currentLocation: item.location,
      newLocation: '',
      reason: '',
    });
    setLocationModalOpen(true);
  };

  const openStatusModal = () => {
    if (!item) return;
    const statusName = (item as any).statusName;
    const statusKey = statusName ? statusName as InventoryStatus : getStatusKey(item.status);
    statusForm.setFieldsValue({
      newStatus: statusKey,
      reason: '',
    });
    setStatusModalOpen(true);
  };

  const openMileageModal = () => {
    if (!item) return;
    mileageForm.setFieldsValue({
      currentMileage: item.mileage || 0,
      newMileage: item.mileage || 0,
      notes: '',
    });
    setMileageModalOpen(true);
  };

  const openEditDrawer = () => {
    if (!item) return;
    const statusName = (item as any).statusName;
    const statusKey = statusName ? statusName as InventoryStatus : getStatusKey(item.status);

    editForm.setFieldsValue({
      vin: item.vin,
      serialNumber: item.serialNumber,
      vehicleVersionId: item.vehicleVersionId,
      vehicleColorId: item.vehicleColorId,
      location: item.location,
      status: statusKey,
      mileage: item.mileage,
      modelYear: item.modelYear,
      entryDate: item.entryDate ? dayjs(item.entryDate) : null,
      entryNotes: item.entryNotes,
      purchasePrice: item.purchasePrice,
      purchaseCurrency: item.purchaseCurrency,
      supplierName: item.supplierName,
      exitDate: item.exitDate ? dayjs(item.exitDate) : null,
      exitNotes: item.exitNotes,
    });
    setEditDrawerOpen(true);
  };

  const handleUpdateInventoryItem = async (values: any) => {
    if (!item) return;

    try {
      const requestData = {
        inventoryItemId: item.inventoryItemId || (item as any).id,
        vin: values.vin,
        serialNumber: values.serialNumber,
        vehicleVersionId: values.vehicleVersionId,
        vehicleColorId: values.vehicleColorId,
        location: values.location,
        status: values.status,
        mileage: values.mileage,
        modelYear: values.modelYear,
        entryDate: values.entryDate ? values.entryDate.toISOString() : null,
        entryNotes: values.entryNotes,
        purchasePrice: values.purchasePrice,
        purchaseCurrency: values.purchaseCurrency,
        supplierName: values.supplierName,
        exitDate: values.exitDate ? values.exitDate.toISOString() : null,
        exitNotes: values.exitNotes,
      };

      await inventoryService.updateInventoryItem(requestData);
      messageApi.success('Item de inventario actualizado exitosamente');
      setEditDrawerOpen(false);
      editForm.resetFields();
      fetchInventoryItem();
    } catch (error: any) {
      console.error('Error updating inventory item:', error);
      messageApi.error(error?.response?.data?.errors || 'Error al actualizar el item de inventario');
    }
  };

  const handleUploadImages = async () => {
    if (fileList.length === 0) {
      messageApi.warning('Por favor selecciona al menos una imagen');
      return;
    }

    if (!imageType) {
      messageApi.warning('Por favor selecciona un tipo de imagen');
      return;
    }

    if (!item) return;

    try {
      setUploading(true);
      const inventoryItemId = item.inventoryItemId || (item as any).id;

      await inventoryService.addImages(inventoryItemId, fileList, imageType.toString());

      messageApi.success('Imágenes subidas exitosamente');
      setUploadModalOpen(false);
      setFileList([]);
      setImageType(undefined);
      // Recargar el item completo para obtener las nuevas imágenes
      fetchInventoryItem();
    } catch (error: any) {
      console.error('Error uploading images:', error);
      const errorMessage = error?.response?.data?.errors
        ? Object.values(error.response.data.errors).join(', ')
        : 'Error al subir las imágenes';
      messageApi.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await inventoryService.deleteImage(imageId);
      messageApi.success('Imagen eliminada exitosamente');
      // Recargar el item completo para obtener las imágenes actualizadas
      fetchInventoryItem();
    } catch (error: any) {
      console.error('Error deleting image:', error);
      messageApi.error(error?.response?.data?.errors || 'Error al eliminar la imagen');
    }
  };

  const openMovementModal = () => {
    if (!item) return;
    movementForm.setFieldsValue({
      movementType: undefined,
      movementDate: dayjs(),
      fromLocation: item.location,
      toLocation: '',
      reason: '',
      notes: '',
      documentReference: '',
      performedBy: user?.email || user?.name || '',
      previousMileage: item.mileage || 0,
      newMileage: item.mileage || 0,
    });
    setMovementModalOpen(true);
  };

  const handleCreateMovement = async (values: any) => {
    if (!item) return;

    try {
      const requestData = {
        inventoryItemId: item.inventoryItemId || (item as any).id,
        movementType: values.movementType,
        movementDate: values.movementDate.toISOString(),
        fromLocation: values.fromLocation || '',
        toLocation: values.toLocation || '',
        reason: values.reason || '',
        notes: values.notes || '',
        documentReference: values.documentReference || '',
        performedBy: values.performedBy,
        previousMileage: values.previousMileage || 0,
        newMileage: values.newMileage || 0,
      };
      await inventoryService.createMovement(requestData);
      messageApi.success('Movimiento creado exitosamente');
      setMovementModalOpen(false);
      movementForm.resetFields();
      fetchInventoryItem();
    } catch (error: any) {
      console.error('Error creating movement:', error);
      const errorMessage = error?.response?.data?.errors
        ? Object.values(error.response.data.errors).join(', ')
        : 'Error al crear el movimiento';
      messageApi.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Cargando...">
          <div style={{ minHeight: '100px' }} />
        </Spin>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
        <Alert
          message="Item no encontrado"
          description="El item de inventario que buscas no existe."
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/inventory')}>
              Volver al Inventario
            </Button>
          }
        />
      </div>
    );
  }

  const statusName = (item as any).statusName;
  const statusKey = statusName ? statusName as InventoryStatus : getStatusKey(item.status);
  const movements = (item as any).movementLogs || [];

  const getMenuItems = (): MenuProps['items'] => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Editar item',
      onClick: openEditDrawer,
    },
    {
      type: 'divider',
    },
    {
      key: 'location',
      icon: <EnvironmentOutlined />,
      label: 'Cambiar ubicación',
      onClick: openLocationModal,
    },
    {
      key: 'status',
      icon: <SwapOutlined />,
      label: 'Cambiar estado',
      onClick: openStatusModal,
    },
    {
      key: 'mileage',
      icon: <DashboardOutlined />,
      label: 'Actualizar kilometraje',
      onClick: openMileageModal,
    },
    {
      type: 'divider',
    },
    {
      key: 'movement',
      icon: <FileAddOutlined />,
      label: 'Crear movimiento',
      onClick: openMovementModal,
    },
  ];

  return (
    <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
      {/* Header */}
      <div style={{
        marginBottom: 'clamp(16px, 3vw, 24px)',
        display: 'flex',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        gap: '12px',
        alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/inventory')}
            style={{ marginBottom: 12 }}
            size={window.innerWidth < 768 ? 'small' : 'middle'}
          >
            Volver
          </Button>
          <Title
            level={2}
            style={{
              margin: 0,
              fontSize: 'clamp(18px, 4vw, 28px)'
            }}
          >
            Detalle de Inventario
          </Title>
        </div>
        <Dropdown menu={{ items: getMenuItems() }} trigger={['click']} placement="bottomRight">
          <Button type="primary" icon={<MoreOutlined />}>
            Acciones
          </Button>
        </Dropdown>
      </div>

      <Row gutter={[16, 16]}>
        {/* Información Principal */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <CarOutlined />
                <span style={{ fontSize: window.innerWidth < 768 ? '14px' : '16px' }}>
                  Información del Vehículo
                </span>
              </Space>
            }
          >
            <Descriptions
              bordered
              column={{ xs: 1, sm: 2 }}
              size={window.innerWidth < 768 ? 'small' : 'middle'}
            >
              <Descriptions.Item label="VIN">
                <Text strong style={{ fontFamily: 'monospace', fontSize: window.innerWidth < 768 ? '12px' : '14px' }}>
                  {item.vin || 'N/A'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Número de Serie">
                {item.serialNumber || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Versión">
                {item.vehicleVersion?.versionName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Año del Modelo">
                {item.modelYear}
              </Descriptions.Item>
              <Descriptions.Item label="Color" span={2}>
                <Space>
                  {(item.vehicleColor?.colorCode || (item.vehicleColor as any)?.hexCode) && (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: item.vehicleColor?.colorCode || (item.vehicleColor as any)?.hexCode,
                        border: '2px solid #d9d9d9',
                      }}
                    />
                  )}
                  <div>
                    <Text>{item.vehicleColor?.colorName || 'N/A'}</Text>
                    {item.vehicleColor?.colorCode && (
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                        {item.vehicleColor.colorCode}
                      </Text>
                    )}
                  </div>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={STATUS_COLORS[statusKey]}>
                  {STATUS_LABELS[statusKey]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ubicación">
                <Space>
                  <EnvironmentOutlined />
                  {item.location || 'Sin ubicación'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Kilometraje">
                <Space>
                  <DashboardOutlined />
                  {item.mileage ? `${item.mileage.toLocaleString()} km` : 'N/A'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Proveedor">
                {item.supplierName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Precio de Compra" span={2}>
                {item.purchasePrice
                  ? `${getCurrencyLabel(item.purchaseCurrency)} $${item.purchasePrice.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Entrada">
                <Space>
                  <CalendarOutlined />
                  {item.entryDate
                    ? dayjs(item.entryDate).format('DD/MM/YYYY HH:mm')
                    : 'N/A'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Salida">
                {item.exitDate
                  ? dayjs(item.exitDate).format('DD/MM/YYYY HH:mm')
                  : 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            {/* Notas adicionales */}
            {(item.entryNotes || item.exitNotes) && (
              <Card
                size="small"
                title="Notas"
                style={{ marginTop: 16 }}
              >
                {item.entryNotes && (
                  <div style={{ marginBottom: item.exitNotes ? 12 : 0 }}>
                    <Text strong>Notas de Entrada:</Text>
                    <br />
                    <Text>{item.entryNotes}</Text>
                  </div>
                )}
                {item.exitNotes && (
                  <div>
                    <Text strong>Notas de Salida:</Text>
                    <br />
                    <Text>{item.exitNotes}</Text>
                  </div>
                )}
              </Card>
            )}
          </Card>

          {/* Sección de Imágenes */}
          <Card
            title={
              <Space>
                <PictureOutlined />
                <span style={{ fontSize: window.innerWidth < 768 ? '14px' : '16px' }}>
                  Imágenes ({images.length})
                </span>
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => setUploadModalOpen(true)}
                size={window.innerWidth < 768 ? 'small' : 'middle'}
              >
                {window.innerWidth < 768 ? 'Subir' : 'Subir Imágenes'}
              </Button>
            }
            style={{ marginTop: 16 }}
          >
            {images.length > 0 ? (
              <Image.PreviewGroup>
                <Row gutter={[16, 16]}>
                  {images.map((image: any) => {
                    // El API devuelve fileURL (con mayúscula)
                    const imageUrl = image.fileURL || image.fileUrl || '';

                    return (
                      <Col key={image.id} xs={12} sm={8} md={6}>
                        <div style={{ position: 'relative' }}>
                          <Image
                            src={imageUrl}
                            alt={image.imageTypeName || `Imagen ${image.id}`}
                            style={{
                              width: '100%',
                              height: window.innerWidth < 768 ? 100 : 150,
                              objectFit: 'cover',
                              borderRadius: 8,
                            }}
                            fallback="data:image/png;base64,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"
                          />
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                          }}
                          onClick={() => {
                            modal.confirm({
                              title: '¿Eliminar imagen?',
                              content: '¿Estás seguro de que quieres eliminar esta imagen?',
                              okText: 'Sí, eliminar',
                              cancelText: 'Cancelar',
                              okButtonProps: { danger: true },
                              onOk: () => handleDeleteImage(image.id),
                            });
                          }}
                        />
                        {image.imageTypeName && (
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            padding: '4px 8px',
                            fontSize: window.innerWidth < 768 ? '10px' : '12px',
                            borderRadius: '0 0 8px 8px',
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {image.imageTypeName}
                          </div>
                        )}
                      </div>
                    </Col>
                    );
                  })}
                </Row>
              </Image.PreviewGroup>
            ) : (
              <Alert
                message="Sin imágenes"
                description="Este item no tiene imágenes. Haz clic en 'Subir Imágenes' para agregar."
                type="info"
                showIcon
              />
            )}
          </Card>
        </Col>

        {/* Historial de Movimientos */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <HistoryOutlined />
                <span style={{ fontSize: window.innerWidth < 768 ? '14px' : '16px' }}>
                  Historial ({movements.length})
                </span>
              </Space>
            }
            styles={{ body: { maxHeight: window.innerWidth < 768 ? '400px' : '600px', overflowY: 'auto' } }}
          >
            {movements.length > 0 ? (
              <Timeline
                items={movements.map((movement: any) => ({
                  color: getMovementColor(movement.movementTypeName),
                  children: (
                    <div>
                      <Text strong style={{ fontSize: window.innerWidth < 768 ? '12px' : '14px' }}>
                        {MOVEMENT_TYPE_LABELS[movement.movementTypeName] || movement.movementTypeName}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: window.innerWidth < 768 ? '11px' : '12px' }}>
                        {dayjs(movement.movementDate).format('DD/MM/YYYY HH:mm')}
                      </Text>
                      {movement.performedBy && (
                        <>
                          <br />
                          <Text type="secondary" style={{ fontSize: window.innerWidth < 768 ? '11px' : '12px' }}>
                            Por: {movement.performedBy}
                          </Text>
                        </>
                      )}
                      {movement.reason && (
                        <>
                          <br />
                          <Text style={{ fontSize: window.innerWidth < 768 ? '12px' : '13px' }}>
                            {movement.reason}
                          </Text>
                        </>
                      )}
                      {movement.notes && (
                        <>
                          <br />
                          <Text type="secondary" italic style={{ fontSize: window.innerWidth < 768 ? '11px' : '12px' }}>
                            {movement.notes}
                          </Text>
                        </>
                      )}
                      {(movement.fromLocation || movement.toLocation) && (
                        <>
                          <br />
                          <Text style={{ fontSize: window.innerWidth < 768 ? '11px' : '12px' }}>
                            {movement.fromLocation && `De: ${movement.fromLocation}`}
                            {movement.fromLocation && movement.toLocation && ' → '}
                            {movement.toLocation && `A: ${movement.toLocation}`}
                          </Text>
                        </>
                      )}
                      {(movement.previousMileage !== null || movement.newMileage !== null) && (
                        <>
                          <br />
                          <Text style={{ fontSize: window.innerWidth < 768 ? '11px' : '12px' }}>
                            {movement.previousMileage !== null && `De: ${movement.previousMileage.toLocaleString()} km`}
                            {movement.previousMileage !== null && movement.newMileage !== null && ' → '}
                            {movement.newMileage !== null && `A: ${movement.newMileage.toLocaleString()} km`}
                          </Text>
                        </>
                      )}
                    </div>
                  ),
                }))}
              />
            ) : (
              <Alert
                message="Sin movimientos"
                description="Este item no tiene historial de movimientos."
                type="info"
                showIcon
              />
            )}
          </Card>
        </Col>
      </Row>

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
          <Form.Item label="Ubicación Actual">
            <Input value={item?.location || 'Sin ubicación'} disabled />
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
          <Form.Item label="Estado Actual">
            {item && (
              <Tag color={STATUS_COLORS[statusKey]}>
                {STATUS_LABELS[statusKey]}
              </Tag>
            )}
          </Form.Item>

          <Form.Item
            label="Nuevo Estado"
            name="newStatus"
            rules={[{ required: true, message: 'Por favor selecciona el nuevo estado' }]}
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
          <Form.Item label="Kilometraje Actual">
            <Input
              value={item?.mileage ? `${item.mileage.toLocaleString()} km` : 'N/A'}
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
              placeholder="Ingrese el nuevo kilometraje"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter="km"
            />
          </Form.Item>

          <Form.Item label="Notas (Opcional)" name="notes">
            <Input.TextArea
              rows={3}
              placeholder="Agrega notas adicionales sobre el cambio"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para crear movimiento */}
      <Modal
        title="Crear Movimiento"
        open={movementModalOpen}
        onCancel={() => {
          setMovementModalOpen(false);
          movementForm.resetFields();
        }}
        onOk={() => movementForm.submit()}
        okText="Crear"
        cancelText="Cancelar"
        width={window.innerWidth < 768 ? '95%' : 600}
      >
        <Form form={movementForm} layout="vertical" onFinish={handleCreateMovement}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tipo de Movimiento"
                name="movementType"
                rules={[{ required: true, message: 'Selecciona el tipo de movimiento' }]}
              >
                <Select placeholder="Seleccionar tipo">
                  <Select.Option value="Entry">Entrada</Select.Option>
                  <Select.Option value="Exit">Salida</Select.Option>
                  <Select.Option value="Transfer">Transferencia</Select.Option>
                  <Select.Option value="StatusChange">Cambio de Estado</Select.Option>
                  <Select.Option value="MaintenanceIn">Entrada a Mantenimiento</Select.Option>
                  <Select.Option value="MaintenanceOut">Salida de Mantenimiento</Select.Option>
                  <Select.Option value="Adjustment">Ajuste</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Fecha del Movimiento"
                name="movementDate"
                rules={[{ required: true, message: 'Selecciona la fecha' }]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  placeholder="Seleccionar fecha"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Ubicación Origen" name="fromLocation">
                <Input placeholder="Ubicación de origen" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Ubicación Destino" name="toLocation">
                <Input placeholder="Ubicación de destino" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Kilometraje Anterior" name="previousMileage">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Kilometraje anterior"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                  addonAfter="km"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Nuevo Kilometraje" name="newMileage">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Nuevo kilometraje"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                  addonAfter="km"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Realizado Por"
            name="performedBy"
            rules={[{ required: true, message: 'Ingresa quién realizó el movimiento' }]}
          >
            <Input placeholder="Nombre o usuario" />
          </Form.Item>

          <Form.Item label="Razón" name="reason">
            <Input.TextArea rows={2} placeholder="Razón del movimiento" />
          </Form.Item>

          <Form.Item label="Notas" name="notes">
            <Input.TextArea rows={2} placeholder="Notas adicionales" />
          </Form.Item>

          <Form.Item label="Referencia de Documento" name="documentReference">
            <Input placeholder="Número de documento o referencia" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer para editar item */}
      <Drawer
        title="Editar Item de Inventario"
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false);
          editForm.resetFields();
        }}
        width={window.innerWidth < 768 ? '100%' : 720}
        extra={
          <Space>
            <Button onClick={() => {
              setEditDrawerOpen(false);
              editForm.resetFields();
            }}>
              Cancelar
            </Button>
            <Button type="primary" onClick={() => editForm.submit()}>
              Guardar
            </Button>
          </Space>
        }
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateInventoryItem}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="VIN"
                name="vin"
                rules={[{ required: true, message: 'Por favor ingresa el VIN' }]}
              >
                <Input placeholder="VIN del vehículo" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Número de Serie"
                name="serialNumber"
                rules={[{ required: true, message: 'Por favor ingresa el número de serie' }]}
              >
                <Input placeholder="Número de serie" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Ubicación"
                name="location"
              >
                <Input placeholder="Ubicación del vehículo" prefix={<EnvironmentOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Estado"
                name="status"
                rules={[{ required: true, message: 'Por favor selecciona el estado' }]}
              >
                <Select placeholder="Seleccionar estado">
                  {(Object.keys(STATUS_LABELS) as InventoryStatus[]).map((statusKey) => (
                    <Select.Option key={statusKey} value={statusKey}>
                      <Tag color={STATUS_COLORS[statusKey]}>{STATUS_LABELS[statusKey]}</Tag>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Kilometraje"
                name="mileage"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Kilometraje"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="km"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Año del Modelo"
                name="modelYear"
                rules={[{ required: true, message: 'Por favor ingresa el año del modelo' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1900}
                  max={2100}
                  placeholder="Año"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Proveedor"
                name="supplierName"
              >
                <Input placeholder="Nombre del proveedor" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Precio de Compra"
                name="purchasePrice"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Precio"
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Moneda"
                name="purchaseCurrency"
              >
                <Select placeholder="Seleccionar moneda">
                  <Select.Option value={1}>MXN</Select.Option>
                  <Select.Option value={2}>USD</Select.Option>
                  <Select.Option value={3}>CNY</Select.Option>
                  <Select.Option value={4}>JPY</Select.Option>
                  <Select.Option value={5}>EUR</Select.Option>
                  <Select.Option value={6}>CAD</Select.Option>
                  <Select.Option value={7}>RUB</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Fecha de Entrada"
                name="entryDate"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Seleccionar fecha"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Fecha de Salida"
                name="exitDate"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Seleccionar fecha"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Notas de Entrada"
            name="entryNotes"
          >
            <Input.TextArea
              rows={3}
              placeholder="Notas sobre la entrada del vehículo"
            />
          </Form.Item>

          <Form.Item
            label="Notas de Salida"
            name="exitNotes"
          >
            <Input.TextArea
              rows={3}
              placeholder="Notas sobre la salida del vehículo"
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Modal para subir imágenes */}
      <Modal
        title="Subir Imágenes"
        open={uploadModalOpen}
        onCancel={() => {
          setUploadModalOpen(false);
          setFileList([]);
          setImageType(undefined);
        }}
        onOk={handleUploadImages}
        confirmLoading={uploading}
        okText="Subir"
        cancelText="Cancelar"
        width={window.innerWidth < 768 ? '95%' : 600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Tipo de imagen:</Text>
            <Select
              placeholder="Seleccionar tipo de imagen"
              value={imageType || undefined}
              onChange={(value) => setImageType(value)}
              style={{ marginTop: 8, width: '100%' }}
            >
              <Select.Option value={1}>Exterior Frontal</Select.Option>
              <Select.Option value={2}>Exterior Trasero</Select.Option>
              <Select.Option value={3}>Exterior Lateral</Select.Option>
              <Select.Option value={4}>Interior</Select.Option>
              <Select.Option value={5}>Tablero de Instrumentos</Select.Option>
              <Select.Option value={6}>Motor</Select.Option>
              <Select.Option value={7}>Ruedas y Llantas</Select.Option>
              <Select.Option value={8}>Daños</Select.Option>
              <Select.Option value={9}>Documentos</Select.Option>
              <Select.Option value={10}>Otros</Select.Option>
            </Select>
          </div>

          <div>
            <Text strong>Seleccionar imágenes:</Text>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
              accept="image/*"
              multiple
              style={{ marginTop: 8 }}
            >
              {fileList.length < 10 && (
                <div>
                  <PictureOutlined />
                  <div style={{ marginTop: 8 }}>Subir</div>
                </div>
              )}
            </Upload>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Puedes subir hasta 10 imágenes a la vez
            </Text>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

// Helper function para colores del timeline
const getMovementColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    Entry: 'green',
    Exit: 'red',
    Transfer: 'blue',
    StatusChange: 'orange',
    MaintenanceIn: 'gold',
    MaintenanceOut: 'cyan',
    Adjustment: 'purple',
  };
  return colorMap[type] || 'gray';
};

// Helper para obtener etiqueta de moneda
const getCurrencyLabel = (currency: any): string => {
  const currencyMap: Record<number, string> = {
    1: 'MXN',
    2: 'USD',
    3: 'CNY',
    4: 'JPY',
    5: 'EUR',
    6: 'CAD',
    7: 'RUB',
  };

  if (typeof currency === 'number') {
    return currencyMap[currency] || 'MXN';
  }
  return currency || 'MXN';
};

export default InventoryDetailPage;
