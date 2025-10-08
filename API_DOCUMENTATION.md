# API Movilidad Eléctrico - Documentación Completa

**Base URL:** `https://movilidadelectrico.azurewebsites.net`

Esta API proporciona un sistema completo para la gestión de vehículos eléctricos, marcas, colores, equipamiento adicional y comentarios.

---

## 📋 Tabla de Contenidos

1. [Additional Equipments](#additional-equipments)
2. [Base Vehicle](#base-vehicle)
3. [Brand Address](#brand-address)
4. [Brands](#brands)
5. [Tools](#tools)
6. [Vehicle Color](#vehicle-color)
7. [Vehicle Comment](#vehicle-comment)
8. [Vehicles](#vehicles)

---

## 🔧 Additional Equipments

Gestión de equipamiento adicional para vehículos.

### GET `/api/AdditionalEquipments`
Obtiene información de equipamiento adicional.

**Respuestas:**
- `200` - Success (AdditionalEquipmentDto)
- `400` - Bad Request

### POST `/api/AdditionalEquipments`
Crea nuevo equipamiento adicional.

**Request Body:**
```json
{
  "vehicleVersionId": "integer (required)",
  "equipmentType": "string (required)"
}
```

**Respuestas:**
- `200` - Success
- `400` - Bad Request

### PUT `/api/AdditionalEquipments`
Actualiza equipamiento adicional existente.

**Query Parameters:**
- `id` (integer) - ID del equipamiento

**Request Body:** AddEquipmentUpdateRequest

**Respuestas:**
- `200` - Success
- `400` - Bad Request

### GET `/api/AdditionalEquipments/{id}`
Obtiene equipamiento por ID.

**Path Parameters:**
- `id` (integer)

### DELETE `/api/AdditionalEquipments/{id}`
Elimina equipamiento por ID.

**Path Parameters:**
- `id` (integer)

---

## 🚗 Base Vehicle

Gestión de vehículos base.

### GET `/api/BaseVehicle`
Obtiene información de vehículos base.

**Respuestas:**
- `200` - Success (BaseVehicleDto)
- `400` - Bad Request

### POST `/api/BaseVehicle`
Crea un nuevo vehículo base.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `BrandId` (integer, required)
- `BrandName` (string, required)
- `ModelName` (string, optional)
- `ModelYear` (integer, optional)
- `ImageVehicleBase` (file, optional)
- `IsFavorite` (boolean, optional)

**Respuestas:**
- `200` - Success
- `400` - Bad Request

### PUT `/api/BaseVehicle`
Actualiza un vehículo base existente.

**Query Parameters:**
- `id` (integer)

**Content-Type:** `multipart/form-data`

**Form Data:** (Similar a POST)

### GET `/api/BaseVehicle/{id}`
Obtiene vehículo base por ID.

### DELETE `/api/BaseVehicle/{id}`
Elimina vehículo base por ID.

### GET `/api/BaseVehicle/GetFavorites`
Obtiene vehículos marcados como favoritos.

### GET `/api/BaseVehicle/GetByBrand`
Obtiene vehículos por marca.

---

## 📍 Brand Address

Gestión de direcciones de marcas.

### GET `/api/BrandAddress/GetBrandAddresses`
Obtiene direcciones de una marca.

**Query Parameters:**
- `brandId` (integer)

**Respuestas:**
- `200` - Success
- `400` - Bad Request

### POST `/api/BrandAddress/AddAddress`
Agrega una nueva dirección.

**Request Body:** BrandAddressRequest

### PUT `/api/BrandAddress/UpdateAddress`
Actualiza una dirección existente.

**Request Body:** BrandAddressUpdateRequest

### DELETE `/api/BrandAddress/DeleteAddress`
Elimina una dirección.

---

## 🏢 Brands

Gestión completa de marcas de vehículos.

### GET `/api/Brands/GetBrands`
Obtiene lista de marcas con paginación.

**Query Parameters:**
- `PageSize` (integer)
- `PageNumber` (integer)

**Respuestas:**
- `200` - Success

### GET `/api/Brands/GetById`
Obtiene una marca por ID.

**Query Parameters:**
- `id` (integer)

**Respuestas:**
- `200` - Success

### POST `/api/Brands/AddBrand`
Crea una nueva marca.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `BrandName` (string, required)
- `BrandLogo` (file, optional)
- `AdressLine` (string, optional)
- `BrandPhone` (string, optional)
- `ContactName` (string, optional)
- `ContactPhone` (string, optional)

**Respuestas:**
- `200` - Success

### PUT `/api/Brands/UpdateBrand`
Actualiza una marca existente.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `BrandId` (integer, required)
- `BrandName` (string, optional)
- `BrandLogo` (file, optional)
- `AdressLine` (string, optional)
- `BrandPhone` (string, optional)
- `ContactName` (string, optional)
- `ContactPhone` (string, optional)

**Respuestas:**
- `200` - Success

### DELETE `/api/Brands/DeleteBrand`
Elimina una marca.

**Query Parameters:**
- `id` (integer)

**Respuestas:**
- `200` - Success

---

## 🛠️ Tools

Herramientas y parámetros generales del sistema.

### GET `/api/Tools/GetCurrencyExchange`
Obtiene tipo de cambio de moneda.

**Query Parameters:**
- `currency` (Currency enum)

**Respuestas:**
- `200` - Success

### GET `/api/Tools/GetGeneralParameters`
Obtiene parámetros generales del sistema.

**Respuestas:**
- `200` - Success

### PUT `/api/Tools/ModifyGeneralParameters`
Modifica parámetros generales.

**Request Body:**
```json
{
  "kwHPrice": "double (nullable)",
  "ivaPercentage": "double (nullable)",
  "importPercentage": "double (nullable)"
}
```

**Respuestas:**
- `200` - Success

---

## 🎨 Vehicle Color

Gestión de colores de vehículos.

### GET `/api/VehicleColor/GetColors`
Obtiene colores de vehículos con filtros.

**Query Parameters:**
- `BrandId` (integer)
- `ColorCode` (string)
- `ColorName` (string)
- `MinYear` (integer)

**Respuestas:**
- `200` - Success

### POST `/api/VehicleColor/AddColor`
Agrega un nuevo color.

**Respuestas:**
- `200` - Success

### POST `/api/VehicleColor/AssociateColorToVehicle`
Asocia un color a un vehículo.

**Respuestas:**
- `200` - Success

### PUT `/api/VehicleColor/UpdateColor`
Actualiza un color existente.

**Respuestas:**
- `200` - Success

### DELETE `/api/VehicleColor/DeleteColor`
Elimina un color.

**Respuestas:**
- `200` - Success

---

## 💬 Vehicle Comment

Gestión de comentarios de vehículos.

### GET `/api/VehicleComment/GetVehicleComments`
Obtiene comentarios de un vehículo.

**Query Parameters:**
- `VehicleId` (integer)

**Respuestas:**
- `200` - Success (VehicleCommentDto)
- `400` - Bad Request (ProblemDetails)

### POST `/api/VehicleComment/AddComment`
Agrega un nuevo comentario.

**Request Body:** VehicleCommentRequest

**Respuestas:**
- `200` - Success (VehicleCommentDto)
- `400` - Bad Request (ProblemDetails)

### PUT `/api/VehicleComment/UpdateComment`
Actualiza un comentario existente.

**Request Body:** VehicleCommentUpdateRequest

**Respuestas:**
- `200` - Success (VehicleCommentDto)
- `400` - Bad Request (ProblemDetails)

### DELETE `/api/VehicleComment/DeleteComment`
Elimina un comentario.

**Query Parameters:**
- `id` (integer)

**Respuestas:**
- `200` - Success (Boolean)
- `400` - Bad Request (ProblemDetails)

---

## 🚙 Vehicles

Gestión completa de versiones de vehículos.

### GET `/api/Vehicles/GetVehicleVersions`
Obtiene versiones de vehículos con filtros y paginación.

**Query Parameters:**
- `VersionName` (string)
- `BaseVehicleId` (integer)
- `MaxSpeed` (number)
- `PageSize` (integer)
- `PageNumber` (integer)
- Y otros filtros disponibles

**Respuestas:**
- `200` - Success

### GET `/api/Vehicles/Versions/GetById`
Obtiene una versión de vehículo por ID.

**Query Parameters:**
- `id` (integer)

**Respuestas:**
- `200` - Success

### POST `/api/Vehicles/Versions/AddVersion`
Agrega una nueva versión de vehículo.

**Content-Type:** `multipart/form-data`

**Form Data:**
- Detalles extensos de la versión del vehículo
- Soporte para múltiples imágenes

**Respuestas:**
- `200` - Success

### PUT `/api/Vehicles/Versions/UpdateVersion`
Actualiza una versión de vehículo existente.

**Request Body:** VehicleVersionUpdateRequest

**Respuestas:**
- `200` - Success

### DELETE `/api/Vehicles/Versions/DeleteVersion`
Elimina una versión de vehículo.

**Query Parameters:**
- `id` (integer)

**Respuestas:**
- `200` - Success

### POST `/api/Vehicles/Versions/AddImages`
Agrega imágenes a una versión de vehículo.

**Query Parameters:**
- `VehicleVersionId` (integer)

**Request Body:** Images (file upload)

**Respuestas:**
- `200` - Success

### DELETE `/api/Vehicles/Versions/DeleteImage`
Elimina una imagen de una versión de vehículo.

**Query Parameters:**
- `id` (integer)

**Respuestas:**
- `200` - Success

---

## 📊 Modelos de Datos Principales

### AdditionalEquipmentDto
Información de equipamiento adicional.

### BaseVehicleDto
Información básica del vehículo base.

### VehicleCommentDto
Información de comentarios de vehículos.

### VehicleVersionDto
Información completa de versiones de vehículos.

---

## 🔐 Notas de Implementación

- La API usa códigos de respuesta HTTP estándar
- Muchos endpoints soportan `multipart/form-data` para subida de archivos
- La paginación está disponible en varios endpoints mediante `PageSize` y `PageNumber`
- Los errores retornan objetos `ProblemDetails` con código 400

---

## 🚀 Próximos Pasos

Este documento servirá como base para el desarrollo de una aplicación React + Vite que consumirá estos endpoints.

**Funcionalidades sugeridas para la aplicación:**
1. Catálogo de vehículos eléctricos con filtros
2. Gestión de marcas y modelos
3. Sistema de favoritos
4. Comparador de vehículos
5. Calculadora de costos (usando parámetros de Tools)
6. Sistema de comentarios y valoraciones
7. Galería de imágenes de vehículos
