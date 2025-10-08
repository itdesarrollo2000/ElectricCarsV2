import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  Empty,
  Badge,
  Avatar,
} from "antd";
import {
  CarOutlined,
  TagsOutlined,
  HeartOutlined,
  ThunderboltFilled,
  HeartFilled,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vehicleService } from "../../services/vehicleService";
import { brandService } from "../../services/brandService";
import type { BaseVehicle, Brand } from "../../types";

const { Title, Paragraph, Text } = Typography;

interface VehicleWithBrand extends BaseVehicle {
  brand?: Brand;
}

interface Stats {
  vehicles: number;
  brands: number;
  favorites: number;
  versions: number;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    vehicles: 0,
    brands: 0,
    favorites: 0,
    versions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [favoriteVehicles, setFavoriteVehicles] = useState<VehicleWithBrand[]>(
    []
  );
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      let vehiclesCount = 0;
      let brandsCount = 0;
      let favoritesCount = 0;
      let versionsCount = 0;

      try {
        const baseVehicles: any = await vehicleService.getBaseVehicles();
        console.log("Base Vehicles Response:", baseVehicles);

        if (Array.isArray(baseVehicles)) {
          vehiclesCount = baseVehicles.length;
        } else if (baseVehicles?.data && Array.isArray(baseVehicles.data)) {
          vehiclesCount = baseVehicles.data.length;
        }
      } catch (error: any) {
        console.log("No hay vehículos base registrados");
        vehiclesCount = 0;
      }

      try {
        const favorites: any = await vehicleService.getFavoriteVehicles();
        console.log("Favorites Response:", favorites);

        let favoritesData: BaseVehicle[] = [];
        if (Array.isArray(favorites)) {
          favoritesData = favorites;
          favoritesCount = favorites.length;
        } else if (favorites?.data && Array.isArray(favorites.data)) {
          favoritesData = favorites.data;
          favoritesCount = favorites.data.length;
        }

        // Cargar marcas para los favoritos
        try {
          const brandsResponse = await brandService.getBrands({
            pageSize: 1000,
            pageNumber: 1,
          });
          const brandsData = brandsResponse.data || [];

          // Crear mapa de marcas
          const brandsMap = new Map<number, Brand>();
          brandsData.forEach((brand) => {
            brandsMap.set(brand.id, brand);
          });

          // Asociar marcas a vehículos favoritos
          const favoritesWithBrands: VehicleWithBrand[] = favoritesData.map(
            (vehicle) => ({
              ...vehicle,
              brand: brandsMap.get(vehicle.brandId),
              brandName:
                brandsMap.get(vehicle.brandId)?.brandName ||
                vehicle.brandName ||
                "Sin marca",
            })
          );

          setFavoriteVehicles(favoritesWithBrands);
        } catch (brandError) {
          console.log("Error loading brands for favorites");
          setFavoriteVehicles(favoritesData);
        }

        setLoadingFavorites(false);
      } catch (error: any) {
        console.log("No hay vehículos favoritos");
        favoritesCount = 0;
        setFavoriteVehicles([]);
        setLoadingFavorites(false);
      }

      try {
        const brandsResponse: any = await brandService.getBrands({
          pageSize: 1000,
          pageNumber: 1,
        });
        console.log("Brands Response:", brandsResponse);

        if (typeof brandsResponse === "object") {
          if ("totalRecords" in brandsResponse) {
            brandsCount = brandsResponse.totalRecords;
          } else if (
            "data" in brandsResponse &&
            Array.isArray(brandsResponse.data)
          ) {
            brandsCount = brandsResponse.data.length;
          } else if (Array.isArray(brandsResponse)) {
            brandsCount = brandsResponse.length;
          }
        }
      } catch (error: any) {
        console.log("No hay marcas registradas");
        brandsCount = 0;
      }

      try {
        const versionsResponse: any = await vehicleService.getVehicleVersions({
          pageSize: 1000,
          pageNumber: 1,
        });
        console.log("Versions Response:", versionsResponse);

        if (typeof versionsResponse === "object") {
          if ("totalRecords" in versionsResponse) {
            versionsCount = versionsResponse.totalRecords;
          } else if (
            "data" in versionsResponse &&
            Array.isArray(versionsResponse.data)
          ) {
            versionsCount = versionsResponse.data.length;
          } else if (Array.isArray(versionsResponse)) {
            versionsCount = versionsResponse.length;
          }
        }
      } catch (error: any) {
        console.log("No hay versiones registradas");
        versionsCount = 0;
      }

      setStats({
        vehicles: vehiclesCount,
        brands: brandsCount,
        favorites: favoritesCount,
        versions: versionsCount,
      });

      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <Title
          level={2}
          style={{ marginBottom: "8px", color: "#1a1a1a", fontWeight: 600 }}
        >
          Bienvenido a Electric Cars
        </Title>
        <Paragraph style={{ fontSize: "15px", color: "#595959", margin: 0 }}>
          Sistema completo de gestión de vehículos eléctricos. Explora las
          mejores marcas y modelos del mercado.
        </Paragraph>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant="borderless"
              style={{
                borderRadius: "8px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
                transition: "all 0.3s",
              }}
              styles={{ body: { padding: "24px" } }}
              hoverable
            >
              <Statistic
                title={
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#8c8c8c",
                      fontWeight: 500,
                    }}
                  >
                    Modelos Base
                  </span>
                }
                value={stats.vehicles}
                prefix={<CarOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{
                  color: "#1a1a1a",
                  fontSize: "32px",
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant="borderless"
              style={{
                borderRadius: "8px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
                transition: "all 0.3s",
              }}
              styles={{ body: { padding: "24px" } }}
              hoverable
            >
              <Statistic
                title={
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#8c8c8c",
                      fontWeight: 500,
                    }}
                  >
                    Marcas
                  </span>
                }
                value={stats.brands}
                prefix={<TagsOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{
                  color: "#1a1a1a",
                  fontSize: "32px",
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant="borderless"
              style={{
                borderRadius: "8px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
                transition: "all 0.3s",
              }}
              styles={{ body: { padding: "24px" } }}
              hoverable
            >
              <Statistic
                title={
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#8c8c8c",
                      fontWeight: 500,
                    }}
                  >
                    Favoritos
                  </span>
                }
                value={stats.favorites}
                prefix={<HeartOutlined style={{ color: "#ff4d4f" }} />}
                valueStyle={{
                  color: "#1a1a1a",
                  fontSize: "32px",
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant="borderless"
              style={{
                borderRadius: "8px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
                transition: "all 0.3s",
              }}
              styles={{ body: { padding: "24px" } }}
              hoverable
            >
              <Statistic
                title={
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#8c8c8c",
                      fontWeight: 500,
                    }}
                  >
                    Versiones
                  </span>
                }
                value={stats.versions}
                prefix={<ThunderboltFilled style={{ color: "#52c41a" }} />}
                valueStyle={{
                  color: "#1a1a1a",
                  fontSize: "32px",
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <div style={{ marginTop: "48px" }}>
        <Title
          level={3}
          style={{ marginBottom: "24px", color: "#1a1a1a", fontWeight: 600 }}
        >
          Funcionalidades
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card
              variant="borderless"
              style={{
                borderRadius: "8px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
                height: "100%",
              }}
              styles={{ body: { padding: "24px" } }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    background: "#f0f9ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CarOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
                </div>
                <div>
                  <Title
                    level={5}
                    style={{ margin: "0 0 8px 0", fontWeight: 600 }}
                  >
                    Catálogo de Vehículos
                  </Title>
                  <Paragraph style={{ margin: 0, color: "#595959" }}>
                    Explora una amplia gama de vehículos eléctricos con
                    especificaciones detalladas, imágenes y precios.
                  </Paragraph>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              variant="borderless"
              style={{
                borderRadius: "8px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
                height: "100%",
              }}
              styles={{ body: { padding: "24px" } }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    background: "#f6ffed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <TagsOutlined
                    style={{ fontSize: "24px", color: "#52c41a" }}
                  />
                </div>
                <div>
                  <Title
                    level={5}
                    style={{ margin: "0 0 8px 0", fontWeight: 600 }}
                  >
                    Gestión de Marcas
                  </Title>
                  <Paragraph style={{ margin: 0, color: "#595959" }}>
                    Administra información de marcas de vehículos eléctricos,
                    incluyendo datos de contacto y direcciones.
                  </Paragraph>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              variant="borderless"
              style={{
                borderRadius: "8px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
                height: "100%",
              }}
              styles={{ body: { padding: "24px" } }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    background: "#fff1f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <HeartOutlined
                    style={{ fontSize: "24px", color: "#ff4d4f" }}
                  />
                </div>
                <div>
                  <Title
                    level={5}
                    style={{ margin: "0 0 8px 0", fontWeight: 600 }}
                  >
                    Sistema de Favoritos
                  </Title>
                  <Paragraph style={{ margin: 0, color: "#595959" }}>
                    Guarda tus vehículos favoritos para acceso rápido y
                    comparación.
                  </Paragraph>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              variant="borderless"
              style={{
                borderRadius: "8px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
                height: "100%",
              }}
              styles={{ body: { padding: "24px" } }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    background: "#f6ffed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ThunderboltFilled
                    style={{ fontSize: "24px", color: "#52c41a" }}
                  />
                </div>
                <div>
                  <Title
                    level={5}
                    style={{ margin: "0 0 8px 0", fontWeight: 600 }}
                  >
                    Versiones Detalladas
                  </Title>
                  <Paragraph style={{ margin: 0, color: "#595959" }}>
                    Consulta especificaciones técnicas completas de cada
                    versión, desde autonomía hasta potencia.
                  </Paragraph>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Sección de Vehículos Favoritos */}
      <div style={{ marginTop: "48px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <Title
            level={3}
            style={{ margin: 0, color: "#1a1a1a", fontWeight: 600 }}
          >
            Vehículos Favoritos
          </Title>
          <Badge
            count={stats.favorites}
            showZero
            style={{ backgroundColor: "#ff4d4f" }}
          />
        </div>

        {loadingFavorites ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin size="large" />
          </div>
        ) : favoriteVehicles.length === 0 ? (
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
                  No tienes vehículos favoritos aún. Marca tus vehículos
                  preferidos para verlos aquí.
                </Text>
              }
            />
          </Card>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {favoriteVehicles.map((vehicle) => {
              const imageUrl =
                vehicle.baseVehicleImageUrl || vehicle.imageVehicleBase;
              return (
                <Card
                  key={vehicle.id}
                  variant="borderless"
                  hoverable
                  onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
                    overflow: "hidden",
                    transition: "all 0.3s",
                    cursor: "pointer",
                  }}
                  styles={{ body: { padding: 0 } }}
                  cover={
                    imageUrl ? (
                      <div
                        style={{
                          height: "180px",
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
                          }}
                        >
                          <HeartFilled
                            style={{ color: "#ff4d4f", fontSize: "18px" }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          height: "180px",
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
                          }}
                        >
                          <HeartFilled
                            style={{ color: "#ff4d4f", fontSize: "18px" }}
                          />
                        </div>
                      </div>
                    )
                  }
                >
                  <div style={{ padding: "16px" }}>
                    {/* Logo y marca */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      {vehicle.brand?.brandLogoUrl ||
                      vehicle.brand?.brandLogo ? (
                        <Avatar
                          src={
                            vehicle.brand.brandLogoUrl ||
                            vehicle.brand.brandLogo
                          }
                          size={28}
                          style={{ flexShrink: 0 }}
                        />
                      ) : (
                        <Avatar
                          size={28}
                          style={{
                            backgroundColor: "#f0f0f0",
                            color: "#8c8c8c",
                            flexShrink: 0,
                            fontSize: "12px",
                          }}
                        >
                          {vehicle.brandName?.charAt(0) || "S"}
                        </Avatar>
                      )}
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#8c8c8c",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: 500,
                        }}
                      >
                        {vehicle.brandName || "Sin marca"}
                      </Text>
                    </div>
                    <Title
                      level={5}
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#1a1a1a",
                      }}
                    >
                      {vehicle.modelName}
                    </Title>
                    <Text style={{ fontSize: "14px", color: "#595959" }}>
                      Año {vehicle.modelYear}
                    </Text>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
