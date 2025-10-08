import { useState, useEffect } from "react";
import {
  Card,
  Spin,
  message,
  Typography,
  Input,
  Button,
  Empty,
  Avatar,
  Drawer,
  Form,
  Select,
  Upload,
  InputNumber,
  Space,
} from "antd";
import {
  SearchOutlined,
  CarOutlined,
  HeartFilled,
  HeartOutlined,
  EyeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import vehicleService from "../../services/vehicleService";
import brandService from "../../services/brandService";
import type { BaseVehicle, Brand, BaseVehicleRequest } from "../../types";
import type { UploadFile } from "antd/es/upload/interface";

const { Title, Text } = Typography;
const { Search } = Input;

// URL de la imagen placeholder para vehículos sin imagen
const PLACEHOLDER_IMAGE_URL =
  "https://cdn-icons-png.flaticon.com/512/3774/3774278.png";

interface VehicleWithBrand extends BaseVehicle {
  brand?: Brand;
}

const VehiclesPage = () => {
  const navigate = useNavigate();
  const [baseVehicles, setBaseVehicles] = useState<VehicleWithBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [_searchTerm, setSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<BaseVehicle | null>(
    null
  );
  const [brands, setBrands] = useState<Brand[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageDeleted, setImageDeleted] = useState(false);
  const [form] = Form.useForm();

  // Estado para confirmación de eliminación
  const [deletingVehicleId, setDeletingVehicleId] = useState<number | null>(
    null
  );

  useEffect(() => {
    fetchVehicles();
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await brandService.getBrands({
        pageSize: 1000,
        pageNumber: 1,
      });
      setBrands(response.data || []);
    } catch (error) {
      console.error("Error loading brands:", error);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);

      // Cargar vehículos base
      const baseVehiclesResponse: any = await vehicleService.getBaseVehicles();

      let baseVehiclesData: BaseVehicle[] = [];

      // Procesar vehículos
      if (Array.isArray(baseVehiclesResponse)) {
        baseVehiclesData = baseVehiclesResponse;
      } else if (
        baseVehiclesResponse?.data &&
        Array.isArray(baseVehiclesResponse.data)
      ) {
        baseVehiclesData = baseVehiclesResponse.data;
      }

      // Cargar marcas
      let brandsData: Brand[] = [];
      try {
        const brandsResponse = await brandService.getBrands({
          pageSize: 1000,
          pageNumber: 1,
        });
        brandsData = brandsResponse.data || [];
      } catch (brandError) {
        console.error("Error loading brands:", brandError);
      }

      // Crear un mapa de marcas por ID para búsqueda rápida
      const brandsMap = new Map<number, Brand>();
      brandsData.forEach((brand) => {
        brandsMap.set(brand.id, brand);
      });

      // Asociar marcas a vehículos
      const vehiclesWithBrands: VehicleWithBrand[] = baseVehiclesData.map(
        (vehicle) => {
          const brand = brandsMap.get(vehicle.brandId);
          return {
            ...vehicle,
            brand: brand,
            brandName: brand?.brandName || vehicle.brandName || "Sin marca",
          };
        }
      );

      setBaseVehicles(vehiclesWithBrands);
    } catch (error) {
      message.error("Error al cargar los vehículos");
      console.error(error);
      setBaseVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    if (!value) {
      fetchVehicles();
      return;
    }

    const allVehicles: any = await vehicleService.getBaseVehicles();
    const vehiclesData = Array.isArray(allVehicles)
      ? allVehicles
      : allVehicles?.data || [];

    const filtered = vehiclesData.filter(
      (vehicle: BaseVehicle) =>
        vehicle.modelName.toLowerCase().includes(value.toLowerCase()) ||
        vehicle.brandName?.toLowerCase().includes(value.toLowerCase())
    );
    setBaseVehicles(filtered);
  };

  const handleToggleFavorite = async (vehicle: BaseVehicle) => {
    try {
      await vehicleService.updateBaseVehicle(vehicle.id, {
        isFavorite: !vehicle.isFavorite,
      });
      message.success(
        vehicle.isFavorite ? "Eliminado de favoritos" : "Agregado a favoritos"
      );
      fetchVehicles();
    } catch (error) {
      message.error("Error al actualizar favorito");
    }
  };

  const handleOpenDrawer = (vehicle?: BaseVehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      form.setFieldsValue({
        brandId: vehicle.brandId,
        modelName: vehicle.modelName,
        modelYear: vehicle.modelYear,
        isFavorite: vehicle.isFavorite,
      });
      if (vehicle.baseVehicleImageUrl || vehicle.imageVehicleBase) {
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: vehicle.baseVehicleImageUrl || vehicle.imageVehicleBase,
          },
        ]);
      }
    } else {
      setEditingVehicle(null);
      form.resetFields();
      setFileList([]);
    }
    setImageDeleted(false);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingVehicle(null);
    form.resetFields();
    setFileList([]);
    setImageDeleted(false);
  };

  // Función para descargar la imagen placeholder desde la URL
  const fetchPlaceholderImage = async (): Promise<File> => {
    try {
      const response = await fetch(PLACEHOLDER_IMAGE_URL);
      const blob = await response.blob();
      return new File([blob], "placeholder-car.png", { type: "image/png" });
    } catch (error) {
      console.error("Error al descargar imagen placeholder:", error);
      // Fallback: crear una imagen transparente pequeña
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const dataUrl = canvas.toDataURL("image/png");
      const arr = dataUrl.split(",");
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }
      const fallbackBlob = new Blob([u8arr], { type: "image/png" });
      return new File([fallbackBlob], "placeholder.png", { type: "image/png" });
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const selectedBrand = brands.find((b) => b.id === values.brandId);
      const vehicleRequest: BaseVehicleRequest = {
        brandId: values.brandId,
        brandName: selectedBrand?.brandName || "",
        modelName: values.modelName,
        modelYear: values.modelYear,
        isFavorite: values.isFavorite || false,
      };

      // Si se eliminó la imagen, enviar imagen placeholder
      if (imageDeleted) {
        vehicleRequest.imageVehicleBase = await fetchPlaceholderImage();
      }
      // Si hay una nueva imagen (con originFileObj)
      else if (fileList.length > 0 && fileList[0].originFileObj) {
        vehicleRequest.imageVehicleBase = fileList[0].originFileObj as File;
      }

      if (editingVehicle) {
        await vehicleService.updateBaseVehicle(
          editingVehicle.id,
          vehicleRequest
        );
        message.success(
          `Vehículo "${values.modelName}" actualizado exitosamente`
        );
      } else {
        await vehicleService.addBaseVehicle(vehicleRequest);
        message.success(`Vehículo "${values.modelName}" creado exitosamente`);
      }

      handleCloseDrawer();
      fetchVehicles();
    } catch (error) {
      message.error(
        editingVehicle
          ? "Error al actualizar el vehículo"
          : "Error al crear el vehículo"
      );
      console.error(error);
    }
  };

  const handleDelete = async (vehicleId: number, modelName: string) => {
    try {
      await vehicleService.deleteBaseVehicle(vehicleId);
      message.success(`Vehículo "${modelName}" eliminado exitosamente`);
      setDeletingVehicleId(null);
      fetchVehicles();
    } catch (error) {
      message.error("Error al eliminar el vehículo");
      console.error(error);
      setDeletingVehicleId(null);
    }
  };

  return (
    <div>
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <Title
            level={2}
            style={{ marginBottom: "8px", color: "#1a1a1a", fontWeight: 600 }}
          >
            Catálogo de Vehículos Eléctricos
          </Title>
          <Text style={{ fontSize: "15px", color: "#595959" }}>
            Explora nuestra colección de {baseVehicles.length} modelos de
            vehículos eléctricos
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenDrawer()}
          size="large"
        >
          Agregar Vehículo
        </Button>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <Search
          placeholder="Buscar por modelo o marca..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "600px" }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      ) : baseVehicles.length === 0 ? (
        <Card
          variant="borderless"
          style={{
            borderRadius: "8px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
          }}
          styles={{ body: { padding: "48px 24px" } }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text style={{ color: "#8c8c8c" }}>
                No se encontraron vehículos
              </Text>
            }
          />
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {baseVehicles.map((vehicle) => {
            const imageUrl =
              vehicle.baseVehicleImageUrl || vehicle.imageVehicleBase;

            return (
              <Card
                key={vehicle.id}
                variant="borderless"
                hoverable
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
                  overflow: "hidden",
                  transition: "all 0.3s",
                }}
                styles={{ body: { padding: 0 } }}
                cover={
                  imageUrl ? (
                    <div
                      style={{
                        height: "220px",
                        background: `url(${imageUrl}) center/cover`,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          background: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "50%",
                          width: "36px",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                          cursor: "pointer",
                          transition: "transform 0.2s",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(vehicle);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        {vehicle.isFavorite ? (
                          <HeartFilled
                            style={{ color: "#ff4d4f", fontSize: "18px" }}
                          />
                        ) : (
                          <HeartOutlined
                            style={{ color: "#8c8c8c", fontSize: "18px" }}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        height: "220px",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      <CarOutlined
                        style={{
                          fontSize: "64px",
                          color: "rgba(255, 255, 255, 0.8)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          background: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "50%",
                          width: "36px",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(vehicle);
                        }}
                      >
                        {vehicle.isFavorite ? (
                          <HeartFilled
                            style={{ color: "#ff4d4f", fontSize: "18px" }}
                          />
                        ) : (
                          <HeartOutlined
                            style={{ color: "#8c8c8c", fontSize: "18px" }}
                          />
                        )}
                      </div>
                    </div>
                  )
                }
              >
                <div style={{ padding: "20px" }}>
                  {/* Logo y marca */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {vehicle.brand?.brandLogoUrl ||
                      vehicle.brand?.brandLogo ? (
                        <Avatar
                          src={
                            vehicle.brand.brandLogoUrl ||
                            vehicle.brand.brandLogo
                          }
                          size={32}
                          style={{ flexShrink: 0 }}
                        />
                      ) : (
                        <Avatar
                          size={32}
                          style={{
                            backgroundColor: "#f0f0f0",
                            color: "#8c8c8c",
                            flexShrink: 0,
                          }}
                        >
                          {vehicle.brandName?.charAt(0) || "S"}
                        </Avatar>
                      )}
                      <Text
                        style={{
                          fontSize: "13px",
                          color: "#8c8c8c",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: 500,
                        }}
                      >
                        {vehicle.brandName || "Sin marca"}
                      </Text>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDrawer(vehicle);
                        }}
                      />
                      {deletingVehicleId === vehicle.id ? (
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
                              handleDelete(vehicle.id, vehicle.modelName);
                            }}
                          >
                            Sí
                          </Button>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingVehicleId(null);
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
                            setDeletingVehicleId(vehicle.id);
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <Title
                    level={5}
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#1a1a1a",
                    }}
                  >
                    {vehicle.modelName}
                  </Title>

                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#595959",
                      display: "block",
                      marginBottom: "16px",
                    }}
                  >
                    Año {vehicle.modelYear}
                  </Text>

                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    block
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    style={{
                      borderRadius: "6px",
                      height: "40px",
                      fontWeight: 500,
                    }}
                  >
                    Ver Detalles y Versiones
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Drawer para formulario de vehículo */}
      <Drawer
        title={editingVehicle ? "Editar Vehículo" : "Agregar Vehículo"}
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        width={500}
        extra={
          <Space>
            <Button onClick={handleCloseDrawer}>Cancelar</Button>
            <Button type="primary" onClick={() => form.submit()}>
              {editingVehicle ? "Actualizar" : "Crear"}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Marca"
            name="brandId"
            rules={[
              { required: true, message: "Por favor selecciona una marca" },
            ]}
          >
            <Select
              placeholder="Selecciona una marca"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={brands.map((brand) => ({
                value: brand.id,
                label: brand.brandName,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Nombre del Modelo"
            name="modelName"
            rules={[
              {
                required: true,
                message: "Por favor ingresa el nombre del modelo",
              },
            ]}
          >
            <Input placeholder="Ej: Model 3" />
          </Form.Item>

          <Form.Item
            label="Año del Modelo"
            name="modelYear"
            rules={[{ required: true, message: "Por favor ingresa el año" }]}
          >
            <InputNumber
              placeholder="Ej: 2024"
              min={2000}
              max={2030}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Imagen del Vehículo"
            name="imageVehicleBase"
            extra="Puedes eliminar la imagen haciendo clic en el ícono de eliminar. Se mostrará un placeholder."
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => {
                setFileList(fileList);
                // Si se elimina la imagen (fileList vacío) y estamos editando
                if (fileList.length === 0 && editingVehicle) {
                  setImageDeleted(true);
                }
              }}
              onRemove={() => {
                setFileList([]);
                if (editingVehicle) {
                  setImageDeleted(true);
                }
                return true;
              }}
              beforeUpload={() => false}
              maxCount={1}
            >
              {fileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Subir Imagen</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default VehiclesPage;
