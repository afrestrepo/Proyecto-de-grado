"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

interface Asset {
  id: string;
  name: string;
  description: string;
  dispositivos: {
    computador_escritorio: boolean;
    laptop: boolean;
    celular_convencional: boolean;
    celular_inteligente: boolean;
    telefono_fijo: boolean;
    captura_dmc: boolean;
    datafono: boolean;
    radiotelefono: boolean;
    lector_codigos: boolean;
    agenda_personal: boolean;
    wearables: boolean;
    dispositivos_red: boolean;
  };
  software: {
    general: {
      navegador_internet: boolean;
      sistema_operativo: boolean;
      sistema_operativo_movil: boolean;
      administrador_correo_elec: boolean;
      software_ofimatico: boolean;
      antivirus: boolean;
      servidor_web: boolean;
      gestion_operacion: boolean;
      base_datos: boolean;
      seguridad: boolean;
      gestion_red: boolean;
      cuales_aplicaciones: string[];
    };
    especifico: {
      erp: boolean;
      crm: boolean;
      cuales_aplicaciones: string[];
    };
  };
  servicios_web: {
    servicios_web_clientes: string[];
    servicios_web_operacion: string[];
  };
  acceso_personas: {
    apps_servicios_internet: boolean;
    admin_dispositivos: boolean;
    admin_redes_servidores: boolean;
    admin_apps: boolean;
    admin_servicio_web: boolean;
  };
  informacion_clientes: {
    personal: {
      nombre: boolean;
      identificacion: boolean;
      direccion: boolean;
      telefono: boolean;
    };
    general: {
      id_req_compra: boolean;
      id_recibo_pago: boolean;
    };
  };
  datos_corporativos: {
    nombre: boolean;
    nit: boolean;
    direccion: boolean;
    telefono: boolean;
    redes_sociales: boolean;
    medios_comunicacion: boolean;
  };
  datos_empleados: {
    nombre: boolean;
    nit: boolean;
    direccion: boolean;
    telefono: boolean;
    redes_sociales: boolean;
    medios_comunicacion: boolean;
  };
  vulnerableThreats: Array<{
    threatId: string;
    threatMongoId: string;
    affectedFields: Record<string, any>;
    description?: string;
  }>;
  vulnerabilities?: Array<{
    _id: string;
    cveId?: string;
    metrics?: any;
    problemTypes?: any;
    lastUpdatedDate?: Date;
  }>;
  commonVulnerabilities?: Array<{
    _id: string;
    cveId?: string;
    metrics?: any;
    problemTypes?: any;
    lastUpdatedDate?: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function IdentificacionPage({
  params,
}: {
  params: Promise<{ evaluationId: string }>;
}) {
  const [evaluationId, setEvaluationId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<Asset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assetWithThreats, setAssetWithThreats] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    params.then((p) => setEvaluationId(p.evaluationId));
  }, [params]);

  const BACKEND_URL = "http://127.0.0.1:5000";

  const downloadTemplate = () => {
  // Array de objetos con dos columnas: Campo y Valor
  const templateData = [
    // Información básica
    { Campo: "ID", Valor: "empresa-001" },
    { Campo: "Nombre", Valor: "TechSoluciones S.A." },
    { Campo: "Descripción", Valor: "Empresa de desarrollo de software con enfoque en soluciones empresariales." },

    // Dispositivos
    { Campo: "Dispositivos: Computador de escritorio", Valor: "Sí/No" },
    { Campo: "Dispositivos: Laptop", Valor: "Sí/No" },
    { Campo: "Dispositivos: Celular convencional", Valor: "Sí/No" },
    { Campo: "Dispositivos: Celular inteligente", Valor: "Sí/No" },
    { Campo: "Dispositivos: Teléfono fijo", Valor: "Sí/No" },
    { Campo: "Dispositivos: Captura DMC", Valor: "Sí/No" },
    { Campo: "Dispositivos: Datafono", Valor: "Sí/No" },
    { Campo: "Dispositivos: Radioteléfono", Valor: "Sí/No" },
    { Campo: "Dispositivos: Lector de códigos", Valor: "Sí/No" },
    { Campo: "Dispositivos: Agenda personal", Valor: "Sí/No" },
    { Campo: "Dispositivos: Wearables", Valor: "Sí/No" },
    { Campo: "Dispositivos: Dispositivos de red", Valor: "Sí/No" },

    // Software General
    { Campo: "Software General: Navegador de internet", Valor: "Sí/No" },
    { Campo: "Software General: Sistema operativo", Valor: "Sí/No" },
    { Campo: "Software General: Sistema operativo móvil", Valor: "Sí/No" },
    { Campo: "Software General: Administrador de correo electrónico", Valor: "Sí/No" },
    { Campo: "Software General: Software ofimático", Valor: "Sí/No" },
    { Campo: "Software General: Antivirus", Valor: "Sí/No" },
    { Campo: "Software General: Servidor web", Valor: "Sí/No" },
    { Campo: "Software General: Gestión de operación", Valor: "Sí/No" },
    { Campo: "Software General: Base de datos", Valor: "Sí/No" },
    { Campo: "Software General: Seguridad", Valor: "Sí/No" },
    { Campo: "Software General: Gestión de red", Valor: "Sí/No" },
    { Campo: "Software General: Cuáles aplicaciones", Valor: "ej.: Microsoft Office, Google Chrome" },

    // Software Específico
    { Campo: "Software Específico: ERP", Valor: "Sí/No" },
    { Campo: "Software Específico: CRM", Valor: "Sí/No" },
    { Campo: "Software Específico: Cuáles aplicaciones", Valor: "ej.:  SAP, Salesforce" },

    // Servicios Web
    { Campo: "Servicios Web: Servicios web para clientes", Valor: "ej.:  Google Analytics, HubSpot" },
    { Campo: "Servicios Web: Servicios web para operación", Valor: "ej.:  Slack, Trello" },

    // Acceso de Personas
    { Campo: "Acceso de Personas: Apps/Servicios de internet", Valor: "Sí/No" },
    { Campo: "Acceso de Personas: Admin de dispositivos", Valor: "Sí/No" },
    { Campo: "Acceso de Personas: Admin de redes/servidores", Valor: "Sí/No" },
    { Campo: "Acceso de Personas: Admin de apps", Valor: "Sí/No" },
    { Campo: "Acceso de Personas: Admin de servicio web", Valor: "Sí/No" },

    // Información de Clientes
    { Campo: "Información de Clientes: Personal - Nombre", Valor: "Sí/No" },
    { Campo: "Información de Clientes: Personal - Identificación", Valor: "Sí/No" },
    { Campo: "Información de Clientes: Personal - Dirección", Valor: "Sí/No" },
    { Campo: "Información de Clientes: Personal - Teléfono", Valor: "Sí/No" },
    { Campo: "Información de Clientes: General - ID requisición de compra", Valor: "Sí/No" },
    { Campo: "Información de Clientes: General - ID recibo de pago", Valor: "Sí/No" },

    // Datos Corporativos
    { Campo: "Datos Corporativos: Nombre", Valor: "Sí/No" },
    { Campo: "Datos Corporativos: NIT", Valor: "Sí/No" },
    { Campo: "Datos Corporativos: Dirección", Valor: "Sí/No" },
    { Campo: "Datos Corporativos: Teléfono", Valor: "Sí/No" },
    { Campo: "Datos Corporativos: Redes sociales", Valor: "Sí/No" },
    { Campo: "Datos Corporativos: Medios de comunicación", Valor: "Sí/No" },

    // Datos Empleados
    { Campo: "Datos Empleados: Nombre", Valor: "Sí/No" },
    { Campo: "Datos Empleados: NIT", Valor: "Sí/No" },
    { Campo: "Datos Empleados: Dirección", Valor: "Sí/No" },
    { Campo: "Datos Empleados: Teléfono", Valor: "Sí/No" },
    { Campo: "Datos Empleados: Redes sociales", Valor: "Sí/No" },
    { Campo: "Datos Empleados: Medios de comunicación", Valor: "Sí/No" },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");

  XLSX.writeFile(wb, "template_identificacion.xlsx");
};
// awadfsadas
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

const processFile = () => {
  if (!file) {
    setError("Por favor, selecciona un archivo Excel.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(firstSheet);

      if (json.length === 0) {
        setError("El archivo Excel está vacío.");
        return;
      }

      const flatData: Record<string, string> = {};
      json.forEach((row: any) => {
        flatData[row.Campo] = row.Valor;
      });

      const processedData = processExcelData(flatData);
      setJsonData(processedData);
      setAssetWithThreats(null);
      setError(null);
    } catch (err) {
      setError("Error al procesar el archivo Excel.");
    }
  };
  reader.readAsArrayBuffer(file);
};

const processExcelData = (excelRow: any): Asset => {
    return {
      id: excelRow["ID"] || "",
      name: excelRow["Nombre"] || "",
      description: excelRow["Descripción"] || "",

      dispositivos: {
        computador_escritorio: excelRow["Dispositivos: Computador de escritorio"]?.toLowerCase() === "sí",
        laptop: excelRow["Dispositivos: Laptop"]?.toLowerCase() === "sí",
        celular_convencional: excelRow["Dispositivos: Celular convencional"]?.toLowerCase() === "sí",
        celular_inteligente: excelRow["Dispositivos: Celular inteligente"]?.toLowerCase() === "sí",
        telefono_fijo: excelRow["Dispositivos: Teléfono fijo"]?.toLowerCase() === "sí",
        captura_dmc: excelRow["Dispositivos: Captura DMC"]?.toLowerCase() === "sí",
        datafono: excelRow["Dispositivos: Datafono"]?.toLowerCase() === "sí",
        radiotelefono: excelRow["Dispositivos: Radioteléfono"]?.toLowerCase() === "sí",
        lector_codigos: excelRow["Dispositivos: Lector de códigos"]?.toLowerCase() === "sí",
        agenda_personal: excelRow["Dispositivos: Agenda personal"]?.toLowerCase() === "sí",
        wearables: excelRow["Dispositivos: Wearables"]?.toLowerCase() === "sí",
        dispositivos_red: excelRow["Dispositivos: Dispositivos de red"]?.toLowerCase() === "sí",
      },

      software: {
        general: {
          navegador_internet: excelRow["Software General: Navegador de internet"]?.toLowerCase() === "sí",
          sistema_operativo: excelRow["Software General: Sistema operativo"]?.toLowerCase() === "sí",
          sistema_operativo_movil: excelRow["Software General: Sistema operativo móvil"]?.toLowerCase() === "sí",
          administrador_correo_elec: excelRow["Software General: Administrador de correo electrónico"]?.toLowerCase() === "sí",
          software_ofimatico: excelRow["Software General: Software ofimático"]?.toLowerCase() === "sí",
          antivirus: excelRow["Software General: Antivirus"]?.toLowerCase() === "sí",
          servidor_web: excelRow["Software General: Servidor web"]?.toLowerCase() === "sí",
          gestion_operacion: excelRow["Software General: Gestión de operación"]?.toLowerCase() === "sí",
          base_datos: excelRow["Software General: Base de datos"]?.toLowerCase() === "sí",
          seguridad: excelRow["Software General: Seguridad"]?.toLowerCase() === "sí",
          gestion_red: excelRow["Software General: Gestión de red"]?.toLowerCase() === "sí",
          cuales_aplicaciones: excelRow["Software General: Cuáles aplicaciones"]
            ? excelRow["Software General: Cuáles aplicaciones"].split(", ").map((app: string) => app.trim())
            : [],
        },
        especifico: {
          erp: excelRow["Software Específico: ERP"]?.toLowerCase() === "sí",
          crm: excelRow["Software Específico: CRM"]?.toLowerCase() === "sí",
          cuales_aplicaciones: excelRow["Software Específico: Cuáles aplicaciones"]
            ? excelRow["Software Específico: Cuáles aplicaciones"].split(", ").map((app: string) => app.trim())
            : [],
        },
      },

      servicios_web: {
        servicios_web_clientes: excelRow["Servicios Web: Servicios web para clientes"]
          ? excelRow["Servicios Web: Servicios web para clientes"].split(", ").map((service: string) => service.trim())
          : [],
        servicios_web_operacion: excelRow["Servicios Web: Servicios web para operación"]
          ? excelRow["Servicios Web: Servicios web para operación"].split(", ").map((service: string) => service.trim())
          : [],
      },

      acceso_personas: {
        apps_servicios_internet: excelRow["Acceso de Personas: Apps/Servicios de internet"]?.toLowerCase() === "sí",
        admin_dispositivos: excelRow["Acceso de Personas: Admin de dispositivos"]?.toLowerCase() === "sí",
        admin_redes_servidores: excelRow["Acceso de Personas: Admin de redes/servidores"]?.toLowerCase() === "sí",
        admin_apps: excelRow["Acceso de Personas: Admin de apps"]?.toLowerCase() === "sí",
        admin_servicio_web: excelRow["Acceso de Personas: Admin de servicio web"]?.toLowerCase() === "sí",
      },

      informacion_clientes: {
        personal: {
          nombre: excelRow["Información de Clientes: Personal - Nombre"]?.toLowerCase() === "sí",
          identificacion: excelRow["Información de Clientes: Personal - Identificación"]?.toLowerCase() === "sí",
          direccion: excelRow["Información de Clientes: Personal - Dirección"]?.toLowerCase() === "sí",
          telefono: excelRow["Información de Clientes: Personal - Teléfono"]?.toLowerCase() === "sí",
        },
        general: {
          id_req_compra: excelRow["Información de Clientes: General - ID requisición de compra"]?.toLowerCase() === "sí",
          id_recibo_pago: excelRow["Información de Clientes: General - ID recibo de pago"]?.toLowerCase() === "sí",
        },
      },

      datos_corporativos: {
        nombre: excelRow["Datos Corporativos: Nombre"]?.toLowerCase() === "sí",
        nit: excelRow["Datos Corporativos: NIT"]?.toLowerCase() === "sí",
        direccion: excelRow["Datos Corporativos: Dirección"]?.toLowerCase() === "sí",
        telefono: excelRow["Datos Corporativos: Teléfono"]?.toLowerCase() === "sí",
        redes_sociales: excelRow["Datos Corporativos: Redes sociales"]?.toLowerCase() === "sí",
        medios_comunicacion: excelRow["Datos Corporativos: Medios de comunicación"]?.toLowerCase() === "sí",
      },

      datos_empleados: {
        nombre: excelRow["Datos Empleados: Nombre"]?.toLowerCase() === "sí",
        nit: excelRow["Datos Empleados: NIT"]?.toLowerCase() === "sí",
        direccion: excelRow["Datos Empleados: Dirección"]?.toLowerCase() === "sí",
        telefono: excelRow["Datos Empleados: Teléfono"]?.toLowerCase() === "sí",
        redes_sociales: excelRow["Datos Empleados: Redes sociales"]?.toLowerCase() === "sí",
        medios_comunicacion: excelRow["Datos Empleados: Medios de comunicación"]?.toLowerCase() === "sí",
      },

      vulnerableThreats: [],
      vulnerabilities: [],
      commonVulnerabilities: [],
    };
  };

const sendToBackend = async () => {
    if (!jsonData || !evaluationId) {
        setError("No hay datos para enviar o el evaluationId no está definido.");
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
        // console.log(jsonData.id)
        const checkAssetResponse = await fetch(`${BACKEND_URL}/assets/id/${jsonData.id}`);
        let assetId: string;

        if (checkAssetResponse.ok) {
            const responseData = await checkAssetResponse.json();

            // console.log(responseData?._id)
            if (!responseData?._id) {
                const createAssetResponse = await fetch(`${BACKEND_URL}/assets`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...jsonData,
                        evaluationId,
                    }),
                });

                if (!createAssetResponse.ok) {
                    throw new Error(`Error al crear el asset: ${createAssetResponse.statusText}`);
                }

                const createdAsset = await createAssetResponse.json();
                assetId = createdAsset._id;
            } else {
                assetId = responseData._id;
                const createAssetResponse = await fetch(`${BACKEND_URL}/assets/${assetId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...jsonData,
                    evaluationId,
                }),
                });

                if (!createAssetResponse.ok) {
                    throw new Error(`Error al crear el asset: ${createAssetResponse.statusText}`);
                }

                const createdAsset = await createAssetResponse.json();
                assetId = createdAsset._id;
            }
        } else {
            const createAssetResponse = await fetch(`${BACKEND_URL}/assets`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({
                ...jsonData,
                evaluationId,
                }),
            });

            if (!createAssetResponse.ok) {
                throw new Error(`Error al crear el asset: ${createAssetResponse.statusText}`);
            }

            const createdAsset = await createAssetResponse.json();
            assetId = createdAsset._id;
        }

        if (!assetId) {
            throw new Error("El asset creado no tiene un _id válido.");
        }

        const endpoints = [
        `${BACKEND_URL}/assets/${assetId}/identify-threats`,
        `${BACKEND_URL}/assets/${assetId}/identify-specific-vulnerabilities`,
        `${BACKEND_URL}/assets/${assetId}/identify-common-vulnerabilities`,
        ];

        const responses = await Promise.all(
        endpoints.map((endpoint) =>
            fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(jsonData),
            })
        )
        );

        for (const response of responses) {
        if (!response.ok) {
            throw new Error(`Error en una de las solicitudes: ${response.statusText}`);
        }
        }

        const getAssetResponse = await fetch(`${BACKEND_URL}/assets/${assetId}`);
            if (!getAssetResponse.ok) {
            throw new Error(`Error al obtener el asset: ${getAssetResponse.statusText}`);
            }

            const assetWithThreatsData = await getAssetResponse.json();
            setAssetWithThreats(assetWithThreatsData);
            setJsonData(null);

            alert("Datos enviados y amenazas/vulnerabilidades identificadas correctamente.");

        } catch (err) {
            setError(`Error al enviar los datos: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoading(false);
        }
    };

    const AffectedFieldsDisplay = ({ fields }: { fields: Record<string, any> }) => {
        const renderField = (category: string, value: any, depth = 0) => {
            const displayName = category.replace(/_/g, ' ');

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                return (
                    <div key={category} className={`mb-${depth === 0 ? '4' : '2'}`}>
                    <h5 className={`font-medium mb-1 ${depth > 0 ? 'pl-4' : ''}`}>
                        {displayName}
                    </h5>
                    <div className={`pl-${depth > 0 ? '4' : '0'}`}>
                        {Object.entries(value).map(([subKey, subValue]) =>
                        renderField(subKey, subValue, depth + 1)
                        )}
                    </div>
                    </div>
                );
            }

            else if (Array.isArray(value)) {
                return value.length > 0 ? (
                    <p key={category} className="mb-1">
                    <strong>{displayName}:</strong> {value.join(', ')}
                    </p>
                ) : null;
            }
            // Si es un booleano true
            else if (value === true) {
            return (
                <p key={category} className="mb-1">
                <strong>{displayName}:</strong> Sí
                </p>
            );
            }
            // Si es false o vacío, no mostrar
            return null;
        };

        return (
            <div className="space-y-2">
            {Object.entries(fields).map(([category, value]) =>
                renderField(category, value)
            )}
            </div>
        );
    };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">
          Paso 1: Identificación de Vulnerabilidades
        </h2>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          RF-3: Identificar automáticamente las vulnerabilidades y amenazas
          pertinentes basándose en MSPI y NIST SP800-30.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <button
            onClick={downloadTemplate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Descargar Template Excel
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Subir archivo Excel:</label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>

        {file && (
            <div className="flex gap-4">
                <button
                onClick={processFile}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                Procesar Excel
                </button>

                {jsonData && (
                <button
                    onClick={sendToBackend}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Guardar y enviar al backend
                </button>
                )}
            </div>
            )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!assetWithThreats && jsonData && (
            <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Datos procesados:</h3>

                {/* Sección: Información básica */}
                <div className="mb-6">
                <h4 className="font-semibold mb-2">Información básica</h4>
                <p><strong>ID:</strong> {jsonData.id}</p>
                <p><strong>Nombre:</strong> {jsonData.name}</p>
                <p><strong>Descripción:</strong> {jsonData.description}</p>
                </div>

                {/* Sección: Dispositivos */}
                <div className="mb-6">
                <h4 className="font-semibold mb-2">Dispositivos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(jsonData.dispositivos).map(([key, value]) => (
                    <p key={key}>
                        <strong>{key.replace(/_/g, ' ')}:</strong> {value ? 'Sí' : 'No'}
                    </p>
                    ))}
                </div>
                </div>

                {/* Sección: Software */}
                <div className="mb-6">
                <h4 className="font-semibold mb-2">Software</h4>
                <div>
                    <h5 className="font-medium mb-1">General</h5>
                    <div className="pl-4 mb-2">
                    {Object.entries(jsonData.software.general).map(([key, value]) => (
                        <p key={key}>
                        <strong>{key.replace(/_/g, ' ')}:</strong> 
                        {Array.isArray(value) ? value.join(', ') : value ? 'Sí' : 'No'}
                        </p>
                    ))}
                    </div>
                    <h5 className="font-medium mb-1">Específico</h5>
                    <div className="pl-4">
                    {Object.entries(jsonData.software.especifico).map(([key, value]) => (
                        <p key={key}>
                        <strong>{key.replace(/_/g, ' ')}:</strong> 
                        {Array.isArray(value) ? value.join(', ') : value ? 'Sí' : 'No'}
                        </p>
                    ))}
                    </div>
                </div>
                </div>

                {/* Sección: Servicios Web */}
                <div className="mb-6">
                <h4 className="font-semibold mb-2">Servicios Web</h4>
                <p>
                    <strong>Servicios web para clientes:</strong> 
                    {jsonData.servicios_web.servicios_web_clientes.join(', ') || 'Ninguno'}
                </p>
                <p>
                    <strong>Servicios web para operación:</strong> 
                    {jsonData.servicios_web.servicios_web_operacion.join(', ') || 'Ninguno'}
                </p>
                </div>

                {/* Sección: Acceso de Personas */}
                <div className="mb-6">
                <h4 className="font-semibold mb-2">Acceso de Personas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(jsonData.acceso_personas).map(([key, value]) => (
                    <p key={key}>
                        <strong>{key.replace(/_/g, ' ')}:</strong> {value ? 'Sí' : 'No'}
                    </p>
                    ))}
                </div>
                </div>

                {/* Sección: Información de Clientes */}
                <div className="mb-6">
                <h4 className="font-semibold mb-2">Información de Clientes</h4>
                <div>
                    <h5 className="font-medium mb-1">Personal</h5>
                    <div className="pl-4 mb-2">
                    {Object.entries(jsonData.informacion_clientes.personal).map(([key, value]) => (
                        <p key={key}>
                        <strong>{key.replace(/_/g, ' ')}:</strong> {value ? 'Sí' : 'No'}
                        </p>
                    ))}
                    </div>
                    <h5 className="font-medium mb-1">General</h5>
                    <div className="pl-4">
                    {Object.entries(jsonData.informacion_clientes.general).map(([key, value]) => (
                        <p key={key}>
                        <strong>{key.replace(/_/g, ' ')}:</strong> {value ? 'Sí' : 'No'}
                        </p>
                    ))}
                    </div>
                </div>
                </div>

                {/* Sección: Datos Corporativos */}
                <div className="mb-6">
                <h4 className="font-semibold mb-2">Datos Corporativos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(jsonData.datos_corporativos).map(([key, value]) => (
                    <p key={key}>
                        <strong>{key.replace(/_/g, ' ')}:</strong> {value ? 'Sí' : 'No'}
                    </p>
                    ))}
                </div>
                </div>

                {/* Sección: Datos Empleados */}
                <div className="mb-6">
                <h4 className="font-semibold mb-2">Datos Empleados</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(jsonData.datos_empleados).map(([key, value]) => (
                    <p key={key}>
                        <strong>{key.replace(/_/g, ' ')}:</strong> {value ? 'Sí' : 'No'}
                    </p>
                    ))}
                </div>
                </div>
            </div>
            )}

        {assetWithThreats && (
            <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {isLoading && <p className="text-blue-500">Procesando datos y buscando amenazas/vulnerabilidades...</p>}

                {assetWithThreats && (
                <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Asset: {assetWithThreats.name}</h3>

                    {/* Sección: Amenazas vulnerables */}
                    {assetWithThreats.vulnerableThreats.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-semibold mb-2">
                        Amenazas vulnerables ({assetWithThreats.vulnerableThreats.length})
                        </h4>
                        <div className="space-y-4">
                        {assetWithThreats.vulnerableThreats.map((threat, index) => (
                            <div key={index} className="p-4 border border-zinc-300 dark:border-zinc-600 rounded-lg">
                            {/* ✅ Usa <div> en lugar de <p> para contener elementos de bloque */}
                            <div className="mb-2">
                                <strong>ID de amenaza:</strong> {threat.threatId}
                            </div>
                            <div className="mb-2">
                                <strong>Descripción:</strong> {threat.description || "Sin descripción"}
                            </div>
                            <div className="mt-2">
                                <strong>Campos afectados:</strong>
                                {Object.keys(threat.affectedFields).length > 0 ? (
                                <div className="mt-2 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                    <AffectedFieldsDisplay fields={threat.affectedFields} />
                                </div>
                                ) : (
                                <span> Ninguno</span>
                                )}
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}
                    

                    {/* Sección: Vulnerabilidades específicas */}
                    {assetWithThreats.vulnerabilities && assetWithThreats.vulnerabilities.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-semibold mb-2">Vulnerabilidades específicas ({assetWithThreats.vulnerabilities.length})</h4>
                        <div className="space-y-2">
                        {assetWithThreats.vulnerabilities.map((vuln, index) => (
                            <div key={index} className="p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg">
                            <p><strong>CVE ID:</strong> {vuln.cveId || "Sin CVE"}</p>
                            <p><strong>Métricas:</strong> {vuln.metrics ? JSON.stringify(vuln.metrics) : "Sin métricas"}</p>
                            <p><strong>Tipos de problema:</strong> {vuln.problemTypes ? JSON.stringify(vuln.problemTypes) : "Sin tipos"}</p>
                            <p><strong>Última actualización:</strong> {vuln.lastUpdatedDate ? new Date(vuln.lastUpdatedDate).toLocaleDateString() : "Desconocida"}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}

                    {/* Sección: Vulnerabilidades comunes */}
                    {assetWithThreats.commonVulnerabilities && assetWithThreats.commonVulnerabilities.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-semibold mb-2">Vulnerabilidades comunes en PYMEs ({assetWithThreats.commonVulnerabilities.length})</h4>
                        <div className="space-y-2">
                        {assetWithThreats.commonVulnerabilities.map((vuln, index) => (
                            <div key={index} className="p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg">
                            <p><strong>CVE ID:</strong> {vuln.cveId || "Sin CVE"}</p>
                            <p><strong>Métricas:</strong> {vuln.metrics ? JSON.stringify(vuln.metrics) : "Sin métricas"}</p>
                            <p><strong>Tipos de problema:</strong> {vuln.problemTypes ? JSON.stringify(vuln.problemTypes) : "Sin tipos"}</p>
                            <p><strong>Última actualización:</strong> {vuln.lastUpdatedDate ? new Date(vuln.lastUpdatedDate).toLocaleDateString() : "Desconocida"}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}

                    {/* Sección: Datos del asset (opcional) */}
                    <div className="mt-6">
                    <h4 className="font-semibold mb-2">Datos del asset</h4>
                    <p><strong>ID:</strong> {assetWithThreats.id}</p>
                    <p><strong>Nombre:</strong> {assetWithThreats.name}</p>
                    <p><strong>Descripción:</strong> {assetWithThreats.description}</p>
                    </div>
                </div>
                )}
            </div>
        )}
        
      </div>

      <div className="flex justify-end">
        <Link
          href={`/evaluation/${evaluationId}/analysis`}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Siguiente: Análisis →
        </Link>
      </div>
    </div>
  );
}