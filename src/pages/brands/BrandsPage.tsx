import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  message,
  Typography,
  Button,
  Space,
  Avatar,
  Drawer,
  Form,
  Input,
  Upload,
  Empty,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  CarOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EnvironmentOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";
import brandService from "../../services/brandService";
import vehicleService from "../../services/vehicleService";
import colorService from "../../services/colorService";
import BrandColorsDrawer from "../../components/brands/BrandColorsDrawer";
import type {
  Brand,
  BrandRequest,
  BrandAddress,
  BrandAddressRequest,
} from "../../types";
import type { UploadFile } from "antd/es/upload/interface";

const { Title, Text } = Typography;

interface BrandWithCount extends Brand {
  vehicleCount?: number;
  colorCount?: number;
}

const BrandsPage = () => {
  const [brands, setBrands] = useState<BrandWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  // Address management state
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [addresses, setAddresses] = useState<BrandAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [editingAddress, setEditingAddress] = useState<BrandAddress | null>(
    null
  );
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [addressForm] = Form.useForm();

  // Estados para confirmación de eliminación
  const [deletingBrandId, setDeletingBrandId] = useState<number | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(
    null
  );

  // Color management state
  const [isColorsModalOpen, setIsColorsModalOpen] = useState(false);
  const [colorsBrand, setColorsBrand] = useState<Brand | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await brandService.getBrands({
        pageSize: 50,
        pageNumber: 1,
      });

      // Cargar conteo de vehículos y colores para cada marca
      const brandsWithCount = await Promise.all(
        response.data.map(async (brand) => {
          try {
            // Obtener conteo de vehículos
            const vehicles: any = await vehicleService.getBaseVehiclesByBrand(
              brand.id
            );
            const vehicleCount = Array.isArray(vehicles)
              ? vehicles.length
              : vehicles?.data?.length || 0;

            // Obtener conteo de colores
            const colors: any = await colorService.getColors({ brandId: brand.id });
            let colorCount = 0;

            if (colors && typeof colors === 'object' && 'data' in colors) {
              colorCount = Array.isArray(colors.data) ? colors.data.length : 0;
            } else if (Array.isArray(colors)) {
              colorCount = colors.length;
            }

            return { ...brand, vehicleCount, colorCount };
          } catch {
            return { ...brand, vehicleCount: 0, colorCount: 0 };
          }
        })
      );

      setBrands(brandsWithCount);
    } catch (error) {
      message.error("Error al cargar las marcas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      form.setFieldsValue({
        brandName: brand.brandName,
        adressLine: brand.adressLine,
        brandPhone: brand.brandPhone,
        contactName: brand.contactName,
        contactPhone: brand.contactPhone,
      });
      if (brand.brandLogoUrl || brand.brandLogo) {
        setFileList([
          {
            uid: "-1",
            name: "logo.png",
            status: "done",
            url: brand.brandLogoUrl || brand.brandLogo,
          },
        ]);
      }
    } else {
      setEditingBrand(null);
      form.resetFields();
      setFileList([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    form.resetFields();
    setFileList([]);
  };

  const handleSubmit = async (values: any) => {
    try {
      const brandRequest: BrandRequest = {
        brandName: values.brandName,
        adressLine: values.adressLine,
        brandPhone: values.brandPhone,
        contactName: values.contactName,
        contactPhone: values.contactPhone,
      };

      if (fileList.length > 0 && fileList[0].originFileObj) {
        brandRequest.brandLogo = fileList[0].originFileObj as File;
      }

      if (editingBrand) {
        await brandService.updateBrand(editingBrand.id, brandRequest);
        message.success(`Marca "${values.brandName}" actualizada exitosamente`);
      } else {
        await brandService.addBrand(brandRequest);
        message.success(`Marca "${values.brandName}" creada exitosamente`);
      }

      handleCloseModal();
      fetchBrands();
    } catch (error) {
      message.error(
        editingBrand
          ? "Error al actualizar la marca"
          : "Error al crear la marca"
      );
      console.error(error);
    }
  };

  const handleDelete = async (brandId: number) => {
    try {
      const brandToDelete = brands.find((b) => b.id === brandId);
      await brandService.deleteBrand(brandId);
      message.success(
        `Marca "${brandToDelete?.brandName || ""}" eliminada exitosamente`
      );
      setDeletingBrandId(null);
      fetchBrands();
    } catch (error) {
      message.error("Error al eliminar la marca");
      console.error(error);
      setDeletingBrandId(null);
    }
  };

  // Address management functions
  const handleOpenAddressDrawer = async (brand: Brand) => {
    setSelectedBrand(brand);
    setIsAddressDrawerOpen(true);
    await fetchAddresses(brand.id);
  };

  const handleCloseAddressDrawer = () => {
    setIsAddressDrawerOpen(false);
    setSelectedBrand(null);
    setAddresses([]);
    setIsAddressFormOpen(false);
    setEditingAddress(null);
    addressForm.resetFields();
  };

  const fetchAddresses = async (brandId: number) => {
    try {
      setLoadingAddresses(true);
      const data: any = await brandService.getBrandAddresses(brandId);
      // La API puede devolver { data: [] } o directamente []
      const addressList = Array.isArray(data) ? data : data?.data || [];
      setAddresses(addressList);
    } catch (error) {
      message.error("Error al cargar las direcciones");
      console.error(error);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleOpenAddressForm = (address?: BrandAddress) => {
    if (address) {
      setEditingAddress(address);
      addressForm.setFieldsValue({
        addressName: address.addressName,
        country: address.country,
        estate: address.estate,
        city: address.city,
        postalCode: address.postalCode,
        streetName: address.streetName,
        streetNumber: address.streetNumber,
        contactNumber: address.contactNumber,
        contactEmail: address.contactEmail,
        otherDetails: address.otherDetails,
        comment: address.comment,
      });
    } else {
      setEditingAddress(null);
      addressForm.resetFields();
    }
    setIsAddressFormOpen(true);
  };

  const handleCloseAddressForm = () => {
    setIsAddressFormOpen(false);
    setEditingAddress(null);
    addressForm.resetFields();
  };

  const handleSubmitAddress = async (values: any) => {
    if (!selectedBrand) return;

    try {
      const addressRequest: BrandAddressRequest = {
        brandId: selectedBrand.id,
        addressName: values.addressName,
        country: values.country,
        estate: values.estate,
        city: values.city,
        postalCode: values.postalCode,
        streetName: values.streetName,
        streetNumber: values.streetNumber,
        contactNumber: values.contactNumber,
        contactEmail: values.contactEmail,
        otherDetails: values.otherDetails,
        comment: values.comment,
      };

      if (editingAddress) {
        await brandService.updateBrandAddress(
          editingAddress.id,
          addressRequest
        );
        message.success(
          `Dirección "${values.addressName}" actualizada exitosamente`
        );
      } else {
        await brandService.addBrandAddress(addressRequest);
        message.success(
          `Dirección "${values.addressName}" agregada exitosamente`
        );
      }

      handleCloseAddressForm();
      await fetchAddresses(selectedBrand.id);
    } catch (error) {
      message.error(
        editingAddress
          ? "Error al actualizar la dirección"
          : "Error al agregar la dirección"
      );
      console.error(error);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!selectedBrand) return;

    try {
      const addressToDelete = addresses.find((a) => a.id === addressId);
      await brandService.deleteBrandAddress(addressId);
      message.success(
        `Dirección "${
          addressToDelete?.addressName || ""
        }" eliminada exitosamente`
      );
      setDeletingAddressId(null);
      await fetchAddresses(selectedBrand.id);
    } catch (error) {
      message.error("Error al eliminar la dirección");
      console.error(error);
      setDeletingAddressId(null);
    }
  };

  const handleOpenColorsModal = (brand: Brand) => {
    setColorsBrand(brand);
    setIsColorsModalOpen(true);
  };

  const handleCloseColorsModal = () => {
    setIsColorsModalOpen(false);
    setColorsBrand(null);
  };

  return (
    <div>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Marcas de Vehículos Eléctricos
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
        >
          Agregar Marca
        </Button>
      </Space>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {brands.length === 0 ? (
            <Col span={24}>
              <Card>
                <div style={{ textAlign: "center", padding: "50px" }}>
                  No se encontraron marcas
                </div>
              </Card>
            </Col>
          ) : (
            brands.map((brand) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={brand.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
                    overflow: "hidden",
                  }}
                  cover={
                    <div
                      style={{
                        height: "180px",
                        background: "#fafafa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                      }}
                    >
                      {brand.brandLogoUrl || brand.brandLogo ? (
                        <img
                          alt={brand.brandName}
                          src={brand.brandLogoUrl || brand.brandLogo}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <Avatar
                          size={80}
                          style={{
                            backgroundColor: "#e6f4ff",
                            color: "#1890ff",
                            fontSize: "32px",
                            fontWeight: 600,
                          }}
                        >
                          {brand.brandName?.charAt(0) || "B"}
                        </Avatar>
                      )}
                    </div>
                  }
                >
                  <div style={{ padding: "16px" }}>
                    <Space
                      style={{
                        width: "100%",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                        {brand.brandName}
                      </Title>
                      <Space>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(brand);
                          }}
                        />
                        {deletingBrandId === brand.id ? (
                          <Space size="small">
                            <Text type="secondary" style={{ fontSize: "11px" }}>
                              ¿Eliminar?
                            </Text>
                            <Button
                              size="small"
                              type="primary"
                              danger
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(brand.id);
                              }}
                            >
                              Sí
                            </Button>
                            <Button
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingBrandId(null);
                              }}
                            >
                              No
                            </Button>
                          </Space>
                        ) : (
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingBrandId(brand.id);
                            }}
                          />
                        )}
                      </Space>
                    </Space>

                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      {brand.contactName && (
                        <Text style={{ fontSize: "13px", color: "#595959" }}>
                          <strong>Contacto:</strong> {brand.contactName}
                        </Text>
                      )}
                      {brand.brandPhone && (
                        <Text style={{ fontSize: "13px", color: "#595959" }}>
                          <strong>Teléfono:</strong> {brand.brandPhone}
                        </Text>
                      )}
                      {brand.adressLine && (
                        <Text style={{ fontSize: "13px", color: "#595959" }}>
                          <strong>Dirección:</strong> {brand.adressLine}
                        </Text>
                      )}
                      {brand.vehicleCount !== undefined && (
                        <Text
                          style={{
                            fontSize: "13px",
                            color: "#52c41a",
                            fontWeight: 500,
                          }}
                        >
                          <CarOutlined /> {brand.vehicleCount}{" "}
                          {brand.vehicleCount === 1 ? "vehículo" : "vehículos"}
                        </Text>
                      )}
                      {brand.colorCount !== undefined && (
                        <Text
                          style={{
                            fontSize: "13px",
                            color: "#1890ff",
                            fontWeight: 500,
                          }}
                        >
                          <BgColorsOutlined /> {brand.colorCount}{" "}
                          {brand.colorCount === 1 ? "color" : "colores"}
                        </Text>
                      )}
                    </Space>

                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%", marginTop: "16px" }}
                    >
                      <Button
                        block
                        icon={<EnvironmentOutlined />}
                        onClick={() => handleOpenAddressDrawer(brand)}
                        style={{ borderRadius: "6px" }}
                      >
                        Gestionar Direcciones
                      </Button>
                      <Button
                        block
                        icon={<BgColorsOutlined />}
                        onClick={() => handleOpenColorsModal(brand)}
                        style={{ borderRadius: "6px" }}
                      >
                        Gestionar Colores
                      </Button>
                    </Space>
                  </div>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}

      {/* Drawer para editar marca */}
      <Drawer
        title={editingBrand ? "Editar Marca" : "Agregar Marca"}
        open={isModalOpen}
        onClose={handleCloseModal}
        width={500}
        extra={
          <Space>
            <Button onClick={handleCloseModal}>Cancelar</Button>
            <Button type="primary" onClick={() => form.submit()}>
              {editingBrand ? "Actualizar" : "Crear"}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Nombre de la Marca"
            name="brandName"
            rules={[
              {
                required: true,
                message: "Por favor ingresa el nombre de la marca",
              },
            ]}
          >
            <Input placeholder="Ej: Tesla" />
          </Form.Item>

          <Form.Item label="Dirección" name="adressLine">
            <Input placeholder="Ej: Av. Principal 123" />
          </Form.Item>

          <Form.Item label="Teléfono de la Marca" name="brandPhone">
            <Input
              type="tel"
              placeholder="Ej: 12345678900"
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>

          <Form.Item label="Nombre del Contacto" name="contactName">
            <Input placeholder="Ej: Juan Pérez" />
          </Form.Item>

          <Form.Item label="Teléfono del Contacto" name="contactPhone">
            <Input
              type="tel"
              placeholder="Ej: 12345678901"
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>

          <Form.Item label="Logo de la Marca" name="brandLogo">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
            >
              {fileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Subir Logo</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Drawer para gestionar direcciones */}
      <Drawer
        title={`Direcciones de ${selectedBrand?.brandName || ""}`}
        open={isAddressDrawerOpen}
        onClose={handleCloseAddressDrawer}
        width={600}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenAddressForm()}
            block
          >
            Agregar Nueva Dirección
          </Button>

          {loadingAddresses ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin />
            </div>
          ) : addresses.length === 0 ? (
            <Empty description="No hay direcciones registradas" />
          ) : (
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {addresses.map((address) => (
                <Card
                  key={address.id}
                  size="small"
                  style={{ borderRadius: "8px" }}
                  title={
                    <Space>
                      <EnvironmentOutlined style={{ color: "#1890ff" }} />
                      <Text strong>{address.addressName}</Text>
                    </Space>
                  }
                  extra={
                    <Space>
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenAddressForm(address)}
                      />
                      {deletingAddressId === address.id ? (
                        <Space size="small">
                          <Text type="secondary" style={{ fontSize: "11px" }}>
                            ¿Eliminar?
                          </Text>
                          <Button
                            size="small"
                            type="primary"
                            danger
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            Sí
                          </Button>
                          <Button
                            size="small"
                            onClick={() => setDeletingAddressId(null)}
                          >
                            No
                          </Button>
                        </Space>
                      ) : (
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => setDeletingAddressId(address.id)}
                        />
                      )}
                    </Space>
                  }
                >
                  <Descriptions column={1} size="small">
                    {address.streetName && (
                      <Descriptions.Item label="Calle">
                        {address.streetName} {address.streetNumber || ""}
                      </Descriptions.Item>
                    )}
                    {address.city && (
                      <Descriptions.Item label="Ciudad">
                        {address.city}
                      </Descriptions.Item>
                    )}
                    {address.estate && (
                      <Descriptions.Item label="Estado">
                        {address.estate}
                      </Descriptions.Item>
                    )}
                    {address.postalCode && (
                      <Descriptions.Item label="CP">
                        {address.postalCode}
                      </Descriptions.Item>
                    )}
                    {address.country && (
                      <Descriptions.Item label="País">
                        {address.country}
                      </Descriptions.Item>
                    )}
                    {address.contactNumber && (
                      <Descriptions.Item label="Teléfono">
                        {address.contactNumber}
                      </Descriptions.Item>
                    )}
                    {address.contactEmail && (
                      <Descriptions.Item label="Email">
                        {address.contactEmail}
                      </Descriptions.Item>
                    )}
                    {address.otherDetails && (
                      <Descriptions.Item label="Detalles">
                        {address.otherDetails}
                      </Descriptions.Item>
                    )}
                    {address.comment && (
                      <Descriptions.Item label="Comentarios">
                        {address.comment}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              ))}
            </Space>
          )}
        </Space>
      </Drawer>

      {/* Drawer para formulario de dirección */}
      <Drawer
        title={editingAddress ? "Editar Dirección" : "Agregar Dirección"}
        open={isAddressFormOpen}
        onClose={handleCloseAddressForm}
        width={500}
        extra={
          <Space>
            <Button onClick={handleCloseAddressForm}>Cancelar</Button>
            <Button type="primary" onClick={() => addressForm.submit()}>
              {editingAddress ? "Actualizar" : "Agregar"}
            </Button>
          </Space>
        }
      >
        <Form
          form={addressForm}
          layout="vertical"
          onFinish={handleSubmitAddress}
        >
          <Form.Item
            label="Nombre de la Dirección"
            name="addressName"
            rules={[
              {
                required: true,
                message: "Por favor ingresa el nombre de la dirección",
              },
            ]}
          >
            <Input placeholder="Ej: Oficina Principal" />
          </Form.Item>

          <Form.Item label="Nombre de Calle" name="streetName">
            <Input placeholder="Ej: Av. Reforma" />
          </Form.Item>

          <Form.Item label="Número" name="streetNumber">
            <Input placeholder="Ej: 123" />
          </Form.Item>

          <Form.Item label="Ciudad" name="city">
            <Input placeholder="Ej: Ciudad de México" />
          </Form.Item>

          <Form.Item label="Estado/Provincia" name="estate">
            <Input placeholder="Ej: CDMX" />
          </Form.Item>

          <Form.Item label="Código Postal" name="postalCode">
            <Input placeholder="Ej: 12345" />
          </Form.Item>

          <Form.Item label="País" name="country">
            <Input placeholder="Ej: México" />
          </Form.Item>

          <Form.Item label="Teléfono de Contacto" name="contactNumber">
            <Input
              type="tel"
              placeholder="Ej: 5551234567"
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>

          <Form.Item label="Email de Contacto" name="contactEmail">
            <Input type="email" placeholder="Ej: contacto@ejemplo.com" />
          </Form.Item>

          <Form.Item label="Otros Detalles" name="otherDetails">
            <Input.TextArea
              rows={2}
              placeholder="Ej: Entre Calle A y Calle B"
            />
          </Form.Item>

          <Form.Item label="Comentarios" name="comment">
            <Input.TextArea
              rows={2}
              placeholder="Ej: Tocar el timbre 2 veces"
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Drawer de Colores */}
      <BrandColorsDrawer
        open={isColorsModalOpen}
        brand={colorsBrand}
        onClose={handleCloseColorsModal}
      />
    </div>
  );
};

export default BrandsPage;
