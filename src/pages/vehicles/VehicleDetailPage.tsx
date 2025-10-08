import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, message, Typography, Button, Descriptions, Divider, Tag, Image, Empty, Avatar, Drawer, Form, Input, InputNumber, Select, Upload, Tabs, Switch, Space, Table, Modal, Alert, List } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, ThunderboltFilled, HeartFilled, HeartOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, MinusCircleOutlined, CommentOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import type { AdditionalEquipmentRequest, VehicleComment, VehicleCommentRequest, VehicleImage } from '../../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import vehicleService from '../../services/vehicleService';
import brandService from '../../services/brandService';
import equipmentService from '../../services/equipmentService';
import commentService from '../../services/commentService';
import type { VehicleVersion, BaseVehicle, Brand } from '../../types';

const { Title, Text, Paragraph } = Typography;

const VehicleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [baseVehicle, setBaseVehicle] = useState<BaseVehicle | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [versions, setVersions] = useState<VehicleVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [isVersionDrawerOpen, setIsVersionDrawerOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<VehicleVersion | null>(null);
  const [form] = Form.useForm();
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const [existingImages, setExistingImages] = useState<VehicleImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [additionalEquipments, setAdditionalEquipments] = useState<(AdditionalEquipmentRequest & { id?: number })[]>([]);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [equipmentForm] = Form.useForm();
  const [excelData, setExcelData] = useState<any>(null);
  const [editingEquipment, setEditingEquipment] = useState<{ index: number; equipment: any } | null>(null);

  // Estados para comentarios
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [selectedVehicleForComments, setSelectedVehicleForComments] = useState<BaseVehicle | null>(null);
  const [comments, setComments] = useState<VehicleComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentForm] = Form.useForm();
  const [editingComment, setEditingComment] = useState<VehicleComment | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  // Estado para confirmación de eliminación de versión
  const [deletingVersionId, setDeletingVersionId] = useState<number | null>(null);

  // Estado para confirmación de eliminación de equipo
  const [deletingEquipmentIndex, setDeletingEquipmentIndex] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchVehicleDetails(parseInt(id));
    }
  }, [id]);

  const fetchVehicleDetails = async (vehicleId: number) => {
    try {
      setLoading(true);
      setLoadingVersions(true);

      // Cargar vehículo base
      const vehicle = await vehicleService.getBaseVehicleById(vehicleId);
      setBaseVehicle(vehicle);

      // Cargar información de la marca
      if (vehicle.brandId) {
        try {
          const brandData = await brandService.getBrandById(vehicle.brandId);
          setBrand(brandData);
        } catch (brandError) {
          console.error('Error loading brand:', brandError);
        }
      }

      setLoading(false);

      // Cargar versiones con todos sus datos e imágenes
      const versionsResponse = await vehicleService.getVehicleVersions({
        baseVehicleId: vehicleId,
        pageSize: 100,
        pageNumber: 1,
      });

      const versionsData = versionsResponse.data || [];
      setVersions(versionsData);
    } catch (error) {
      message.error('Error al cargar los detalles del vehículo');
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingVersions(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!baseVehicle) return;

    try {
      await vehicleService.updateBaseVehicle(baseVehicle.id, {
        isFavorite: !baseVehicle.isFavorite,
      });
      message.success(baseVehicle.isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');
      setBaseVehicle({ ...baseVehicle, isFavorite: !baseVehicle.isFavorite });
    } catch (error) {
      message.error('Error al actualizar favorito');
    }
  };

  const handleOpenVersionForm = async (version?: VehicleVersion) => {
    setEditingVersion(version || null);
    if (version) {
      // Mapear todos los campos del formulario básico
      const versionData = version as any;

      // Mapeo de moneda: número a string enum
      const currencyMap: { [key: number]: string } = {
        1: 'MXN',
        2: 'USD',
        3: 'CNY',
        4: 'JPY',
        5: 'EUR',
        6: 'CAD',
        7: 'RUB',
      };

      form.setFieldsValue({
        versionName: versionData.versionName,
        originPrice: versionData.originPrice,
        originCurrency: typeof versionData.originCurrency === 'number'
          ? currencyMap[versionData.originCurrency]
          : versionData.originCurrency,
        discountPrice: versionData.discountPrice || versionData.price,
        maxDrivingRangeKm: versionData.maxDrivingRangeKm || version.range,
        motorPowerkw: versionData.motorPowerkw || version.motorPower,
        batteryCapacityKwh: versionData.batteryCapacityKwh || version.batteryCapacity,
        maximumSpeedKmH: versionData.maximumSpeedKmH,
        motorTorqueNm: versionData.motorTorqueNm || version.torque,
        chargeTimeHrs: versionData.chargeTimeHrs || version.chargingTime,
        seatsNumber: versionData.seatsNumber || version.seatingCapacity,
        doorsNumber: versionData.doorsNumber,
        wheelSize: versionData.wheelSize,
        airbag: versionData.airbag,
        rearViewCamera: versionData.rearViewCamera,
        parkingRadar: versionData.parkingRadar,
      });

      // Cargar equipos adicionales existentes desde la versión (incluir el ID)
      const equipments = version.additionalEquipments || version.additionalEquipment || [];
      const equipmentsForForm = equipments.map(eq => ({
        id: eq.id,
        equipmentType: String(eq.equipmentType), // Convertir a string
        equipmentDescription: eq.equipmentDescription,
        equipmentPrice: eq.equipmentPrice,
        equipmentPriceCurrency: String(eq.equipmentPriceCurrency), // Convertir a string
      }));
      setAdditionalEquipments(equipmentsForForm);

      // Cargar imágenes existentes
      const images = version.vehicleImages || version.images || [];
      setExistingImages(images);
      setImageFileList([]);
    } else {
      form.resetFields();
      setImageFileList([]);
      setAdditionalEquipments([]);
    }
    setIsVersionDrawerOpen(true);
  };

  const handleCloseVersionDrawer = () => {
    setIsVersionDrawerOpen(false);
    setEditingVersion(null);
    form.resetFields();
    setImageFileList([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setAdditionalEquipments([]);
    setExcelData(null);
  };

  const handleAddEquipment = () => {
    equipmentForm.validateFields().then((values) => {
      if (editingEquipment !== null) {
        // Editar equipo existente
        const updated = [...additionalEquipments];
        updated[editingEquipment.index] = { ...updated[editingEquipment.index], ...values };
        setAdditionalEquipments(updated);
        setEditingEquipment(null);
      } else {
        // Agregar nuevo equipo
        setAdditionalEquipments([...additionalEquipments, values]);
      }
      equipmentForm.resetFields();
      setIsEquipmentModalOpen(false);
    });
  };

  const handleEditEquipment = (index: number) => {
    const equipment = additionalEquipments[index];
    setEditingEquipment({ index, equipment });

    // Convertir valores a string para que el Select los muestre correctamente
    equipmentForm.setFieldsValue({
      equipmentType: String(equipment.equipmentType),
      equipmentDescription: equipment.equipmentDescription,
      equipmentPrice: equipment.equipmentPrice,
      equipmentPriceCurrency: String(equipment.equipmentPriceCurrency),
    });
    setIsEquipmentModalOpen(true);
  };

  const handleRemoveEquipment = async (index: number) => {
    const equipment = additionalEquipments[index];

    // Si el equipo tiene ID, eliminarlo del servidor
    if (equipment.id) {
      try {
        await equipmentService.deleteAdditionalEquipment(equipment.id);
        message.success('Equipamiento eliminado');
      } catch (error) {
        message.error('Error al eliminar equipamiento');
        setDeletingEquipmentIndex(null);
        return;
      }
    }

    // Eliminar del estado local
    setAdditionalEquipments(additionalEquipments.filter((_, i) => i !== index));
    setDeletingEquipmentIndex(null);
  };

  const handleDeleteExistingImage = (imageId: number) => {
    // Marcar imagen para eliminar (no eliminar de inmediato)
    setImagesToDelete([...imagesToDelete, imageId]);
    setExistingImages(existingImages.filter(img => img.id !== imageId));
    message.info('La imagen se eliminará al guardar');
  };

  // Funciones para manejar comentarios
  const handleOpenCommentsModal = (vehicle: BaseVehicle) => {
    try {
      setSelectedVehicleForComments(vehicle);
      setIsCommentsModalOpen(true);
      // Cargar comentarios después de abrir el modal
      loadComments(vehicle.id);
    } catch (error) {
      console.error('Error opening comments modal:', error);
      message.error('Error al abrir los comentarios');
    }
  };

  const loadComments = async (versionId: number) => {
    try {
      setLoadingComments(true);
      const commentsData = await commentService.getVehicleComments(versionId);
      setComments(commentsData || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      message.warning('No se pudieron cargar los comentarios');
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (values: any) => {
    if (!selectedVehicleForComments) return;

    try {
      if (editingComment) {
        // Editar comentario existente
        await commentService.updateComment(editingComment.id, {
          baseVehicleId: selectedVehicleForComments.id,
          title: values.title,
          description: values.description,
        });
        message.success('Comentario actualizado exitosamente');
        setEditingComment(null);
      } else {
        // Agregar nuevo comentario
        const commentRequest: VehicleCommentRequest = {
          baseVehicleId: selectedVehicleForComments.id,
          title: values.title,
          description: values.description,
        };
        await commentService.addComment(commentRequest);
        message.success('Comentario agregado exitosamente');
      }
      commentForm.resetFields();
      await loadComments(selectedVehicleForComments.id);
    } catch (error) {
      console.error('Error saving comment:', error);
      message.error('Error al guardar el comentario');
    }
  };

  const handleEditComment = (comment: VehicleComment) => {
    setEditingComment(comment);
    commentForm.setFieldsValue({
      title: comment.title,
      description: comment.description,
    });
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!selectedVehicleForComments) return;

    try {
      await commentService.deleteComment(commentId);
      message.success('Comentario eliminado exitosamente');
      setDeletingCommentId(null);
      await loadComments(selectedVehicleForComments.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
      message.error('Error al eliminar el comentario');
    }
  };

  const handleCloseCommentsModal = () => {
    setIsCommentsModalOpen(false);
    setSelectedVehicleForComments(null);
    setComments([]);
    setEditingComment(null);
    setDeletingCommentId(null);
    commentForm.resetFields();
  };

  const downloadExcelTemplate = () => {
    const template = [
      {
        Campo: 'discountPrice',
        Descripción: 'Precio con Descuento',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'lenghtmm',
        Descripción: 'Longitud (mm)',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'widthmm',
        Descripción: 'Ancho (mm)',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'heightmm',
        Descripción: 'Altura (mm)',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'wheelBasemm',
        Descripción: 'Distancia entre Ejes (mm)',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'wheelTrackmm',
        Descripción: 'Ancho de vía (mm)',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'groundClearance',
        Descripción: 'Altura al Suelo (mm)',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'curbWeightKg',
        Descripción: 'Peso en Vacío (kg)',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'numberOfMotors',
        Descripción: 'Número de Motores',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'rearMotorKw',
        Descripción: 'Motor Trasero (kW)',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'rearMotorTorque',
        Descripción: 'Torque Motor Trasero (Nm)',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'operatingDrivingRangeKm',
        Descripción: 'Autonomía Operativa (km)',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'drivingRangeWithACMultiplier',
        Descripción: 'Multiplicador de Autonomía con AC',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'batteryCapacityAh',
        Descripción: 'Capacidad de Batería (Ah)',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'batteryType',
        Descripción: 'Tipo de Batería',
        Valor: '',
        Tipo: 'Enum: LITHIUM, LEAD_ACID, SILVER_CALCIUM, EFB, GEL_CELL, ABSORBENT_GLASS, NICKEL_METAL',
      },
      {
        Campo: 'systemVoltageV',
        Descripción: 'Voltaje del Sistema (V)',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'chargeVoltage',
        Descripción: 'Voltaje de Carga',
        Valor: '',
        Tipo: 'Enum: v110, v220, v230, v240, v115, v110_120, v127',
      },
      {
        Campo: 'hasFastCharge',
        Descripción: 'Carga Rápida',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'fastChargeTimeHrs',
        Descripción: 'Tiempo de Carga Rápida (horas)',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'gears',
        Descripción: 'Número de Marchas',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'driveTrainType',
        Descripción: 'Tipo de Tracción',
        Valor: '',
        Tipo: 'Enum: AWD, RWD, FWD, WD4',
      },
      {
        Campo: 'frontSuspension',
        Descripción: 'Suspensión Delantera',
        Valor: '',
        Tipo: 'Texto',
      },
      {
        Campo: 'rearSuspension',
        Descripción: 'Suspensión Trasera',
        Valor: '',
        Tipo: 'Texto',
      },
      {
        Campo: 'brakeSystem',
        Descripción: 'Sistema de Frenos',
        Valor: '',
        Tipo: 'Enum: DISCO, TAMBOR, ABS, OTRO',
      },
      {
        Campo: 'safetyBelt3Point',
        Descripción: 'Cinturón de 3 Puntos',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'seatBeltWarning',
        Descripción: 'Alerta de Cinturón',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'preventSlipping',
        Descripción: 'Control de Tracción',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'brakeBooster',
        Descripción: 'Asistente de Frenado',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'tirePressureMonitoring',
        Descripción: 'Monitor de Presión de Llantas',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'spareTire',
        Descripción: 'Llanta de Repuesto',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'wheelMaterial',
        Descripción: 'Material de Llanta',
        Valor: '',
        Tipo: 'Enum: ACERO, ALUMINIO, CHROME',
      },
      {
        Campo: 'fullAutomaticAC',
        Descripción: 'Aire Acondicionado Automático',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'heater',
        Descripción: 'Calefacción',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'keylessEnginteStart',
        Descripción: 'Arranque sin Llave',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'keylessEntrySystem',
        Descripción: 'Entrada sin Llave',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'remoteStart',
        Descripción: 'Arranque Remoto',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'adjustableSeat',
        Descripción: 'Asientos Ajustables',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'electricDoorsWindows',
        Descripción: 'Ventanas Eléctricas',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'foldableRearViewMirror',
        Descripción: 'Espejos Retrovisores Plegables',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'antiGlareInsideRearViewMirror',
        Descripción: 'Espejo Retrovisor Anti-Reflejo',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'inermittentWindshieldWiper',
        Descripción: 'Limpiaparabrisas Intermitente',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'skyRoof',
        Descripción: 'Techo Panorámico',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'copilotHandle',
        Descripción: 'Manija de Copiloto',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'centralControlSystem',
        Descripción: 'Sistema de Control Central',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'automaticSteeringWheelReturn',
        Descripción: 'Retorno Automático del Volante',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'rotationsOfSteeringWheel',
        Descripción: 'Rotaciones del Volante',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'powerInterFace12V',
        Descripción: 'Toma de Corriente 12V',
        Valor: '',
        Tipo: 'Número',
      },
      {
        Campo: 'readingLamp',
        Descripción: 'Lámpara de Lectura',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'ledDigitalInstrument',
        Descripción: 'Instrumentos Digitales LED',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'ledHeadlamp',
        Descripción: 'Faros LED',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'ledTailight',
        Descripción: 'Luces Traseras LED',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'headLampLevelingSystem',
        Descripción: 'Sistema de Nivelación de Faros',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'daylightRunningLights',
        Descripción: 'Luces Diurnas',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'highMountedBrakeLamp',
        Descripción: 'Tercera Luz de Freno',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'autoInductionHeadlamp',
        Descripción: 'Faros con Sensor Automático',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'intelligentChargingSystem',
        Descripción: 'Sistema de Carga Inteligente',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'androidInch9',
        Descripción: 'Pantalla Android 9 pulgadas',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'intelligentVehicleNavigation',
        Descripción: 'Navegación Inteligente',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'voiceControl',
        Descripción: 'Control por Voz',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'navigationSystem',
        Descripción: 'Sistema de Navegación',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'bluetoothTelephone',
        Descripción: 'Bluetooth',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'radioMP3',
        Descripción: 'Radio MP3',
        Valor: '',
        Tipo: 'Boolean: true/false',
      },
      {
        Campo: 'loudspeaker',
        Descripción: 'Altavoces',
        Valor: '',
        Tipo: 'Número',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Técnicos');

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 30 }, // Campo
      { wch: 40 }, // Descripción
      { wch: 20 }, // Valor
      { wch: 50 }, // Tipo
    ];

    XLSX.writeFile(workbook, 'Plantilla_Datos_Tecnicos_Vehiculo.xlsx');
    message.success('Plantilla descargada exitosamente');
  };

  const handleExcelUpload = (file: any) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Procesar los datos y convertirlos al formato esperado
        const processedData: any = {};
        jsonData.forEach((row: any) => {
          const campo = row.Campo;
          let valor = row.Valor;

          // Convertir valores booleanos
          if (valor === 'true' || valor === 'TRUE' || valor === true) {
            valor = true;
          } else if (valor === 'false' || valor === 'FALSE' || valor === false) {
            valor = false;
          }

          // Convertir números
          if (valor && !isNaN(Number(valor)) && typeof valor !== 'boolean') {
            valor = Number(valor);
          }

          // Solo agregar si tiene valor
          if (valor !== '' && valor !== null && valor !== undefined) {
            processedData[campo] = valor;
          }
        });

        setExcelData(processedData);
        message.success(`Archivo procesado exitosamente. ${Object.keys(processedData).length} campos cargados.`);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        message.error('Error al procesar el archivo Excel');
      }
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevent upload
  };

  const handleSubmitVersion = async (values: any) => {
    try {
      if (!baseVehicle) return;

      if (editingVersion) {
        // Update version
        const updatePayload = {
          vehicleVersionId: editingVersion.id,
          ...values,
          ...(excelData || {}),
        };
        await vehicleService.updateVehicleVersion(updatePayload);

        // Guardar equipos adicionales (crear nuevos o actualizar existentes)
        if (additionalEquipments.length > 0) {
          for (const equipment of additionalEquipments) {
            if (equipment.id) {
              // Actualizar equipo existente
              await equipmentService.updateAdditionalEquipment(equipment.id, {
                vehicleVersionId: editingVersion.id,
                equipmentType: equipment.equipmentType,
                equipmentDescription: equipment.equipmentDescription,
                equipmentPrice: equipment.equipmentPrice,
                equipmentPriceCurrency: equipment.equipmentPriceCurrency,
              });
            } else {
              // Crear nuevo equipo
              await equipmentService.addAdditionalEquipment({
                vehicleVersionId: editingVersion.id,
                equipmentType: equipment.equipmentType,
                equipmentDescription: equipment.equipmentDescription,
                equipmentPrice: equipment.equipmentPrice,
                equipmentPriceCurrency: equipment.equipmentPriceCurrency,
              });
            }
          }
        }

        // Eliminar imágenes marcadas para eliminar
        if (imagesToDelete.length > 0) {
          for (const imageId of imagesToDelete) {
            await vehicleService.deleteVehicleImage(imageId);
          }
        }

        // Agregar nuevas imágenes si existen
        if (imageFileList.length > 0) {
          const newImages = imageFileList
            .map(file => file.originFileObj as File)
            .filter(Boolean);

          if (newImages.length > 0) {
            await vehicleService.addVehicleImages(editingVersion.id, newImages);
          }
        }

        message.success('Versión actualizada exitosamente');
      } else {
        // Add new version - Combinar datos del formulario con datos del Excel
        const versionRequest = {
          baseVehicleId: baseVehicle.id,
          ...values,
          ...(excelData || {}), // Agregar datos del Excel si existen
          vehicleImages: imageFileList.map(file => file.originFileObj as File).filter(Boolean),
        };

        await vehicleService.addVehicleVersion(versionRequest);
        message.success('Versión agregada exitosamente');
      }

      handleCloseVersionDrawer();
      if (id) {
        fetchVehicleDetails(parseInt(id));
      }
    } catch (error) {
      console.error('Error saving version:', error);
      message.error('Error al guardar la versión');
    }
  };

  const handleDeleteVersion = async (versionId: number) => {
    try {
      await vehicleService.deleteVehicleVersion(versionId);
      message.success('Versión eliminada exitosamente');
      setDeletingVersionId(null);
      if (id) {
        fetchVehicleDetails(parseInt(id));
      }
    } catch (error) {
      console.error('Error deleting version:', error);
      message.error('Error al eliminar la versión');
      setDeletingVersionId(null);
    }
  };

  const generateVersionPDF = async (version: VehicleVersion) => {
    if (!baseVehicle) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header con fondo verde
    doc.setFillColor(82, 196, 26);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Logo de la marca (si existe) - mejorado con mejor manejo de errores
    let logoAdded = false;
    const logoUrl = brand?.brandLogoUrl || brand?.brandLogo;

    if (logoUrl) {
      try {
        const logoImg = await loadImage(logoUrl);
        // Logo más grande en el header
        doc.addImage(logoImg, 'PNG', 15, 5, 25, 25);
        logoAdded = true;
      } catch (error) {
        console.error('Error loading brand logo for PDF:', error);
      }
    }

    // Título
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('FICHA TÉCNICA', logoAdded ? 48 : 20, 18);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Vehículo Eléctrico', logoAdded ? 48 : 20, 26);

    let yPosition = 42;

    // Información del vehículo con diseño mejorado
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, yPosition, pageWidth - 30, 25, 3, 3, 'F');

    doc.setFontSize(18);
    doc.setTextColor(82, 196, 26);
    doc.setFont('helvetica', 'bold');
    doc.text(`${brand?.brandName || baseVehicle.brandName || 'Sin marca'} ${baseVehicle.modelName}`, 20, yPosition + 10);

    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(version.versionName, 20, yPosition + 18);

    yPosition += 30;

    // Precio destacado en caja
    doc.setFillColor(82, 196, 26);
    doc.roundedRect(15, yPosition, 60, 18, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('PRECIO', 45, yPosition + 7, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`$${(version.originPrice || version.price || 0).toLocaleString()}`, 45, yPosition + 14, { align: 'center' });

    // Año y especificaciones básicas
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(80, yPosition, 55, 18, 3, 3, 'F');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.text('AÑO', 107.5, yPosition + 7, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`${baseVehicle.modelYear}`, 107.5, yPosition + 14, { align: 'center' });

    doc.setFillColor(240, 240, 240);
    doc.roundedRect(140, yPosition, 55, 18, 3, 3, 'F');
    doc.setFontSize(10);
    doc.text('AUTONOMÍA', 167.5, yPosition + 7, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`${version.maxDrivingRangeKm || version.range || 'N/A'} km`, 167.5, yPosition + 14, { align: 'center' });

    yPosition += 25;

    // Agregar imagen del vehículo (usar imagen de la versión si existe, si no, del base)
    const versionImageUrl = version.vehicleImages && version.vehicleImages.length > 0
      ? version.vehicleImages[0].fileURL || version.vehicleImages[0].imageUrl
      : baseVehicle.baseVehicleImageUrl || baseVehicle.imageVehicleBase;

    if (versionImageUrl) {
      try {
        const img = await loadImage(versionImageUrl);
        doc.addImage(img, 'PNG', 40, yPosition, 130, 75);
        yPosition += 85;
      } catch (error) {
        console.error('Error loading vehicle image:', error);
        yPosition += 10;
      }
    } else {
      yPosition += 10;
    }

    // Especificaciones técnicas con secciones
    doc.setFillColor(82, 196, 26);
    doc.rect(15, yPosition, 180, 8, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('ESPECIFICACIONES TÉCNICAS', 20, yPosition + 5.5);
    yPosition += 10;

    const specs = [
      ['RENDIMIENTO', '', '', ''],
      ['Autonomía máxima', version.range ? `${version.range} km` : 'N/A', 'Potencia del motor', version.motorPower ? `${version.motorPower} kW` : 'N/A'],
      ['Velocidad máxima', (version as any).maximumSpeedKmH ? `${(version as any).maximumSpeedKmH} km/h` : 'N/A', 'Torque del motor', version.torque ? `${version.torque} Nm` : 'N/A'],
      ['', '', '', ''],
      ['BATERÍA Y CARGA', '', '', ''],
      ['Capacidad batería', version.batteryCapacity ? `${version.batteryCapacity} kWh` : 'N/A', 'Tiempo de carga', version.chargingTime ? `${version.chargingTime} hrs` : 'N/A'],
      ['Voltaje de carga', (version as any).chargeVoltage === 1 ? '110V' : (version as any).chargeVoltage === 2 ? '220V' : 'N/A', 'Carga rápida', version.fastChargingTime ? `${version.fastChargingTime} hrs` : (version as any).hasFastCharge ? 'Sí' : 'N/A'],
      ['', '', '', ''],
      ['DIMENSIONES Y CAPACIDAD', '', '', ''],
      ['Número de asientos', version.seatingCapacity ? `${version.seatingCapacity}` : 'N/A', 'Número de puertas', (version as any).doorsNumber ? `${(version as any).doorsNumber}` : 'N/A'],
      ['Longitud', version.length ? `${version.length} mm` : 'N/A', 'Ancho', version.width ? `${version.width} mm` : 'N/A'],
      ['Altura', version.height ? `${version.height} mm` : 'N/A', 'Distancia entre ejes', version.wheelbase ? `${version.wheelbase} mm` : 'N/A'],
      ['Peso en vacío', version.weight ? `${version.weight} kg` : 'N/A', 'Altura al suelo', version.groundClearance ? `${version.groundClearance} mm` : 'N/A'],
      ['', '', '', ''],
      ['EQUIPAMIENTO', '', '', ''],
      ['Airbag', (version as any).airbag ? 'Sí' : 'No', 'Aire acondicionado', (version as any).fullAutomaticAC ? 'Automático' : 'N/A'],
      ['Cámara trasera', (version as any).rearViewCamera ? 'Sí' : 'N/A', 'Sensor de estacionamiento', (version as any).parkingRadar ? 'Sí' : 'N/A'],
      ['Techo panorámico', (version as any).skyRoof ? 'Sí' : 'N/A', 'Sistema de navegación', (version as any).navigationSystem ? 'Sí' : 'N/A'],
      ['Llanta de repuesto', (version as any).spareTire ? 'Sí' : 'N/A', 'Tamaño de llantas', (version as any).wheelSize || 'N/A'],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: specs,
      theme: 'plain',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50, textColor: [60, 60, 60] },
        1: { cellWidth: 40, textColor: [80, 80, 80] },
        2: { fontStyle: 'bold', cellWidth: 50, textColor: [60, 60, 60] },
        3: { cellWidth: 40, textColor: [80, 80, 80] }
      },
      styles: {
        fontSize: 9,
        cellPadding: 2,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      didParseCell: (data) => {
        // Encabezados de sección
        if (data.cell.raw === 'RENDIMIENTO' || data.cell.raw === 'BATERÍA Y CARGA' ||
            data.cell.raw === 'DIMENSIONES Y CAPACIDAD' || data.cell.raw === 'EQUIPAMIENTO') {
          data.cell.styles.fillColor = [82, 196, 26];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 10;
          data.cell.colSpan = 4;
        }
        // Filas vacías (separadores)
        if (data.cell.raw === '' && data.column.index === 0) {
          data.cell.styles.fillColor = [250, 250, 250];
        }
        // Alternar colores de fondo
        if (data.row.index % 2 === 0 && data.cell.raw !== '' &&
            data.cell.raw !== 'RENDIMIENTO' && data.cell.raw !== 'BATERÍA Y CARGA' &&
            data.cell.raw !== 'DIMENSIONES Y CAPACIDAD' && data.cell.raw !== 'EQUIPAMIENTO') {
          data.cell.styles.fillColor = [248, 248, 248];
        }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Descripción
    if (version.description) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Descripción', 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const splitText = doc.splitTextToSize(version.description, 180);
      doc.text(splitText, 14, yPosition);
    }

    // Garantía
    // if (version.warranty) {
    //   yPosition += splitText ? splitText.length * 5 + 10 : 10;
    //   if (yPosition > 250) {
    //     doc.addPage();
    //     yPosition = 20;
    //   }

    //   doc.setFontSize(12);
    //   doc.setTextColor(40, 40, 40);
    //   doc.text('Garantía', 14, yPosition);
    //   yPosition += 6;

    //   doc.setFontSize(10);
    //   doc.setTextColor(80, 80, 80);
    //   doc.text(version.warranty, 14, yPosition);
    // }

    // Footer mejorado en todas las páginas
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Línea superior del footer
      doc.setDrawColor(82, 196, 26);
      doc.setLineWidth(0.5);
      doc.line(15, 280, 195, 280);

      // Información del footer
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `${brand?.brandName || baseVehicle.brandName || 'Vehículo Eléctrico'} | Generado el ${new Date().toLocaleDateString('es-ES')}`,
        15,
        285
      );
      doc.text(
        `Página ${i} de ${pageCount}`,
        195,
        285,
        { align: 'right' }
      );

      // Marca de agua
      doc.setFontSize(7);
      doc.setTextColor(180, 180, 180);
      doc.text('Electric Cars - Movilidad Eléctrica', 105, 290, { align: 'center' });
    }

    // Descargar PDF con nombre mejorado
    const brandName = brand?.brandName || baseVehicle.brandName || 'Vehiculo';
    const fileName = `FichaTecnica_${brandName}_${baseVehicle.modelName}_${version.versionName}_${baseVehicle.modelYear}.pdf`
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_.-]/g, '');

    doc.save(fileName);
    message.success('Ficha técnica descargada exitosamente');
  };

  const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Primero intentar cargar directamente sin canvas (evita CORS)
      const img = document.createElement('img');
      img.onload = () => {
        // Si la imagen carga, intentar con canvas para convertir a base64
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Si no hay contexto, devolver la URL directamente
            resolve(url);
            return;
          }
          ctx.drawImage(img, 0, 0);
          try {
            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
          } catch (canvasError) {
            // Si hay error de CORS, usar la URL directamente
            console.warn('CORS error converting to base64, using direct URL');
            resolve(url);
          }
        } catch (error) {
          // En caso de error, usar la URL directamente
          console.warn('Error processing image, using direct URL');
          resolve(url);
        }
      };
      img.onerror = () => {
        // Si falla al cargar, rechazar
        reject(new Error(`Failed to load image: ${url}`));
      };
      // Intentar con crossOrigin primero
      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!baseVehicle) {
    return (
      <Card>
        <Empty description="Vehículo no encontrado" />
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Button onClick={() => navigate('/vehicles')}>Volver al catálogo</Button>
        </div>
      </Card>
    );
  }

  const imageUrl = baseVehicle.baseVehicleImageUrl || baseVehicle.imageVehicleBase;

  return (
    <div>
      {/* Botón de regreso */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/vehicles')}
        style={{ marginBottom: '24px' }}
      >
        Volver al catálogo
      </Button>

      {/* Información del vehículo base */}
      <Card
        variant="borderless"
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {/* Imagen del vehículo */}
          {imageUrl && (
            <div style={{ flex: '0 0 400px' }}>
              <Image
                src={imageUrl}
                alt={baseVehicle.modelName}
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
            </div>
          )}

          {/* Información principal */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                {/* Logo y marca */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  {brand?.brandLogoUrl || brand?.brandLogo ? (
                    <Avatar
                      src={brand.brandLogoUrl || brand.brandLogo}
                      size={48}
                      style={{ flexShrink: 0 }}
                    />
                  ) : (
                    <Avatar
                      size={48}
                      style={{ backgroundColor: '#f0f0f0', color: '#8c8c8c', fontSize: '20px', flexShrink: 0 }}
                    >
                      {(brand?.brandName || baseVehicle.brandName)?.charAt(0) || 'S'}
                    </Avatar>
                  )}
                  <div>
                    <Text
                      style={{
                        fontSize: '14px',
                        color: '#8c8c8c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: 500,
                        display: 'block',
                      }}
                    >
                      {brand?.brandName || baseVehicle.brandName || 'Sin marca'}
                    </Text>
                    {brand?.brandPhone && (
                      <Text style={{ fontSize: '12px', color: '#bfbfbf' }}>
                        {brand.brandPhone}
                      </Text>
                    )}
                  </div>
                </div>

                <Title level={2} style={{ margin: '8px 0 4px 0' }}>
                  {baseVehicle.modelName}
                </Title>
                <Text style={{ fontSize: '16px', color: '#595959' }}>
                  Año {baseVehicle.modelYear}
                </Text>
              </div>

              <Button
                type="text"
                icon={
                  baseVehicle.isFavorite ? (
                    <HeartFilled style={{ fontSize: '24px', color: '#ff4d4f' }} />
                  ) : (
                    <HeartOutlined style={{ fontSize: '24px', color: '#8c8c8c' }} />
                  )
                }
                onClick={handleToggleFavorite}
                style={{ padding: '4px 8px' }}
              />
            </div>

            <Divider />

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tag color="green" style={{ fontSize: '16px', padding: '8px 16px' }}>
                {versions.length} {versions.length === 1 ? 'versión disponible' : 'versiones disponibles'}
              </Tag>
              <Button
                icon={<CommentOutlined />}
                onClick={() => handleOpenCommentsModal(baseVehicle)}
                size="large"
              >
                Ver Comentarios
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Versiones */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0, color: '#1a1a1a', fontWeight: 600 }}>
            <ThunderboltFilled style={{ color: '#52c41a', marginRight: '8px' }} />
            Versiones Disponibles
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenVersionForm()}
            size="large"
          >
            Agregar Versión
          </Button>
        </div>

        {loadingVersions ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        ) : versions.length === 0 ? (
          <Card
            variant="borderless"
            style={{
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
            }}
            styles={{ body: { padding: '48px 24px' } }}
          >
            <Empty description="No hay versiones disponibles para este vehículo" />
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {versions.map((version) => (
              <Card
                key={version.id}
                variant="borderless"
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                }}
                styles={{ body: { padding: 0 } }}
              >
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  {/* Galería de imágenes */}
                  {version.vehicleImages && version.vehicleImages.length > 0 && (
                    <div style={{ flex: '0 0 300px', padding: '24px' }}>
                      <Image.PreviewGroup>
                        <Image
                          src={version.vehicleImages[0].fileURL || version.vehicleImages[0].imageUrl}
                          alt={version.versionName}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                        />
                        {version.vehicleImages.length > 1 && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
                            {version.vehicleImages.slice(1, 4).map((img) => (
                              <Image
                                key={img.id}
                                src={img.fileURL || img.imageUrl}
                                style={{
                                  width: '100%',
                                  height: '60px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                }}
                              />
                            ))}
                          </div>
                        )}
                        {/* Imágenes ocultas para el preview */}
                        {version.vehicleImages.length > 4 && (
                          <div style={{ display: 'none' }}>
                            {version.vehicleImages.slice(4).map((img) => (
                              <Image key={img.id} src={img.fileURL || img.imageUrl} />
                            ))}
                          </div>
                        )}
                      </Image.PreviewGroup>
                      {version.vehicleImages.length > 4 && (
                        <Text
                          type="secondary"
                          style={{
                            fontSize: '12px',
                            display: 'block',
                            textAlign: 'center',
                            marginTop: '8px',
                          }}
                        >
                          +{version.vehicleImages.length - 4} imágenes más
                        </Text>
                      )}
                    </div>
                  )}

                  {/* Información de la versión */}
                  <div style={{ flex: 1, padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        {/* Marca */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          {brand?.brandLogoUrl || brand?.brandLogo ? (
                            <Avatar
                              src={brand.brandLogoUrl || brand.brandLogo}
                              size={24}
                              style={{ flexShrink: 0 }}
                            />
                          ) : (
                            <Avatar
                              size={24}
                              style={{ backgroundColor: '#f0f0f0', color: '#8c8c8c', fontSize: '12px', flexShrink: 0 }}
                            >
                              {(brand?.brandName || baseVehicle.brandName)?.charAt(0) || 'S'}
                            </Avatar>
                          )}
                          <Text
                            style={{
                              fontSize: '12px',
                              color: '#8c8c8c',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              fontWeight: 500,
                            }}
                          >
                            {brand?.brandName || baseVehicle.brandName || 'Sin marca'} - {baseVehicle.modelName}
                          </Text>
                        </div>

                        <Title level={4} style={{ margin: '0 0 8px 0' }}>
                          {version.versionName}
                        </Title>
                        <Tag color="green" style={{ fontSize: '16px', padding: '6px 16px' }}>
                          ${(version.originPrice || version.price || 0).toLocaleString()}
                        </Tag>
                      </div>
                      <Space wrap>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => handleOpenVersionForm(version)}
                        >
                          Editar
                        </Button>
                        {deletingVersionId === version.id ? (
                          <Space>
                            <Text type="secondary" style={{ fontSize: '12px' }}>¿Eliminar?</Text>
                            <Button
                              size="small"
                              type="primary"
                              danger
                              onClick={() => handleDeleteVersion(version.id)}
                            >
                              Sí
                            </Button>
                            <Button
                              size="small"
                              onClick={() => setDeletingVersionId(null)}
                            >
                              No
                            </Button>
                          </Space>
                        ) : (
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => setDeletingVersionId(version.id)}
                          >
                            Eliminar
                          </Button>
                        )}
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={() => generateVersionPDF(version)}
                        >
                          Descargar Ficha
                        </Button>
                      </Space>
                    </div>

                    {version.description && (
                      <Paragraph
                        style={{
                          background: '#f5f5f5',
                          padding: '12px',
                          borderRadius: '6px',
                          marginBottom: '16px',
                          color: '#595959',
                        }}
                      >
                        {version.description}
                      </Paragraph>
                    )}

                    <Descriptions column={2} size="small" bordered>
                      <Descriptions.Item label="Autonomía Máxima" span={1}>
                        {version.range ? `${version.range} km` : 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Potencia del Motor" span={1}>
                        {version.motorPower ? `${version.motorPower} kW` : 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Capacidad de Batería" span={1}>
                        {version.batteryCapacity ? `${version.batteryCapacity} kWh` : 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Velocidad Máxima" span={1}>
                        {(version as any).maximumSpeedKmH ? `${(version as any).maximumSpeedKmH} km/h` : 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Torque del Motor" span={1}>
                        {version.torque ? `${version.torque} Nm` : 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tiempo de Carga" span={1}>
                        {version.chargingTime ? `${version.chargingTime} hrs` : 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Número de Asientos" span={1}>
                        {version.seatingCapacity ? `${version.seatingCapacity}` : 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Número de Puertas" span={1}>
                        {(version as any).doorsNumber ? `${(version as any).doorsNumber}` : 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tamaño de Llanta" span={1}>
                        {(version as any).wheelSize || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Airbag" span={1}>
                        {(version as any).airbag ? 'Sí' : 'No'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Cámara Trasera" span={1}>
                        {(version as any).rearViewCamera ? 'Sí' : 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Sensor de Estacionamiento" span={1}>
                        {(version as any).parkingRadar ? 'Sí' : 'N/A'}
                      </Descriptions.Item>
                    </Descriptions>

                    {/* Equipamiento Adicional */}
                    {version.additionalEquipments && version.additionalEquipments.length > 0 && (
                      <>
                        <Divider orientation="left">Equipamiento Adicional</Divider>
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                          {version.additionalEquipments.map((equipment) => (
                            <Card key={equipment.id} size="small" style={{ backgroundColor: '#fafafa' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <Text strong>
                                    {(() => {
                                      const types: { [key: string]: string } = {
                                        '0': 'Otros',
                                        '1': 'Bolsa de Aire',
                                        '2': 'Aire Acondicionado',
                                        '3': 'Quemacocos',
                                        '4': 'Panel Solar',
                                        '5': 'Media',
                                        '6': 'Pantalla',
                                        '7': 'Cámaras',
                                        '8': 'Sensores',
                                        '9': 'Asistencia de Manejo',
                                        OTROS: 'Otros',
                                        BOLSA_DE_AIRE: 'Bolsa de Aire',
                                        AIRE_ACONDICIONADO: 'Aire Acondicionado',
                                        QUEMACOCOS: 'Quemacocos',
                                        PANEL_SOLAR: 'Panel Solar',
                                        MEDIA: 'Media',
                                        PANTALLA: 'Pantalla',
                                        CAMARAS: 'Cámaras',
                                        SENSORES: 'Sensores',
                                        ASISTENCIA_MANEJO: 'Asistencia de Manejo',
                                      };
                                      return types[equipment.equipmentType] || equipment.equipmentType;
                                    })()}
                                  </Text>
                                  <br />
                                  <Text type="secondary">{equipment.equipmentDescription}</Text>
                                  <br />
                                  <Tag color="green">
                                    {(() => {
                                      const currencyMap: { [key: string]: string } = {
                                        '1': 'MXN',
                                        '2': 'USD',
                                        '3': 'CNY',
                                        '4': 'JPY',
                                        '5': 'EUR',
                                        '6': 'CAD',
                                        '7': 'RUB',
                                      };
                                      const currency = currencyMap[equipment.equipmentPriceCurrency] || equipment.equipmentPriceCurrency;
                                      return `${currency} $${equipment.equipmentPrice?.toLocaleString() || 0}`;
                                    })()}
                                  </Tag>
                                </div>
                                <Space>
                                  <Button
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    danger
                                    onClick={async () => {
                                      try {
                                        await equipmentService.deleteAdditionalEquipment(equipment.id);
                                        message.success('Equipamiento eliminado');
                                        if (id) fetchVehicleDetails(parseInt(id));
                                      } catch (error) {
                                        message.error('Error al eliminar equipamiento');
                                      }
                                    }}
                                  >
                                    Eliminar
                                  </Button>
                                </Space>
                              </div>
                            </Card>
                          ))}
                        </Space>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Drawer para agregar/editar versión */}
      <Drawer
        title={editingVersion ? 'Editar Versión' : 'Agregar Nueva Versión'}
        open={isVersionDrawerOpen}
        onClose={handleCloseVersionDrawer}
        width={720}
        extra={
          <Space>
            <Button onClick={handleCloseVersionDrawer}>Cancelar</Button>
            <Button type="primary" onClick={() => form.submit()}>
              {editingVersion ? 'Guardar Cambios' : 'Agregar Versión'}
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitVersion}
        >
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: 'Información Básica',
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Form.Item
                      name="versionName"
                      label="Nombre de la Versión"
                      rules={[{ required: true, message: 'Por favor ingrese el nombre de la versión' }]}
                    >
                      <Input placeholder="Ej: Premium, Standard, Sport" />
                    </Form.Item>

                    <Form.Item name="originPrice" label="Precio Original">
                      <InputNumber
                        placeholder="0.00"
                        style={{ width: '100%' }}
                        min={0}
                        formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      />
                    </Form.Item>

                    <Form.Item name="originCurrency" label="Moneda">
                      <Select placeholder="Seleccione la moneda">
                        <Select.Option value="MXN">MXN</Select.Option>
                        <Select.Option value="USD">USD</Select.Option>
                        <Select.Option value="CNY">CNY</Select.Option>
                        <Select.Option value="JPY">JPY</Select.Option>
                        <Select.Option value="EUR">EUR</Select.Option>
                        <Select.Option value="CAD">CAD</Select.Option>
                        <Select.Option value="RUB">RUB</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item name="discountPrice" label="Precio con Descuento">
                      <InputNumber
                        placeholder="0.00"
                        style={{ width: '100%' }}
                        min={0}
                        formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      />
                    </Form.Item>

                    <Form.Item name="maxDrivingRangeKm" label="Autonomía Máxima (km)">
                      <InputNumber placeholder="0" style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item name="motorPowerkw" label="Potencia del Motor (kW)">
                      <InputNumber placeholder="0" style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item name="batteryCapacityKwh" label="Capacidad de Batería (kWh)">
                      <InputNumber placeholder="0" style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item name="maximumSpeedKmH" label="Velocidad Máxima (km/h)">
                      <InputNumber placeholder="0" style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item name="motorTorqueNm" label="Torque del Motor (Nm)">
                      <InputNumber placeholder="0" style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item name="chargeTimeHrs" label="Tiempo de Carga (horas)">
                      <InputNumber placeholder="0" style={{ width: '100%' }} min={0} step={0.5} />
                    </Form.Item>

                    <Form.Item name="seatsNumber" label="Número de Asientos">
                      <InputNumber placeholder="0" style={{ width: '100%' }} min={1} max={10} />
                    </Form.Item>

                    <Form.Item name="doorsNumber" label="Número de Puertas">
                      <InputNumber placeholder="0" style={{ width: '100%' }} min={2} max={6} />
                    </Form.Item>

                    <Form.Item name="wheelSize" label="Tamaño de Llanta">
                      <Input placeholder="Ej: 18 pulgadas" />
                    </Form.Item>

                    <Form.Item name="airbag" label="Airbag" valuePropName="checked">
                      <Switch />
                    </Form.Item>

                    <Form.Item name="rearViewCamera" label="Cámara Trasera" valuePropName="checked">
                      <Switch />
                    </Form.Item>

                    <Form.Item name="parkingRadar" label="Sensor de Estacionamiento" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Space>
                ),
              },
              {
                key: '2',
                label: 'Datos Completos (Excel)',
                children: (
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Alert
                      message="Información"
                      description="Puede cargar un archivo Excel con todos los datos técnicos de la versión. Los campos incluyen dimensiones, motor, batería, seguridad, confort y equipamiento tecnológico."
                      type="info"
                      showIcon
                    />

                    <Form.Item label="Archivo Excel con Datos Técnicos">
                      <Upload
                        accept=".xlsx,.xls"
                        maxCount={1}
                        beforeUpload={handleExcelUpload}
                        fileList={excelData ? [{
                          uid: '-1',
                          name: 'Datos técnicos cargados',
                          status: 'done',
                          url: '',
                        }] : []}
                        onRemove={() => {
                          setExcelData(null);
                          message.info('Datos del Excel eliminados');
                        }}
                      >
                        <Button icon={<UploadOutlined />} block disabled={!!excelData}>
                          {excelData ? 'Archivo Cargado' : 'Seleccionar Archivo Excel'}
                        </Button>
                      </Upload>
                      {excelData && (
                        <Alert
                          message={`${Object.keys(excelData).length} campos cargados desde Excel`}
                          type="success"
                          style={{ marginTop: 8 }}
                          closable
                        />
                      )}
                      <Typography.Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                        Descargue la plantilla Excel para llenar los datos correctamente
                      </Typography.Text>
                      <Button type="link" style={{ paddingLeft: 0 }} onClick={downloadExcelTemplate}>
                        Descargar Plantilla Excel
                      </Button>
                    </Form.Item>

                    {editingVersion && (
                      <>
                        <Divider />

                        <Form.Item label="Equipamiento Adicional">
                          <Button
                            type="dashed"
                            onClick={() => setIsEquipmentModalOpen(true)}
                            icon={<PlusOutlined />}
                            block
                          >
                            Agregar Equipamiento
                          </Button>
                          {additionalEquipments.length > 0 && (
                            <Table
                              dataSource={additionalEquipments}
                              rowKey={(record) => record.id ? `equipment-${record.id}` : `new-equipment-${Math.random()}`}
                              columns={[
                                {
                                  title: 'Tipo',
                                  dataIndex: 'equipmentType',
                                  key: 'equipmentType',
                                  render: (value) => {
                                    const types: { [key: string]: string } = {
                                      '0': 'Otros',
                                      '1': 'Bolsa de Aire',
                                      '2': 'Aire Acondicionado',
                                      '3': 'Quemacocos',
                                      '4': 'Panel Solar',
                                      '5': 'Media',
                                      '6': 'Pantalla',
                                      '7': 'Cámaras',
                                      '8': 'Sensores',
                                      '9': 'Asistencia de Manejo',
                                      OTROS: 'Otros',
                                      BOLSA_DE_AIRE: 'Bolsa de Aire',
                                      AIRE_ACONDICIONADO: 'Aire Acondicionado',
                                      QUEMACOCOS: 'Quemacocos',
                                      PANEL_SOLAR: 'Panel Solar',
                                      MEDIA: 'Media',
                                      PANTALLA: 'Pantalla',
                                      CAMARAS: 'Cámaras',
                                      SENSORES: 'Sensores',
                                      ASISTENCIA_MANEJO: 'Asistencia de Manejo',
                                    };
                                    return types[value] || value;
                                  },
                                },
                                {
                                  title: 'Descripción',
                                  dataIndex: 'equipmentDescription',
                                  key: 'equipmentDescription',
                                },
                                {
                                  title: 'Precio',
                                  dataIndex: 'equipmentPrice',
                                  key: 'equipmentPrice',
                                  render: (value, record) => {
                                    // Mapear moneda de número a string si es necesario
                                    const currencyMap: { [key: string]: string } = {
                                      '1': 'MXN',
                                      '2': 'USD',
                                      '3': 'CNY',
                                      '4': 'JPY',
                                      '5': 'EUR',
                                      '6': 'CAD',
                                      '7': 'RUB',
                                    };
                                    const currency = currencyMap[record.equipmentPriceCurrency] || record.equipmentPriceCurrency;
                                    return `${currency} $${value?.toLocaleString() || 0}`;
                                  },
                                },
                                {
                                  title: 'Acciones',
                                  key: 'actions',
                                  render: (_, __, index) => (
                                    <Space size="small">
                                      <Button
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => handleEditEquipment(index)}
                                      >
                                        Editar
                                      </Button>
                                      {deletingEquipmentIndex === index ? (
                                        <Space size="small">
                                          <Text type="secondary" style={{ fontSize: '11px' }}>¿Eliminar?</Text>
                                          <Button
                                            size="small"
                                            type="primary"
                                            danger
                                            onClick={() => handleRemoveEquipment(index)}
                                          >
                                            Sí
                                          </Button>
                                          <Button
                                            size="small"
                                            onClick={() => setDeletingEquipmentIndex(null)}
                                          >
                                            No
                                          </Button>
                                        </Space>
                                      ) : (
                                        <Button
                                          danger
                                          size="small"
                                          icon={<MinusCircleOutlined />}
                                          onClick={() => setDeletingEquipmentIndex(index)}
                                        >
                                          Eliminar
                                        </Button>
                                      )}
                                    </Space>
                                  ),
                                },
                              ]}
                              pagination={false}
                              size="small"
                              style={{ marginTop: 16 }}
                            />
                          )}
                        </Form.Item>
                      </>
                    )}
                  </Space>
                ),
              },
              {
                key: '3',
                label: 'Imágenes',
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {editingVersion && existingImages.length > 0 && (
                      <div>
                        <Text strong>Imágenes Existentes:</Text>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                          {existingImages.map((img) => (
                            <div key={img.id} style={{ position: 'relative' }}>
                              <Image
                                width={100}
                                height={100}
                                src={img.fileURL || img.imageUrl}
                                style={{ objectFit: 'cover', borderRadius: '4px' }}
                              />
                              <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                }}
                                onClick={() => handleDeleteExistingImage(img.id)}
                              />
                            </div>
                          ))}
                        </div>
                        <Divider />
                      </div>
                    )}
                    <Form.Item label={editingVersion ? "Agregar Nuevas Imágenes" : "Imágenes del Vehículo"}>
                      <Upload
                        listType="picture-card"
                        fileList={imageFileList}
                        onChange={({ fileList }) => setImageFileList(fileList)}
                        beforeUpload={() => false}
                        multiple
                      >
                        {imageFileList.length >= 8 ? null : (
                          <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Subir</div>
                          </div>
                        )}
                      </Upload>
                    </Form.Item>
                  </Space>
                ),
              },
            ]}
          />
        </Form>
      </Drawer>

      {/* Modal para agregar/editar equipamiento adicional */}
      <Modal
        title={editingEquipment ? "Editar Equipamiento Adicional" : "Agregar Equipamiento Adicional"}
        open={isEquipmentModalOpen}
        onOk={handleAddEquipment}
        onCancel={() => {
          equipmentForm.resetFields();
          setEditingEquipment(null);
          setIsEquipmentModalOpen(false);
        }}
        okText={editingEquipment ? "Guardar" : "Agregar"}
        cancelText="Cancelar"
      >
        <Form form={equipmentForm} layout="vertical">
          <Form.Item
            name="equipmentType"
            label="Tipo de Equipamiento"
            rules={[{ required: true, message: 'Seleccione el tipo' }]}
          >
            <Select placeholder="Seleccione el tipo">
              <Select.Option value="0">Otros</Select.Option>
              <Select.Option value="1">Bolsa de Aire</Select.Option>
              <Select.Option value="2">Aire Acondicionado</Select.Option>
              <Select.Option value="3">Quemacocos</Select.Option>
              <Select.Option value="4">Panel Solar</Select.Option>
              <Select.Option value="5">Media</Select.Option>
              <Select.Option value="6">Pantalla</Select.Option>
              <Select.Option value="7">Cámaras</Select.Option>
              <Select.Option value="8">Sensores</Select.Option>
              <Select.Option value="9">Asistencia de Manejo</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="equipmentDescription"
            label="Descripción"
            rules={[{ required: true, message: 'Ingrese la descripción' }]}
          >
            <Input.TextArea rows={3} placeholder="Descripción del equipamiento" />
          </Form.Item>

          <Form.Item
            name="equipmentPrice"
            label="Precio"
            rules={[{ required: true, message: 'Ingrese el precio' }]}
          >
            <InputNumber
              placeholder="0.00"
              style={{ width: '100%' }}
              min={0}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item
            name="equipmentPriceCurrency"
            label="Moneda"
            rules={[{ required: true, message: 'Seleccione la moneda' }]}
          >
            <Select placeholder="Seleccione la moneda">
              <Select.Option value="MXN">MXN</Select.Option>
              <Select.Option value="USD">USD</Select.Option>
              <Select.Option value="CNY">CNY</Select.Option>
              <Select.Option value="JPY">JPY</Select.Option>
              <Select.Option value="EUR">EUR</Select.Option>
              <Select.Option value="CAD">CAD</Select.Option>
              <Select.Option value="RUB">RUB</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para comentarios */}
      <Modal
        title={`Comentarios - ${selectedVehicleForComments?.modelName || ''} ${selectedVehicleForComments?.modelYear || ''}`}
        open={isCommentsModalOpen}
        onCancel={handleCloseCommentsModal}
        width={800}
        footer={null}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Formulario para agregar/editar comentario */}
          <Card size="small" title={editingComment ? "Editar Comentario" : "Agregar Comentario"}>
            <Form
              form={commentForm}
              layout="vertical"
              onFinish={handleAddComment}
            >
              <Form.Item
                name="title"
                label="Título"
                rules={[{ required: true, message: 'Por favor ingrese un título' }]}
              >
                <Input placeholder="Título del comentario" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Descripción"
                rules={[{ required: true, message: 'Por favor ingrese una descripción' }]}
              >
                <Input.TextArea rows={6} placeholder="Escribe tu comentario aquí..." />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editingComment ? 'Actualizar' : 'Publicar'}
                  </Button>
                  {editingComment && (
                    <Button onClick={() => {
                      setEditingComment(null);
                      commentForm.resetFields();
                    }}>
                      Cancelar
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>

          {/* Lista de comentarios */}
          <Divider>Comentarios ({Array.isArray(comments) ? comments.length : 0})</Divider>

          <Spin spinning={loadingComments}>
            {!Array.isArray(comments) || comments.length === 0 ? (
              <Empty description="No hay comentarios aún" />
            ) : (
              <List
                dataSource={comments}
                renderItem={(comment) => (
                  <Card
                    key={comment.id}
                    size="small"
                    style={{ marginBottom: '16px' }}
                    extra={
                      deletingCommentId === comment.id ? (
                        <Space>
                          <Text type="secondary" style={{ fontSize: '12px' }}>¿Eliminar?</Text>
                          <Button
                            size="small"
                            type="primary"
                            danger
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            Sí
                          </Button>
                          <Button
                            size="small"
                            onClick={() => setDeletingCommentId(null)}
                          >
                            No
                          </Button>
                        </Space>
                      ) : (
                        <Space>
                          <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditComment(comment)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => setDeletingCommentId(comment.id)}
                          >
                            Eliminar
                          </Button>
                        </Space>
                      )
                    }
                  >
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong style={{ fontSize: '16px' }}>{comment.title}</Text>
                    </div>
                    {comment.createdAt && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {new Date(comment.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    )}
                    <Paragraph style={{ marginTop: '12px', marginBottom: 0 }}>
                      {comment.description}
                    </Paragraph>
                  </Card>
                )}
              />
            )}
          </Spin>
        </Space>
      </Modal>
    </div>
  );
};

export default VehicleDetailPage;
